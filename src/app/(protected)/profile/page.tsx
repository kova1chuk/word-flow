"use client";

import { useState, useEffect } from "react";

import ISO6391 from "iso-639-1";

import { useSelector } from "react-redux";

import {
  saveLanguages,
  clearSuccess,
  setLanguages,
  fetchProfile,
} from "@profile";

import { useAppDispatch, RootState } from "@/shared/model/store";

const LANGUAGE_OPTIONS = [
  { code: "uk", label: "Ukrainian" },
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
];

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { native_language, learning_language, loading, error, success } =
    useSelector((state: RootState) => state.profile);
  const [nativeLanguage, setNativeLanguage] = useState(native_language);
  const [learningLanguage, setLearningLanguage] = useState(learning_language);

  // Load profile data on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Sync local state with RTK state on mount
  useEffect(() => {
    setNativeLanguage(native_language);
    setLearningLanguage(learning_language);
  }, [native_language, learning_language]);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      saveLanguages({ native: nativeLanguage, learning: learningLanguage }),
    );
    dispatch(
      setLanguages({ native: nativeLanguage, learning: learningLanguage }),
    );
  };

  return (
    <div className="px-4 py-12">
      <div className="relative mx-auto w-full max-w-lg rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-2xl sm:p-10 dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 shadow-lg dark:bg-gray-800">
            <svg
              className="h-12 w-12 text-blue-400 dark:text-blue-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.25a7.75 7.75 0 0115 0v.25a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.25z"
              />
            </svg>
          </div>
          <h1 className="mb-1 text-3xl font-extrabold text-gray-900 dark:text-white">
            Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your language preferences
          </p>
          {/* Display current languages only if loaded */}
          {native_language && learning_language && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Native:{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {ISO6391.getName(native_language) || native_language}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learning:{" "}
                <span className="font-medium text-green-600 dark:text-green-400">
                  {ISO6391.getName(learning_language) || learning_language}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Show spinner when loading and no languages loaded yet */}
        {loading && !native_language && !learning_language ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading profile...
            </span>
          </div>
        ) : (
          <form className="space-y-8" onSubmit={handleSave}>
            <div>
              <label className="mb-3 block text-base font-semibold text-gray-700 dark:text-gray-200">
                Native Language
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 text-gray-900 transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select your native language</option>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="mb-3 block text-base font-semibold text-gray-700 dark:text-gray-200">
                Learning Language
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 px-5 py-3 text-gray-900 transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  value={learningLanguage}
                  onChange={(e) => setLearningLanguage(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select language to learn</option>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-3 text-lg font-bold text-white shadow-lg transition-all hover:from-blue-600 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !nativeLanguage || !learningLanguage}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            {success && (
              <div className="text-center font-medium text-green-600">
                Saved successfully!
              </div>
            )}
            {error && (
              <div className="text-center font-medium text-red-600">
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
