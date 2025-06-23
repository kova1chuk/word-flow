import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AuthError {
  code: string;
  message: string;
}

export const authApi = {
  // Sign in with email and password
  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // Sign up with email and password
  async signUpWithEmail(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  },

  // Sign out
  async signOut(): Promise<void> {
    await signOut(auth);
  },

  // Validate password
  validatePassword(password: string): string | null {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  },

  // Validate password confirmation
  validatePasswordConfirmation(
    password: string,
    confirmPassword: string
  ): string | null {
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  },
};
