interface StatusMessagesProps {
  error: string;
  success: string;
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({
  error,
  success,
}) => {
  if (!error && !success) return null;

  return (
    <div className="mb-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md">
          <p>{success}</p>
        </div>
      )}
    </div>
  );
};
