import { useRouter } from "next/navigation";
import { Analysis, AnalysisStats } from "../lib/useAnalysisWords";

interface AnalysisWordsHeaderProps {
  analysis: Analysis | null;
  stats: AnalysisStats;
  onRefresh: () => void;
}

export function AnalysisWordsHeader({
  analysis,
  stats,
  onRefresh,
}: AnalysisWordsHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/analyses/${analysis?.id}`);
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {analysis?.title || "Loading..."}
              </h1>
              <p className="text-gray-600">
                Words from analysis • {analysis?.uniqueWords || 0} unique words
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ↻
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-blue-700">Total Words</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.learned}
            </div>
            <div className="text-sm text-green-700">Learned</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.notLearned}
            </div>
            <div className="text-sm text-yellow-700">Not Learned</div>
          </div>
        </div>
      </div>
    </div>
  );
}
