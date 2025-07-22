import { AuthApiError } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/server";

const getServerUser = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    // Handle refresh token errors specifically
    if (error && error instanceof AuthApiError) {
      if (
        error.code === "refresh_token_not_found" ||
        (error.status === 400 &&
          error.message.includes("Invalid Refresh Token"))
      ) {
        console.log(
          "🔄 Server: Invalid refresh token detected, returning null user",
        );
        return { user: null, error: null }; // Return null user instead of error
      }
    }

    return { user: data?.user || null, error };
  } catch (error) {
    // Handle any other server-side auth errors
    if (
      error instanceof AuthApiError &&
      (error.code === "refresh_token_not_found" ||
        (error.status === 400 &&
          error.message.includes("Invalid Refresh Token")))
    ) {
      console.log(
        "🔄 Server: Caught refresh token error in catch block, returning null user",
      );
      return { user: null, error: null };
    }

    console.error("Server auth error:", error);
    return { user: null, error };
  }
};

export default getServerUser;
