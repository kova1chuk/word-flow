"use client";

import React, { useEffect, useMemo } from "react";

import { useSearchParams } from "next/navigation";

import { useSelector, useDispatch } from "react-redux";

import { selectUser } from "@/entities/user/model/selectors";

import { AppDispatch, RootState } from "@/shared/model/store";

import { WithSkeleton } from "../../../shared/hocs";
import { useUpdateQueryParams } from "../../../shared/hooks/useUpdateQueryParams";

import { WordsList } from "../components";
import { WordsListSkeleton } from "../components/WordsList";
import { selectPageInfo } from "../model/selectors";
import {
  fetchAnalysesForFilter,
  fetchWordsPage,
  silentRefetchPage,
} from "../model/thunks";

import { WordsPageHeader } from "./WordsPageHeader";
import { WordsPagePagination } from "./WordsPagePagination";

const PAGE_SIZE = 24;

export const WordsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const { loading: isPageLoading, pagination } = useSelector(
    (state: RootState) => {
      return selectPageInfo(state);
    },
  );

  const searchParams = useSearchParams();
  const { page, search, statusFilter, analysisIds } = useMemo(() => {
    return {
      page: Number(searchParams.get("page") ?? 1),
      search: searchParams.get("search") ?? "",
      statusFilter: searchParams.get("statusFilter")?.split(",") ?? [],
      analysisIds: searchParams.get("analysisIds")?.split(",") ?? [],
    };
  }, [searchParams]);
  const updateQueryParams = useUpdateQueryParams();

  useEffect(() => {
    if (!user?.uid) return;
    dispatch(
      fetchWordsPage({
        page: page || 1,
        pageSize: PAGE_SIZE,
        statusFilter: statusFilter.map(Number) || [],
        search,
        analysisIds: analysisIds || [],
      }),
    );
    dispatch(fetchAnalysesForFilter("en"));
  }, [user?.uid, dispatch, page, statusFilter, search, analysisIds]);

  const handlePageChange = (page: number) => {
    updateQueryParams("page", page);
  };

  const handleSearchChange = (search: string) => {
    updateQueryParams("search", search);
  };

  const handleStatusFilterChange = (statusFilter: number[]) => {
    updateQueryParams("statusFilter", statusFilter.map(String));
  };

  const handleSilentRefetchPage = () => {
    dispatch(silentRefetchPage({ page, pageSize: PAGE_SIZE }));
  };

  const handleAnalysisIdsChange = (analysisIds: string[]) => {
    updateQueryParams("analysisIds", analysisIds.map(String));
  };

  const shouldShowPagination =
    Math.ceil(pagination.totalWords / PAGE_SIZE) &&
    Math.ceil(pagination.totalWords / PAGE_SIZE) > 1 &&
    !isPageLoading;

  return (
    <div className="w-full">
      <WordsPageHeader
        search={search}
        setSearch={handleSearchChange}
        statusFilter={statusFilter.map(Number)}
        onStatusFilterChange={handleStatusFilterChange}
        selectedAnalyses={analysisIds}
        onAnalysesFilterChange={handleAnalysisIdsChange}
      />

      <WithSkeleton
        skeleton={<WordsListSkeleton count={3} />}
        isLoading={isPageLoading}
      >
        <WordsList
          currentPage={page}
          onSilentRefetchPage={handleSilentRefetchPage}
        />
      </WithSkeleton>

      {!!shouldShowPagination && (
        <WordsPagePagination
          currentPage={page}
          totalPages={Math.ceil(pagination.totalWords / PAGE_SIZE)}
          total={pagination.totalWords}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
