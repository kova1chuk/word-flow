"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "connected" | "failed"
  >("testing");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient();

        // Simple test query to check connection
        const { error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
          setConnectionStatus("failed");
        } else {
          setConnectionStatus("connected");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setConnectionStatus("failed");
      }
    }

    testConnection();
  }, []);

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-2 font-semibold">Supabase Connection Test:</h3>
      <div className="flex items-center">
        {connectionStatus === "testing" && (
          <>
            <div className="mr-2 h-3 w-3 animate-pulse rounded-full bg-yellow-500"></div>
            <span>Testing connection...</span>
          </>
        )}
        {connectionStatus === "connected" && (
          <>
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-green-700">✅ Connected to Supabase</span>
          </>
        )}
        {connectionStatus === "failed" && (
          <>
            <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-red-700">❌ Connection failed: {error}</span>
          </>
        )}
      </div>
    </div>
  );
}
