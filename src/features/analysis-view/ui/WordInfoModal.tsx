import { WordInfo } from "@/entities/analysis";

interface WordInfoModalProps {
  selectedWord: WordInfo | null;
  wordInfoLoading: boolean;
  reloadingDefinition: boolean;
  reloadingTranslation: boolean;
  onClose: () => void;
  onReloadDefinition: () => void;
  onReloadTranslation: () => void;
}

export const WordInfoModal: React.FC<WordInfoModalProps> = ({
  selectedWord,
  wordInfoLoading,
  reloadingDefinition,
  reloadingTranslation,
  onClose,
  onReloadDefinition,
  onReloadTranslation,
}) => {
  if (!selectedWord) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedWord.word}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {wordInfoLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading word info...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedWord.definition && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Definition
                    </h4>
                    <button
                      onClick={onReloadDefinition}
                      disabled={reloadingDefinition}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reloadingDefinition ? "Reloading..." : "Reload"}
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedWord.definition}
                  </p>
                </div>
              )}

              {selectedWord.translation && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Translation
                    </h4>
                    <button
                      onClick={onReloadTranslation}
                      disabled={reloadingTranslation}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reloadingTranslation ? "Reloading..." : "Reload"}
                    </button>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400">
                    {selectedWord.translation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
