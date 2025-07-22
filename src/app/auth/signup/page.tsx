import { Suspense } from "react";

import { SignUpPage } from "@/features/auth";

export default function SignUpPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPage />
    </Suspense>
  );
}
