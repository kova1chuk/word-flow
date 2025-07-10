import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AnalysisWord {
  id: string;
  word: string;
  status: number;
  isLearned: boolean;
  isInDictionary: boolean;
  usages: string[];
  definition?: string;
  translation?: string;
  createdAt: Timestamp | null;
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
  summary?: {
    wordStats?: Record<number, number>;
    // Add other known summary fields here as needed
  };
}

export function useAnalysisWords(
  analysisId: string,
  options?: {
    pageSize?: number;
    statusFilter?: string | (string | number)[];
    search?: string;
    pageCursor?: QueryDocumentSnapshot<DocumentData> | null;
  }
) {
  const user = useSelector(selectUser);
  const [words, setWords] = useState<AnalysisWord[]>([]);
  const [allWords, setAllWords] = useState<AnalysisWord[]>([]); // Store all words for client-side filtering
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalysisStats>({
    total: 0,
    learned: 0,
    notLearned: 0,
  });
  const [nextCursor, setNextCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const pageSize = options?.pageSize || 12;
  const statusFilter = options?.statusFilter ?? "all";
  const search = options?.search || "";
  const pageCursor = options?.pageCursor || null;

  // Client-side filtering function
  const applyFilters = useCallback(
    (wordsData: AnalysisWord[]) => {
      let filtered = wordsData;

      // Apply status filter
      if (Array.isArray(statusFilter)) {
        if (statusFilter.length > 0) {
          filtered = filtered.filter((w) => {
            const statusNumbers = statusFilter.map((s) =>
              typeof s === "string" ? parseInt(s, 10) : s
            );
            return statusNumbers.includes(w.status);
          });
        }
      } else if (statusFilter !== "all") {
        const filterValue =
          typeof statusFilter === "string"
            ? parseInt(statusFilter, 10)
            : statusFilter;
        filtered = filtered.filter((w) => w.status === filterValue);
      }

      // Apply search filter
      if (search.trim() !== "") {
        filtered = filtered.filter((w) =>
          w.word.toLowerCase().includes(search.trim().toLowerCase())
        );
      }

      return filtered;
    },
    [statusFilter, search]
  );

  // Apply filters to all words and update displayed words
  useEffect(() => {
    if (allWords.length > 0) {
      const filtered = applyFilters(allWords);
      setWords(filtered);
    }
  }, [allWords, applyFilters]);

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
        summary: analysisData.summary,
      });

      // Only fetch from server if we don't have all words yet or if pagination changed
      if (allWords.length === 0 || pageCursor !== null) {
        const wordsData: AnalysisWord[] = [];

        if (pageCursor !== null) {
          // Fetch paginated words
          let refsQuery = query(
            collection(db, "analyses", analysisId, "words"),
            orderBy("word")
          );
          refsQuery = query(refsQuery, orderBy("word")); // Ensure orderBy is applied
          refsQuery = query(refsQuery, orderBy("word")); // Ensure orderBy is applied
          const refsSnapshot = await getDocs(refsQuery);
          const wordIds = refsSnapshot.docs.map((doc) => doc.data().wordId);
          setNextCursor(
            refsSnapshot.docs.length === pageSize
              ? refsSnapshot.docs[refsSnapshot.docs.length - 1]
              : null
          );

          // Fetch actual word docs
          if (wordIds.length > 0) {
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
                  status: typeof data.status === "number" ? data.status : 1,
                  isLearned: data.isLearned || false,
                  isInDictionary: data.isInDictionary || false,
                  usages: data.usages || [],
                  definition:
                    typeof data.definition === "string" ? data.definition : "",
                  translation:
                    typeof data.translation === "string"
                      ? data.translation
                      : "",
                  createdAt: data.createdAt || null,
                });
              });
            }
          }

          // Add to existing words for pagination
          setAllWords((prev) => [...prev, ...wordsData]);
        } else {
          // Fetch all words initially
          const refsQuery = query(
            collection(db, "analyses", analysisId, "words"),
            orderBy("word")
          );
          const refsSnapshot = await getDocs(refsQuery);
          const wordIds = refsSnapshot.docs.map((doc) => doc.data().wordId);

          // Fetch actual word docs
          if (wordIds.length > 0) {
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
                  status: typeof data.status === "number" ? data.status : 1,
                  isLearned: data.isLearned || false,
                  isInDictionary: data.isInDictionary || false,
                  usages: data.usages || [],
                  definition:
                    typeof data.definition === "string" ? data.definition : "",
                  translation:
                    typeof data.translation === "string"
                      ? data.translation
                      : "",
                  createdAt: data.createdAt || null,
                });
              });
            }
          }

          setAllWords(wordsData);
        }
      }

      // Calculate stats from all words
      const total = allWords.length;
      const learned = allWords.filter((w) => w.isLearned).length;
      const notLearned = total - learned;
      setStats({ total, learned, notLearned });
    } catch (err) {
      console.error("Error fetching analysis words:", err);
      setError(err instanceof Error ? err.message : "Failed to load words");
    } finally {
      setLoading(false);
    }
  }, [user, analysisId, pageSize, pageCursor, allWords]);

  const refreshWords = useCallback(() => {
    setAllWords([]); // Clear cached words to force refetch
    setNextCursor(null);
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
    nextCursor,
  };
}
