import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { useDispatch, useSelector } from "react-redux";

import { setUser, setLoading } from "@/entities/user/model/authSlice";

import { RootState } from "@/shared/model/store";

import { auth } from "@/lib/firebase";

export function useAuthSync() {
  const dispatch = useDispatch();
  const { user, loading, initialized } = useSelector(
    (state: RootState) => state.auth
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Set loading to true when starting auth check
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Auth state has been determined, update user and mark as initialized
        dispatch(
          setUser(
            firebaseUser
              ? {
                  id: firebaseUser.uid,
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  displayName: firebaseUser.displayName || undefined,
                  photoURL: firebaseUser.photoURL || undefined,
                  emailVerified: firebaseUser.emailVerified,
                  createdAt: new Date().toISOString(),
                }
              : null
          )
        );
      },
      (error) => {
        // Handle auth errors
        console.error("Auth state change error:", error);
        dispatch(setUser(null)); // Set user to null on error
      }
    );

    return unsubscribe;
  }, [dispatch, isClient]);

  // Return safe defaults during SSR
  if (!isClient) {
    return { user: null, loading: true, initialized: false };
  }

  return { user, loading, initialized };
}
