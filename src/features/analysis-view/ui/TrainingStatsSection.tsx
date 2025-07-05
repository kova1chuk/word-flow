import { useRouter } from "next/navigation";

interface TrainingStats {
  learned: number;
  notLearned: number;
  total: number;
}

interface TrainingStatsSectionProps {
  analysisId: string;
  trainingStats: TrainingStats | null;
  trainingLoading: boolean;
  onStartTraining: () => void;
}

export const TrainingStatsSection: React.FC<TrainingStatsSectionProps> = ({
  analysisId,
  trainingStats,
  trainingLoading,
  onStartTraining,
}) => {
  const router = useRouter();

  if (!trainingStats) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex gap-6">
        <div className="text-green-600 font-semibold">
          Learned: {trainingStats.learned}
        </div>
        <div className="text-red-600 font-semibold">
          Not learned: {trainingStats.notLearned}
        </div>
        <div className="text-gray-600 font-semibold">
          Total: {trainingStats.total}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <button
          onClick={onStartTraining}
          disabled={trainingLoading || trainingStats.total === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
        >
          {trainingLoading ? "Preparing..." : "Start Training"}
        </button>
        <button
          onClick={() => router.push(`/analyses/${analysisId}/words`)}
          className="mt-2 bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-bold"
        >
          Words Statistic
        </button>
      </div>
    </div>
  );
};
