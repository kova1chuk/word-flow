import Link from "next/link";

export default function NavigationLinks() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        href="/words"
        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition text-center"
      >
        Words
      </Link>
      <Link
        href="/training"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
      >
        Training Words
      </Link>
      <Link
        href="/analyses"
        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
      >
        Analyses
      </Link>
      <Link
        href="/analyze"
        className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition text-center"
      >
        Analyze
      </Link>
    </div>
  );
}
