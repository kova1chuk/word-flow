import Link from "next/link";

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Word Flow</h1>
      <p className="mb-6 text-lg text-gray-600">
        Sign in to start learning and tracking your vocabulary!
      </p>
      <Link
        href="/auth/signin"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Sign In
      </Link>
    </div>
  );
}
