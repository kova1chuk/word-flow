import type { Analysis } from "@/entities/analysis/types";

interface AnalysisSummaryProps {
  analysis: Analysis;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  analysis,
}) => {
  // Helper function to format numbers consistently
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total Words
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {formatNumber(analysis.summary.totalWords)}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Unique Words
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          {formatNumber(analysis.summary.uniqueWords)}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Known Words
        </div>
        <div className="text-2xl font-bold text-green-600">
          {formatNumber(analysis.summary.knownWords)}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Unknown Words
        </div>
        <div className="text-2xl font-bold text-red-600">
          {formatNumber(analysis.summary.unknownWords)}
        </div>
      </div>
    </div>
  );
};
