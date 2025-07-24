import { useState, useCallback } from "react";

import { useSelector } from "react-redux";

import { createClient } from "@/utils/supabase/client";

import { selectUser } from "@/entities/user/model/selectors";

import { config } from "@/lib/config";

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
        // TODO: Implement Supabase word deletion
        console.log("Would delete word:", word.id);

        // Placeholder implementation
        const supabase = createClient();
        const { error } = await supabase
          .from("words")
          .delete()
          .eq("id", word.id)
          .eq("user_id", user.uid);

        if (error) {
          console.log("Word deletion not fully implemented:", error);
        }

        return true; // Success
      } catch (error) {
        console.error("Error deleting word:", error);
        throw new Error("Failed to delete word");
      }
    },
    [user],
  );

  const onReloadDefinition = useCallback(
    async (word: Word) => {
      if (!user) return;
      setUpdating(word.id);

      try {
        let definition = "";
        let details: WordDetails | undefined = undefined;

        const res = await fetch(
          `${config.dictionaryApi}/${encodeURIComponent(word.word)}`,
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

        // TODO: Update word in Supabase instead of Firebase
        console.log("Would update word definition:", {
          wordId: word.id,
          dataToUpdate,
        });

        return dataToUpdate;
      } catch (error) {
        console.error("Error reloading definition:", error);
        throw new Error(
          `Failed to reload definition: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      } finally {
        setUpdating(null);
      }
    },
    [user],
  );

  const onReloadTranslation = useCallback(
    async (word: Word) => {
      if (!user) return;
      setUpdating(word.id);

      try {
        let translation = "";
        const langPair = `en|uk`;
        const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
          word.word,
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

        // TODO: Update word in Supabase instead of Firebase
        console.log("Would update word translation:", {
          wordId: word.id,
          translation,
        });

        return { translation };
      } catch (error) {
        console.error("Error reloading translation:", error);
        throw new Error(
          `Failed to reload translation: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      } finally {
        setUpdating(null);
      }
    },
    [user],
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

        // TODO: Update word status in Supabase instead of Firebase
        console.log("Would update word status:", {
          wordId: id,
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
    [user],
  );

  return {
    updating,
    handleDeleteWord,
    onReloadDefinition,
    onReloadTranslation,
    onStatusChange,
  };
}
