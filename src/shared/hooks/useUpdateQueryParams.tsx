"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export const useUpdateQueryParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateQueryParam = (key: string, value: string | string[] | number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (Array.isArray(value)) {
      if (value.length === 0) {
        params.delete(key);
      } else {
        params.set(key, value.join(","));
      }
    } else {
      if (value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const updateQueryParamsBatch = (
    updates: Record<string, string | string[] | number>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          params.delete(key);
        } else {
          params.set(key, value.join(","));
        }
      } else {
        if (value === "" || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value.toString());
        }
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  return { updateQueryParam, updateQueryParamsBatch };
};
