import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AnalysisWord {
  id: string;
  word: string;
  isLearned: boolean;
  isInDictionary: boolean;
  usages: string[];
  definition?: string;
  translation?: string;
}

export interface AnalysisStats {
  total: number;
  learned: number;
  notLearned: number;
}

export interface Analysis {
  id: string;
  title: string;
  createdAt: string;
  totalWords: number;
  uniqueWords: number;
}

export function useAnalysisWords(analysisId: string) {
  const { user } = useAuth();
  const [words, setWords] = useState<AnalysisWord[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalysisStats>({
    total: 0,
    learned: 0,
    notLearned: 0,
  });

  const fetchWords = useCallback(async () => {
    if (!user || !analysisId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch analysis details
      const analysisDoc = await getDoc(doc(db, "analyses", analysisId));
      if (!analysisDoc.exists()) {
        throw new Error("Analysis not found");
      }

      const analysisData = analysisDoc.data();
      setAnalysis({
        id: analysisId,
        title: analysisData.title || "Untitled Analysis",
        createdAt:
          analysisData.createdAt?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        totalWords: analysisData.totalWords || 0,
        uniqueWords: analysisData.uniqueWords || 0,
      });

      // Fetch words from the analysis words subcollection
      const analysisWordsQuery = query(
        collection(db, "analyses", analysisId, "words")
      );
      const analysisWordsSnapshot = await getDocs(analysisWordsQuery);

      // Get all word IDs from the analysis
      const wordIds = analysisWordsSnapshot.docs.map(
        (doc) => doc.data().wordId
      );

      if (wordIds.length === 0) {
        setWords([]);
        setStats({ total: 0, learned: 0, notLearned: 0 });
        return;
      }

      // Fetch the actual word documents
      const wordsData: AnalysisWord[] = [];

      // Process words in chunks to avoid query limits
      const chunkSize = 10;
      for (let i = 0; i < wordIds.length; i += chunkSize) {
        const chunk = wordIds.slice(i, i + chunkSize);
        const wordsQuery = query(
          collection(db, "words"),
          where("__name__", "in", chunk)
        );
        const wordsSnapshot = await getDocs(wordsQuery);

        wordsSnapshot.forEach((doc) => {
          const data = doc.data();
          wordsData.push({
            id: doc.id,
            word: data.word,
            isLearned: data.isLearned || false,
            isInDictionary: data.isInDictionary || false,
            usages: data.usages || [],
            definition: data.definition,
            translation: data.translation,
          });
        });
      }

      setWords(wordsData);

      // Calculate stats
      const total = wordsData.length;
      const learned = wordsData.filter((w) => w.isLearned).length;
      const notLearned = total - learned;

      setStats({
        total,
        learned,
        notLearned,
      });
    } catch (err) {
      console.error("Error fetching analysis words:", err);
      setError(err instanceof Error ? err.message : "Failed to load words");
    } finally {
      setLoading(false);
    }
  }, [user, analysisId]);

  const refreshWords = useCallback(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  return {
    words,
    analysis,
    loading,
    error,
    stats,
    refreshWords,
  };
}
