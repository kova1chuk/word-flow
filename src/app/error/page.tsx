export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="mt-4 text-gray-600">
            Sorry, we couldn&apos;t complete your authentication request.
          </p>
        </div>
        <div>
          <a
            href="/auth/signin"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Try again
          </a>
        </div>
      </div>
    </div>
  );
}
