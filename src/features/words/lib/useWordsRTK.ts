import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/shared/model/store";
import { AppDispatch } from "@/shared/model/store";
import {
  fetchWordsPage,
  fetchWordsWithFilters,
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
    statusFilter?: number[]
  ) => {
    dispatch(fetchWordsPage({ userId, page, pageSize, statusFilter }));
  };

  const fetchWordsWithFiltersAction = (
    userId: string,
    statusFilter?: number[],
    search?: string
  ) => {
    dispatch(fetchWordsWithFilters({ userId, statusFilter, search }));
  };

  const deleteWordAction = (wordId: string, userId: string) => {
    dispatch(deleteWord({ wordId, userId }));
  };

  const reloadDefinitionAction = (word: Word, userId: string) => {
    dispatch(reloadDefinition({ word, userId }));
  };

  const reloadTranslationAction = (word: Word, userId: string) => {
    dispatch(reloadTranslation({ word, userId }));
  };

  const updateWordStatusAction = (
    wordId: string,
    status: 1 | 2 | 3 | 4 | 5 | 6 | 7,
    userId: string
  ) => {
    dispatch(updateWordStatus({ wordId, status, userId, words }));
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
    fetchWordsWithFilters: fetchWordsWithFiltersAction,
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
