import LoadingSpinner from "./LoadingSpinner";

interface PageLoaderProps {
  text?: string;
}

export default function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
}
