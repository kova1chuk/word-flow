import type { Analysis } from "@/entities/analysis/types";

interface AnalysisSummaryProps {
  analysis: Analysis;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  analysis,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Words
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {analysis.summary.totalWords.toLocaleString()}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Unique Words
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {analysis.summary.uniqueWords.toLocaleString()}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Known Words
        </div>
        <div className="text-2xl font-bold text-green-600">
          {analysis.summary.knownWords.toLocaleString()}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Unknown Words
        </div>
        <div className="text-2xl font-bold text-red-600">
          {analysis.summary.unknownWords.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
