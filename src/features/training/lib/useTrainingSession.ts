import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import type {
  Word,
  TrainingQuestion,
  TrainingType,
  TrainingSession as TrainingSessionType,
  TrainingResult,
} from "@/types";
import { TrainingQuestionGenerator } from "./trainingQuestionGenerator";
import { updateWordStatsOnStatusChange } from "@/features/word-management/lib/updateWordStatsOnStatusChange";
import { config } from "@/lib/config";

interface UseTrainingSessionProps {
  selectedStatuses: number[];
  selectedAnalysisIds: string[];
  sessionSize?: number;
  trainingTypes?: TrainingType[];
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
  // Update Firestore
  await updateDoc(doc(db, "words", word.id), { translation });
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

  // Fetch words for training
  const fetchTrainingWords = useCallback(async () => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const wordsQuery = query(
        collection(db, "words"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(wordsQuery);
      let allWords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Word[];

      // Filter by selected statuses
      if (selectedStatuses.length > 0) {
        allWords = allWords.filter((word) =>
          selectedStatuses.includes(word.status || 1)
        );
      }

      // Filter by selected analyses if any
      if (selectedAnalysisIds.length > 0) {
        allWords = allWords.filter(
          (word) =>
            word.analysisIds &&
            word.analysisIds.some((id) => selectedAnalysisIds.includes(id))
        );
      }

      // Sort by priority: lower status first, then by last trained date
      allWords.sort((a, b) => {
        const statusA = a.status || 1;
        const statusB = b.status || 1;

        if (statusA !== statusB) {
          return statusA - statusB; // Lower status first
        }

        // TODO: Add lastTrainedAt sorting when UserWord is implemented
        return 0;
      });

      // Take only the session size
      return allWords.slice(0, sessionSize);
    } catch (err) {
      console.error("Error fetching training words:", err);
      setError("Failed to fetch words for training");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, selectedStatuses, selectedAnalysisIds, sessionSize]);

  // Start training session
  const startSession = useCallback(async () => {
    if (!user) return;

    const trainingWords = await fetchTrainingWords();
    if (trainingWords.length === 0) {
      setError("No words available for training with the selected criteria");
      return;
    }

    // Create session
    const sessionData: Omit<TrainingSessionType, "id"> = {
      userId: user.uid,
      mode: "word",
      wordIds: trainingWords.map((w) => w.id),
      currentIndex: 0,
      completedWords: [],
      correctAnswers: 0,
      incorrectAnswers: 0,
      startedAt: new Date(),
      settings: {
        autoAdvance: false,
        showTranslation: true,
        showDefinition: true,
        trainingTypes,
        sessionSize,
        priorityLowerStatus: true,
        priorityOldWords: true,
      },
    };

    // Save session to database
    const sessionRef = await addDoc(collection(db, "trainingSessions"), {
      ...sessionData,
      startedAt: serverTimestamp(),
    });

    const newSession: TrainingSessionType = {
      ...sessionData,
      id: sessionRef.id,
    };

    setSession(newSession);
    setWords(trainingWords);
    setIsStarted(true);
    setIsCompleted(false);
    setCurrentWordIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setCompletedWords([]);

    // Generate first question, fetch translation if missing
    let firstWord = trainingWords[0];
    if (
      !firstWord.translation ||
      firstWord.translation === "No translation found."
    ) {
      setLoading(true);
      const translation = await fetchAndUpdateTranslation(firstWord);
      firstWord = { ...firstWord, translation };
      setWords((prev) => {
        const updated = [...prev];
        updated[0] = firstWord;
        return updated;
      });
      setLoading(false);
    }
    const question = TrainingQuestionGenerator.generateQuestion(
      firstWord,
      trainingTypes[0]
    );
    setCurrentQuestion(question);
  }, [user, fetchTrainingWords, trainingTypes, sessionSize]);

  // Handle answer submission
  const handleAnswer = useCallback(
    async (isCorrect: boolean) => {
      if (!session || !currentQuestion || !words[currentWordIndex]) return;

      const currentWord = words[currentWordIndex];
      const oldStatus = currentWord.status || 1;
      let newStatus = oldStatus;

      // Update status based on answer
      if (isCorrect) {
        newStatus = Math.min(7, oldStatus + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      } else {
        newStatus = Math.max(1, oldStatus - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      }

      // Update progress
      if (isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      } else {
        setIncorrectAnswers((prev) => prev + 1);
      }

      setCompletedWords((prev) => [...prev, currentWord.id]);

      // Update word status in database
      try {
        await updateDoc(doc(db, "words", currentWord.id), {
          status: newStatus,
          lastTrainedAt: serverTimestamp(),
        });

        // Update user stats
        if (user) {
          await updateWordStatsOnStatusChange({
            wordId: currentWord.id,
            userId: user.uid,
            oldStatus,
            newStatus,
          });
        }

        // Save training result
        const trainingResult: Omit<TrainingResult, "id"> = {
          result: isCorrect ? "correct" : "incorrect",
          type: currentQuestion.type,
          timestamp: new Date(),
          oldStatus,
          newStatus,
          sessionId: session.id,
        };

        await addDoc(collection(db, "trainingResults"), {
          ...trainingResult,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error updating word status:", err);
        setError("Failed to update word status");
      }

      // Move to next word or complete session
      const nextIndex = currentWordIndex + 1;
      if (nextIndex < words.length) {
        let nextWord = words[nextIndex];
        if (
          !nextWord.translation ||
          nextWord.translation === "No translation found."
        ) {
          setLoading(true);
          const translation = await fetchAndUpdateTranslation(nextWord);
          nextWord = { ...nextWord, translation };
          setWords((prev) => {
            const updated = [...prev];
            updated[nextIndex] = nextWord;
            return updated;
          });
          setLoading(false);
        }
        setCurrentWordIndex(nextIndex);
        const nextQuestion = TrainingQuestionGenerator.generateQuestion(
          nextWord,
          trainingTypes[0]
        );
        setCurrentQuestion(nextQuestion);
      } else {
        // Session completed
        setIsCompleted(true);
        setCurrentQuestion(null);

        // Update session in database
        if (session) {
          await updateDoc(doc(db, "trainingSessions", session.id), {
            completedAt: serverTimestamp(),
            correctAnswers: correctAnswers + (isCorrect ? 1 : 0),
            incorrectAnswers: incorrectAnswers + (isCorrect ? 0 : 1),
            completedWords: [...completedWords, currentWord.id],
          });
        }
      }
    },
    [
      session,
      currentQuestion,
      words,
      currentWordIndex,
      trainingTypes,
      correctAnswers,
      incorrectAnswers,
      completedWords,
      user,
    ]
  );

  // Skip current question
  const skipQuestion = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      const nextWord = words[nextIndex];
      const nextQuestion = TrainingQuestionGenerator.generateQuestion(
        nextWord,
        trainingTypes[0]
      );
      setCurrentQuestion(nextQuestion);
    } else {
      // Reached the last word, complete the session
      setIsCompleted(true);
      setCurrentQuestion(null);
    }
  }, [currentWordIndex, words, trainingTypes]);

  // Navigate to next word
  const nextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      const nextWord = words[nextIndex];
      const nextQuestion = TrainingQuestionGenerator.generateQuestion(
        nextWord,
        trainingTypes[0]
      );
      setCurrentQuestion(nextQuestion);
    } else {
      // Reached the last word, complete the session
      setIsCompleted(true);
      setCurrentQuestion(null);
    }
  }, [currentWordIndex, words, trainingTypes]);

  // Navigate to previous word
  const previousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      const prevIndex = currentWordIndex - 1;
      setCurrentWordIndex(prevIndex);
      const prevWord = words[prevIndex];
      const prevQuestion = TrainingQuestionGenerator.generateQuestion(
        prevWord,
        trainingTypes[0]
      );
      setCurrentQuestion(prevQuestion);
    }
  }, [currentWordIndex, words, trainingTypes]);

  // Handle status change for manual training
  const handleStatusChange = useCallback(
    async (wordId: string, newStatus: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
      if (!user) return;

      const currentWord = words[currentWordIndex];
      if (currentWord.id !== wordId) return;

      const oldStatus = currentWord.status || 1;

      try {
        // Update word status in database
        await updateDoc(doc(db, "words", wordId), {
          status: newStatus,
          lastTrainedAt: serverTimestamp(),
        });

        // Update user stats
        await updateWordStatsOnStatusChange({
          wordId,
          userId: user.uid,
          oldStatus,
          newStatus,
        });

        // Update local state
        setWords((prev) =>
          prev.map((word) =>
            word.id === wordId ? { ...word, status: newStatus } : word
          )
        );

        // Save training result
        const trainingResult: Omit<TrainingResult, "id"> = {
          result: "correct", // Manual status change is considered correct
          type: "manual",
          timestamp: new Date(),
          oldStatus,
          newStatus,
          sessionId: session?.id,
        };

        await addDoc(collection(db, "trainingResults"), {
          ...trainingResult,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error updating word status:", err);
        setError("Failed to update word status");
      }
    },
    [user, words, currentWordIndex, session]
  );

  // End session
  const endSession = useCallback(() => {
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

  // Retry incorrect answers
  const retryIncorrectAnswers = useCallback(async () => {
    if (!user || words.length === 0) return;

    // Get words that were answered incorrectly (status decreased)
    const incorrectWords = words.filter((word) => {
      const originalStatus = word.status || 1;
      // If word status is lower than expected, it was likely answered incorrectly
      return originalStatus <= 2; // Words with low status that need retry
    });

    if (incorrectWords.length === 0) {
      // No incorrect answers to retry, start new session
      endSession();
      return;
    }

    // Start a new session with only incorrect words
    const sessionData: Omit<TrainingSessionType, "id"> = {
      userId: user.uid,
      mode: "word",
      wordIds: incorrectWords.map((w) => w.id),
      currentIndex: 0,
      completedWords: [],
      correctAnswers: 0,
      incorrectAnswers: 0,
      startedAt: new Date(),
      settings: {
        autoAdvance: false,
        showTranslation: true,
        showDefinition: true,
        trainingTypes,
        sessionSize: incorrectWords.length,
        priorityLowerStatus: true,
        priorityOldWords: true,
      },
    };

    // Save session to database
    const sessionRef = await addDoc(collection(db, "trainingSessions"), {
      ...sessionData,
      startedAt: serverTimestamp(),
    });

    const newSession: TrainingSessionType = {
      ...sessionData,
      id: sessionRef.id,
    };

    setSession(newSession);
    setWords(incorrectWords);
    setIsStarted(true);
    setIsCompleted(false);
    setCurrentWordIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setCompletedWords([]);

    // Generate first question
    const firstWord = incorrectWords[0];
    const question = TrainingQuestionGenerator.generateQuestion(
      firstWord,
      trainingTypes[0]
    );
    setCurrentQuestion(question);
  }, [user, words, trainingTypes, endSession]);

  // Handle word deletion
  const handleDeleteWord = useCallback(
    async (wordToDelete: Word) => {
      if (!user) return;

      try {
        // Remove word from database
        await updateDoc(doc(db, "words", wordToDelete.id), {
          deletedAt: serverTimestamp(),
        });

        // Remove from local state
        setWords((prev) => {
          const updated = prev.filter((word) => word.id !== wordToDelete.id);

          // Check if we have no more words
          if (updated.length === 0) {
            // End session immediately if no words left
            setTimeout(() => {
              setIsCompleted(true);
              setCurrentQuestion(null);
            }, 100);
          }

          return updated;
        });

        // If we deleted the current word, move to next or previous
        if (wordToDelete.id === words[currentWordIndex]?.id) {
          if (currentWordIndex < words.length - 1) {
            nextWord();
          } else if (currentWordIndex > 0) {
            previousWord();
          } else {
            // No more words, end session
            setTimeout(() => {
              setIsCompleted(true);
              setCurrentQuestion(null);
            }, 100);
          }
        }
      } catch (err) {
        console.error("Error deleting word:", err);
        setError("Failed to delete word");
      }
    },
    [user, words, currentWordIndex, nextWord, previousWord]
  );

  // Calculate progress
  const progress =
    words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;
  const accuracy =
    correctAnswers + incorrectAnswers > 0
      ? (correctAnswers / (correctAnswers + incorrectAnswers)) * 100
      : 0;

  // Complete session manually
  const completeSession = useCallback(() => {
    setIsCompleted(true);
    setCurrentQuestion(null);
  }, []);

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
  };
}
