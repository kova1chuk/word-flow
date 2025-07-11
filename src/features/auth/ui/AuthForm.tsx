import { GoogleButton } from "./GoogleButton";

interface AuthFormProps {
  email: string;
  password: string;
  confirmPassword?: string;
  error: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange?: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleAuth: () => void;
  submitText: string;
  googleText: string;
  showConfirmPassword?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  email,
  password,
  confirmPassword = "",
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onGoogleAuth,
  submitText,
  googleText,
  showConfirmPassword = false,
}) => {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 text-base bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-colors"
            placeholder="Email address"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              showConfirmPassword ? "new-password" : "current-password"
            }
            required
            className={`appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 text-base bg-white dark:bg-gray-800 ${
              showConfirmPassword ? "" : "rounded-b-md"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-colors`}
            placeholder="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />
        </div>
        {showConfirmPassword && (
          <div>
            <label htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 text-base bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 transition-colors"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange?.(e.target.value)}
            />
          </div>
        )}
      </div>

      {error && <div className="text-red-600 text-sm text-center">{error}</div>}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : submitText}
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700 transition-colors" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleButton onClick={onGoogleAuth} disabled={loading}>
            {googleText}
          </GoogleButton>
        </div>
      </div>
    </form>
  );
};
