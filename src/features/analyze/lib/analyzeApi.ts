import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  setDoc,
  doc,
  getDoc,
  DocumentReference,
  CollectionReference,
  DocumentSnapshot,
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
      const statusNum = parseInt(status as string);
      if (statusNum >= 1 && statusNum <= 5) {
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

  /**
   * Save analysis to Firestore
   *
   * This function is split into 3 main steps for better understanding:
   *
   * Step 1: Create the main analysis document
   * - Creates a document in the 'analyses' collection
   * - Stores basic analysis info (title, summary, metadata)
   *
   * Step 2: Save all sentences
   * - Creates a 'sentences' subcollection in the analysis document
   * - Stores each sentence with its index for ordering
   *
   * Step 3: Process and save words
   * - Extracts all unique words from the analysis
   * - For each word:
   *   - Finds all sentence indexes where the word appears
   *   - Updates or creates word documents in the 'words' collection
   *   - Links words to the analysis via analysisIds
   *   - Creates references in the analysis 'words' subcollection
   *
   * @param userId - The user ID who owns this analysis
   * @param analysisResult - The analysis result to save
   * @returns The ID of the created analysis document
   */
  async saveAnalysis(
    userId: string,
    analysisResult: AnalysisResult
  ): Promise<string> {
    // Step 1: Create the main analysis document
    const analysisRef = await this.createAnalysisDocument(
      userId,
      analysisResult
    );

    // Step 2: Save all sentences
    await this.saveSentences(analysisRef, analysisResult.sentences);

    // Step 3: Process and save words
    await this.processAndSaveWords(userId, analysisRef, analysisResult);

    return analysisRef.id;
  },

  /**
   * Step 1: Create the main analysis document
   *
   * Creates a new document in the 'analyses' collection with:
   * - User ID for ownership
   * - Analysis title
   * - Creation timestamp
   * - Analysis summary (word counts, etc.)
   *
   * @param userId - The user ID who owns this analysis
   * @param analysisResult - The analysis result containing title and summary
   * @returns DocumentReference to the created analysis document
   */
  async createAnalysisDocument(userId: string, analysisResult: AnalysisResult) {
    return await addDoc(collection(db, "analyses"), {
      userId,
      title: analysisResult.title,
      createdAt: Timestamp.now(),
      summary: analysisResult.summary,
    });
  },

  /**
   * Step 2: Save all sentences to the sentences subcollection
   *
   * Creates a 'sentences' subcollection in the analysis document.
   * Each sentence is stored as a separate document with:
   * - The sentence text
   * - Its index for maintaining order
   *
   * @param analysisRef - Reference to the analysis document
   * @param sentences - Array of sentences to save
   */
  async saveSentences(analysisRef: DocumentReference, sentences: string[]) {
    const sentencesToSave = sentences || [];
    for (let i = 0; i < sentencesToSave.length; i++) {
      await addDoc(collection(analysisRef, "sentences"), {
        text: sentencesToSave[i],
        index: i,
      });
    }
  },

  // Step 3: Process and save all words
  async processAndSaveWords(
    userId: string,
    analysisRef: DocumentReference,
    analysisResult: AnalysisResult
  ) {
    const allWords = this.extractAllWords(analysisResult);
    const sentences = analysisResult.sentences || [];
    const wordsCollection = collection(analysisRef, "words");

    if (allWords.length === 0) {
      console.warn(
        "No words to save for analysis",
        analysisRef.id,
        analysisResult
      );
    } else {
      console.log(
        `Saving ${allWords.length} words for analysis ${analysisRef.id}`
      );
    }

    for (const word of allWords) {
      try {
        const usageIndexes = this.findWordUsages(word, sentences);
        await this.saveOrUpdateWord(userId, word, usageIndexes, analysisRef.id);
        await this.addWordToAnalysis(
          userId,
          word,
          usageIndexes,
          wordsCollection
        );
      } catch (err) {
        console.error(
          `Failed to save word '${word}' for analysis ${analysisRef.id}:`,
          err
        );
      }
    }
  },

  // Extract all unique words from the analysis
  extractAllWords(analysisResult: AnalysisResult): string[] {
    return Array.from(
      new Set([
        ...Object.keys(analysisResult.wordFrequency || {}),
        ...(analysisResult.unknownWordList || []),
      ])
    );
  },

  // Find all sentence indexes where a word appears
  findWordUsages(word: string, sentences: string[]): number[] {
    return sentences
      .map((sentence, idx) =>
        sentence.toLowerCase().includes(word.toLowerCase()) ? idx : -1
      )
      .filter((idx) => idx !== -1);
  },

  // Save or update a word document
  async saveOrUpdateWord(
    userId: string,
    word: string,
    usageIndexes: number[],
    analysisId: string
  ) {
    const wordDocRef = doc(db, "words", `${userId}_${word}`);
    const wordDoc = await getDoc(wordDocRef);

    if (wordDoc.exists()) {
      await this.updateExistingWord(
        wordDoc,
        wordDocRef,
        userId,
        word,
        usageIndexes,
        analysisId
      );
    } else {
      await this.createNewWord(
        wordDocRef,
        userId,
        word,
        usageIndexes,
        analysisId
      );
    }
  },

  // Update an existing word document
  async updateExistingWord(
    wordDoc: DocumentSnapshot,
    wordDocRef: DocumentReference,
    userId: string,
    word: string,
    usageIndexes: number[],
    analysisId: string
  ) {
    const existingData = wordDoc.data();
    if (!existingData) {
      throw new Error("Word document data is undefined");
    }
    const existingUsages = existingData.usages || [];
    const existingAnalysisIds = existingData.analysisIds || [];

    // Add new analysisId if not already present
    if (!existingAnalysisIds.includes(analysisId)) {
      existingAnalysisIds.push(analysisId);
    }

    // Merge usages
    const mergedUsages = [...new Set([...existingUsages, ...usageIndexes])];

    await setDoc(
      wordDocRef,
      {
        userId,
        word,
        analysisIds: existingAnalysisIds,
        analysisId: analysisId, // Keep for backward compatibility
        usages: mergedUsages,
      },
      { merge: true }
    );
  },

  // Create a new word document
  async createNewWord(
    wordDocRef: DocumentReference,
    userId: string,
    word: string,
    usageIndexes: number[],
    analysisId: string
  ) {
    await setDoc(wordDocRef, {
      userId,
      word,
      analysisIds: [analysisId],
      analysisId: analysisId,
      usages: usageIndexes,
    });
  },

  // Add word reference to analysis words subcollection
  async addWordToAnalysis(
    userId: string,
    word: string,
    usageIndexes: number[],
    wordsCollection: CollectionReference
  ) {
    const wordDocRef = doc(db, "words", `${userId}_${word}`);
    await setDoc(doc(wordsCollection, wordDocRef.id), {
      wordId: wordDocRef.id,
      word: word,
      userId: userId,
      usages: usageIndexes,
    });
  },
};

export { config, transformApiResult };
