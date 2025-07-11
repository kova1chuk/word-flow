import Link from "next/link";

import { useAuth } from "../lib/useAuth";

import { AuthForm } from "./AuthForm";

export const SignUpPage: React.FC = () => {
  const {
    email,
    password,
    confirmPassword,
    error,
    loading,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleEmailSignUp,
    handleGoogleAuth,
  } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <AuthForm
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          error={error}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleEmailSignUp}
          onGoogleAuth={handleGoogleAuth}
          submitText="Sign up"
          googleText="Sign up with Google"
          showConfirmPassword={true}
        />
      </div>
    </div>
  );
};
