import { useState } from "react";

import { useRouter } from "next/navigation";

import { doc, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { Analysis } from "../lib/useAnalysisWords";

interface AnalysisWordsHeaderProps {
  analysis: Analysis | null;
}

export function AnalysisWordsHeader({ analysis }: AnalysisWordsHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(analysis?.title || "");
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    router.push(`/analyses/${analysis?.id}`);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const saveTitle = async () => {
    if (!analysis || !title.trim() || title === analysis.title) {
      setEditing(false);
      setTitle(analysis?.title || "");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "analyses", analysis.id), {
        title: title.trim(),
      });
      setEditing(false);
      window.alert("Title updated!");
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const handleTitleBlur = () => {
    saveTitle();
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setEditing(false);
      setTitle(analysis?.title || "");
    }
  };

  // Status colors and labels for 1-7
  const STATUS_META = [
    { value: 1, color: "#3b82f6", label: "Not Learned" }, // blue
    { value: 2, color: "#ef4444", label: "Beginner" }, // red
    { value: 3, color: "#f59e42", label: "Basic" }, // orange
    { value: 4, color: "#eab308", label: "Intermediate" }, // yellow
    { value: 5, color: "#3b82f6", label: "Advanced" }, // blue
    { value: 6, color: "#22c55e", label: "Well Known" }, // green
    { value: 7, color: "#a21caf", label: "Mastered" }, // purple
  ];

  // Get wordStats from analysis.summary.wordStats or fallback to empty
  let wordStats: Record<number, number> = {};
  if (
    analysis &&
    analysis.summary &&
    typeof analysis.summary.wordStats === "object"
  ) {
    wordStats = analysis.summary.wordStats as Record<number, number>;
  }
  const total = Object.values(wordStats).reduce(
    (sum, n) => sum + (typeof n === "number" ? n : 0),
    0
  );

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            ←
          </button>
          {editing ? (
            <input
              className="text-3xl font-extrabold text-white bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-b-4 border-blue-500 shadow"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              disabled={saving}
              autoFocus
              style={{ minWidth: 220 }}
            />
          ) : (
            <h1
              className="text-3xl font-extrabold text-white cursor-pointer hover:underline tracking-tight drop-shadow"
              onClick={() => setEditing(true)}
              title="Click to edit title"
            >
              {title}
            </h1>
          )}
        </div>

        {/* Status Bar Visualization */}
        <div className="w-full max-w-3xl mx-auto mb-6">
          <div className="flex h-8 rounded-full overflow-hidden border-2 border-gray-700 shadow-lg">
            {STATUS_META.map((status) => {
              const count = wordStats[status.value] || 0;
              const percent = total > 0 ? (count / total) * 100 : 0;
              return (
                <div
                  key={status.value}
                  style={{
                    width: `${percent}%`,
                    background: status.color,
                    display: percent === 0 ? "none" : undefined,
                  }}
                  className="flex items-center justify-center text-white text-base font-bold transition-all duration-300 relative"
                  title={`${status.label}: ${count}`}
                >
                  {percent > 7 && (
                    <span className="drop-shadow-sm absolute left-1/2 -translate-x-1/2 text-xs font-semibold">
                      {count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-4">
          {STATUS_META.map((status) => (
            <div key={status.value} className="flex items-center gap-2">
              <span
                className="inline-block w-6 h-6 rounded-full border-2 border-gray-600 shadow-sm"
                style={{ background: status.color }}
              ></span>
              <span className="text-base font-semibold text-gray-200">
                {status.label}
              </span>
              <span className="text-base font-mono text-gray-400">
                {wordStats[status.value] ?? 0}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <span className="inline-block bg-gray-800 text-white text-lg font-bold rounded-full px-6 py-2 shadow border-2 border-gray-700">
            Total words: {total}
          </span>
        </div>
      </div>
    </div>
  );
}
