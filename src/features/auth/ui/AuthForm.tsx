import { GoogleButton } from "./GoogleButton";

interface AuthFormProps {
  email?: string;
  password?: string;
  confirmPassword?: string;
  error?: string;
  loading?: boolean;
  onEmailChange?: (email: string) => void;
  onPasswordChange?: (password: string) => void;
  onConfirmPasswordChange?: (password: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onGoogleAuth?: () => void;
  submitText: string;
  googleText: string;
  showConfirmPassword?: boolean;
  // New props for server actions
  serverAction?: (formData: FormData) => Promise<void>;
  googleServerAction?: (origin?: string) => Promise<void>;
  urlError?: string;
  urlMessage?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  email = "",
  password = "",
  confirmPassword = "",
  error = "",
  loading = false,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onGoogleAuth,
  submitText,
  googleText,
  showConfirmPassword = false,
  serverAction,
  googleServerAction,
  urlError,
  urlMessage,
}) => {
  // Use server actions if provided, otherwise fall back to client-side handlers
  const isServerMode = !!serverAction;

  return (
    <div>
      {/* Display URL-based error/message for server actions */}
      {urlError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20">
          {urlError}
        </div>
      )}

      {urlMessage && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-center text-sm text-green-600 dark:border-green-800 dark:bg-green-900/20">
          {urlMessage}
        </div>
      )}

      <form
        className="mt-8 space-y-6"
        action={serverAction}
        onSubmit={!isServerMode ? onSubmit : undefined}
      >
        <div className="-space-y-px rounded-md shadow-sm">
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
              className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-colors focus:z-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              placeholder="Email address"
              value={isServerMode ? undefined : email}
              defaultValue={isServerMode ? email : undefined}
              onChange={
                !isServerMode
                  ? (e) => onEmailChange?.(e.target.value)
                  : undefined
              }
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
              className={`relative block w-full appearance-none rounded-none border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${
                showConfirmPassword ? "" : "rounded-b-md"
              } transition-colors focus:z-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              placeholder="Password"
              value={isServerMode ? undefined : password}
              defaultValue={isServerMode ? password : undefined}
              onChange={
                !isServerMode
                  ? (e) => onPasswordChange?.(e.target.value)
                  : undefined
              }
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
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-500 transition-colors focus:z-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                placeholder="Confirm Password"
                value={isServerMode ? undefined : confirmPassword}
                defaultValue={isServerMode ? confirmPassword : undefined}
                onChange={
                  !isServerMode
                    ? (e) => onConfirmPasswordChange?.(e.target.value)
                    : undefined
                }
              />
            </div>
          )}
        </div>

        {/* Show client-side error for non-server mode */}
        {!isServerMode && error && (
          <div className="text-center text-sm text-red-600">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={!isServerMode && loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!isServerMode && loading ? "Processing..." : submitText}
          </button>
        </div>
      </form>

      {/* Google auth section - outside the main form to avoid nesting */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 transition-colors dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500 transition-colors dark:bg-gray-900 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          {googleServerAction ? (
            <GoogleButton
              onClick={async () => {
                const origin =
                  typeof window !== "undefined"
                    ? window.location.origin
                    : undefined;
                await googleServerAction(origin);
              }}
            >
              {googleText}
            </GoogleButton>
          ) : (
            <GoogleButton onClick={onGoogleAuth} disabled={loading}>
              {googleText}
            </GoogleButton>
          )}
        </div>
      </div>
    </div>
  );
};
