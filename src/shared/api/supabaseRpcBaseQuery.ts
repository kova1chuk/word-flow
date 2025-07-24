import { createClient } from "@/utils/supabase/client";

import type { BaseQueryFn } from "@reduxjs/toolkit/query/react";

export interface SupabaseRpcArgs {
  functionName: string;
  args?: Record<string, unknown>;
}

export interface SupabaseRpcError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * RTK Query baseQuery for Supabase RPC (Remote Procedure Call) functions
 *
 * Usage example:
 * ```typescript
 * const api = createApi({
 *   reducerPath: 'supabaseApi',
 *   baseQuery: supabaseRpcBaseQuery,
 *   endpoints: (builder) => ({
 *     getUserStats: builder.query<UserStats, { userId: string }>({
 *       query: ({ userId }) => ({
 *         functionName: 'get_user_stats',
 *         args: { user_id: userId }
 *       })
 *     })
 *   })
 * });
 * ```
 */
export const supabaseRpcBaseQuery: BaseQueryFn<
  SupabaseRpcArgs,
  unknown,
  SupabaseRpcError
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = async ({ functionName, args }, _api, _extraOptions) => {
  try {
    const supabase = createClient();

    console.log(`🔄 RPC Call: ${functionName}`, args);

    const { data, error } = args
      ? await supabase.rpc(functionName, args)
      : await supabase.rpc(functionName);

    if (error) {
      console.error(`❌ RPC Error in ${functionName}:`, error);
      return {
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    console.log(`✅ RPC Success: ${functionName}`, data);
    return { data };
  } catch (error) {
    console.error(`❌ RPC Exception in ${functionName}:`, error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        details: String(error),
      },
    };
  }
};

/**
 * Enhanced baseQuery that supports both RPC calls and regular REST-like operations
 *
 * Usage example:
 * ```typescript
 * // For RPC calls
 * query: { type: 'rpc', functionName: 'get_user_stats', args: { user_id: userId } }
 *
 * // For table operations (future extension)
 * query: { type: 'select', table: 'words', filters: { user_id: userId } }
 * ```
 */
export interface SupabaseQueryArgs {
  type: "rpc";
  functionName: string;
  args?: Record<string, unknown>;
}

export const supabaseBaseQuery: BaseQueryFn<
  SupabaseQueryArgs,
  unknown,
  SupabaseRpcError
> = async (queryArgs, api, extraOptions) => {
  switch (queryArgs.type) {
    case "rpc":
      return supabaseRpcBaseQuery(
        {
          functionName: queryArgs.functionName,
          args: queryArgs.args,
        },
        api,
        extraOptions,
      );

    default:
      return {
        error: {
          message: `Unsupported query type: ${(queryArgs as { type: string }).type}`,
        },
      };
  }
};
