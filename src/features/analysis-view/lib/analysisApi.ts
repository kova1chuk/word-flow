import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs,
  limit,
  startAfter,
  Timestamp,
  setDoc,
} from "firebase/firestore";

import { API_ENDPOINTS } from "@/shared/config/api";

import { db } from "@/lib/firebase";

// Local type definitions to avoid circular dependency
interface SerializableTimestamp {
  seconds: number;
  nanoseconds: number;
  dateString: string;
}

interface Analysis {
  id: string;
  title: string;
  userId: string;
  createdAt: SerializableTimestamp;
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    wordStats?: { [key: number]: number };
  };
}

interface Sentence {
  id: string;
  text: string;
  index: number;
}

interface ReadingProgress {
  currentPage: number;
  currentSentenceIndex: number;
  lastReadAt: SerializableTimestamp;
}

interface UserSettings {
  sentencesPerPage: number;
}

interface FirestoreDocSnapshot {
  id: string;
  exists: () => boolean;
  data: () => Record<string, unknown>;
}

// Helper function to convert Firestore Timestamp to serializable format
const convertTimestamp = (timestamp: Timestamp) => {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
    // Store the date as a string for serialization
    dateString: timestamp.toDate().toISOString(),
  };
};

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

  const analysisData = analysisSnap.data();
  const analysis: Analysis = {
    id: analysisSnap.id,
    title: analysisData.title,
    userId: analysisData.userId,
    summary: analysisData.summary,
    createdAt: convertTimestamp(analysisData.createdAt),
  };

  // Fetch all sentences for now (will be replaced with pagination)
  const sentencesRef = collection(analysisRef, "sentences");
  const q = query(sentencesRef, orderBy("index"));
  const sentencesSnap = await getDocs(q);
  const sentences = sentencesSnap.docs.map((doc) => {
    const data = doc.data();
    // Convert any timestamp fields to serializable format
    const serializedData = { ...data };
    Object.keys(serializedData).forEach((key) => {
      const value = serializedData[key];
      if (
        value &&
        typeof value === "object" &&
        "seconds" in value &&
        "nanoseconds" in value &&
        "toDate" in value &&
        typeof value.toDate === "function"
      ) {
        serializedData[key] = convertTimestamp(value);
      }
    });
    return { id: doc.id, ...serializedData } as Sentence;
  });

  return { analysis, sentences };
};

export const fetchSentencesPage = async (
  analysisId: string,
  page: number,
  pageSize: number,
  lastDoc?: FirestoreDocSnapshot
): Promise<{
  sentences: Sentence[];
  hasMore: boolean;
  lastDoc: FirestoreDocSnapshot | null;
}> => {
  const sentencesRef = collection(db, "analyses", analysisId, "sentences");

  let q = query(sentencesRef, orderBy("index"), limit(pageSize));

  if (lastDoc && page > 1) {
    q = query(
      sentencesRef,
      orderBy("index"),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }

  const sentencesSnap = await getDocs(q);
  const sentences = sentencesSnap.docs.map((doc) => {
    const data = doc.data();
    // Convert any timestamp fields to serializable format
    const serializedData = { ...data };
    Object.keys(serializedData).forEach((key) => {
      const value = serializedData[key];
      if (
        value &&
        typeof value === "object" &&
        "seconds" in value &&
        "nanoseconds" in value &&
        "toDate" in value &&
        typeof value.toDate === "function"
      ) {
        serializedData[key] = convertTimestamp(value);
      }
    });
    return { id: doc.id, ...serializedData } as Sentence;
  });

  const hasMore = sentencesSnap.docs.length === pageSize;
  const newLastDoc = sentencesSnap.docs[sentencesSnap.docs.length - 1] || null;

  return {
    sentences,
    hasMore,
    lastDoc: newLastDoc,
  };
};

export const saveReadingProgress = async (
  userId: string,
  analysisId: string,
  page: number,
  sentenceIndex: number = 0
): Promise<void> => {
  const progressRef = doc(db, "readingProgress", `${userId}_${analysisId}`);
  const timestamp = Timestamp.now();
  const progress: ReadingProgress = {
    currentPage: page,
    currentSentenceIndex: sentenceIndex,
    lastReadAt: convertTimestamp(timestamp),
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
    const data = progressSnap.data();
    return {
      currentPage: data.currentPage,
      currentSentenceIndex: data.currentSentenceIndex,
      lastReadAt: convertTimestamp(data.lastReadAt),
    } as ReadingProgress;
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
    translation = await translateSentence(word);
  } catch (error) {
    console.error("Error translating word:", error);
  }

  return {
    definition,
    translation,
    details,
  };
};
