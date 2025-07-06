import { useRouter } from "next/navigation";
import { Analysis } from "../lib/useAnalysisWords";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          {editing ? (
            <input
              className="text-2xl font-bold text-gray-900 bg-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              disabled={saving}
              autoFocus
              style={{ minWidth: 200 }}
            />
          ) : (
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer hover:underline"
              onClick={() => setEditing(true)}
              title="Click to edit title"
            >
              {title}
            </h1>
          )}
        </div>

        {/* Status Bar Visualization */}
        <div className="w-full max-w-3xl mx-auto mb-4">
          <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
                  className="flex items-center justify-center text-white text-lg font-bold transition-all duration-300"
                  title={`${status.label}: ${count}`}
                >
                  {percent > 8 && (
                    <span className="drop-shadow-sm">{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-2">
          {STATUS_META.map((status) => (
            <div key={status.value} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded"
                style={{ background: status.color }}
              ></span>
              <span className="text-sm text-gray-700">{status.label}</span>
              <span className="text-sm font-mono text-gray-500">
                {wordStats[status.value] ?? 0}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center text-gray-500 text-sm">
          Total words: <span className="font-bold text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
}
