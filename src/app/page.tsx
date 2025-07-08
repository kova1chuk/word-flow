"use client";

import AuthGuard from "@/components/AuthGuard";
import {
  WordStatsChart,
  NavigationLinks,
  WelcomeScreen,
} from "@/features/main";

function AuthenticatedDashboard() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="mb-8">
            <WordStatsChart />
          </div>
        </div>
        <NavigationLinks />
      </div>
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
