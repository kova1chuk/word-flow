"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useUserStats } from "@/shared/hooks/useUserStats";
import WelcomeScreen from "./components/WelcomeScreen";
import WordStatsChart from "./components/WordStatsChart";
import NavigationLinks from "./components/NavigationLinks";
import AuthGuard from "@/components/AuthGuard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AuthenticatedDashboard() {
  const { wordStats, loading, error } = useUserStats();

  // Prepare chart data (current snapshot)
  const statusCounts = [1, 2, 3, 4, 5, 6, 7].map((s) => wordStats?.[s] ?? 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <WordStatsChart
            statusCounts={statusCounts}
            loading={loading}
            error={error}
          />
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
