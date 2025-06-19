"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {user ? (
          // Authenticated user content
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Welcome to Word Flow!
            </h1>
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  You&apos;re signed in as:
                </h2>
                <p className="text-lg text-gray-600 mb-2">{user.email}</p>
                <p className="text-sm text-gray-500">User ID: {user.uid}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Authentication Status: ✅ Active
                  </h3>
                  <p className="text-green-700">
                    You can now access all features of Word Flow.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    What&apos;s Next?
                  </h3>
                  <p className="text-blue-700 mb-3">
                    Start exploring the features of Word Flow. Your account is
                    ready to use!
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Non-authenticated user content
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Welcome to Word Flow
            </h1>
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Get Started Today
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Sign in or create an account to access all the features of
                  Word Flow.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    Authentication Required
                  </h3>
                  <p className="text-yellow-700">
                    Please sign in or create an account to continue.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signin"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
