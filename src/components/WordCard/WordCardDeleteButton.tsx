import React from "react";

interface WordCardDeleteButtonProps {
  onDelete: () => void;
  loading?: boolean;
}

const WordCardDeleteButton: React.FC<WordCardDeleteButtonProps> = ({
  onDelete,
  loading = false,
}) => {
  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className={`absolute top-2 right-2 rounded-full p-1 transition-colors ${
        loading
          ? "cursor-not-allowed text-red-400"
          : "text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
      }`}
      title={loading ? "Deleting..." : "Delete word"}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: "rotate(0deg)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
    </button>
  );
};

export default WordCardDeleteButton;
