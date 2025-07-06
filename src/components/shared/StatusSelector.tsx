import * as RadixSlider from "@radix-ui/react-slider";
import type { Word } from "@/types";
import { useRef, useLayoutEffect, useState } from "react";

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
  const activeOption = STATUS_OPTIONS.find(
    (opt) => opt.value === currentStatus
  );
  const activeColor = activeOption ? activeOption.color : "#6b7280";
  const activeLabel = activeOption ? activeOption.label : "";

  // For label positioning
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [labelWidth, setLabelWidth] = useState(80);
  const labelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (trackRef.current) {
      const track = trackRef.current;
      const rect = track.getBoundingClientRect();
      // 0 to 1
      const percent = (currentStatus - 1) / 6;
      setThumbLeft(rect.width * percent);
    }
  }, [currentStatus]);

  useLayoutEffect(() => {
    if (labelRef.current) {
      setLabelWidth(labelRef.current.offsetWidth);
    }
  }, [activeLabel]);

  const handleChange = (value: number[]) => {
    const newStatus = value[0];
    if (newStatus !== currentStatus && newStatus >= 1 && newStatus <= 7) {
      onStatusChange(word.id, newStatus as 1 | 2 | 3 | 4 | 5 | 6 | 7);
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center ${className}`}
      style={{ position: "relative" }}
    >
      <div
        className="relative w-full max-w-xl flex items-center"
        style={{ height: 56 }}
      >
        {/* Dots */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between w-full px-3 pointer-events-none"
          style={{ zIndex: 2 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <span
              key={opt.value}
              className="block"
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                background:
                  opt.value === currentStatus ? activeColor : "#a3a3a3",
                boxShadow: "none",
                transition: "background 0.2s",
                cursor: "pointer",
                display: "inline-block",
              }}
            />
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
              const thumbWidth = 20; // actual thumb width in px
              let left = thumbLeft - labelWidth / 2 + thumbWidth / 2;
              left = Math.max(0, Math.min(left, trackWidth - labelWidth));
              return left;
            })(),
            top: -15,
            minWidth: 80,
            textAlign: "center",
            pointerEvents: "none",
            color: activeColor,
            fontWeight: 600,
            fontSize: 14,
            zIndex: 10,
            transition: "left 0.2s",
          }}
        >
          {activeLabel}
        </div>
        {/* Radix Slider */}
        <RadixSlider.Root
          className="relative w-full h-2 flex items-center select-none touch-none"
          min={1}
          max={7}
          step={1}
          value={[currentStatus]}
          onValueChange={handleChange}
          disabled={updating === word.id}
        >
          <RadixSlider.Track
            ref={trackRef}
            className="bg-gray-700 rounded-full h-2 w-full relative"
            style={{
              background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${
                ((currentStatus - 1) / 6) * 100
              }%, #374151 ${((currentStatus - 1) / 6) * 100}%, #374151 100%)`,
            }}
          >
            <RadixSlider.Range
              className="absolute h-2 rounded-full"
              style={{ background: activeColor }}
            />
          </RadixSlider.Track>
          <RadixSlider.Thumb
            className="block w-5 h-5 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: activeColor, border: "none" }}
            aria-label="Status"
          />
        </RadixSlider.Root>
      </div>
    </div>
  );
}
