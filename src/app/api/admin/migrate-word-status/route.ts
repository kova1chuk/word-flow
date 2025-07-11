
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { NextResponse } from "next/server";

export async function POST() {
  const logs: string[] = [];

  try {
    // Debug: Check if environment variables are loaded
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    logs.push("Checking environment variables...");
    logs.push(`FIREBASE_PROJECT_ID: ${projectId ? "SET" : "MISSING"}`);
    logs.push(`FIREBASE_CLIENT_EMAIL: ${clientEmail ? "SET" : "MISSING"}`);
    logs.push(`FIREBASE_PRIVATE_KEY: ${privateKey ? "SET" : "MISSING"}`);

    if (!projectId || !clientEmail || !privateKey) {
      logs.push("Missing required Firebase Admin environment variables");
      return NextResponse.json({ success: false, logs }, { status: 500 });
    }

    // Only initialize once
    if (!getApps().length) {
      logs.push("Initializing Firebase Admin SDK...");
      try {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        });
        logs.push("Firebase Admin SDK initialized successfully");
      } catch (initError) {
        logs.push(
          `Firebase Admin SDK initialization failed: ${
            initError instanceof Error ? initError.message : "Unknown error"
          }`
        );
        return NextResponse.json({ success: false, logs }, { status: 500 });
      }
    }

    const db = getFirestore();
    logs.push("Firestore instance created");

    const statusMapping: Record<string, number> = {
      to_learn: 1,
      want_repeat: 4,
      well_known: 6,
      unset: 1,
    };

    let migratedCount = 0;
    let skippedCount = 0;
    const batchSize = 1; // Process 1 word at a time

    logs.push("Starting migration process with pagination...");

    let lastDoc = null;
    let hasMore = true;
    let batchNumber = 1;

    while (hasMore) {
      try {
        logs.push(`Processing batch ${batchNumber}...`);

        let query = db.collection("words").limit(batchSize);
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        const wordsSnapshot = await query.get();

        if (wordsSnapshot.empty) {
          logs.push("No more documents to process");
          hasMore = false;
          break;
        }

        logs.push(`Found ${wordsSnapshot.size} words in batch ${batchNumber}`);

        // Process this batch
        for (const wordDoc of wordsSnapshot.docs) {
          const wordData = wordDoc.data();
          const oldStatus = wordData.status;

          if (typeof oldStatus === "number") {
            logs.push(
              `Skipping word "${wordData.word}" - already has numeric status: ${oldStatus}`
            );
            skippedCount++;
            continue;
          }

          const newStatus = statusMapping[oldStatus] || 1;
          logs.push(
            `Migrating word "${wordData.word}": ${oldStatus} -> ${newStatus}`
          );

          await wordDoc.ref.update({
            status: newStatus,
            oldStatus: oldStatus,
          });

          migratedCount++;
        }

        // Update lastDoc for next iteration
        lastDoc = wordsSnapshot.docs[wordsSnapshot.docs.length - 1];

        // If we got fewer documents than the batch size, we're done
        if (wordsSnapshot.docs.length < batchSize) {
          hasMore = false;
        }

        batchNumber++;

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
      } catch (batchError) {
        logs.push(
          `Error processing batch ${batchNumber}: ${
            batchError instanceof Error ? batchError.message : "Unknown error"
          }`
        );
        return NextResponse.json({ success: false, logs }, { status: 500 });
      }
    }

    logs.push(`Migration completed!`);
    logs.push(`- Migrated: ${migratedCount} words`);
    logs.push(`- Skipped: ${skippedCount} words (already numeric)`);
    logs.push(`- Total batches processed: ${batchNumber - 1}`);

    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logs.push(`Error during migration: ${errorMessage}`);
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, logs }, { status: 500 });
  }
}
