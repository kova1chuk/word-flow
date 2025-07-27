"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { useSelector } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { Word } from "../../../entities/word";

// --- Component ---
export default function WordPage() {
  const user = useSelector(selectUser);
  const params = useParams();
  const wordParam = Array.isArray(params.word) ? params.word[0] : params.word;

  const [word] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWord = useCallback(async () => {
    if (!user || !wordParam) return;
    setLoading(true);
    try {
      // TODO: Implement Supabase word fetching
      console.log("Fetching word:", wordParam);
      setError("Word fetching not implemented with Supabase yet");
    } catch (err) {
      console.error("Error fetching word:", err);
      setError("Failed to load word data.");
    } finally {
      setLoading(false);
    }
  }, [user, wordParam]);

  useEffect(() => {
    if (user && wordParam) {
      fetchWord();
    }
  }, [user, wordParam, fetchWord]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please sign in to view word details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Word Not Found
          </h1>
          <p className="text-gray-600">
            The word &quot;{wordParam}&quot; was not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">{word.word}</h1>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Definition</h2>
          <p className="text-gray-700">
            {word.definition || "Definition not available"}
          </p>

          {word.translation && (
            <div className="mt-4">
              <h2 className="mb-2 text-xl font-semibold">Translation</h2>
              <p className="text-gray-700">{word.translation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
