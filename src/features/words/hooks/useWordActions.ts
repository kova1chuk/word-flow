import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import { db } from "@/lib/firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { config } from "@/lib/config";
import { updateWordStatsOnStatusChange } from "@/features/word-management/lib/updateWordStatsOnStatusChange";
import type { Word, WordDetails, Phonetic } from "@/types";

interface DictionaryApiResponse {
  phonetics: { text: string; audio: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
}

export function useWordActions() {
  const user = useSelector(selectUser);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleDeleteWord = useCallback(
    async (word: Word) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, "words", word.id));
        return true; // Success
      } catch (error) {
        console.error("Error deleting word:", error);
        throw new Error("Failed to delete word");
      }
    },
    [user]
  );

  const onReloadDefinition = useCallback(
    async (word: Word) => {
      if (!user) return;
      setUpdating(word.id);

      try {
        let definition = "";
        let details: WordDetails | undefined = undefined;

        const res = await fetch(
          `${config.dictionaryApi}/${encodeURIComponent(word.word)}`
        );

        if (res.ok) {
          const data: DictionaryApiResponse[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const firstResult = data[0];
            definition =
              firstResult.meanings?.[0]?.definitions?.[0]?.definition ??
              "No definition found.";
            details = {
              phonetics: (firstResult.phonetics || [])
                .map((p) => ({ text: p.text, audio: p.audio }))
                .filter((p): p is Phonetic => !!(p.text && p.audio)),
              meanings: (firstResult.meanings || []).map((m) => ({
                partOfSpeech: m.partOfSpeech,
                definitions: m.definitions.map((d) => {
                  const newDef: {
                    definition: string;
                    example?: string;
                    synonyms?: string[];
                    antonyms?: string[];
                  } = { definition: d.definition };
                  if (d.example) newDef.example = d.example;
                  if (d.synonyms) newDef.synonyms = d.synonyms;
                  if (d.antonyms) newDef.antonyms = d.antonyms;
                  return newDef;
                }),
              })),
            };
          } else {
            definition = "No definition found.";
          }
        } else {
          definition = "No definition found.";
        }

        const dataToUpdate: { definition: string; details?: WordDetails } = {
          definition,
        };
        if (details) dataToUpdate.details = details;

        await updateDoc(doc(db, "words", word.id), dataToUpdate);
        return dataToUpdate;
      } catch (error) {
        console.error("Error reloading definition:", error);
        throw new Error(
          `Failed to reload definition: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setUpdating(null);
      }
    },
    [user]
  );

  const onReloadTranslation = useCallback(
    async (word: Word) => {
      if (!user) return;
      setUpdating(word.id);

      try {
        let translation = "";
        const langPair = `en|uk`;
        const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
          word.word
        )}&langpair=${langPair}`;

        const res = await fetch(url);
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

        await updateDoc(doc(db, "words", word.id), { translation });
        return { translation };
      } catch (error) {
        console.error("Error reloading translation:", error);
        throw new Error(
          `Failed to reload translation: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setUpdating(null);
      }
    },
    [user]
  );

  const onStatusChange = useCallback(
    async (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7, words: Word[]) => {
      if (!user) return;
      setUpdating(id);

      try {
        // Find the word and its old status
        const word = words.find((w) => w.id === id);
        if (!word) throw new Error("Word not found");
        const oldStatus = word.status;
        if (typeof oldStatus !== "number") {
          throw new Error("Old status is not a number");
        }

        await updateDoc(doc(db, "words", id), { status });
        await updateWordStatsOnStatusChange({
          wordId: id,
          userId: user.uid,
          oldStatus,
          newStatus: status,
        });

        return { status };
      } catch (error) {
        console.error("Error updating word status:", error);
        throw new Error("Failed to update word status");
      } finally {
        setUpdating(null);
      }
    },
    [user]
  );

  return {
    updating,
    handleDeleteWord,
    onReloadDefinition,
    onReloadTranslation,
    onStatusChange,
  };
}
