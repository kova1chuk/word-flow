import { config } from "@/lib/config";

interface TranslationApiResponse {
  responseData: {
    translatedText: string;
  };
}

interface FetchWordTranslationResult {
  translation: string | null;
}

export async function fetchWordTranslation(
  wordText: string,
  sourceLang: string = "en",
  targetLang: string = "uk",
): Promise<FetchWordTranslationResult> {
  let translation: string | null = null;

  const langPair = `${sourceLang}|${targetLang}`;
  const url = `${config.translationApi.baseUrl}?q=${encodeURIComponent(
    wordText,
  )}&langpair=${langPair}`;

  const res = await fetch(url);
  if (res.ok) {
    const data: TranslationApiResponse = await res.json();
    if (data.responseData && data.responseData.translatedText) {
      translation = data.responseData.translatedText;
    }
  }

  return {
    translation,
  };
}
