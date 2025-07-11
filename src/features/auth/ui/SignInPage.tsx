import Link from "next/link";

import { colors, getPageBackground } from "@/shared/config/colors";

import { useAuth } from "../lib/useAuth";

import { AuthForm } from "./AuthForm";

export const SignInPage: React.FC = () => {
  const {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleEmailSignIn,
    handleGoogleAuth,
  } = useAuth();

  return (
    <div
      className={`min-h-screen ${getPageBackground()} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md w-full space-y-8">
        <div
          className={`bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 pb-6 border border-gray-100 dark:border-gray-800 transition-all duration-300 backdrop-blur-md`}
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
              href="/auth/signup"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            >
              create a new account
            </Link>
          </p>
          <AuthForm
            email={email}
            password={password}
            error={error}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleEmailSignIn}
            onGoogleAuth={handleGoogleAuth}
            submitText="Sign in"
            googleText="Sign in with Google"
            showConfirmPassword={false}
          />
        </div>
      </div>
    </div>
  );
};
