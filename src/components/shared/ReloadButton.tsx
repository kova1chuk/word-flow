interface ReloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export default function ReloadButton({
  onClick,
  disabled = false,
  className = "",
  title = "Reload",
}: ReloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
      title={title}
      style={{ lineHeight: 0 }}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  );
}
