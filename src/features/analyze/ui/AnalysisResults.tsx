import { AnalysisResult } from "../lib/analyzeApi";

interface AnalysisResultsProps {
  analysisResult: AnalysisResult;
  onSave: () => void;
  saving: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysisResult,
  onSave,
  saving,
}) => {
  const { summary } = analysisResult;

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Analysis Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.totalWords.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Words
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {summary.uniqueWords.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Unique Words
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.wordsInDictionary.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            In My Dictionary
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.learnerWords.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Learner Words
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 col-span-1 md:col-span-2 lg:col-span-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summary.unknownWords.toLocaleString()}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            Unknown Words
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Analysis"}
        </button>
      </div>
    </div>
  );
};
