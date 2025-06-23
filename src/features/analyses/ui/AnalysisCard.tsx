import Link from "next/link";
import { Analysis } from "../lib/analysesApi";

interface AnalysisCardProps {
  analysis: Analysis;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Link href={`/analyses/${analysis.id}`}>
      <div className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6 h-full flex flex-col justify-between group">
        <div className="flex-1">
          <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {analysis.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
            Analyzed on {formatDate(analysis.createdAt.dateString)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">
              Total Words
            </span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {analysis.summary.totalWords.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">
              Unique Words
            </span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {analysis.summary.uniqueWords.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">
              Known Words
            </span>
            <span className="font-semibold text-green-600">
              {analysis.summary.knownWords.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-gray-500 dark:text-gray-400 mb-1">
              Unknown Words
            </span>
            <span className="font-semibold text-red-600">
              {analysis.summary.unknownWords.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
