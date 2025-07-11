import { useCallback } from "react";

import {
  setReloadingDefinition,
  setReloadingTranslation,
} from "@/entities/analysis/model/analysisSlice";
import type { WordInfo } from "@/entities/analysis/types";

import { useAppDispatch } from "@/shared/model/store";

import { fetchWordInfo, translateSentence } from "./analysisApi";

export const useWordManagement = (
  selectedWord: WordInfo | null,
  setSelectedWord: (word: WordInfo | null) => void
) => {
  const dispatch = useAppDispatch();

  // Reload definition
  const reloadDefinition = useCallback(async () => {
    if (!selectedWord) return;
    dispatch(setReloadingDefinition(true));

    try {
      const { definition, details } = await fetchWordInfo(selectedWord.word);
      setSelectedWord({
        ...selectedWord,
        definition,
        details,
      });
    } catch (error) {
      console.error("Error reloading definition:", error);
      setSelectedWord({
        ...selectedWord,
        definition: "Failed to reload definition",
        details: {
          ...selectedWord.details,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } finally {
      dispatch(setReloadingDefinition(false));
    }
  }, [selectedWord, setSelectedWord, dispatch]);

  // Reload translation
  const reloadTranslation = useCallback(async () => {
    if (!selectedWord) return;
    dispatch(setReloadingTranslation(true));

    try {
      const translation = await translateSentence(selectedWord.word);
      setSelectedWord({
        ...selectedWord,
        translation,
      });
    } catch (error) {
      console.error("Error reloading translation:", error);
      setSelectedWord({
        ...selectedWord,
        translation: "Failed to reload translation",
      });
    } finally {
      dispatch(setReloadingTranslation(false));
    }
  }, [selectedWord, setSelectedWord, dispatch]);

  return {
    reloadDefinition,
    reloadTranslation,
  };
};
