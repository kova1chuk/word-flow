import Link from "next/link";
import { Analysis } from "@/entities/analysis";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ analysis }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(analysis.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "analyses", analysis.id), { title });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update title", err);
      setError("Failed to update title");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-8">
      <Link href="/analyses">
        <span className="text-blue-600 hover:underline text-sm">
          &larr; Back to My Analyses
        </span>
      </Link>
      <div className="flex items-center gap-3 mt-2">
        {editing ? (
          <>
            <input
              className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-blue-400 focus:outline-none focus:border-blue-600 px-2 py-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
            />
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitle(analysis.title);
              }}
              disabled={saving}
              className="ml-1 px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <button
              onClick={() => setEditing(true)}
              className="ml-2 px-2 py-1 text-blue-600 hover:underline text-sm"
            >
              Edit
            </button>
          </>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Analyzed on {formatDate(analysis.createdAt.dateString)}
      </p>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};
