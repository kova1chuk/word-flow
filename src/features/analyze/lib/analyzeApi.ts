import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { config } from "@/lib/config";

export interface AnalysisResult {
  title: string;
  wordFrequency: { [key: string]: number };
  unknownWordList: string[];
  sentences: string[];
  summary: {
    totalWords: number;
    uniqueWords: number;
    learnerWords: number;
    unknownWords: number;
  };
  isProcessingUserWords?: boolean;
}

export interface ApiAnalysisResponse {
  title?: string;
  wordFrequency?: { [key: string]: number };
  unknownWordList?: string[];
  sentences?: string[];
  totalWords?: number;
  uniqueWords?: number;
  knownWords?: number;
  unknownWords?: number;
  averageWordLength?: number;
  readingTime?: number;
  summary?: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    averageWordLength: number;
    readingTime: number;
  };
  unique_words?: string[];
  total_words?: number;
  total_unique_words?: number;
}

type UserWord = {
  word: string;
  status?: string;
};

export type { UserWord };

const transformApiResult = (
  apiResponse: ApiAnalysisResponse,
  fileName: string,
  userWords: UserWord[]
): AnalysisResult => {
  const userWordMap = new Map(
    userWords.map((w) => [w.word.toLowerCase(), w.status])
  );
  let uniqueWords: string[] = [];
  if (Array.isArray(apiResponse.unique_words)) {
    uniqueWords = apiResponse.unique_words;
  } else if (Array.isArray(apiResponse.uniqueWords)) {
    uniqueWords = apiResponse.uniqueWords;
  }
  let learnerWords = 0;
  let unknownWords = 0;

  uniqueWords.forEach((word: string) => {
    const status = userWordMap.get(word.toLowerCase());
    if (status !== undefined) {
      if (status === "to_learn" || status === "want_repeat") {
        learnerWords++;
      }
    } else {
      unknownWords++;
    }
  });

  let totalWords = 0;
  if (typeof apiResponse.total_words === "number") {
    totalWords = apiResponse.total_words;
  } else if (typeof apiResponse.totalWords === "number") {
    totalWords = apiResponse.totalWords;
  }
  let totalUniqueWords = 0;
  if (typeof apiResponse.total_unique_words === "number") {
    totalUniqueWords = apiResponse.total_unique_words;
  } else if (typeof apiResponse.uniqueWords === "number") {
    totalUniqueWords = apiResponse.uniqueWords;
  }

  return {
    title: apiResponse.title || fileName,
    wordFrequency: apiResponse.wordFrequency || {},
    unknownWordList: apiResponse.unknownWordList || [],
    sentences: apiResponse.sentences || [],
    summary: {
      totalWords,
      uniqueWords: totalUniqueWords,
      learnerWords,
      unknownWords,
    },
  };
};

export const analyzeApi = {
  // Analyze subtitle files (SRT, VTT)
  async analyzeSubtitle(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(config.subtitleAnalysisUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Subtitle upload failed: ${response.statusText}`);
    }

    const apiResponse = await response.json();
    return transformApiResult(apiResponse, file.name, []);
  },

  // Analyze generic files (TXT, EPUB)
  async analyzeFile(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(config.uploadServiceUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const apiResponse = await response.json();
    return transformApiResult(apiResponse, file.name, []);
  },

  // Analyze pasted text
  async analyzeText(text: string): Promise<AnalysisResult> {
    const response = await fetch(config.textAnalysisUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const flatResult = await response.json();
    return {
      title: flatResult.title || "Pasted Text",
      wordFrequency: flatResult.wordFrequency || {},
      unknownWordList: flatResult.unknownWordList || [],
      sentences: flatResult.sentences || [],
      summary: {
        totalWords: flatResult.totalWords || flatResult.total_words || 0,
        uniqueWords:
          flatResult.uniqueWords || flatResult.total_unique_words || 0,
        learnerWords: 0,
        unknownWords: flatResult.unknownWords || 0,
      },
    };
  },

  // Save analysis to Firestore
  async saveAnalysis(
    userId: string,
    analysisResult: AnalysisResult
  ): Promise<string> {
    // Save the analysis document (without sentences field)
    const analysisRef = await addDoc(collection(db, "analyses"), {
      userId,
      title: analysisResult.title,
      createdAt: Timestamp.now(),
      summary: analysisResult.summary,
    });

    // Save each sentence as a document in the 'sentences' subcollection
    const sentences = analysisResult.sentences || [];
    for (let i = 0; i < sentences.length; i++) {
      await addDoc(collection(analysisRef, "sentences"), {
        text: sentences[i],
        index: i,
      });
    }

    // Create words subcollection in the analysis document
    const wordsCollection = collection(analysisRef, "words");

    // For each word in the analysis, save or update the word document with usages
    const allWords = Array.from(
      new Set([
        ...Object.keys(analysisResult.wordFrequency || {}),
        ...(analysisResult.unknownWordList || []),
      ])
    );
    for (const word of allWords) {
      // Find all sentence indexes where the word appears
      const usageIndexes = sentences
        .map((sentence, idx) =>
          sentence.toLowerCase().includes(word.toLowerCase()) ? idx : -1
        )
        .filter((idx) => idx !== -1);

      // Get existing word document to merge analysisId properly
      const wordDocRef = doc(db, "words", `${userId}_${word}`);
      const wordDoc = await getDoc(wordDocRef);

      if (wordDoc.exists()) {
        // Word exists, update with new analysisId and merge usages
        const existingData = wordDoc.data();
        const existingUsages = existingData.usages || [];
        const existingAnalysisIds = existingData.analysisIds || [];

        // Add new analysisId if not already present
        if (!existingAnalysisIds.includes(analysisRef.id)) {
          existingAnalysisIds.push(analysisRef.id);
        }

        // Merge usages
        const mergedUsages = [...new Set([...existingUsages, ...usageIndexes])];

        await setDoc(
          wordDocRef,
          {
            userId,
            word,
            analysisIds: existingAnalysisIds,
            analysisId: analysisRef.id, // Keep for backward compatibility
            usages: mergedUsages,
          },
          { merge: true }
        );
      } else {
        // New word, create with analysisId
        await setDoc(wordDocRef, {
          userId,
          word,
          analysisIds: [analysisRef.id],
          analysisId: analysisRef.id,
          usages: usageIndexes,
        });
      }

      // Add word reference to analysis words subcollection
      await setDoc(doc(wordsCollection, wordDocRef.id), {
        wordId: wordDocRef.id,
        word: word,
        userId: userId,
        usages: usageIndexes,
      });
    }

    return analysisRef.id;
  },
};

export { config, transformApiResult };
