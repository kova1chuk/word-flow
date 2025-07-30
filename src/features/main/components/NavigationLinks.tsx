import Link from "next/link";

export default function NavigationLinks() {
  return (
    <div className="flex flex-col justify-center gap-4 sm:flex-row">
      <Link
        href="/dictionary"
        className="rounded-lg bg-gray-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-gray-700"
      >
        Dictionary
      </Link>
      <Link
        href="/training"
        className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        Training Words
      </Link>
      <Link
        href="/analyses"
        className="rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-green-700"
      >
        Analyses
      </Link>
    </div>
  );
}
