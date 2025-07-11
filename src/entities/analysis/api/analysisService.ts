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
} from "firebase/firestore";

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
