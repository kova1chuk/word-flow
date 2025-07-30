import Link from "next/link";

interface AnalysisWordsHeaderProps {
  analysis: {
    id?: string;
    title?: string;
    description?: string;
  } | null;
}

export function AnalysisWordsHeader({ analysis }: AnalysisWordsHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={`/analyses/${analysis?.id || ""}`}
        className="mb-4 inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Analysis
      </Link>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Words in {analysis?.title || "Analysis"}
      </h1>

      {analysis?.description && (
        <p className="text-gray-600">{analysis.description}</p>
      )}
    </div>
  );
}
