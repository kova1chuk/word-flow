"use client";

import React, { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";

import { addWord } from "@/features/words/model/thunks";

import { selectUser } from "@/entities/user/model/selectors";

import type { AppDispatch, RootState } from "@/shared/model/store";

export default function AddWordPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
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
          page: 1, // Add to first page
        }),
      ).unwrap();

      // Redirect back to words page on success
      router.push("/words");
    } catch (error) {
      console.error("Error adding word:", error);
      // Error is handled by Redux state
    }
  };

  if (!user) {
    return <div>Please sign in to add words.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Word
          </h1>
          <Link
            href="/words"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Words
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="word"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Word
              </label>
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder="Enter a word to add"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Link
                href="/words"
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !word.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Word"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
