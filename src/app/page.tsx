"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { selectWordStats } from "@/entities/word/model/selectors";
import { selectUser } from "@/entities/user/model/selectors";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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
  const wordStats = useSelector(selectWordStats);

  // Prepare chart data (current snapshot)
  const chartData = {
    labels: STATUS_LABELS,
    datasets: [
      {
        label: "Words by Status",
        data: [
          wordStats.notLearned,
          wordStats.beginner,
          wordStats.basic,
          wordStats.intermediate,
          wordStats.advanced,
          wordStats.wellKnown,
          wordStats.mastered,
        ],
        borderColor: "#3b82f6",
        backgroundColor: STATUS_COLORS,
        pointBackgroundColor: STATUS_COLORS,
        pointBorderColor: "#fff",
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Your Word Statuses" },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
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
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
  );
}
