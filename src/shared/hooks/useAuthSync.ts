import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "@/entities/user/model/authSlice";
import { auth } from "@/lib/firebase";

export function useAuthSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
    });
    return unsubscribe;
  }, [dispatch]);
}
