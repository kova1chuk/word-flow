"use client";

import { Suspense } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { login, signInWithGoogle } from "@/app/(auth)/actions";

import { colors, getPageBackground } from "@/shared/config/colors";

import { AuthForm } from "./AuthForm";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div
      className={`min-h-screen ${getPageBackground()} flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8`}
    >
      <div className="w-full max-w-md space-y-8">
        <div
          className={`rounded-2xl border border-gray-100 bg-white/90 p-8 pb-6 shadow-2xl backdrop-blur-md transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/80`}
        >
          <h2
            className={`text-center text-3xl font-extrabold ${colors.text.primary.light} dark:${colors.text.primary.dark} mb-2`}
          >
            Sign in to your account
          </h2>
          <p
            className={`text-center text-sm ${colors.text.secondary.light} dark:${colors.text.secondary.dark} mb-6`}
          >
            Or{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              create a new account
            </Link>
          </p>

          <AuthForm
            serverAction={login}
            googleServerAction={signInWithGoogle}
            urlError={error ?? undefined}
            urlMessage={message ?? undefined}
            submitText="Sign in"
            googleText="Sign in with Google"
            showConfirmPassword={false}
          />
        </div>
      </div>
    </div>
  );
}

export const SignInPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
};
