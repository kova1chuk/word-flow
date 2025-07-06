import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Missing required Firebase Admin environment variables");
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function POST() {
  // Start migration in the background
  try {
    // Set initial progress
    await db.collection("migration_progress").doc("status").set({
      status: "running",
      migratedCount: 0,
      skippedCount: 0,
      total: 0,
      currentBatch: 0,
      error: null,
    });

    // Run migration asynchronously
    migrateInBackground();

    return NextResponse.json({ started: true });
  } catch (error) {
    return NextResponse.json(
      {
        started: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function migrateInBackground() {
  const statusDoc = db.collection("migration_progress").doc("status");
  const statusMapping: Record<string, number> = {
    to_learn: 1,
    want_repeat: 4,
    well_known: 6,
    unset: 1,
  };
  let migratedCount = 0;
  let skippedCount = 0;
  const batchSize = 10;
  let lastDoc = null;
  let hasMore = true;
  let batchNumber = 1;
  let total = 0;

  try {
    // Get total count for progress
    const totalSnapshot = await db.collection("words").get();
    total = totalSnapshot.size;
    await statusDoc.update({ total });

    while (hasMore) {
      let query = db.collection("words").limit(batchSize);
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      const wordsSnapshot = await query.get();
      if (wordsSnapshot.empty) {
        hasMore = false;
        break;
      }
      for (const wordDoc of wordsSnapshot.docs) {
        const wordData = wordDoc.data();
        const oldStatus = wordData.status;
        if (typeof oldStatus === "number") {
          skippedCount++;
          continue;
        }
        const newStatus = statusMapping[oldStatus] || 1;
        await wordDoc.ref.update({
          status: newStatus,
          oldStatus: oldStatus,
        });
        migratedCount++;
      }
      lastDoc = wordsSnapshot.docs[wordsSnapshot.docs.length - 1];
      await statusDoc.update({
        migratedCount,
        skippedCount,
        currentBatch: batchNumber,
        status: "running",
        error: null,
      });
      batchNumber++;
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (wordsSnapshot.docs.length < batchSize) {
        hasMore = false;
      }
    }
    await statusDoc.update({
      status: "completed",
      migratedCount,
      skippedCount,
      currentBatch: batchNumber - 1,
      error: null,
    });
  } catch (error) {
    await statusDoc.update({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
