import { fetchWordDefinition } from "@/features/dictionary/lib/fetchWordDefinition";

interface ReloadWordDefinitionParams {
  wordId: string;
  wordText: string;
  addUpdatingDefinition: (id: string) => void;
  reloadWordDefinition: (params: {
    langCode: string;
    id: string;
    definition: string | null;
    newPhoneticText: string | null;
    newPhoneticAudioLink: string | null;
  }) => void;
  langCode: string;
}

export async function reloadWordDefinitionFromApi({
  wordId,
  wordText,
  addUpdatingDefinition,
  reloadWordDefinition,
  langCode = "en",
}: ReloadWordDefinitionParams) {
  if (!wordId) return;

  addUpdatingDefinition(wordId);

  try {
    const { definition, phoneticText, phoneticAudioLink } =
      await fetchWordDefinition(langCode, wordText);

    if (!definition || definition.length === 0) {
      return;
    }

    // Use the thunk to save the definition to the database
    await reloadWordDefinition({
      langCode: "en",
      id: wordId,
      definition,
      newPhoneticText: phoneticText,
      newPhoneticAudioLink: phoneticAudioLink,
    });

    console.log("Definition updated successfully for word:", wordText);

    return { definition, phoneticText, phoneticAudioLink };
  } catch (error) {
    console.error("Error reloading definition:", error);
    throw new Error(
      `Failed to reload definition: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}
