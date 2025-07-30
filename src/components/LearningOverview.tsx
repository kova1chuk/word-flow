import { WORD_STATUS_LABELS, WORD_STATUS_COLORS } from "@/entities/word/types";

interface LearningOverviewProps {
  statusCounts: { [key: number]: number };
}

export const LearningOverview: React.FC<LearningOverviewProps> = ({
  statusCounts,
}) => {
  const totalStatusWords = Object.values(statusCounts).reduce(
    (acc, val) => acc + val,
    0
  );

  return (
    <div className="my-4">
      <div className="flex w-full h-4 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((status) => {
          const count = statusCounts[status] || 0;
          const percent = (count / totalStatusWords) * 100;
          const colorClass =
            WORD_STATUS_COLORS[status as keyof typeof WORD_STATUS_COLORS] ||
            "bg-gray-500";
          return (
            <div
              key={status}
              className={colorClass}
              style={{ width: `${percent}%`, transition: "width 0.3s" }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap justify-between mt-2 text-xs">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((status) => (
          <div key={status} className="flex items-center mr-2 mb-1">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-1 border ${
                WORD_STATUS_COLORS[status as keyof typeof WORD_STATUS_COLORS]
              }`}
            ></span>
            <span className="font-medium mr-1">
              {WORD_STATUS_LABELS[status as keyof typeof WORD_STATUS_LABELS]}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ({statusCounts[status] || 0})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
