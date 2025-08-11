import Link from "next/link";

import { Word } from "../../entities/word";

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
          href={`/dictionary/${word.word}`}
          className="transition-colors hover:text-blue-900 dark:hover:text-blue-300"
        >
          {wordElement}
        </Link>
      ) : (
        wordElement
      )}

      {word.phonetic && word.phonetic.audio && (
        <div className="flex items-center space-x-2">
          {word.phonetic.text && (
            <span
              className={`text-gray-500 dark:text-gray-400 ${phoneticSizeClasses[size]}`}
            >
              {word.phonetic.text}
            </span>
          )}
          {word.phonetic.audio && (
            <AudioPlayer
              audioUrl={word.phonetic.audio}
              size={audioSizeClasses[size]}
            />
          )}
        </div>
      )}
    </div>
  );
}
