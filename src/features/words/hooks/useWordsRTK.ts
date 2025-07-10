import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/shared/model/store";
import { selectUser } from "@/entities/user/model/selectors";
import type { Word } from "@/types";
import {
  selectWords,
  selectWordsLoading,
  selectWordsError,
  selectWordsUpdating,
} from "../model/selectors";
import {
  fetchWordsPage,
  deleteWord,
  reloadDefinition,
  reloadTranslation,
  updateWordStatus,
  clearError,
} from "../model/wordsSlice";

export function useWordsRTK() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // Select state from store
  const words = useSelector(selectWords);
  const loading = useSelector(selectWordsLoading);
  const error = useSelector(selectWordsError);
  const updating = useSelector(selectWordsUpdating);

  // Fetch words when user changes
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchWordsPage({ userId: user.uid, page: 1, pageSize: 12 }));
    }
  }, [dispatch, user?.uid]);

  // Actions
  const handleDeleteWord = async (wordId: string) => {
    if (!user?.uid) return;
    try {
      await dispatch(deleteWord({ wordId, userId: user.uid })).unwrap();
    } catch (error) {
      console.error("Failed to delete word:", error);
      throw error;
    }
  };

  const handleReloadDefinition = async (word: Word) => {
    try {
      await dispatch(reloadDefinition({ word })).unwrap();
    } catch (error) {
      console.error("Failed to reload definition:", error);
      throw error;
    }
  };

  const handleReloadTranslation = async (word: Word) => {
    try {
      await dispatch(reloadTranslation({ word })).unwrap();
    } catch (error) {
      console.error("Failed to reload translation:", error);
      throw error;
    }
  };

  const handleStatusChange = async (
    wordId: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7
  ) => {
    if (!user?.uid) return;
    try {
      const allWords = Object.values(words).flat();
      await dispatch(
        updateWordStatus({ wordId, status, userId: user.uid, words: allWords })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update word status:", error);
      throw error;
    }
  };

  const clearErrorAction = () => {
    dispatch(clearError());
  };

  return {
    // State
    words,
    loading,
    error,
    updating,

    // Actions
    handleDeleteWord,
    handleReloadDefinition,
    handleReloadTranslation,
    handleStatusChange,
    clearError: clearErrorAction,
  };
}
