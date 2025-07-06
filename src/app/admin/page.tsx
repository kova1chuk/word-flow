"use client";
import { useState, useRef } from "react";

export default function AdminPage() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const pollProgress = async () => {
    try {
      const res = await fetch("/api/admin/migrate-word-status/progress");
      const data = await res.json();
      setProgress(data);
      if (data.status === "completed") {
        setSuccess(true);
        setLoading(false);
        clearInterval(pollingRef.current!);
      } else if (data.status === "error") {
        setError(data.error || "Migration failed");
        setSuccess(false);
        setLoading(false);
        clearInterval(pollingRef.current!);
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setLoading(false);
      clearInterval(pollingRef.current!);
    }
  };

  const runMigration = async () => {
    setLoading(true);
    setProgress(null);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/migrate-word-status/start", {
        method: "POST",
      });
      const data = await res.json();
      if (!data.started) {
        setError(data.error || "Migration failed to start");
        setLoading(false);
        return;
      }
      // Start polling
      pollingRef.current = setInterval(pollProgress, 2000);
      pollProgress();
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin: Word Status Migration</h1>
      <button
        onClick={runMigration}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Migration"}
      </button>
      {success !== null && (
        <div
          className={`mt-4 font-semibold ${
            success ? "text-green-600" : "text-red-600"
          }`}
        >
          {success ? "Migration completed successfully!" : "Migration failed."}
        </div>
      )}
      {error && <div className="mt-2 text-red-600">{error}</div>}
      <div className="mt-6 bg-gray-100 rounded-lg p-4 max-h-96 overflow-auto text-sm font-mono text-gray-800">
        {progress ? (
          <>
            <div>Status: {progress.status}</div>
            {progress.status === "running" && (
              <>
                <div>Batch: {progress.currentBatch}</div>
                <div>Migrated: {progress.migratedCount}</div>
                <div>Skipped: {progress.skippedCount}</div>
                <div>Total: {progress.total}</div>
              </>
            )}
            {progress.status === "error" && (
              <div className="text-red-600">Error: {progress.error}</div>
            )}
            {progress.status === "completed" && (
              <>
                <div className="text-green-600">Migration completed!</div>
                <div>Migrated: {progress.migratedCount}</div>
                <div>Skipped: {progress.skippedCount}</div>
                <div>Total: {progress.total}</div>
              </>
            )}
          </>
        ) : (
          <div>No migration progress yet.</div>
        )}
      </div>
    </div>
  );
}
