import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useUserStats() {
  const user = useSelector(selectUser);
  const [wordStats, setWordStats] = useState<Record<number, number> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWordStats(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getDoc(doc(db, "userStats", user.uid))
      .then((snap) => {
        if (snap.exists()) {
          setWordStats(snap.data().wordStats || null);
        } else {
          setWordStats(null);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch userStats");
        setWordStats(null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return { wordStats, loading, error };
}
