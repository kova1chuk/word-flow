interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  text,
  onTextChange,
  onAnalyze,
  loading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Or Paste Text
      </h2>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste your text here..."
        className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {text.length} characters
        </span>
        <button
          onClick={onAnalyze}
          disabled={!text.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Analyze Text"}
        </button>
      </div>
    </div>
  );
};
