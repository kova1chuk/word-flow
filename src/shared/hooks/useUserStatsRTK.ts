import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/model/store";
import { useSelector } from "react-redux";
import { selectUser } from "@/entities/user/model/selectors";
import {
  fetchUserStats,
  clearUserStats,
} from "@/entities/user/model/userStatsSlice";
import {
  selectWordStats,
  selectUserStatsLoading,
  selectUserStatsError,
} from "@/entities/user/model/userStatsSelectors";

export function useUserStatsRTK() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);

  // Select state from store
  const wordStats = useAppSelector(selectWordStats);
  const loading = useAppSelector(selectUserStatsLoading);
  const error = useAppSelector(selectUserStatsError);

  // Fetch user stats when user changes
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserStats(user.uid));
    } else {
      dispatch(clearUserStats());
    }
  }, [dispatch, user?.uid]);

  // Refetch function
  const refetch = () => {
    if (user?.uid) {
      dispatch(fetchUserStats(user.uid));
    }
  };

  return {
    wordStats,
    loading,
    error,
    refetch,
  };
}
