"use client";

import AuthGuard from "@/components/AuthGuard";

import {
  WordStatsChart,
  NavigationLinks,
  WelcomeScreen,
} from "@/features/main";

function AuthenticatedDashboard() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <WordStatsChart />
      </div>
      <NavigationLinks />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthGuard fallback={<WelcomeScreen />}>
      <AuthenticatedDashboard />
    </AuthGuard>
  );
}
