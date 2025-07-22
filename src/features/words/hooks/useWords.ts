import { useState, useEffect, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import type { Word } from "@/types";

// This hook is deprecated - use useWordsRTK instead which uses Supabase
export function useWords() {
  const user = useSelector(selectUser);
  const [words, setWords] = useState<Word[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [error, setError] = useState("");

  const fetchWords = useCallback(async () => {
    if (!user) return;
    setLoadingWords(true);
    setError("");

    try {
      // This would need to be implemented with Supabase
      // For now, return empty array
      setWords([]);
    } catch (err) {
      console.error("Error fetching words:", err);
      setError("Failed to load words");
    } finally {
      setLoadingWords(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWords();
    }
  }, [user, fetchWords]);

  return {
    words,
    loadingWords,
    error,
    setError,
    fetchWords,
  };
}
