import React from "react";

import { colors } from "@/shared/config/colors";

interface StatsDisplayProps {
  totalCount?: number;
  filteredCount?: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  totalCount,
  filteredCount,
}) => {
  if (totalCount === undefined && filteredCount === undefined) {
    return null;
  }

  return (
    <div className="mb-4 text-center">
      <p
        className={`text-sm ${colors.text.muted.light} dark:${colors.text.muted.dark}`}
      >
        {totalCount !== undefined && filteredCount !== undefined
          ? `Showing ${filteredCount} of ${totalCount} words`
          : totalCount !== undefined
            ? `Total: ${totalCount} words`
            : `Showing: ${filteredCount} words`}
      </p>
    </div>
  );
};
