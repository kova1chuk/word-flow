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
import { supabase } from "@/lib/supabaseClient";

export interface Analysis {
  id: string;
  title: string;
  document_link?: string;
  total_words_count: number;
  unique_words_count: number;
  sentences_count: number;
  sentence_cursor: number;
  words_stat: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
    "6": number;
    "7": number;
  };
  // Keep legacy fields for backward compatibility
  createdAt?: {
    seconds: number;
    nanoseconds: number;
    dateString: string;
  };
  summary?: {
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
  // Fetch all analyses for a user using Supabase RPC
  async fetchUserAnalyses(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Analysis[]> {
    try {
      console.log("📤 Fetching analyses from Supabase:", {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
      });

      const { data, error } = await supabase.rpc("get_analyses", {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) {
        console.error("❌ Failed to fetch analyses:", error);
        throw error;
      }

      console.log("✅ Analyses fetched successfully:", data);

      // Transform Supabase response to Analysis interface
      const analyses: Analysis[] = (data || []).map(
        (row: {
          id: string;
          title: string;
          document_link: string | null;
          total_words_count: number;
          unique_words_count: number;
          sentences_count: number;
          sentence_cursor: number;
          words_stat: object;
        }) => ({
          id: row.id,
          title: row.title,
          document_link: row.document_link || undefined,
          total_words_count: row.total_words_count,
          unique_words_count: row.unique_words_count,
          sentences_count: row.sentences_count,
          sentence_cursor: row.sentence_cursor,
          words_stat: row.words_stat || {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
          },
          // Add legacy fields for backward compatibility
          createdAt: {
            seconds: 0,
            nanoseconds: 0,
            dateString: new Date().toISOString(),
          },
          summary: {
            totalWords: row.total_words_count,
            uniqueWords: row.unique_words_count,
            knownWords: 0,
            unknownWords: 0,
            averageWordLength: 0,
            readingTime: 0,
          },
        })
      );

      return analyses;
    } catch (error) {
      console.log("🔄 Supabase RPC failed, falling back to Firebase", error);

      // Fallback to Firebase implementation
      const analysesRef = collection(db, "analyses");
      const q = query(analysesRef, where("userId", "==", userId));

      const querySnapshot = await getDocs(q);
      const analysesData: Analysis[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        const analysis: Analysis = {
          id: docSnapshot.id,
          title: data.title,
          document_link: undefined,
          total_words_count: data.summary?.totalWords || 0,
          unique_words_count: data.summary?.uniqueWords || 0,
          sentences_count: 0,
          sentence_cursor: 0,
          words_stat: {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
          },
          createdAt: convertTimestamp(data.createdAt),
          summary: data.summary,
        };

        // Fetch word statistics if not already present
        if (!data.wordStats) {
          try {
            const wordsRef = collection(db, "words");
            const wordsQuery = query(wordsRef, where("userId", "==", userId));
            const wordsSnapshot = await getDocs(wordsQuery);
            const words = wordsSnapshot.docs.map(
              (doc) => doc.data() as WordData
            );

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
      analysesData.sort((a, b) => {
        const aTime = a.createdAt?.dateString
          ? new Date(a.createdAt.dateString).getTime()
          : 0;
        const bTime = b.createdAt?.dateString
          ? new Date(b.createdAt.dateString).getTime()
          : 0;
        return bTime - aTime;
      });

      return analysesData;
    }
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
