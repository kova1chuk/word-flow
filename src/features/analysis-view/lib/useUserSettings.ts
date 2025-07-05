import { useEffect, useCallback } from "react";
import { useAppDispatch } from "@/app/store";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import {
  Sentence,
  setCurrentPage,
  setSentencesPerPage,
} from "@/entities/analysis";
import {
  saveReadingProgress,
  loadReadingProgress,
  saveUserSettings,
  loadUserSettings,
} from "./analysisApi";

export const useUserSettings = (
  analysisId: string,
  sentences: Sentence[],
  currentPage: number
) => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // Load reading progress
  useEffect(() => {
    if (user && analysisId) {
      const loadProgress = async () => {
        try {
          const progress = await loadReadingProgress(user.uid, analysisId);
          if (progress) {
            dispatch(setCurrentPage(progress.currentPage));
          }
        } catch (error) {
          console.error("Error loading reading progress:", error);
        }
      };
      loadProgress();
    }
  }, [user, analysisId, dispatch]);

  // Load user settings
  useEffect(() => {
    if (user) {
      const loadSettings = async () => {
        try {
          const settings = await loadUserSettings(user.uid);
          if (settings) {
            dispatch(setSentencesPerPage(settings.sentencesPerPage));
          }
        } catch (error) {
          console.error("Error loading user settings:", error);
        }
      };
      loadSettings();
    }
  }, [user, dispatch]);

  // Save reading progress
  const saveProgress = useCallback(
    async (page: number, sentenceIndex: number = 0) => {
      if (!user || !analysisId) return;

      try {
        await saveReadingProgress(user.uid, analysisId, page, sentenceIndex);
      } catch (error) {
        console.error("Error saving reading progress:", error);
      }
    },
    [user, analysisId]
  );

  // Save user settings
  const saveSettings = useCallback(
    async (newSentencesPerPage: number) => {
      if (!user) return;

      try {
        await saveUserSettings(user.uid, newSentencesPerPage);
        dispatch(setSentencesPerPage(newSentencesPerPage));

        // Recalculate current page to maintain position
        const newTotalPages = Math.ceil(sentences.length / newSentencesPerPage);
        const newCurrentPage = Math.min(currentPage, newTotalPages);
        dispatch(setCurrentPage(newCurrentPage));
        saveProgress(newCurrentPage);
      } catch (error) {
        console.error("Error saving user settings:", error);
      }
    },
    [user, sentences.length, currentPage, dispatch, saveProgress]
  );

  return {
    saveProgress,
    saveSettings,
  };
};
