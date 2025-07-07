"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { Doughnut } from "react-chartjs-2";
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
import { selectUser } from "@/entities/user/model/selectors";
import { useUserStats } from "@/shared/hooks/useUserStats";

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

const STATUS_LABELS = [
  "Not Learned",
  "Beginner",
  "Basic",
  "Intermediate",
  "Advanced",
  "Well Known",
  "Mastered",
];
const STATUS_COLORS = [
  "#6b7280", // gray
  "#ef4444", // red
  "#f59e42", // orange
  "#eab308", // yellow
  "#3b82f6", // blue
  "#22c55e", // green
  "#a21caf", // purple
];

export default function HomePage() {
  const user = useSelector(selectUser);
  const { wordStats, loading, error } = useUserStats();

  // Prepare chart data (current snapshot)
  const statusCounts = [1, 2, 3, 4, 5, 6, 7].map((s) => wordStats?.[s] ?? 0);
  const chartData = {
    labels: STATUS_LABELS,
    datasets: [
      {
        label: "Words by Status",
        data: statusCounts,
        borderColor: "#3b82f6",
        backgroundColor: STATUS_COLORS,
        pointBackgroundColor: STATUS_COLORS,
        pointBorderColor: "#fff",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  if (!user) {
    // Show the current landing/sign-in page
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Welcome to Word Flow</h1>
        <p className="mb-6 text-lg text-gray-600">
          Sign in to start learning and tracking your vocabulary!
        </p>
        <Link
          href="/auth/signin"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Authenticated dashboard
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          {loading ? (
            <div className="text-gray-500">Loading word stats...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <div
                className="flex justify-center items-center"
                style={{ minHeight: 400 }}
              >
                <div className="w-full max-w-lg h-96">
                  <Doughnut
                    data={{
                      ...chartData,
                      datasets: chartData.datasets.map((ds) => ({
                        ...ds,
                        borderWidth: 0,
                      })),
                    }}
                    options={{
                      plugins: {
                        legend: { display: false },
                        title: { display: true, text: "Your Word Statuses" },
                      },
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "65%",
                    }}
                  />
                </div>
              </div>
              {/* Custom Legend */}
              <div className="flex flex-wrap justify-center gap-2 mt-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-4 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
                {STATUS_LABELS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-gray-400 shadow-sm"
                      style={{ background: STATUS_COLORS[i] }}
                    ></span>
                    <span className="text-base font-medium text-gray-800 dark:text-gray-100">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/words"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition text-center"
          >
            Words
          </Link>
          <Link
            href="/training"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
          >
            Training Words
          </Link>
          <Link
            href="/analyses"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
          >
            Analyses
          </Link>
          <Link
            href="/analyze"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition text-center"
          >
            Analyze
          </Link>
        </div>
      </div>
    </div>
  );
}
