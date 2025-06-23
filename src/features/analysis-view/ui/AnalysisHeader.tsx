import Link from "next/link";
import { Analysis } from "@/entities/analysis";

interface AnalysisHeaderProps {
  analysis: Analysis;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ analysis }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <Link href="/analyses">
        <span className="text-blue-600 hover:underline text-sm">
          &larr; Back to My Analyses
        </span>
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
        {analysis.title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Analyzed on {formatDate(analysis.createdAt.dateString)}
      </p>
    </div>
  );
};
