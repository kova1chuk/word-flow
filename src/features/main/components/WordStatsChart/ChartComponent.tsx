"use client";

import { Doughnut } from "react-chartjs-2";

import { useSelector } from "react-redux";

import { STATUS_LABELS, STATUS_COLORS } from "@/shared/constants/colors";

import { selectMainChartData } from "../../model";

import centerTextPlugin from "./centerTextPlugin";

function getChartData(wordStats: Record<string, number>) {
  return {
    labels: STATUS_LABELS,
    datasets: [
      {
        label: "Words by Status",
        data: Object.values(wordStats),
        borderColor: "#3b82f6",
        backgroundColor: STATUS_COLORS,
        pointBackgroundColor: STATUS_COLORS,
        pointBorderColor: "#fff",
        tension: 0.3,
        fill: false,
      },
    ],
  };
}

export default function ChartComponent() {
  const { wordStats } = useSelector(selectMainChartData);

  const chartData = getChartData(wordStats);

  return (
    <>
      <div
        className="flex items-center justify-center"
        style={{ minHeight: 400 }}
      >
        <div className="h-96 w-full max-w-lg">
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
              },
              responsive: true,
              maintainAspectRatio: false,
              cutout: "65%",
            }}
            plugins={[centerTextPlugin]}
          />
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800/80">
        {STATUS_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full border border-gray-400 shadow-sm"
              style={{ background: STATUS_COLORS[i] }}
            ></span>
            <span className="text-base font-medium text-gray-800 dark:text-gray-100">
              {label} ({wordStats[i + 1]})
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
