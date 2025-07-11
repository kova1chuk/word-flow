import { useRef, useLayoutEffect, useState } from "react";

import * as RadixSlider from "@radix-ui/react-slider";

import type { Word } from "@/types";

const STATUS_OPTIONS = [
  { value: 1, color: "#6b7280", label: "Not Learned" }, // gray-500
  { value: 2, color: "#ef4444", label: "Beginner" }, // red-500
  { value: 3, color: "#f59e42", label: "Basic" }, // orange-500
  { value: 4, color: "#eab308", label: "Intermediate" }, // yellow-500
  { value: 5, color: "#3b82f6", label: "Advanced" }, // blue-500
  { value: 6, color: "#22c55e", label: "Well Known" }, // green-500
  { value: 7, color: "#a21caf", label: "Mastered" }, // purple-700
];

interface StatusSelectorProps {
  word: Word;
  onStatusChange: (id: string, status: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  updating?: string | null;
  className?: string;
}

export default function StatusSelector({
  word,
  onStatusChange,
  updating,
  className = "",
}: StatusSelectorProps) {
  const currentStatus = word.status || 1;

  // For label positioning
  const trackRef = useRef<HTMLDivElement>(null);
  const [labelWidth, setLabelWidth] = useState(80);
  const labelRef = useRef<HTMLDivElement>(null);

  // For visual feedback and delayed API call
  const [visualStatus, setVisualStatus] = useState(currentStatus);
  const [isChanging, setIsChanging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getVisualColor = () => {
    const visualOption = STATUS_OPTIONS.find(
      (opt) => opt.value === visualStatus
    );
    return visualOption ? visualOption.color : "#6b7280";
  };

  const getVisualLabel = () => {
    const visualOption = STATUS_OPTIONS.find(
      (opt) => opt.value === visualStatus
    );
    return visualOption ? visualOption.label : "";
  };

  const visualLabel = getVisualLabel();
  useLayoutEffect(() => {
    if (trackRef.current) {
      // No-op: thumb position is now handled by Radix and padding
    }
  }, [visualStatus]);

  useLayoutEffect(() => {
    if (labelRef.current) {
      setLabelWidth(labelRef.current.offsetWidth);
    }
  }, [visualLabel]);

  // Update visual status when currentStatus changes (from API)
  useLayoutEffect(() => {
    setVisualStatus(currentStatus);
  }, [currentStatus]);

  const handleChange = (value: number[]) => {
    const newStatus = value[0];
    if (newStatus >= 1 && newStatus <= 7) {
      // Update visual immediately
      setVisualStatus(newStatus as 1 | 2 | 3 | 4 | 5 | 6 | 7);
      setIsChanging(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only make API call if status actually changed
      if (newStatus !== currentStatus) {
        // Delay API call to show visual feedback first
        timeoutRef.current = setTimeout(() => {
          onStatusChange(word.id, newStatus as 1 | 2 | 3 | 4 | 5 | 6 | 7);
          setIsChanging(false);
        }, 300); // 300ms delay for visual feedback
      } else {
        setIsChanging(false);
      }
    }
  };

  // Cleanup timeout on unmount
  useLayoutEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`w-full flex flex-col items-center ${className}`}
      style={{ position: "relative" }}
    >
      <div
        className="relative w-full max-w-xl flex items-center"
        style={{ height: 80 }} // Increased height for bigger clickable area
      >
        {/* Dots with bigger clickable areas */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between w-full px-6"
          style={{ zIndex: 2 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="relative flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{
                width: 24, // Even bigger clickable area
                height: 24,
                cursor: "pointer",
                border: "none",
                background: "transparent",
                outline: "none",
              }}
              onClick={() => handleChange([opt.value])}
              disabled={updating === word.id}
              title={opt.label}
            >
              <span
                className="block"
                style={{
                  width: 8, // Bigger dots
                  height: 8,
                  borderRadius: 4,
                  background:
                    opt.value === visualStatus ? getVisualColor() : "#a3a3a3",
                  boxShadow:
                    opt.value === visualStatus
                      ? "0 0 12px rgba(0,0,0,0.4)"
                      : "none",
                  transition: "all 0.2s",
                  display: "inline-block",
                }}
              />
            </button>
          ))}
        </div>

        {/* Status label above thumb */}
        <div
          ref={labelRef}
          className="absolute"
          style={{
            left: (() => {
              if (!trackRef.current) return 0;
              const trackWidth = trackRef.current.offsetWidth;
              const thumbWidth = 20;
              let left =
                ((visualStatus - 1) / 6) * (trackWidth - 0) -
                labelWidth / 2 +
                thumbWidth / 2;
              left = Math.max(0, Math.min(left, trackWidth - labelWidth));
              return left;
            })(),
            top: -15, // Moved up for more space
            minWidth: 80,
            textAlign: "center",
            pointerEvents: "none",
            color: getVisualColor(),
            fontWeight: 600,
            fontSize: 14,
            zIndex: 10,
            transition: "left 0.2s, color 0.2s",
            opacity: isChanging ? 0.8 : 1,
          }}
        >
          {getVisualLabel()}
        </div>

        {/* Radix Slider with bigger track */}
        <RadixSlider.Root
          className="relative w-full h-4 flex items-center select-none touch-none px-6" // Added px-6 for padding
          min={1}
          max={7}
          step={1}
          value={[visualStatus]}
          onValueChange={handleChange}
          disabled={updating === word.id}
        >
          <RadixSlider.Track
            ref={trackRef}
            className="bg-gray-700 rounded-full h-4 w-full relative" // Increased height
            style={{
              background: `linear-gradient(to right, ${getVisualColor()} 0%, ${getVisualColor()} ${
                ((visualStatus - 1) / 6) * 100
              }%, #374151 ${((visualStatus - 1) / 6) * 100}%, #374151 100%)`,
              transition: "background 0.2s",
            }}
          >
            <RadixSlider.Range
              className="absolute h-4 rounded-full" // Increased height
              style={{
                background: getVisualColor(),
                transition: "background 0.2s",
              }}
            />
          </RadixSlider.Track>
          <RadixSlider.Thumb
            className="block w-6 h-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-110 transition-transform flex items-center justify-center" // Added flex for centering spinner
            style={{
              background: getVisualColor(),
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              transition: "background 0.2s, transform 0.1s",
            }}
            aria-label="Status"
          >
            {isChanging && (
              <svg
                className="w-3 h-3 text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
          </RadixSlider.Thumb>
        </RadixSlider.Root>
      </div>
    </div>
  );
}
