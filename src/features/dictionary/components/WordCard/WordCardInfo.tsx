import React from "react";

import ReloadButton from "../../../../components/shared/ReloadButton";

interface WordCardInfoProps {
  type: "definition" | "translation";
  infoText?: string;
  onReload: () => void;
  updating: boolean;
}

const WordCardInfo: React.FC<WordCardInfoProps> = ({
  type,
  infoText,
  onReload,
  updating,
}) => {
  const isDefinition = type === "definition";
  const isTranslation = type === "translation";

  const getLabelStyles = () => {
    if (isDefinition) {
      return "text-sm font-semibold text-gray-700 sm:text-base dark:text-gray-300";
    }
    if (isTranslation) {
      return "text-sm font-semibold text-green-700 sm:text-base dark:text-green-400";
    }
    return "text-sm font-semibold text-gray-700 sm:text-base dark:text-gray-300";
  };

  const getContentStyles = () => {
    if (isDefinition) {
      return "text-sm leading-relaxed text-gray-800 sm:text-base dark:text-gray-200";
    }
    if (isTranslation) {
      return "text-sm text-green-700 sm:text-base dark:text-green-400";
    }
    return "text-sm leading-relaxed text-gray-800 sm:text-base dark:text-gray-200";
  };

  const getLabel = () => {
    if (isDefinition) return "Definition:";
    if (isTranslation) return "Translation:";
    return "Info:";
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className={getLabelStyles()}>{getLabel()}</span>
        <ReloadButton onClick={onReload} disabled={updating} />
      </div>
      <div className={getContentStyles()}>
        {infoText || (
          <span className="text-gray-400 dark:text-gray-500">(none)</span>
        )}
      </div>
    </div>
  );
};

export default WordCardInfo;
