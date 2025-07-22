import { useState, useCallback } from "react";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { config } from "@/lib/config";
import { supabase } from "@/lib/supabaseClient";

import { TrainingQuestionGenerator } from "./trainingQuestionGenerator";

import type {
  Word,
  TrainingQuestion,
  TrainingType,
  TrainingSession as TrainingSessionType,
  TrainingResult,
} from "@/types";

interface UseTrainingSessionProps {
  selectedStatuses: number[];
  selectedAnalysisIds: string[];
  sessionSize?: number;
  trainingTypes?: TrainingType[];
}

// Helper to fetch definition for a word
async function fetchAndUpdateDefinition(word: Word): Promise<string> {
  const res = await fetch(
    `${config.dictionaryApi}/${encodeURIComponent(word.word)}`
  );
  let definition = "";
  if (res.ok) {
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      definition =
        data[0].meanings?.[0]?.definitions?.[0]?.definition ??
        "No definition found.";
    } else {
      definition = "No definition found.";
    }
  } else {
    definition = "No definition found.";
  }
  // TODO: Update word in Supabase instead of Firebase
  console.log("Would update definition:", { wordId: word.id, definition });
  return definition;
}

// Helper to fetch translation for a word
async function fetchAndUpdateTranslation(word: Word): Promise<string> {
  const langPair = `en|uk`;
  const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
    word.word
  )}&langpair=${langPair}`;
  const res = await fetch(url);
  let translation = "";
  if (res.ok) {
    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
      translation = data.responseData.translatedText;
    } else {
      translation = "No translation found.";
    }
  } else {
    translation = "No translation found.";
  }
  // TODO: Update word in Supabase instead of Firebase
  console.log("Would update translation:", { wordId: word.id, translation });
  return translation;
}

export function useTrainingSession({
  selectedStatuses,
  selectedAnalysisIds,
  sessionSize = 10,
  trainingTypes = ["input_word"],
}: UseTrainingSessionProps) {
  const user = useSelector(selectUser);

  // Session state
  const [session, setSession] = useState<TrainingSessionType | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [currentQuestion, setCurrentQuestion] =
    useState<TrainingQuestion | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Progress tracking
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [completedWords, setCompletedWords] = useState<string[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch words for training - TODO: Implement Supabase version
  const fetchTrainingWords = useCallback(async () => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement Supabase word fetching for training
      console.log("Would fetch training words:", {
        userId: user.uid,
        selectedStatuses,
        selectedAnalysisIds,
        sessionSize,
      });

      // Placeholder: return empty array for now
      return [];
    } catch (err) {
      console.error("Error fetching training words:", err);
      setError("Failed to fetch words for training");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, selectedStatuses, selectedAnalysisIds, sessionSize]);

  // Start training session - TODO: Implement Supabase version
  const startSession = useCallback(async () => {
    if (!user) return;

    const trainingWords = await fetchTrainingWords();
    if (trainingWords.length === 0) {
      setError("No words available for training with the selected criteria");
      return;
    }

    // TODO: Create session in Supabase instead of Firebase
    console.log("Would create training session:", {
      userId: user.uid,
      wordIds: trainingWords.map((w) => w.id),
      settings: {
        trainingTypes,
        sessionSize,
      },
    });

    // Placeholder implementation
    setSession(null);
    setWords([]);
    setIsStarted(false);
    setError("Training session functionality needs Supabase implementation");
  }, [user, fetchTrainingWords, trainingTypes, sessionSize]);

  // All other methods are placeholders that need Supabase implementation
  const handleAnswer = useCallback(async (isCorrect: boolean) => {
    console.log("Would handle answer:", isCorrect);
  }, []);

  const skipQuestion = useCallback(() => {
    console.log("Would skip question");
  }, []);

  const nextWord = useCallback(() => {
    console.log("Would go to next word");
  }, []);

  const previousWord = useCallback(() => {
    console.log("Would go to previous word");
  }, []);

  const handleStatusChange = useCallback(
    async (wordId: string, newStatus: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
      console.log("Would change word status:", { wordId, newStatus });
    },
    []
  );

  const endSession = useCallback(() => {
    console.log("Would end session");
    setIsStarted(false);
    setIsCompleted(false);
    setSession(null);
    setWords([]);
    setCurrentQuestion(null);
    setCurrentWordIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setCompletedWords([]);
  }, []);

  const retryIncorrectAnswers = useCallback(async () => {
    console.log("Would retry incorrect answers");
  }, []);

  const handleDeleteWord = useCallback(async (wordToDelete: Word) => {
    console.log("Would delete word:", wordToDelete.id);
  }, []);

  const completeSession = useCallback(() => {
    setIsCompleted(true);
    setCurrentQuestion(null);
  }, []);

  const reloadDefinition = useCallback(async () => {
    console.log("Would reload definition");
  }, []);

  const reloadTranslation = useCallback(async () => {
    console.log("Would reload translation");
  }, []);

  // Calculate progress
  const progress =
    words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;
  const accuracy =
    correctAnswers + incorrectAnswers > 0
      ? (correctAnswers / (correctAnswers + incorrectAnswers)) * 100
      : 0;

  return {
    // State
    session,
    words,
    currentQuestion,
    currentWordIndex,
    isStarted,
    isCompleted,
    loading,
    error,

    // Progress
    correctAnswers,
    incorrectAnswers,
    completedWords,
    progress,
    accuracy,

    // Actions
    startSession,
    handleAnswer,
    skipQuestion,
    endSession,
    retryIncorrectAnswers,
    completeSession,
    nextWord,
    previousWord,
    handleStatusChange,
    handleDeleteWord,
    reloadDefinition,
    reloadTranslation,
  };
}
