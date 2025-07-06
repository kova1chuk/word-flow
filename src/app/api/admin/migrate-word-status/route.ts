import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Only initialize once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const statusMapping: Record<string, number> = {
  to_learn: 1,
  want_repeat: 4,
  well_known: 6,
  unset: 1,
};

export async function POST() {
  const logs: string[] = [];
  let migratedCount = 0;
  let skippedCount = 0;
  try {
    const wordsRef = db.collection("words");
    const wordsSnapshot = await wordsRef.get();
    logs.push(`Found ${wordsSnapshot.size} words to migrate`);
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
    logs.push(`Migration completed!`);
    logs.push(`- Migrated: ${migratedCount} words`);
    logs.push(`- Skipped: ${skippedCount} words (already numeric)`);
    logs.push(`- Total processed: ${wordsSnapshot.size} words`);
    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logs.push(`Error during migration: ${errorMessage}`);
    return NextResponse.json({ success: false, logs }, { status: 500 });
  }
}
