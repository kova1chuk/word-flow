import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-8">
          <div className="mb-4 text-6xl font-bold text-gray-300 dark:text-gray-600">
            404
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Go Home
          </Link>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Or try one of these pages:
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dictionary"
              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Dictionary
            </Link>
            <Link
              href="/reviews/create"
              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Analyze Text
            </Link>
            <Link
              href="/reviews"
              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              My Reviews
            </Link>
            <Link
              href="/training"
              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Training
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
