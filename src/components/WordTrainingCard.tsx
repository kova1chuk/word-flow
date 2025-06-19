import type { Timestamp } from "firebase/firestore";

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

type Word = {
  id: string;
  word: string;
  definition: string;
  translation?: string;
  status?: string;
  createdAt: Timestamp;
  example?: string;
};

export default function WordTrainingCard({
  word,
  onReloadDefinition,
  onReloadTranslation,
  onStatusChange,
  updating,
  current,
  total,
  onPrev,
  onNext,
}: {
  word: Word;
  onReloadDefinition: (word: Word) => void;
  onReloadTranslation: (word: Word) => void;
  onStatusChange: (id: string, status: string) => void;
  updating?: string | null;
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto mb-6 relative flex flex-col items-center">
      <div className="absolute top-2 right-4 text-xs text-gray-400">
        {current + 1} / {total}
      </div>
      <div
        className="text-3xl font-extrabold text-blue-700 mb-6 text-center"
        style={{ letterSpacing: 1 }}
      >
        {word.word}
      </div>
      <div className="mb-6 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-700">Definition:</span>
          <button
            onClick={() => onReloadDefinition(word)}
            disabled={updating === word.id}
            className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 rounded px-2 py-1 ml-1 disabled:opacity-50"
            title="Reload definition"
          >
            Reload
          </button>
        </div>
        <div className="text-gray-800 text-lg">
          {word.definition || <span className="text-gray-400">(none)</span>}
        </div>
      </div>
      <div className="mb-6 w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-green-700">Translation:</span>
          <button
            onClick={() => onReloadTranslation(word)}
            disabled={updating === word.id}
            className="text-blue-600 hover:text-blue-800 text-xs border border-blue-200 rounded px-2 py-1 ml-1 disabled:opacity-50"
            title="Reload translation"
          >
            Reload
          </button>
        </div>
        <div className="text-green-700 text-lg">
          {word.translation || <span className="text-gray-400">(none)</span>}
        </div>
      </div>
      <div className="mb-6 w-full">
        <span className="font-semibold text-gray-700">Status:</span>
        <div className="flex gap-2 mt-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(word.id, opt.value)}
              disabled={updating === word.id || word.status === opt.value}
              className={`px-4 py-2 rounded font-medium border transition-colors text-sm
                ${
                  word.status === opt.value
                    ? opt.color
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
                disabled:opacity-60`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between w-full mt-2">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={current === total - 1}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
