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
      className={`text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs border border-blue-200 dark:border-blue-700 rounded px-2 py-1 disabled:opacity-50 transition-colors ${className}`}
      title={title}
    >
      Reload
    </button>
  );
}
