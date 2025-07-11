import { SparklesIcon } from "@heroicons/react/24/outline";

import { colors, getPageBackground } from "@/shared/config/colors";

export default function Loading() {
  return (
    <div
      className={`min-h-screen ${getPageBackground()} flex items-center justify-center`}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`p-4 bg-gradient-to-r ${colors.primary.light} rounded-2xl ${colors.shadow.card} animate-pulse`}
          >
            <SparklesIcon className="h-10 w-10 text-white animate-bounce" />
          </div>
        </div>

        {/* Loading Text */}
        <h1
          className={`text-3xl font-bold ${colors.text.primary.light} dark:${colors.text.primary.dark} mb-4`}
        >
          <span className={colors.gradientText.primary}>Word Flow</span>
        </h1>

        <p
          className={`text-lg ${colors.text.secondary.light} dark:${colors.text.secondary.dark} mb-8`}
        >
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
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`bg-gradient-to-r ${colors.primary.light} h-2 rounded-full animate-pulse`}
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        {/* Loading Tips */}
        <div
          className={`mt-8 text-sm ${colors.text.muted.light} dark:${colors.text.muted.dark} max-w-md mx-auto`}
        >
          <p>Preparing your vocabulary journey...</p>
        </div>
      </div>
    </div>
  );
}
