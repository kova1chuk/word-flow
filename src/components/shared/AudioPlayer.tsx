import { useRef } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
}

export default function AudioPlayer({
  audioUrl,
  className = "",
  size = "md",
  title = "Play pronunciation",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  return (
    <>
      <audio ref={audioRef} />
      <button
        onClick={playAudio}
        title={title}
        className={`text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ${className}`}
      >
        <svg
          className={sizeClasses[size]}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </>
  );
}
