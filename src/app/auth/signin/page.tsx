import { Suspense } from "react";

import { SignInPage } from "@/features/auth";

export default function SignInPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
