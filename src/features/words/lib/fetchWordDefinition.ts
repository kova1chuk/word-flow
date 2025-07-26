import { config } from "@/lib/config";

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

interface FetchWordDefinitionResult {
  definition: string | null;
  phoneticText: string | null;
  phoneticAudioLink: string | null;
}

export async function fetchWordDefinition(
  langCode: string = "en",
  wordText: string,
): Promise<FetchWordDefinitionResult> {
  let definition: string | null = null;
  let phoneticText: string | null = null;
  let phoneticAudioLink: string | null = null;

  const res = await fetch(
    `${config.dictionaryApi}/${langCode}/${encodeURIComponent(wordText)}`,
  );

  if (res.ok) {
    const data: DictionaryApiResponse[] = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const firstResult = data[0];
      definition =
        firstResult.meanings?.[0]?.definitions?.[0]?.definition ?? null;

      if (firstResult.phonetics && firstResult.phonetics.length > 0) {
        const phonetic = firstResult.phonetics[0];
        phoneticText = phonetic.text;
        phoneticAudioLink = phonetic.audio;
      }
    }
  }

  return {
    definition,
    phoneticText,
    phoneticAudioLink,
  };
}
