"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

interface AnalysisResult {
  totalWords: number;
  uniqueWords: number;
  knownWords: number;
  unknownWords: number;
  unknownWordList: string[];
  wordFrequency: { [key: string]: number };
  averageWordLength: number;
  readingTime: number;
}

interface TranslationResult {
  word: string;
  translation: string;
  explanation: string;
}

interface UserWord {
  id: string;
  word: string;
  status: string;
  createdAt: Date;
}

export default function AnalyzePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userWords, setUserWords] = useState<UserWord[]>([]);
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [addingWords, setAddingWords] = useState(false);
  const [addWordsProgress, setAddWordsProgress] = useState(0);
  const [error, setError] = useState("");
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [addingWord, setAddingWord] = useState<string | null>(null);
  const [frequencyStatusFilters, setFrequencyStatusFilters] = useState<
    string[]
  >(["all"]);
  const [allWordsPage, setAllWordsPage] = useState(1);
  const [wellKnownWordsPage, setWellKnownWordsPage] = useState(1);
  const wordsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [bookMetadata, setBookMetadata] = useState<{
    title?: string;
    creator?: string;
    language?: string;
    subject?: string;
    description?: string;
  } | null>(null);

  const STATUS_OPTIONS = [
    { value: "well_known", label: "Well Known", color: "bg-green-500" },
    { value: "want_repeat", label: "Want Repeat", color: "bg-orange-400" },
    { value: "to_learn", label: "To Learn", color: "bg-blue-600" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
      return;
    }

    if (user) {
      fetchUserWords();
    }
  }, [user, loading, router]);

  // Close tooltip on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setActiveTooltip(null);
      }
    }
    if (activeTooltip !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltip]);

  const fetchUserWords = async () => {
    if (!user) return;

    try {
      const wordsRef = collection(db, "words");
      const q = query(wordsRef, where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const wordsData: UserWord[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        wordsData.push({
          id: doc.id,
          word: data.word,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      setUserWords(wordsData);
    } catch (error) {
      console.error("Error fetching user words:", error);
      setError("Failed to load your word collection");
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze");
      return;
    }

    setLoadingAnalysis(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      // Step 1: Pre-processing and splitting words
      setAnalysisProgress(10);
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .filter((word) => isNaN(parseInt(word, 10))); // Exclude numbers
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Step 2: Counting word frequency
      setAnalysisProgress(30);
      const wordFrequency: { [key: string]: number } = {};
      words.forEach((word) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Step 3: Getting unique words and user's known words
      setAnalysisProgress(60);
      const uniqueWords = Object.keys(wordFrequency);
      const userKnownWords = userWords.map((w) => w.word.toLowerCase().trim());
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Step 4: Categorizing words
      setAnalysisProgress(80);
      const knownWords = uniqueWords.filter((word) =>
        userKnownWords.includes(word)
      );
      const unknownWords = uniqueWords.filter(
        (word) => !userKnownWords.includes(word)
      );
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Step 5: Finalizing results
      setAnalysisProgress(95);
      const result: AnalysisResult = {
        totalWords: words.length,
        uniqueWords: uniqueWords.length,
        knownWords: knownWords.length,
        unknownWords: unknownWords.length,
        unknownWordList: unknownWords,
        wordFrequency,
        averageWordLength:
          words.reduce((sum, word) => sum + word.length, 0) / words.length,
        readingTime: words.length / 200, // Assuming 200 words per minute
      };

      setAnalysisResult(result);
      setAnalysisProgress(100);
    } catch (error) {
      console.error("Error analyzing text:", error);
      setError("Failed to analyze text");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const addUnknownWords = async () => {
    if (!user || !analysisResult) return;

    try {
      setAddingWords(true);
      setAddWordsProgress(0);
      setError("");

      const wordsRef = collection(db, "words");
      const explanationMap: Record<string, string> = {};
      translations.forEach((t) => {
        explanationMap[t.word.toLowerCase()] = t.explanation;
      });

      const wordsToAdd = analysisResult.unknownWordList.map((word) => ({
        userId: user.uid,
        word: word.toLowerCase().trim(),
        definition:
          explanationMap[word.toLowerCase()] || "No definition available",
        example: "",
        status: "to_learn",
        createdAt: Timestamp.now(),
      }));

      const totalWords = wordsToAdd.length;
      for (let i = 0; i < totalWords; i++) {
        const wordData = wordsToAdd[i];
        await addDoc(wordsRef, wordData);
        setAddWordsProgress(Math.round(((i + 1) / totalWords) * 100));
      }

      await fetchUserWords();
      // Re-analyze text to update results
      setText(text);
      analyzeText();
    } catch (error) {
      console.error("Error adding words:", error);
      setError("Failed to add words to your collection");
    } finally {
      setAddingWords(false);
      setAddWordsProgress(0);
    }
  };

  const fetchTranslations = async () => {
    if (!analysisResult || analysisResult.unknownWords === 0) return;

    try {
      setLoadingTranslations(true);
      setError("");

      const results: TranslationResult[] = [];
      for (const word of analysisResult.unknownWordList.slice(0, 20)) {
        try {
          const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );
          if (response.ok) {
            const data = await response.json();
            const definition =
              data[0]?.meanings?.[0]?.definitions?.[0]?.definition ||
              "No definition found.";
            results.push({
              word,
              translation: word, // English word, so translation is the same
              explanation: definition,
            });
          } else {
            results.push({
              word,
              translation: word,
              explanation: "No definition found.",
            });
          }
        } catch {
          results.push({
            word,
            translation: word,
            explanation: "No definition found.",
          });
        }
      }

      setTranslations(results);
    } catch {
      console.error("Error fetching translations");
      setError("Failed to fetch translations");
    } finally {
      setLoadingTranslations(false);
    }
  };

  const addSingleWord = async (word: string, status?: string) => {
    if (!user) return;

    try {
      setAddingWord(word);
      setError("");

      const wordsRef = collection(db, "words");
      const explanationMap: Record<string, string> = {};
      translations.forEach((t) => {
        explanationMap[t.word.toLowerCase()] = t.explanation;
      });

      const wordData = {
        userId: user.uid,
        word: word.toLowerCase().trim(),
        definition:
          explanationMap[word.toLowerCase()] || "No definition available",
        example: "",
        status: status || "to_learn",
        createdAt: Timestamp.now(),
      };

      await addDoc(wordsRef, wordData);

      setUserWords((prev) => [
        ...prev,
        {
          id: "temp",
          word: wordData.word,
          status: wordData.status,
          createdAt: new Date(),
        },
      ]);

      // Re-analyze text to update results
      setText(text);
      analyzeText();
    } catch (error) {
      console.error("Error adding word:", error);
      setError("Failed to add word to your collection");
    } finally {
      setAddingWord(null);
    }
  };

  const updateWordStatus = async (wordId: string, status: string) => {
    if (!user) return;

    try {
      const wordRef = doc(db, "words", wordId);
      await updateDoc(wordRef, { status });

      setUserWords((prev) =>
        prev.map((word) => (word.id === wordId ? { ...word, status } : word))
      );

      await fetchUserWords();
      // Re-analyze text to update results
      setText(text);
      analyzeText();
    } catch (error) {
      console.error("Error updating word status:", error);
      setError("Failed to update word status");
    }
  };

  const wellKnownWords = analysisResult
    ? Object.entries(analysisResult.wordFrequency)
        .filter(([word]) =>
          userWords.some(
            (w) =>
              w.word.toLowerCase().trim() === word.toLowerCase() &&
              w.status === "well_known"
          )
        )
        .sort(([, a], [, b]) => b - a)
    : [];

  const toggleFrequencyStatusFilter = (status: string) => {
    setFrequencyStatusFilters((prev) => {
      if (status === "all") {
        return ["all"];
      }
      const newFilters = prev.filter((f) => f !== "all");
      if (prev.includes(status)) {
        const filtered = newFilters.filter((f) => f !== status);
        return filtered.length === 0 ? ["all"] : filtered;
      }
      return [...newFilters, status];
    });
  };

  const filterWordsByStatus = (words: [string, number][]) => {
    if (frequencyStatusFilters.includes("all")) return words;

    return words.filter(([word]) => {
      const existingWord = userWords.find(
        (w) => w.word.toLowerCase().trim() === word.toLowerCase()
      );

      if (!existingWord && frequencyStatusFilters.includes("unknown")) {
        return true;
      }

      if (
        existingWord &&
        frequencyStatusFilters.includes(existingWord.status || "unset")
      ) {
        return true;
      }

      return false;
    });
  };

  const getPaginatedWords = (
    words: [string, number][],
    currentPage: number
  ) => {
    const startIndex = (currentPage - 1) * wordsPerPage;
    const endIndex = startIndex + wordsPerPage;
    return words.slice(startIndex, endIndex);
  };

  const getTotalPages = (words: [string, number][]) => {
    return Math.ceil(words.length / wordsPerPage);
  };

  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".epub")) {
      setError("Please upload an EPUB file");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");
    setFileName(file.name);
    setBookMetadata(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Simulate initial progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Send file to API
      const response = await fetch("/api/parse-epub", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process EPUB file");
      }

      const { text: extractedText, metadata } = await response.json();
      setUploadProgress(100);
      setBookMetadata(metadata);

      // Set the extracted text
      setText(extractedText);

      // Auto-analyze the extracted text
      setTimeout(() => {
        handleAnalyze();
        setUploadProgress(0);
        setUploading(false);
      }, 500);
    } catch (error) {
      console.error("File upload error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to parse EPUB file. Please try again."
      );
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    analyzeText();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Analyze Text
          </h1>
          <p className="text-gray-600">
            Analyze text to identify known and unknown words
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Enter Text
            </h2>
            <div className="space-y-4">
              {/* EPUB Upload Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Upload EPUB File
                </h2>

                {/* Book Metadata Section */}
                {bookMetadata && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="text-md font-medium text-blue-900 mb-2">
                      Book Information
                    </h3>
                    <div className="space-y-2">
                      {bookMetadata.title && (
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Title:</span>{" "}
                          {bookMetadata.title}
                        </p>
                      )}
                      {bookMetadata.creator && (
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Author:</span>{" "}
                          {bookMetadata.creator}
                        </p>
                      )}
                      {bookMetadata.language && (
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Language:</span>{" "}
                          {bookMetadata.language}
                        </p>
                      )}
                      {bookMetadata.subject && (
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Subject:</span>{" "}
                          {bookMetadata.subject}
                        </p>
                      )}
                      {bookMetadata.description && (
                        <div className="text-sm text-blue-800">
                          <span className="font-medium">Description:</span>
                          <p className="mt-1">{bookMetadata.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Processing {fileName}...
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress}% complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-center mb-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Drag and drop your EPUB file here, or
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Choose File
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports EPUB format only
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".epub"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {fileName && !uploading && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">
                      Successfully processed: {fileName}
                    </p>
                  </div>
                )}
              </div>

              {/* Text Input Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Or Enter Text Manually
                </h2>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text here or upload an EPUB file above..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Analyze Button */}
              <div className="mb-8">
                <button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || loadingAnalysis}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingAnalysis ? "Analyzing..." : "Analyze Text"}
                </button>
              </div>

              {loadingAnalysis && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-blue-700">
                      Analyzing text...
                    </span>
                    <span className="text-sm font-medium text-blue-700">
                      {analysisProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Sample Text Button for Testing */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    const sampleText = `The quick brown fox jumps over the lazy dog. This is a sample text for testing the word analysis functionality. It contains various words that can be analyzed for frequency and categorization. Some words might be known while others could be unknown depending on your vocabulary.`;
                    setText(sampleText);
                    setError("");
                  }}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Load Sample Text (for testing)
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Analysis Results
            </h2>

            {!analysisResult ? (
              <div className="text-center text-gray-500 py-8">
                <p>Upload an EPUB file or enter text to see analysis results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.totalWords}
                    </div>
                    <div className="text-sm text-blue-700">Total Words</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.uniqueWords}
                    </div>
                    <div className="text-sm text-green-700">Unique Words</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.knownWords}
                    </div>
                    <div className="text-sm text-purple-700">Known Words</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {analysisResult.unknownWords}
                    </div>
                    <div className="text-sm text-orange-700">Unknown Words</div>
                  </div>
                </div>

                {/* Unknown Words Section */}
                {analysisResult.unknownWords > 0 && (
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Unknown Words ({analysisResult.unknownWords})
                      </h3>
                      <button
                        onClick={addUnknownWords}
                        disabled={addingWords}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingWords ? "Adding..." : "Add All to My Words"}
                      </button>
                    </div>

                    {addingWords && (
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-base font-medium text-green-700">
                            Adding words...
                          </span>
                          <span className="text-sm font-medium text-green-700">
                            {addWordsProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${addWordsProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.unknownWordList.map((word, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded text-sm border text-gray-900 font-medium"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Known Words Section */}
                {analysisResult.knownWords > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Known Words ({analysisResult.knownWords})
                    </h3>
                    <div className="space-y-4">
                      {/* Well Known Words */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Well Known:
                        </h4>
                        <div className="bg-green-50 p-4 rounded-lg max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {wellKnownWords.map(([word]) => (
                              <span
                                key={word}
                                className="bg-green-100 px-2 py-1 rounded text-sm border border-green-200 text-green-800 font-medium"
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* In Dictionary Words */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          In Dictionary:
                        </h4>
                        <div className="bg-blue-50 p-4 rounded-lg max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const inDictWords = Object.keys(
                                analysisResult.wordFrequency
                              ).filter((word) =>
                                userWords.some(
                                  (uw) =>
                                    uw.word.toLowerCase().trim() ===
                                      word.toLowerCase() &&
                                    uw.status !== "well_known"
                                )
                              );
                              return inDictWords.map((word, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 px-2 py-1 rounded text-sm border border-blue-200 text-blue-800 font-medium"
                                >
                                  {word}
                                </span>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Word Frequency */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Word Frequency
                  </h3>

                  {/* Status Filters */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Filter by status:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleFrequencyStatusFilter("all")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          frequencyStatusFilters.includes("all")
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All Words
                      </button>
                      <button
                        onClick={() => toggleFrequencyStatusFilter("unknown")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          frequencyStatusFilters.includes("unknown")
                            ? "bg-red-600 text-white"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        Unknown
                      </button>
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            toggleFrequencyStatusFilter(option.value)
                          }
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            frequencyStatusFilters.includes(option.value)
                              ? `${option.color} text-white`
                              : `bg-${option.color.split("-")[1]}-50 hover:bg-${
                                  option.color.split("-")[1]
                                }-100 text-${option.color.split("-")[1]}-700`
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                      <button
                        onClick={() => toggleFrequencyStatusFilter("unset")}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          frequencyStatusFilters.includes("unset")
                            ? "bg-gray-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        No Status
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* All Words */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        All Words (
                        {
                          filterWordsByStatus(
                            Object.entries(analysisResult.wordFrequency)
                          ).length
                        }{" "}
                        words)
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Word
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Count
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {getPaginatedWords(
                              filterWordsByStatus(
                                Object.entries(analysisResult.wordFrequency)
                              ).sort(([, a], [, b]) => b - a),
                              allWordsPage
                            ).map(([word, count]) => {
                              const existingWord = userWords.find(
                                (w) =>
                                  w.word.toLowerCase().trim() ===
                                  word.toLowerCase()
                              );
                              const isUnknown = !existingWord;

                              return (
                                <tr key={word} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm">
                                    <span
                                      className={`inline-block px-2 py-1 rounded ${
                                        isUnknown
                                          ? "bg-red-100 text-red-700"
                                          : existingWord?.status ===
                                            "well_known"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {word}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {count}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {isUnknown ? (
                                      <span className="text-red-600 text-xs">
                                        Not in dictionary
                                      </span>
                                    ) : (
                                      <span
                                        className={`text-xs font-medium ${
                                          existingWord.status === "well_known"
                                            ? "text-green-600"
                                            : existingWord.status ===
                                              "want_repeat"
                                            ? "text-orange-600"
                                            : "text-blue-600"
                                        }`}
                                      >
                                        {STATUS_OPTIONS.find(
                                          (opt) =>
                                            opt.value === existingWord.status
                                        )?.label || "No Status"}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-right">
                                    <div className="flex justify-end gap-1">
                                      {isUnknown
                                        ? STATUS_OPTIONS.map((option) => (
                                            <button
                                              key={option.value}
                                              onClick={() =>
                                                addSingleWord(
                                                  word,
                                                  option.value
                                                )
                                              }
                                              disabled={addingWord === word}
                                              className={`px-2 py-1 rounded text-xs font-medium ${option.color} text-white hover:opacity-90 disabled:opacity-50 transition-colors`}
                                            >
                                              {addingWord === word
                                                ? "..."
                                                : option.label}
                                            </button>
                                          ))
                                        : STATUS_OPTIONS.map((option) => (
                                            <button
                                              key={option.value}
                                              onClick={() =>
                                                updateWordStatus(
                                                  existingWord.id,
                                                  option.value
                                                )
                                              }
                                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                existingWord.status ===
                                                option.value
                                                  ? `${option.color} text-white`
                                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                              }`}
                                            >
                                              {option.label}
                                            </button>
                                          ))}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <Pagination
                          currentPage={allWordsPage}
                          totalPages={getTotalPages(
                            filterWordsByStatus(
                              Object.entries(analysisResult.wordFrequency)
                            )
                          )}
                          onPageChange={setAllWordsPage}
                        />
                      </div>
                    </div>

                    {/* Well Known Words */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Well Known Words ({wellKnownWords.length} words)
                      </h4>
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Word
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Count
                              </th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {getPaginatedWords(
                              wellKnownWords,
                              wellKnownWordsPage
                            ).map(([word]) => (
                              <tr key={word} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">
                                  <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700">
                                    {word}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {analysisResult.wordFrequency[word]}
                                </td>
                                <td className="px-4 py-2 text-sm text-right">
                                  <div className="flex justify-end gap-1">
                                    {STATUS_OPTIONS.map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          const existingWord = userWords.find(
                                            (w) =>
                                              w.word.toLowerCase().trim() ===
                                              word.toLowerCase()
                                          );
                                          if (existingWord) {
                                            updateWordStatus(
                                              existingWord.id,
                                              option.value
                                            );
                                          }
                                        }}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                          option.value === "well_known"
                                            ? `${option.color} text-white`
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <Pagination
                          currentPage={wellKnownWordsPage}
                          totalPages={getTotalPages(wellKnownWords)}
                          onPageChange={setWellKnownWordsPage}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Translations Section */}
        {analysisResult && analysisResult.unknownWords > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Unknown Word Translations & Explanations
              </h2>
              <button
                onClick={fetchTranslations}
                disabled={loadingTranslations}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingTranslations ? "Translating..." : "Fetch Translations"}
              </button>
            </div>
            {translations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Word
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Translation
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                        Explanation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {translations.map((t) => (
                      <tr key={t.word}>
                        <td className="px-4 py-2 text-gray-900 font-medium">
                          {t.word}
                        </td>
                        <td className="px-4 py-2 text-green-700">
                          {t.translation}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {t.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {loadingTranslations && (
              <div className="text-gray-500 mt-4">Fetching translations...</div>
            )}
            {!loadingTranslations && translations.length === 0 && (
              <div className="text-gray-500 mt-4">
                No translations fetched yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
