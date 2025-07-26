import React, { useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import WordCard from "@/components/WordCard";

import { selectPaginatedWordIds } from "@/features/words/model/selectors";

import type { AppDispatch, RootState } from "@/shared/model/store";

import { selectUser } from "../../../../entities/user";
import { Word } from "../../../../entities/word";
import { reloadWordDefinitionFromApi } from "../../lib/reloadWordDefinition";
import { reloadWordTranslationFromApi } from "../../lib/reloadWordTranslation";
import {
  reloadWordDefinition,
  reloadWordTranslation,
  removeWordFromDictionary,
} from "../../model/thunks";
import {
  addUpdatingDefinition,
  addUpdatingTranslation,
} from "../../model/wordsSlice";

interface WordsListProps {
  currentPage: number;
  onWordAction: (action: string, word: Word, data?: unknown) => void;
}

const WordsList: React.FC<WordsListProps> = ({ currentPage }) => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const { wordIds } = useSelector((state: RootState) =>
    selectPaginatedWordIds(state, { page: currentPage }),
  );
  // const { updatingDefinitions, updatingTranslations, updatingDelete } =
  //   useSelector(selectUpdating());

  const handleReloadDefinition = useCallback(
    (wordId: string, wordText: string) => {
      const reloadWordDefinitionThunk = (params: {
        langCode: string;
        id: string;
        definition: string | null;
        newPhoneticText: string | null;
        newPhoneticAudioLink: string | null;
      }) => {
        dispatch(reloadWordDefinition(params));
      };
      const addUpdatingDefinitionAction = (id: string) => {
        dispatch(addUpdatingDefinition(id));
      };
      reloadWordDefinitionFromApi({
        wordId,
        wordText,
        addUpdatingDefinition: addUpdatingDefinitionAction,
        reloadWordDefinition: reloadWordDefinitionThunk,
        langCode: "en",
      });
    },
    [dispatch],
  );

  const handleReloadTranslation = useCallback(
    (wordId: string, wordText: string) => {
      const reloadWordTranslationThunk = (params: {
        langCode: string;
        id: string;
        translation: string | null;
      }) => {
        dispatch(reloadWordTranslation(params));
      };
      const addUpdatingTranslationAction = (id: string) => {
        dispatch(addUpdatingTranslation(id));
      };
      reloadWordTranslationFromApi({
        wordId,
        wordText,
        addUpdatingTranslation: addUpdatingTranslationAction,
        reloadWordTranslation: reloadWordTranslationThunk,
        sourceLang: "en",
        targetLang: "uk",
      });
    },
    [dispatch],
  );

  const handleRemoveWord = useCallback(
    (wordId: string) => {
      if (!user) {
        return;
      }
      dispatch(
        removeWordFromDictionary({
          langCode: "en",
          id: wordId,
          userId: user.id,
        }),
      );
    },
    [dispatch],
  );

  if (wordIds.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No words found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wordIds.map((wordId) => (
        <WordCard
          key={wordId}
          wordId={wordId}
          currentPage={currentPage}
          onReloadDefinition={handleReloadDefinition}
          onReloadTranslation={handleReloadTranslation}
          onDelete={handleRemoveWord}
          onStatusChange={() => {}}
          // updatingDefinition={updatingDefinitions.includes(word.id)}
          // updatingTranslation={updatingTranslations.includes(word.id)}
          // updatingDelete={updatingDelete.includes(word.id)}
        />
      ))}
    </div>
  );
};

export default WordsList;
