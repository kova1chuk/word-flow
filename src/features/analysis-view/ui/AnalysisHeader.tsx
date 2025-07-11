import { useState } from "react";

import Link from "next/link";

import { doc, updateDoc } from "firebase/firestore";

import type { Analysis } from "@/entities/analysis/types";

import { ClientOnly } from "@/shared/ui/ClientOnly";

import { db } from "@/lib/firebase";

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ analysis }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(analysis.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "analyses", analysis.id), {
        title: title.trim(),
      });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update title", err);
      setError("Failed to update title");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setTitle(analysis.title);
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="mb-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/analyses"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to My Analyses
        </Link>
      </div>

      {/* Title Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-4">
                <input
                  className="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-400 focus:border-blue-600 focus:outline-none px-0 py-2 transition-colors duration-200"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={saving}
                  autoFocus
                  placeholder="Enter analysis title..."
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !title.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Title"
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white line-clamp-2">
                    {title}
                  </h1>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Edit title"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <ClientOnly
                    fallback={`Analyzed on ${analysis.createdAt.dateString}`}
                  >
                    Analyzed on {formatDate(analysis.createdAt.dateString)}
                  </ClientOnly>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
