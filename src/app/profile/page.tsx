"use client";

import { useState, useEffect } from "react";

import ISO6391 from "iso-639-1";

import { useSelector } from "react-redux";

import {
  saveLanguages,
  clearSuccess,
  setLanguages,
  fetchProfile,
} from "@/features/profile/model/profileSlice";

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
      saveLanguages({ native: nativeLanguage, learning: learningLanguage })
    );
    dispatch(
      setLanguages({ native: nativeLanguage, learning: learningLanguage })
    );
  };

  return (
    <div className="py-12 px-4">
      <div className="w-full max-w-lg mx-auto bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 sm:p-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-gray-800 flex items-center justify-center shadow-lg mb-4">
            <svg
              className="w-12 h-12 text-blue-400 dark:text-blue-300"
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
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
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
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading profile...
            </span>
          </div>
        ) : (
          <form className="space-y-8" onSubmit={handleSave}>
            <div>
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Native Language
              </label>
              <div className="relative">
                <select
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none"
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
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Learning Language
              </label>
              <div className="relative">
                <select
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all appearance-none"
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
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading || !nativeLanguage || !learningLanguage}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            {success && (
              <div className="text-green-600 text-center font-medium">
                Saved successfully!
              </div>
            )}
            {error && (
              <div className="text-red-600 text-center font-medium">
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
