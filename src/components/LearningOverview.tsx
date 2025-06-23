import React from "react";

interface LearningOverviewProps {
  toLearn: number;
  toRepeat: number;
  learned: number;
  total: number;
  mode?: "compact" | "detailed";
}

export const LearningOverview: React.FC<LearningOverviewProps> = ({
  toLearn,
  toRepeat,
  learned,
  total,
  mode = "compact",
}) => {
  const percent = (n: number) =>
    total > 0 ? Math.round((n / total) * 100) : 0;

  if (mode === "detailed") {
    // Detailed: full block with legend and big bars
    return (
      <div className="rounded-2xl border border-gray-700/40 bg-gray-800/60 p-6 mb-6">
        <div className="flex items-center mb-4">
          <span className="text-lg font-semibold text-white mr-2">
            Progress Overview
          </span>
          <span className="ml-auto text-sm text-gray-400">
            Total: {total.toLocaleString()} words
          </span>
        </div>
        {/* Stacked Bar */}
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden mb-4 flex">
          <div
            className="bg-blue-600 h-full"
            style={{ width: `${percent(toLearn)}%` }}
          />
          <div
            className="bg-orange-500 h-full"
            style={{ width: `${percent(toRepeat)}%` }}
          />
          <div
            className="bg-green-500 h-full"
            style={{ width: `${percent(learned)}%` }}
          />
        </div>
        {/* Legend */}
        <div className="flex items-center space-x-6 mb-4">
          <div className="flex items-center text-blue-400 text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-600 mr-2 inline-block" />
            To Learn
          </div>
          <div className="flex items-center text-orange-400 text-sm">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2 inline-block" />
            To Repeat
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2 inline-block" />
            Learned
          </div>
        </div>
        {/* Individual Bars */}
        <div className="mb-2 flex items-center">
          <span className="w-3 h-3 rounded-full bg-blue-600 mr-2" />
          <span className="text-blue-400 font-semibold mr-2">To Learn</span>
          <span className="text-white font-bold mr-2">
            {toLearn.toLocaleString()}
          </span>
          <span className="bg-blue-900/60 text-blue-200 text-xs px-2 py-0.5 rounded-full">
            {percent(toLearn)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${percent(toLearn)}%` }}
          />
        </div>
        <div className="mb-2 flex items-center">
          <span className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
          <span className="text-orange-400 font-semibold mr-2">To Repeat</span>
          <span className="text-white font-bold mr-2">
            {toRepeat.toLocaleString()}
          </span>
          <span className="bg-orange-900/60 text-orange-200 text-xs px-2 py-0.5 rounded-full">
            {percent(toRepeat)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
          <div
            className="bg-orange-500 h-3 rounded-full"
            style={{ width: `${percent(toRepeat)}%` }}
          />
        </div>
        <div className="mb-2 flex items-center">
          <span className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <span className="text-green-400 font-semibold mr-2">Learned</span>
          <span className="text-white font-bold mr-2">
            {learned.toLocaleString()}
          </span>
          <span className="bg-green-900/60 text-green-200 text-xs px-2 py-0.5 rounded-full">
            {percent(learned)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${percent(learned)}%` }}
          />
        </div>
      </div>
    );
  }

  // Compact: single stacked bar with numbers/percentages
  return (
    <div className="w-full mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Progress</span>
        <span className="text-xs text-gray-400">
          {total.toLocaleString()} words
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden flex">
        <div
          className="bg-blue-600 h-full"
          style={{ width: `${percent(toLearn)}%` }}
        />
        <div
          className="bg-orange-500 h-full"
          style={{ width: `${percent(toRepeat)}%` }}
        />
        <div
          className="bg-green-500 h-full"
          style={{ width: `${percent(learned)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs">
        <span className="text-blue-400">{toLearn}</span>
        <span className="text-orange-400">{toRepeat}</span>
        <span className="text-green-400">{learned}</span>
      </div>
    </div>
  );
};
