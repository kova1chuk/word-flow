// import AuthGuard from "@/components/AuthGuard";

import {
  WordStatsChart,
  NavigationLinks,
  WelcomeScreen,
} from "@/features/main";

import getServerUser from "../utils/supabase/getServerUser";

function AuthenticatedDashboard() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <WordStatsChart />
      </div>
      <NavigationLinks />
    </div>
  );
}

export default async function HomePage() {
  let user = null;

  try {
    const result = await getServerUser();
    user = result.user;
    console.log(result);
  } catch {
    // Suppress any server-side auth errors, including refresh token errors
    console.log(
      "🔄 HomePage: Suppressed server-side auth error, showing welcome screen",
    );
    user = null;
  }

  return !user ? <WelcomeScreen /> : <AuthenticatedDashboard />;
}
