"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const STATUS_LABELS = {
  well_known: "Well known",
  want_repeat: "Want repeat",
  to_learn: "To learn",
};
const STATUS_COLORS = {
  well_known: "#22c55e", // green-500
  want_repeat: "#f59e42", // orange-400
  to_learn: "#3b82f6", // blue-500
};

export default function Home() {
  const { user, loading } = useAuth();
  const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingChart(true);
    (async () => {
      const wordsRef = collection(db, "words");
      const q = query(wordsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const counts: { [key: string]: number } = {
        well_known: 0,
        want_repeat: 0,
        to_learn: 0,
      };
      querySnapshot.forEach((doc) => {
        const status = doc.data().status || "to_learn";
        if (counts[status] !== undefined) counts[status]++;
      });
      setStatusCounts(counts);
      setLoadingChart(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {user && (
          <div className="mb-12 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Word Statuses
            </h2>
            {loadingChart ? (
              <div className="text-gray-500">Loading chart...</div>
            ) : (
              <PieChart statusCounts={statusCounts} />
            )}
          </div>
        )}
        {user ? (
          // Authenticated user content
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Welcome to Word Flow!
            </h1>
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  You&apos;re signed in as:
                </h2>
                <p className="text-lg text-gray-600 mb-2">{user.email}</p>
                <p className="text-sm text-gray-500">User ID: {user.uid}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Authentication Status: ✅ Active
                  </h3>
                  <p className="text-green-700">
                    You can now access all features of Word Flow.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">
                    What&apos;s Next?
                  </h3>
                  <p className="text-blue-700 mb-3">
                    Start exploring the features of Word Flow. Your account is
                    ready to use!
                  </p>
                  <Link
                    href="/words"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Non-authenticated user content
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Welcome to Word Flow
            </h1>
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Get Started Today
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Sign in or create an account to access all the features of
                  Word Flow.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">
                    Authentication Required
                  </h3>
                  <p className="text-yellow-700">
                    Please sign in or create an account to continue.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signin"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  startAngle: number,
  endAngle: number
) {
  // Convert angles to radians
  const startRadians = (Math.PI / 180) * startAngle;
  const endRadians = (Math.PI / 180) * endAngle;
  // Outer arc start/end
  const x1 = cx + r2 * Math.cos(startRadians);
  const y1 = cy + r2 * Math.sin(startRadians);
  const x2 = cx + r2 * Math.cos(endRadians);
  const y2 = cy + r2 * Math.sin(endRadians);
  // Inner arc start/end
  const x3 = cx + r1 * Math.cos(endRadians);
  const y3 = cy + r1 * Math.sin(endRadians);
  const x4 = cx + r1 * Math.cos(startRadians);
  const y4 = cy + r1 * Math.sin(startRadians);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M${x1},${y1}`,
    `A${r2},${r2} 0 ${largeArc} 1 ${x2},${y2}`,
    `L${x3},${y3}`,
    `A${r1},${r1} 0 ${largeArc} 0 ${x4},${y4}`,
    "Z",
  ].join(" ");
}

function PieChart({
  statusCounts,
}: {
  statusCounts: { [key: string]: number };
}) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return <div className="text-gray-400">No words to display.</div>;
  }
  // Doughnut chart math
  let startAngle = 0;
  const outerRadius = 60;
  const innerRadius = 35;
  const cx = 80;
  const cy = 80;
  const pieces = Object.entries(statusCounts).map(([status, count]) => {
    const angle = (count / total) * 360;
    const endAngle = startAngle + angle;
    const pathData = describeArc(
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    );
    const piece = (
      <path
        key={status}
        d={pathData}
        fill={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}
        stroke="#fff"
        strokeWidth="2"
      />
    );
    startAngle = endAngle;
    return piece;
  });
  return (
    <div className="flex flex-col items-center">
      <svg width={160} height={160} viewBox="0 0 160 160">
        {pieces}
      </svg>
      <div className="flex gap-6 mt-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{
                background: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
              }}
            ></span>
            <span className="text-gray-700 text-sm">
              {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}: {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
