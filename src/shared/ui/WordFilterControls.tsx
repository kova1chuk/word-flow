import React from "react";

interface StatusOption {
  value: string | number;
  label: string;
  color?: string;
}

interface WordFilterControlsProps {
  selectedStatuses: (string | number)[];
  onStatusFilterChange: (selected: (string | number)[]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusOptions: StatusOption[];
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  totalCount?: number;
  filteredCount?: number;
  className?: string;
}

const WordFilterControls: React.FC<WordFilterControlsProps> = ({
  selectedStatuses,
  onStatusFilterChange,
  search,
  onSearchChange,
  statusOptions,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  totalCount,
  filteredCount,
  className = "",
}) => {
  const selectedStatusesSafe = selectedStatuses ?? [];

  // Compute all status values except 'all'
  const allStatusValues = statusOptions
    .filter((opt) => opt.value !== "all")
    .map((opt) => opt.value);
  const allSelected = allStatusValues.every((val) =>
    selectedStatusesSafe.includes(val)
  );

  // Handler for status button click
  const handleStatusClick = (value: string | number) => {
    if (value === "all") {
      if (allSelected) {
        // Deselect all
        onStatusFilterChange([]);
      } else {
        // Select all
        onStatusFilterChange(allStatusValues);
      }
    } else {
      let newSelected = [...selectedStatusesSafe];
      if (selectedStatusesSafe.includes(value)) {
        newSelected = newSelected.filter((v) => v !== value);
      } else {
        newSelected.push(value);
      }
      // If after toggle all are selected, treat as 'all' selected
      if (allStatusValues.every((val) => newSelected.includes(val))) {
        onStatusFilterChange(allStatusValues);
      } else {
        onStatusFilterChange(newSelected);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background with unified dark theme */}
      <div className="absolute inset-0 bg-[#262c36] rounded-3xl border border-[#313846] shadow-lg" />

      {/* Main content */}
      <div className="relative p-4 sm:p-6 mb-8">
        {/* Controls Section */}
        <div className="relative w-full flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-3 p-0 mb-4">
          {/* Search Input */}
          <div className="w-full sm:flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search words..."
              className={
                `w-full px-4 py-3 sm:px-6 rounded-2xl border border-[#3a4152] focus:border-blue-400 focus:ring-2 focus:ring-blue-900/40 transition-all duration-200 ` +
                `bg-[#23272f] text-[#e5eaf2] placeholder-[#7b8ca6] ` +
                `shadow-sm text-base sm:text-lg`
              }
              style={{ fontWeight: 500 }}
            />
          </div>

          {/* Page Size Selector (if provided) */}
          {pageSizeOptions && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#e5eaf2] whitespace-nowrap">
                Show:
              </label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-[#3a4152] bg-[#23272f] text-[#e5eaf2] focus:border-blue-400 focus:ring-2 focus:ring-blue-900/40 transition-all duration-200"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats Display (if provided) */}
        {(totalCount !== undefined || filteredCount !== undefined) && (
          <div className="mb-4 text-center">
            <p className="text-sm text-[#7b8ca6]">
              {totalCount !== undefined && filteredCount !== undefined
                ? `Showing ${filteredCount} of ${totalCount} words`
                : totalCount !== undefined
                ? `Total: ${totalCount} words`
                : `Showing: ${filteredCount} words`}
            </p>
          </div>
        )}

        {/* Status Filters Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
            {statusOptions.map((option) => {
              const isAllOption = option.value === "all";
              const key = isAllOption ? "all" : String(option.value);
              const selected = isAllOption
                ? allSelected
                : selectedStatusesSafe.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusClick(option.value)}
                  className={getStatusButtonStyle(key, selected)}
                >
                  <span
                    className="block w-full text-center"
                    style={{ lineHeight: 1.2 }}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusButtonStyle = (key: string, selected: boolean) => {
  const colorMap: Record<
    string,
    {
      border: string;
      text: string;
      bg: string;
      activeBg: string;
      hover: string;
    }
  > = {
    all: {
      border: "border-[#7b8ca6]",
      text: "text-[#e5eaf2]",
      bg: "bg-transparent",
      activeBg: "bg-[#3a4152]/80",
      hover: "hover:bg-[#3a4152]/60",
    },
    "1": {
      border: "border-[#ff6b6b]",
      text: "text-[#ff6b6b]",
      bg: "bg-transparent",
      activeBg: "bg-[#ff6b6b]/80",
      hover: "hover:bg-[#ff6b6b]/20",
    },
    "2": {
      border: "border-[#ffb347]",
      text: "text-[#ffb347]",
      bg: "bg-transparent",
      activeBg: "bg-[#ffb347]/80",
      hover: "hover:bg-[#ffb347]/20",
    },
    "3": {
      border: "border-[#ffd600]",
      text: "text-[#ffd600]",
      bg: "bg-transparent",
      activeBg: "bg-[#ffd600]/80",
      hover: "hover:bg-[#ffd600]/20",
    },
    "4": {
      border: "border-[#64b5f6]",
      text: "text-[#64b5f6]",
      bg: "bg-transparent",
      activeBg: "bg-[#64b5f6]/80",
      hover: "hover:bg-[#64b5f6]/20",
    },
    "5": {
      border: "border-[#43e97b]",
      text: "text-[#43e97b]",
      bg: "bg-transparent",
      activeBg: "bg-[#43e97b]/80",
      hover: "hover:bg-[#43e97b]/20",
    },
    "6": {
      border: "border-[#b388ff]",
      text: "text-[#b388ff]",
      bg: "bg-transparent",
      activeBg: "bg-[#b388ff]/80",
      hover: "hover:bg-[#b388ff]/20",
    },
    "7": {
      border: "border-[#4dd0e1]",
      text: "text-[#4dd0e1]",
      bg: "bg-transparent",
      activeBg: "bg-[#4dd0e1]/80",
      hover: "hover:bg-[#4dd0e1]/20",
    },
  };
  const color = colorMap[key] || colorMap["all"];
  return [
    "transition-all duration-150 font-semibold text-xs sm:text-sm rounded-lg border-2",
    selected
      ? `${color.activeBg} text-white ${color.border}`
      : `${color.bg} ${color.text} ${color.border}`,
    color.hover,
    "px-2 py-1 sm:px-4 sm:py-1 focus:outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-auto min-w-[72px] sm:min-w-[90px] max-w-full",
  ].join(" ");
};

export default WordFilterControls;
