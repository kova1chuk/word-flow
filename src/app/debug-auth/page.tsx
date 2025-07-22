"use client";

import Link from "next/link";

import SupabaseTest from "@/components/SupabaseTest";

export default function DebugAuthPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Supabase Configuration Debug
        </h1>

        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Environment Variables Status:
            </h3>
            <ul className="mt-2 space-y-2">
              <li className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${supabaseUrl ? "bg-green-500" : "bg-red-500"}`}
                ></span>
                NEXT_PUBLIC_SUPABASE_URL:{" "}
                {supabaseUrl ? "✅ Set" : "❌ Missing"}
              </li>
              <li className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${supabaseKey ? "bg-green-500" : "bg-red-500"}`}
                ></span>
                NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
                {supabaseKey ? "✅ Set" : "❌ Missing"}
              </li>
              <li className="flex items-center">
                <span
                  className={`mr-2 h-3 w-3 rounded-full ${siteUrl ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
                NEXT_PUBLIC_SITE_URL:{" "}
                {siteUrl || "Using fallback (localhost:3000)"}
              </li>
            </ul>
          </div>

          {/* Debug Actions */}
          <div className="rounded-md border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <h3 className="mb-2 font-semibold text-purple-800 dark:text-purple-200">
              Debug Actions:
            </h3>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                alert("Browser storage cleared! Try authenticating again.");
                window.location.reload();
              }}
              className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700"
            >
              Clear Session Storage
            </button>
          </div>

          {supabaseUrl && supabaseKey && <SupabaseTest />}

          {(!supabaseUrl || !supabaseKey) && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 font-semibold text-red-800">
                Setup Required:
              </h3>
              <ol className="list-inside list-decimal space-y-1 text-red-700">
                <li>
                  Create a{" "}
                  <code className="rounded bg-red-100 px-1">.env.local</code>{" "}
                  file in your project root
                </li>
                <li>Add your Supabase project URL and anon key</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          )}

          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">
              Example .env.local file:
            </h3>
            <pre className="overflow-x-auto rounded bg-blue-100 p-2 text-sm text-blue-700">
              {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000`}
            </pre>
          </div>

          {supabaseUrl && supabaseKey && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-800">
                ✅ Configuration looks good!
              </h3>
              <p className="text-green-700">
                Your environment variables are set. If authentication is still
                failing, check your Supabase dashboard settings.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-4">
          <Link
            href="/auth/signin"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Sign In
          </Link>
          <Link
            href="/"
            className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
