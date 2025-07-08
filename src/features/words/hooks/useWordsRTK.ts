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
  selectFilteredWords,
  selectPaginatedWords,
  selectWordsStats,
} from "../model/selectors";
import {
  fetchWords,
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
      dispatch(fetchWords(user.uid));
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
    if (!user?.uid) return;
    try {
      await dispatch(reloadDefinition({ word, userId: user.uid })).unwrap();
    } catch (error) {
      console.error("Failed to reload definition:", error);
      throw error;
    }
  };

  const handleReloadTranslation = async (word: Word) => {
    if (!user?.uid) return;
    try {
      await dispatch(reloadTranslation({ word, userId: user.uid })).unwrap();
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
      await dispatch(
        updateWordStatus({ wordId, status, userId: user.uid, words })
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

    // Selectors (for use in components)
    selectFilteredWords,
    selectPaginatedWords,
    selectWordsStats,
  };
}
