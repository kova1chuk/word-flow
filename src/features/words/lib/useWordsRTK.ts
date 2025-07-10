import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/shared/model/store";
import { AppDispatch } from "@/shared/model/store";
import {
  fetchWordsPage,
  deleteWord,
  reloadDefinition,
  reloadTranslation,
  updateWordStatus,
  clearError,
  setUpdating,
  setCurrentPage,
  setPageSize,
  clearWords,
} from "../model/wordsSlice";
import type { Word } from "@/types";

export const useWordsRTK = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { words, loading, error, updating, pagination } = useSelector(
    (state: RootState) => state.words
  );

  const fetchWords = (
    userId: string,
    page: number,
    pageSize: number,
    statusFilter?: number[],
    search?: string
  ) => {
    dispatch(fetchWordsPage({ userId, page, pageSize, statusFilter, search }));
  };

  const deleteWordAction = (wordId: string, userId: string) => {
    dispatch(deleteWord({ wordId, userId }));
  };

  const reloadDefinitionAction = (word: Word) => {
    dispatch(reloadDefinition({ word }));
  };

  const reloadTranslationAction = (word: Word) => {
    dispatch(reloadTranslation({ word }));
  };

  const updateWordStatusAction = (
    wordId: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
    userId: string,
    words: Record<number, Word[]>
  ) => {
    const allWords = Object.values(words).flat();
    dispatch(updateWordStatus({ wordId, status, userId, words: allWords }));
  };

  const clearErrorAction = () => {
    dispatch(clearError());
  };

  const setUpdatingAction = (wordId: string | null) => {
    dispatch(setUpdating(wordId));
  };

  const setCurrentPageAction = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const setPageSizeAction = (pageSize: number) => {
    dispatch(setPageSize(pageSize));
  };

  const clearWordsAction = () => {
    dispatch(clearWords());
  };

  return {
    words,
    loading,
    error,
    updating,
    pagination,
    fetchWords,
    deleteWord: deleteWordAction,
    reloadDefinition: reloadDefinitionAction,
    reloadTranslation: reloadTranslationAction,
    updateWordStatus: updateWordStatusAction,
    clearError: clearErrorAction,
    setUpdating: setUpdatingAction,
    setCurrentPage: setCurrentPageAction,
    setPageSize: setPageSizeAction,
    clearWords: clearWordsAction,
  };
};
