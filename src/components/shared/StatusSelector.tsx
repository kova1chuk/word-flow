import type { Word } from "@/types";

const STATUS_OPTIONS = [
  {
    value: "well_known",
    label: "Well known",
    color: "bg-green-500 text-white border-green-500",
  },
  {
    value: "want_repeat",
    label: "Want repeat",
    color: "bg-orange-400 text-white border-orange-400",
  },
  {
    value: "to_learn",
    label: "To learn",
    color: "bg-blue-600 text-white border-blue-600",
  },
];

interface StatusSelectorProps {
  word: Word;
  onStatusChange: (id: string, status: string) => void;
  updating?: string | null;
  className?: string;
  buttonClassName?: string;
}

export default function StatusSelector({
  word,
  onStatusChange,
  updating,
  className = "",
  buttonClassName = "",
}: StatusSelectorProps) {
  return (
    <div className={className}>
      <span className="font-semibold text-gray-700 dark:text-gray-300">
        Status:
      </span>
      <div className="flex flex-wrap gap-2 mt-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(word.id, opt.value)}
            disabled={updating === word.id || word.status === opt.value}
            className={`px-3 py-1.5 rounded font-medium border transition-colors text-sm
              ${
                word.status === opt.value
                  ? opt.color
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              }
              disabled:opacity-60 ${buttonClassName}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
