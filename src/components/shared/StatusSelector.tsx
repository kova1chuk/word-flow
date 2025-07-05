import type { Word } from "@/types";

const STATUS_OPTIONS = [
  {
    value: 1,
    label: "Not Learned",
    color: "bg-gray-500 text-white border-gray-500",
  },
  {
    value: 2,
    label: "Beginner",
    color: "bg-red-500 text-white border-red-500",
  },
  {
    value: 3,
    label: "Basic",
    color: "bg-orange-500 text-white border-orange-500",
  },
  {
    value: 4,
    label: "Intermediate",
    color: "bg-yellow-500 text-white border-yellow-500",
  },
  {
    value: 5,
    label: "Advanced",
    color: "bg-blue-500 text-white border-blue-500",
  },
  {
    value: 6,
    label: "Well Known",
    color: "bg-green-500 text-white border-green-500",
  },
  {
    value: 7,
    label: "Mastered",
    color: "bg-purple-500 text-white border-purple-500",
  },
];

interface StatusSelectorProps {
  word: Word;
  onStatusChange: (id: string, status: number) => void;
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
