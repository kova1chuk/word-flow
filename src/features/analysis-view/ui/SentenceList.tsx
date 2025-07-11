import { useRef, useEffect } from "react";

import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";

import "react-virtualized/styles.css";
import { Sentence } from "@/entities/analysis";

interface SentenceListProps {
  sentences: Sentence[];
  viewMode: "list" | "columns";
  isFullScreen: boolean;
  translatedSentences: Record<string, string>;
  translatingSentenceId: string | null;
  onWordClick: (word: string) => void;
  onTranslate: (sentenceId: string, text: string) => void;
}

export const SentenceList: React.FC<SentenceListProps> = ({
  sentences,
  viewMode,
  isFullScreen,
  translatedSentences,
  translatingSentenceId,
  onWordClick,
  onTranslate,
}) => {
  const listRef = useRef<List | null>(null);

  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 50,
    })
  );

  // Clear cache when view mode changes
  useEffect(() => {
    cache.current.clearAll();
    if (listRef.current) {
      listRef.current.forceUpdateGrid();
    }
  }, [viewMode]);

  // Clear cache when translations change
  useEffect(() => {
    cache.current.clearAll();
    if (listRef.current) {
      listRef.current.forceUpdateGrid();
    }
  }, [translatedSentences]);

  // Highlight words in text and make them clickable
  const renderClickableText = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, "");
      if (cleanWord.length > 2) {
        return (
          <span key={index}>
            <button
              onClick={() => onWordClick(cleanWord.toLowerCase())}
              className="hover:bg-yellow-200 dark:hover:bg-yellow-800 px-1 rounded transition-colors"
              title={`Click to see info about "${cleanWord}"`}
            >
              {word}
            </button>
          </span>
        );
      }
      return <span key={index}>{word}</span>;
    });
  };

  return (
    <div className={`${isFullScreen ? "flex-1" : "h-[600px]"}`}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref={listRef}
            className="sentence-list"
            width={width}
            height={height}
            rowCount={sentences.length}
            deferredMeasurementCache={cache.current}
            rowHeight={cache.current.rowHeight}
            rowRenderer={({ index, key, style, parent }) => {
              const sentence = sentences[index];
              const translation = translatedSentences[sentence.id];
              const isTranslating = translatingSentenceId === sentence.id;

              return (
                <CellMeasurer
                  key={key}
                  cache={cache.current}
                  parent={parent}
                  columnIndex={0}
                  rowIndex={index}
                >
                  <div style={style} className="py-2 pr-2">
                    <div className="flex items-start">
                      <span className="text-gray-500 dark:text-gray-400 text-base mr-4 w-8 pt-1">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        {viewMode === "columns" && (
                          <div className="grid grid-cols-2 gap-4">
                            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                              {renderClickableText(sentence.text)}
                            </p>
                            <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                              {translation && (
                                <p className="text-blue-500 dark:text-blue-400 text-lg leading-relaxed">
                                  {translation}
                                </p>
                              )}
                              {!translation && (
                                <button
                                  onClick={() =>
                                    onTranslate(sentence.id, sentence.text)
                                  }
                                  disabled={isTranslating}
                                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                                >
                                  {isTranslating
                                    ? "Translating..."
                                    : "Translate"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        {viewMode === "list" && (
                          <div>
                            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                              {renderClickableText(sentence.text)}
                            </p>
                            <div className="mt-3">
                              {translation && (
                                <p className="text-blue-500 dark:text-blue-400 text-base leading-relaxed pl-3 border-l-2 border-blue-500">
                                  {translation}
                                </p>
                              )}
                              {!translation && (
                                <button
                                  onClick={() =>
                                    onTranslate(sentence.id, sentence.text)
                                  }
                                  disabled={isTranslating}
                                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                                >
                                  {isTranslating
                                    ? "Translating..."
                                    : "Translate"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CellMeasurer>
              );
            }}
            overscanRowCount={5}
          />
        )}
      </AutoSizer>
    </div>
  );
};
