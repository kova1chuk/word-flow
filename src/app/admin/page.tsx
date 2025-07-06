"use client";
import { useState } from "react";

export default function AdminPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);

  const runMigration = async () => {
    setLoading(true);
    setLogs([]);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/migrate-word-status", {
        method: "POST",
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setSuccess(data.success);
      if (!data.success) setError("Migration failed");
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
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
      <div className="mt-6 bg-gray-100 rounded-lg p-4 max-h-96 overflow-auto text-sm font-mono">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
