"use client";

import { Doughnut } from "react-chartjs-2";
import { STATUS_LABELS, STATUS_COLORS } from "@/shared/constants/colors";

interface WordStatsChartProps {
  statusCounts: number[];
  loading: boolean;
  error: string | null;
}

export default function WordStatsChart({
  statusCounts,
  loading,
  error,
}: WordStatsChartProps) {
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

  if (loading) {
    return <div className="text-gray-500">Loading word stats...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
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
  );
}
