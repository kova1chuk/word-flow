
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue, FieldPath } from "firebase-admin/firestore";

import { NextResponse } from "next/server";

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
  try {
    const analysesSnapshot = await db.collection("analyses").get();
    let processed = 0;
    for (const analysisDoc of analysesSnapshot.docs) {
      const analysisId = analysisDoc.id;
      // Remove old wordStats if it exists
      await db
        .collection("analyses")
        .doc(analysisId)
        .update({ wordStats: FieldValue.delete() });
      // Get all words in the analysis's words subcollection
      const analysisWordsSnapshot = await db
        .collection(`analyses/${analysisId}/words`)
        .get();
      const wordIds = analysisWordsSnapshot.docs.map(
        (doc) => doc.data().wordId
      );
      // Tally statuses from global words collection
      const wordStats: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      };
      if (wordIds.length > 0) {
        // Use getCountFromServer for efficient counting
        for (let status = 1; status <= 7; status++) {
          // Count words with this status that are in the analysis
          const chunkSize = 10;
          let statusCount = 0;

          for (let i = 0; i < wordIds.length; i += chunkSize) {
            const chunk = wordIds.slice(i, i + chunkSize);
            const statusQuery = db
              .collection("words")
              .where(FieldPath.documentId(), "in", chunk)
              .where("status", "==", status);
            const statusSnapshot = await statusQuery.count().get();
            statusCount += statusSnapshot.data().count;
          }

          wordStats[status] = statusCount;
        }
      }
      // Update summary.wordStats
      await db
        .collection("analyses")
        .doc(analysisId)
        .update({ "summary.wordStats": wordStats });
      processed++;
    }
    return NextResponse.json({ success: true, processed });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
