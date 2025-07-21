"use client";

import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";

import { addWord } from "@/features/words/model/wordsSlice";

import { useAuthSync } from "@/shared/hooks/useAuthSync";
import type { AppDispatch, RootState } from "@/shared/model/store";

export default function AddWordPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuthSync();
  const { loading, error } = useSelector((state: RootState) => state.words);

  const [word, setWord] = useState("");
  const [langCode] = useState("en"); // Default to English for now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !user) return;

    try {
      await dispatch(
        addWord({
          userId: user.uid,
          langCode,
          wordText: word.trim(),
        })
      ).unwrap();

      // Redirect back to words page on success
      router.push("/words");
    } catch (error) {
      console.error("Error adding word:", error);
      // Error is handled by Redux state
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/words"
          className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Words
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add New Word
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Word Input */}
          <div>
            <label
              htmlFor="word"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Word *
            </label>
            <input
              type="text"
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter the word"
              required
              disabled={loading}
            />
          </div>

          {/* Language Code Input */}
          <div>
            <label
              htmlFor="langCode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Language
            </label>
            <select
              id="langCode"
              value={langCode}
              disabled={true} // For now, keep it fixed to English
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="en">English</option>
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Currently only English words are supported
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!word.trim() || loading || !user}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Add Word
                </>
              )}
            </button>
            <Link
              href="/words"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
