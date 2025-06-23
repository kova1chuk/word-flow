import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import {
  Analysis,
  Sentence,
  ReadingProgress,
  UserSettings,
} from "@/entities/analysis";
import { API_ENDPOINTS } from "@/shared/config/api";

export const fetchAnalysisDetails = async (
  analysisId: string,
  userId: string
): Promise<{
  analysis: Analysis;
  sentences: Sentence[];
}> => {
  // Fetch analysis document
  const analysisRef = doc(db, "analyses", analysisId);
  const analysisSnap = await getDoc(analysisRef);

  if (!analysisSnap.exists() || analysisSnap.data().userId !== userId) {
    throw new Error(
      "Analysis not found or you do not have permission to view it."
    );
  }

  const analysis = {
    id: analysisSnap.id,
    ...analysisSnap.data(),
  } as Analysis;

  // Fetch sentences subcollection
  const sentencesRef = collection(analysisRef, "sentences");
  const q = query(sentencesRef, orderBy("index"));
  const sentencesSnap = await getDocs(q);
  const sentences = sentencesSnap.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Sentence)
  );

  return { analysis, sentences };
};

export const saveReadingProgress = async (
  userId: string,
  analysisId: string,
  page: number,
  sentenceIndex: number = 0
): Promise<void> => {
  const progressRef = doc(db, "readingProgress", `${userId}_${analysisId}`);
  const progress: ReadingProgress = {
    currentPage: page,
    currentSentenceIndex: sentenceIndex,
    lastReadAt: Timestamp.now(),
  };
  await setDoc(progressRef, progress);
};

export const loadReadingProgress = async (
  userId: string,
  analysisId: string
): Promise<ReadingProgress | null> => {
  const progressRef = doc(db, "readingProgress", `${userId}_${analysisId}`);
  const progressSnap = await getDoc(progressRef);

  if (progressSnap.exists()) {
    return progressSnap.data() as ReadingProgress;
  }

  return null;
};

export const saveUserSettings = async (
  userId: string,
  sentencesPerPage: number
): Promise<void> => {
  const settingsRef = doc(db, "userSettings", userId);
  const settings: UserSettings = {
    sentencesPerPage,
  };
  await setDoc(settingsRef, settings);
};

export const loadUserSettings = async (
  userId: string
): Promise<UserSettings | null> => {
  const settingsRef = doc(db, "userSettings", userId);
  const settingsSnap = await getDoc(settingsRef);

  if (settingsSnap.exists()) {
    return settingsSnap.data() as UserSettings;
  }

  return null;
};

export const translateSentence = async (text: string): Promise<string> => {
  const url = `${API_ENDPOINTS.translation.baseUrl}?q=${encodeURIComponent(
    text
  )}&langpair=en|uk`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.responseData) {
    return data.responseData.translatedText;
  } else {
    throw new Error("Translation failed");
  }
};

export const fetchWordInfo = async (
  word: string
): Promise<{
  definition: string;
  translation: string;
  details: Record<string, unknown>;
}> => {
  // Fetch word info from multiple APIs
  const [freeDictResponse, datamuseResponse] = await Promise.allSettled([
    fetch(`${API_ENDPOINTS.dictionary}/${encodeURIComponent(word)}`),
    fetch(
      `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=5`
    ),
  ]);

  let definition = "";
  let details: Record<string, unknown> = {};

  if (freeDictResponse.status === "fulfilled" && freeDictResponse.value.ok) {
    try {
      const freeDictData = await freeDictResponse.value.json();
      if (freeDictData && freeDictData.length > 0) {
        definition =
          freeDictData[0].meanings?.[0]?.definitions?.[0]?.definition || "";
        details = { freeDictionary: freeDictData };
      }
    } catch (error) {
      console.error("Error parsing Free Dictionary API response:", error);
    }
  }

  if (datamuseResponse.status === "fulfilled" && datamuseResponse.value.ok) {
    try {
      const datamuseData = await datamuseResponse.value.json();
      details = { ...details, datamuse: datamuseData };
    } catch (error) {
      console.error("Error parsing Datamuse API response:", error);
    }
  }

  // Try to get translation
  let translation = "";
  try {
    const translationResponse = await fetch(
      `${API_ENDPOINTS.translation.baseUrl}?q=${encodeURIComponent(
        word
      )}&langpair=en|uk`
    );
    const translationData = await translationResponse.json();
    translation = translationData.responseData?.translatedText || "";
  } catch (error) {
    console.error("Translation error:", error);
  }

  return {
    definition: definition || "No definition found",
    translation,
    details,
  };
};
