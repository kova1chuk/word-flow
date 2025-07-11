import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface Analysis {
  id: string;
  title: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
    dateString: string;
  };
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    averageWordLength: number;
    readingTime: number;
  };
  wordStats?: {
    toLearn: number;
    toRepeat: number;
    learned: number;
    totalWords: number;
    uniqueWords: number;
  };
}

interface WordData {
  word: string;
  status?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

// Helper function to convert Firestore Timestamp to serializable format
const convertTimestamp = (timestamp: Timestamp) => {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
    dateString: timestamp.toDate().toISOString(),
  };
};

// Helper function to calculate word statistics
const calculateWordStats = (words: WordData[]) => {
  const stats = {
    toLearn: 0,
    toRepeat: 0,
    learned: 0,
    totalWords: words.length,
    uniqueWords: new Set(words.map((w) => w.word.toLowerCase())).size,
  };

  words.forEach((word) => {
    const status = word.status;
    if (status) {
      if (status >= 1 && status <= 3) {
        stats.toLearn++;
      } else if (status >= 4 && status <= 5) {
        stats.toRepeat++;
      } else if (status >= 6 && status <= 7) {
        stats.learned++;
      }
    }
  });

  return stats;
};

export const analysesApi = {
  // Fetch all analyses for a user
  async fetchUserAnalyses(userId: string): Promise<Analysis[]> {
    const analysesRef = collection(db, "analyses");
    const q = query(analysesRef, where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const analysesData: Analysis[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const analysis: Analysis = {
        id: docSnapshot.id,
        title: data.title,
        createdAt: convertTimestamp(data.createdAt),
        summary: data.summary,
      };

      // Fetch word statistics if not already present
      if (!data.wordStats) {
        try {
          const wordsRef = collection(db, "words");
          const wordsQuery = query(wordsRef, where("userId", "==", userId));
          const wordsSnapshot = await getDocs(wordsQuery);
          const words = wordsSnapshot.docs.map((doc) => doc.data() as WordData);

          analysis.wordStats = calculateWordStats(words);

          // Update the analysis document with word stats
          await updateDoc(doc(db, "analyses", docSnapshot.id), {
            wordStats: analysis.wordStats,
          });
        } catch (error) {
          console.error("Error fetching word stats:", error);
        }
      } else {
        analysis.wordStats = data.wordStats;
      }

      analysesData.push(analysis);
    }

    // Sort by creation date, newest first
    analysesData.sort(
      (a, b) =>
        new Date(b.createdAt.dateString).getTime() -
        new Date(a.createdAt.dateString).getTime()
    );

    return analysesData;
  },

  // Update analysis statistics
  async updateAnalysisStats(analysisId: string, userId: string): Promise<void> {
    try {
      // Fetch only words for this analysis and user
      const wordsRef = collection(db, "words");
      const wordsQuery = query(
        wordsRef,
        where("userId", "==", userId),
        where("analysisId", "==", analysisId)
      );
      const wordsSnapshot = await getDocs(wordsQuery);
      const words = wordsSnapshot.docs.map((doc) => doc.data() as WordData);

      const wordStats = calculateWordStats(words);

      // Update the analysis document
      await updateDoc(doc(db, "analyses", analysisId), {
        wordStats: wordStats,
      });
    } catch (error) {
      console.error("Error updating analysis stats:", error);
      throw error;
    }
  },

  // Fetch a single analysis by ID, only returning required fields
  async fetchAnalysisById(
    analysisId: string
  ): Promise<
    Pick<Analysis, "id" | "title" | "createdAt" | "summary" | "wordStats">
  > {
    const analysisRef = doc(db, "analyses", analysisId);
    const analysisSnap = await getDoc(analysisRef);
    if (!analysisSnap.exists()) {
      throw new Error("Analysis not found");
    }
    const data = analysisSnap.data();
    return {
      id: analysisSnap.id,
      title: data.title,
      createdAt: data.createdAt
        ? {
            seconds: data.createdAt.seconds,
            nanoseconds: data.createdAt.nanoseconds,
            dateString: data.createdAt.toDate
              ? data.createdAt.toDate().toISOString()
              : "",
          }
        : { seconds: 0, nanoseconds: 0, dateString: "" },
      summary: data.summary,
      wordStats: data.wordStats,
    };
  },
};
