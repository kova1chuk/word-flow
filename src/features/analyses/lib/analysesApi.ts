import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export interface Analysis {
  id: string;
  title: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
    dateString: string;
  };
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    averageWordLength: number;
    readingTime: number;
  };
}

// Helper function to convert Firestore Timestamp to serializable format
const convertTimestamp = (timestamp: Timestamp) => {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
    dateString: timestamp.toDate().toISOString(),
  };
};

export const analysesApi = {
  // Fetch all analyses for a user
  async fetchUserAnalyses(userId: string): Promise<Analysis[]> {
    const analysesRef = collection(db, "analyses");
    const q = query(analysesRef, where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const analysesData: Analysis[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      analysesData.push({
        id: doc.id,
        title: data.title,
        createdAt: convertTimestamp(data.createdAt),
        summary: data.summary,
      } as Analysis);
    });

    // Sort by creation date, newest first
    analysesData.sort(
      (a, b) =>
        new Date(b.createdAt.dateString).getTime() -
        new Date(a.createdAt.dateString).getTime()
    );

    return analysesData;
  },
};
