import { fetchWordTranslation } from "@/features/words/lib/fetchWordTranslation";

interface ReloadWordTranslationParams {
  wordId: string;
  wordText: string;
  addUpdatingTranslation: (id: string) => void;
  reloadWordTranslation: (params: {
    langCode: string;
    id: string;
    translation: string | null;
  }) => void;
  sourceLang?: string;
  targetLang?: string;
}

export async function reloadWordTranslationFromApi({
  wordId,
  wordText,
  addUpdatingTranslation,
  reloadWordTranslation,
  sourceLang = "en",
  targetLang = "uk",
}: ReloadWordTranslationParams) {
  if (!wordId) return;

  addUpdatingTranslation(wordId);

  try {
    const { translation } = await fetchWordTranslation(
      wordText,
      sourceLang,
      targetLang,
    );

    // Use the thunk to save the translation to the database
    await reloadWordTranslation({
      langCode: sourceLang,
      id: wordId,
      translation,
    });

    console.log("Translation updated successfully for word:", wordText);

    return { translation };
  } catch (error) {
    console.error("Error reloading translation:", error);
    throw new Error(
      `Failed to reload translation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}
