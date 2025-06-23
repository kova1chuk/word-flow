import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { config } from "@/lib/config";

export interface AnalysisResult {
  title: string;
  wordFrequency: { [key: string]: number };
  unknownWordList: string[];
  sentences: string[];
  summary: {
    totalWords: number;
    uniqueWords: number;
    knownWords: number;
    unknownWords: number;
    averageWordLength: number;
    readingTime: number;
  };
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
}

const transformApiResult = (
  apiResponse: ApiAnalysisResponse,
  fileName: string
): AnalysisResult => {
  // Handles both flat and nested summary objects from the API
  const summaryData = apiResponse.summary || apiResponse;
  return {
    title: apiResponse.title || fileName,
    wordFrequency: apiResponse.wordFrequency || {},
    unknownWordList: apiResponse.unknownWordList || [],
    sentences: apiResponse.sentences || [],
    summary: {
      totalWords: summaryData.totalWords || 0,
      uniqueWords: summaryData.uniqueWords || 0,
      knownWords: summaryData.knownWords || 0,
      unknownWords: summaryData.unknownWords || 0,
      averageWordLength: summaryData.averageWordLength || 0,
      readingTime: Math.round(summaryData.readingTime || 0),
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
    return transformApiResult(apiResponse, file.name);
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
    return transformApiResult(apiResponse, file.name);
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
        totalWords: flatResult.totalWords || 0,
        uniqueWords: flatResult.uniqueWords || 0,
        knownWords: flatResult.knownWords || 0,
        unknownWords: flatResult.unknownWords || 0,
        averageWordLength: flatResult.averageWordLength || 0,
        readingTime: Math.round(flatResult.readingTime) || 0,
      },
    };
  },

  // Save analysis to Firestore
  async saveAnalysis(
    userId: string,
    analysisResult: AnalysisResult
  ): Promise<void> {
    await addDoc(collection(db, "analyses"), {
      userId,
      title: analysisResult.title,
      createdAt: Timestamp.now(),
      summary: analysisResult.summary,
      sentences: analysisResult.sentences,
    });
  },
};
