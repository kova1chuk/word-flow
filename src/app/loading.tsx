import { SparklesIcon } from "@heroicons/react/24/outline";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg animate-pulse">
            <SparklesIcon className="h-10 w-10 text-white animate-bounce" />
          </div>
        </div>

        {/* Loading Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Word Flow
          </span>
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Loading your learning experience...
        </p>

        {/* Animated Loading Dots */}
        <div className="flex items-center justify-center space-x-2">
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 max-w-xs mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        {/* Loading Tips */}
        <div className="mt-8 text-sm text-gray-500 max-w-md mx-auto">
          <p>Preparing your vocabulary journey...</p>
        </div>
      </div>
    </div>
  );
}
