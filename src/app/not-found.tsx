import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="mb-8">
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-600 mb-4">
            404
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Go Home
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Or try one of these pages:
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/words"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              My Words
            </Link>
            <Link
              href="/analyze"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Analyze Text
            </Link>
            <Link
              href="/analyses"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              My Analyses
            </Link>
            <Link
              href="/training"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Training
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
