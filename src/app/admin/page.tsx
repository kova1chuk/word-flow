"use client";
import { useState, useRef } from "react";

export default function AdminPage() {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const [dbMigrationProgress, setDbMigrationProgress] = useState<any>(null);
  const [dbMigrationLoading, setDbMigrationLoading] = useState(false);
  const [dbMigrationError, setDbMigrationError] = useState<string | null>(null);
  const dbMigrationPollingRef = useRef<NodeJS.Timeout | null>(null);

  const [userStatsResult, setUserStatsResult] = useState<any>(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [userStatsError, setUserStatsError] = useState<string | null>(null);

  const [analysisStatsResult, setAnalysisStatsResult] = useState<any>(null);
  const [analysisStatsLoading, setAnalysisStatsLoading] = useState(false);
  const [analysisStatsError, setAnalysisStatsError] = useState<string | null>(
    null
  );

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

  const dbMigrationPollProgress = async () => {
    try {
      const res = await fetch("/api/admin/db-migration/progress");
      const data = await res.json();
      setDbMigrationProgress(data);
      if (data.status === "completed" || data.status === "error") {
        setDbMigrationLoading(false);
        clearInterval(dbMigrationPollingRef.current!);
      }
    } catch (e: any) {
      setDbMigrationError(e.message || "Unknown error");
      setDbMigrationLoading(false);
      clearInterval(dbMigrationPollingRef.current!);
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
      {/* Step-by-Step Plan Section (dynamic logic will be implemented) */}
      {/* Database Migrations Section */}
      <div className="max-w-2xl mx-auto py-12 px-4 mt-12">
        <h2 className="text-xl font-bold mb-4">Database Migrations</h2>
        <button
          onClick={async () => {
            setDbMigrationProgress(null);
            setDbMigrationError(null);
            setDbMigrationLoading(true);
            try {
              const res = await fetch("/api/admin/db-migration/start", {
                method: "POST",
              });
              const data = await res.json();
              if (!data.started) {
                setDbMigrationError(data.error || "Migration failed to start");
                setDbMigrationLoading(false);
                return;
              }
              dbMigrationPollingRef.current = setInterval(
                dbMigrationPollProgress,
                2000
              );
              dbMigrationPollProgress();
            } catch (e: any) {
              setDbMigrationError(e.message || "Unknown error");
              setDbMigrationLoading(false);
            }
          }}
          disabled={dbMigrationLoading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 mb-4"
        >
          {dbMigrationLoading ? "Running..." : "Run Full Refactor"}
        </button>
        {dbMigrationError && (
          <div className="mt-2 text-red-600">{dbMigrationError}</div>
        )}
        <div className="mt-6 bg-gray-100 rounded-lg p-4 max-h-96 overflow-auto text-sm font-mono text-gray-800">
          {dbMigrationProgress ? (
            <>
              <div>Status: {dbMigrationProgress.status}</div>
              <div>Current Step: {dbMigrationProgress.currentStep}</div>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                {Array.isArray(dbMigrationProgress.steps) ? (
                  dbMigrationProgress.steps.map((step: any, i: number) => (
                    <li key={i}>
                      <span className="font-semibold">{step.name}:</span>{" "}
                      {step.status}
                      {step.status === "running" ||
                      step.status === "completed" ? (
                        <span>
                          {" "}
                          ({step.processed}/{step.total})
                        </span>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li>No step progress available.</li>
                )}
              </ol>
              {dbMigrationProgress.status === "completed" && (
                <div className="text-green-600 mt-2">Migration completed!</div>
              )}
              {dbMigrationProgress.status === "error" && (
                <div className="text-red-600 mt-2">
                  Error: {dbMigrationProgress.error}
                </div>
              )}
            </>
          ) : (
            <div>No migration progress yet.</div>
          )}
        </div>
      </div>
      {/* Create userStats Collection Section */}
      <div className="max-w-2xl mx-auto py-12 px-4 mt-12">
        <h2 className="text-xl font-bold mb-4">Create userStats Collection</h2>
        <button
          onClick={async () => {
            setUserStatsResult(null);
            setUserStatsError(null);
            setUserStatsLoading(true);
            try {
              const res = await fetch("/api/admin/create-user-stats/start", {
                method: "POST",
              });
              const data = await res.json();
              setUserStatsResult(data);
              setUserStatsLoading(false);
            } catch (e: any) {
              setUserStatsError(e.message || "Unknown error");
              setUserStatsLoading(false);
            }
          }}
          disabled={userStatsLoading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 mb-4"
        >
          {userStatsLoading ? "Running..." : "Create userStats Collection"}
        </button>
        {userStatsError && (
          <div className="mt-2 text-red-600">{userStatsError}</div>
        )}
        {userStatsResult && (
          <div className="mt-2 text-gray-800">
            {userStatsResult.success
              ? `Processed ${userStatsResult.processed} users successfully.`
              : `Error: ${userStatsResult.error}`}
          </div>
        )}
      </div>
      {/* Analysis wordStats Migration Section */}
      <div className="max-w-2xl mx-auto py-12 px-4 mt-12">
        <h2 className="text-xl font-bold mb-4">Update Analyses wordStats</h2>
        <button
          onClick={async () => {
            setAnalysisStatsResult(null);
            setAnalysisStatsError(null);
            setAnalysisStatsLoading(true);
            try {
              const res = await fetch("/api/admin/analysis-word-stats/start", {
                method: "POST",
              });
              const data = await res.json();
              setAnalysisStatsResult(data);
              setAnalysisStatsLoading(false);
            } catch (e: any) {
              setAnalysisStatsError(e.message || "Unknown error");
              setAnalysisStatsLoading(false);
            }
          }}
          disabled={analysisStatsLoading}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 mb-4"
        >
          {analysisStatsLoading ? "Running..." : "Update Analyses wordStats"}
        </button>
        {analysisStatsError && (
          <div className="mt-2 text-red-600">{analysisStatsError}</div>
        )}
        {analysisStatsResult && (
          <div className="mt-2 text-gray-800">
            {analysisStatsResult.success
              ? `Processed ${analysisStatsResult.processed} analyses successfully.`
              : `Error: ${analysisStatsResult.error}`}
          </div>
        )}
      </div>
    </div>
  );
}
