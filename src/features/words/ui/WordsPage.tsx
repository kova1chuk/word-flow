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
import { fetchWordsPage, silentRefetchPage } from "../model/thunks";

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
  }, [user?.uid, dispatch, page, statusFilter, search, analysisIds]);

  const handlePageChange = (page: number) => {
    updateQueryParams("page", page);
  };

  const handleSilentRefetchPage = () => {
    dispatch(silentRefetchPage({ page, pageSize: PAGE_SIZE }));
  };

  // const handleStatusFilterChange = (statusFilter: string[]) => {
  //   updateQueryParams("statusFilter", statusFilter);
  // };

  const shouldShowPagination =
    Math.ceil(pagination.totalWords / PAGE_SIZE) &&
    Math.ceil(pagination.totalWords / PAGE_SIZE) > 1 &&
    !isPageLoading;

  return (
    <div className="container mx-auto">
      {/* <WordsPageHeader
        error={error}
        clearError={clearError}
        statusFilter={statusFilter}
        search={search}
        setSearch={setSearch}
        STATUS_OPTIONS={STATUS_OPTIONS}
        analysesOptions={analysesOptions}
        selectedAnalyses={selectedAnalyses}
        setSelectedAnalyses={setSelectedAnalyses}
        onStatusFilterChange={handleStatusFilterChange}
      /> */}

      {/* Show skeleton loading during page transitions */}

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
