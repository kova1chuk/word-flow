import Link from "next/link";

import { colors } from "@/shared/config/colors";

export default function WelcomeScreen() {
  return (
    <div className={`flex min-h-screen items-center justify-center p-4 pt-26`}>
      <div className="mx-auto max-w-4xl text-center">
        {/* Hero Section */}
        <div className="mb-12">
          {/* Animated Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div
                className={`h-24 w-24 bg-gradient-to-r ${colors.primary.light} flex items-center justify-center rounded-2xl ${colors.shadow.card} transform transition-transform duration-300 hover:scale-110`}
              >
                <svg
                  className="h-12 w-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 h-6 w-6 animate-bounce rounded-full bg-yellow-400"></div>
              <div className="absolute -bottom-2 -left-2 h-4 w-4 animate-pulse rounded-full bg-green-400"></div>
            </div>
          </div>

          {/* Main Heading */}
          <h1
            className={`text-5xl font-bold md:text-6xl ${colors.gradientText.primary} mb-6`}
          >
            Welcome to Word Flow
          </h1>

          {/* Subtitle */}
          <p
            className={`text-xl md:text-2xl ${colors.text.secondary.light} dark:${colors.text.secondary.dark} mx-auto mb-8 max-w-2xl leading-relaxed`}
          >
            Master vocabulary through intelligent analysis, personalized
            training, and seamless learning experiences
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mb-12 grid max-w-4xl gap-6 md:grid-cols-3">
          <div
            className={`${colors.background.card.light} dark:${colors.background.card.dark} rounded-xl p-6 ${colors.shadow.card} ${colors.shadow.cardHover} transition-shadow duration-300`}
          >
            <div
              className={`h-12 w-12 ${colors.features.analysis.icon.light} dark:${colors.features.analysis.icon.dark} mx-auto mb-4 flex items-center justify-center rounded-lg`}
            >
              <svg
                className={`h-6 w-6 ${colors.features.analysis.text.light} dark:${colors.features.analysis.text.dark}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-semibold ${colors.text.primary.light} dark:${colors.text.primary.dark} mb-2`}
            >
              Smart Analysis
            </h3>
            <p
              className={`${colors.text.secondary.light} dark:${colors.text.secondary.dark}`}
            >
              Upload texts and get intelligent word analysis with difficulty
              levels and learning recommendations
            </p>
          </div>

          <div
            className={`${colors.background.card.light} dark:${colors.background.card.dark} rounded-xl p-6 ${colors.shadow.card} ${colors.shadow.cardHover} transition-shadow duration-300`}
          >
            <div
              className={`h-12 w-12 ${colors.features.training.icon.light} dark:${colors.features.training.icon.dark} mx-auto mb-4 flex items-center justify-center rounded-lg`}
            >
              <svg
                className={`h-6 w-6 ${colors.features.training.text.light} dark:${colors.features.training.text.dark}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-semibold ${colors.text.primary.light} dark:${colors.text.primary.dark} mb-2`}
            >
              Interactive Training
            </h3>
            <p
              className={`${colors.text.secondary.light} dark:${colors.text.secondary.dark}`}
            >
              Engage with various training modes including quizzes,
              translations, and context exercises
            </p>
          </div>

          <div
            className={`${colors.background.card.light} dark:${colors.background.card.dark} rounded-xl p-6 ${colors.shadow.card} ${colors.shadow.cardHover} transition-shadow duration-300`}
          >
            <div
              className={`h-12 w-12 ${colors.features.progress.icon.light} dark:${colors.features.progress.icon.dark} mx-auto mb-4 flex items-center justify-center rounded-lg`}
            >
              <svg
                className={`h-6 w-6 ${colors.features.progress.text.light} dark:${colors.features.progress.text.dark}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-semibold ${colors.text.primary.light} dark:${colors.text.primary.dark} mb-2`}
            >
              Progress Tracking
            </h3>
            <p
              className={`${colors.text.secondary.light} dark:${colors.text.secondary.dark}`}
            >
              Monitor your learning progress with detailed statistics and
              personalized insights
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signin"
              className={`inline-flex transform items-center justify-center rounded-xl bg-gradient-to-r px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 ${colors.button.primary.background} ${colors.button.primary.text} ${colors.shadow.button} hover:${colors.shadow.buttonHover}`}
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Get Started
            </Link>

            <Link
              href="/signup"
              className={`inline-flex items-center justify-center px-8 py-4 text-lg font-semibold ${colors.button.secondary.background} ${colors.button.secondary.text.light} dark:${colors.button.secondary.text.dark} rounded-xl ${colors.button.secondary.hover.light} dark:${colors.button.secondary.hover.dark} transition-all duration-300`}
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create Account
            </Link>
          </div>

          <p
            className={`text-sm ${colors.text.muted.light} dark:${colors.text.muted.dark}`}
          >
            Join thousands of learners improving their vocabulary with Word Flow
          </p>
        </div>
      </div>
    </div>
  );
}
