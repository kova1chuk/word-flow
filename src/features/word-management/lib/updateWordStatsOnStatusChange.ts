import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  getDocs,
  collection,
  runTransaction,
} from "firebase/firestore";

/**
 * Updates userStats and all relevant analyses' summary.wordStats when a word's status changes.
 * @param params - { wordId, userId, oldStatus, newStatus }
 */
export async function updateWordStatsOnStatusChange({
  wordId,
  userId,
  oldStatus,
  newStatus,
}: {
  wordId: string;
  userId: string;
  oldStatus: number;
  newStatus: number;
}) {
  // 1. Update userStats/{userId}.wordStats in a transaction
  const userStatsRef = doc(db, "userStats", userId);
  await runTransaction(db, async (transaction) => {
    const userStatsDoc = await transaction.get(userStatsRef);
    const wordStats = {
      ...(userStatsDoc.exists() ? userStatsDoc.data().wordStats : {}),
    };
    wordStats[oldStatus] = Math.max((wordStats[oldStatus] || 1) - 1, 0);
    wordStats[newStatus] = (wordStats[newStatus] || 0) + 1;
    transaction.set(userStatsRef, { wordStats }, { merge: true });
  });

  // 2. Update all analyses where this word is used
  const analysesSnapshot = await getDocs(collection(db, "analyses"));
  for (const analysisDoc of analysesSnapshot.docs) {
    const analysisId = analysisDoc.id;
    // Check if this analysis uses the word
    const analysisWordsSnapshot = await getDocs(
      collection(db, "analyses", analysisId, "words")
    );
    const used = analysisWordsSnapshot.docs.some(
      (doc) => doc.data().wordId === wordId
    );
    if (used) {
      // Update summary.wordStats in a transaction
      const analysisRef = doc(db, "analyses", analysisId);
      await runTransaction(db, async (transaction) => {
        const analysisDocSnap = await transaction.get(analysisRef);
        const summary = analysisDocSnap.exists()
          ? analysisDocSnap.data().summary || {}
          : {};
        const wordStats = { ...(summary.wordStats || {}) };
        wordStats[oldStatus] = Math.max((wordStats[oldStatus] || 1) - 1, 0);
        wordStats[newStatus] = (wordStats[newStatus] || 0) + 1;
        transaction.set(
          analysisRef,
          { summary: { ...summary, wordStats } },
          { merge: true }
        );
      });
    }
  }
}
