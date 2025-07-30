import React from "react";

import { colors } from "@/shared/config/colors";

interface PageSizeSelectorProps {
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
}) => {
  if (!pageSizeOptions || !onPageSizeChange) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label
        className={`text-sm font-medium ${colors.text.primary.light} dark:${colors.text.primary.dark} whitespace-nowrap`}
      >
        Show:
      </label>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className={`rounded-lg border px-3 py-2 ${colors.border.light} dark:${colors.border.dark} ${colors.background.card.light} dark:${colors.background.card.dark} ${colors.text.primary.light} dark:${colors.text.primary.dark} transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-900/40`}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
};
