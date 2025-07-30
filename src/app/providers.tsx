import { AuthSyncProvider } from "@/providers/AuthSyncProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { PWAProvider } from "@/providers/PWAProvider";
import { StoreProvider } from "@/providers/StoreProvider";

import getServerUser from "../utils/supabase/getServerUser";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;

  try {
    const result = await getServerUser();
    user = result.user;
  } catch {
    // Ensure no server-side errors propagate to React
    console.log(
      "🔄 Providers: Caught error from getServerUser, defaulting to null user",
    );
    user = null;
  }

  return (
    <StoreProvider>
      <AuthSyncProvider serverUser={user}>
        <PWAProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </PWAProvider>
      </AuthSyncProvider>
    </StoreProvider>
  );
}
