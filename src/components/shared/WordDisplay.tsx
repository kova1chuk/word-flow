import Link from "next/link";
import type { Word } from "@/types";
import AudioPlayer from "./AudioPlayer";

interface WordDisplayProps {
  word: Word;
  showLink?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function WordDisplay({
  word,
  showLink = true,
  size = "md",
  className = "",
}: WordDisplayProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const phoneticSizeClasses = {
    sm: "text-sm",
    md: "text-md",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const audioSizeClasses = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
    xl: "lg" as const,
  };

  const wordElement = (
    <span
      className={`font-bold text-blue-700 dark:text-blue-400 ${sizeClasses[size]} ${className}`}
      style={{ letterSpacing: 1 }}
    >
      {word.word}
    </span>
  );

  return (
    <div className="flex items-center space-x-3">
      {showLink ? (
        <Link
          href={`/words/${word.word}`}
          className="hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
        >
          {wordElement}
        </Link>
      ) : (
        wordElement
      )}

      {word.details?.phonetics && word.details.phonetics.length > 0 && (
        <div className="flex items-center space-x-2">
          <span
            className={`text-gray-500 dark:text-gray-400 ${phoneticSizeClasses[size]}`}
          >
            {word.details.phonetics[0].text}
          </span>
          <AudioPlayer
            audioUrl={word.details.phonetics[0].audio}
            size={audioSizeClasses[size]}
          />
        </div>
      )}
    </div>
  );
}
