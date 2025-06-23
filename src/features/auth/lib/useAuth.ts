import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "./authApi";

export const useAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const clearForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, []);

  const handleEmailSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        await authApi.signInWithEmail(email, password);
        router.push("/");
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  const handleEmailSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      // Validate password
      const passwordError = authApi.validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Validate password confirmation
      const confirmError = authApi.validatePasswordConfirmation(
        password,
        confirmPassword
      );
      if (confirmError) {
        setError(confirmError);
        return;
      }

      setLoading(true);

      try {
        await authApi.signUpWithEmail(email, password);
        router.push("/");
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [email, password, confirmPassword, router]
  );

  const handleGoogleAuth = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      await authApi.signInWithGoogle();
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    // Form state
    email,
    password,
    confirmPassword,
    error,
    loading,

    // Form actions
    setEmail,
    setPassword,
    setConfirmPassword,
    clearForm,

    // Auth actions
    handleEmailSignIn,
    handleEmailSignUp,
    handleGoogleAuth,
  };
};
