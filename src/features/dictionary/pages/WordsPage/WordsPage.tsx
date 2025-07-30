"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "next/navigation";

import { useSelector, useDispatch } from "react-redux";

import debounce from "@/utils/debounce";

import { selectUser } from "@/entities/user/model/selectors";

import { WithSkeleton } from "@/shared/hocs";
import { useUpdateQueryParams } from "@/shared/hooks/useUpdateQueryParams";
import { AppDispatch, RootState } from "@/shared/model/store";

import { WordsList } from "../../components";
import { WordsListSkeleton } from "../../components/WordsList";
import { selectPageInfo } from "../../model";
import {
  fetchAnalysesForFilter,
  fetchWordsPage,
  silentRefetchPage,
} from "../../model/thunks";

import { WordsPageHeader } from "./ui/WordsPageHeader";
import { WordsPagePagination } from "./ui/WordsPagePagination";

const PAGE_SIZE = 24;

export const WordsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { updateQueryParam, updateQueryParamsBatch } = useUpdateQueryParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("statusFilter")?.split(",") ?? [],
  );
  const [analysisIds, setAnalysisIds] = useState(
    searchParams.get("analysisIds")?.split(",") ?? [],
  );

  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(selectUser);
  const { loading: isPageLoading, pagination } = useSelector(
    (state: RootState) => {
      return selectPageInfo(state);
    },
  );

  const {
    page: pageParam,
    search: searchParam,
    statusFilter: statusFilterParam,
    analysisIds: analysisIdsParam,
  } = useMemo(() => {
    return {
      page: Number(searchParams.get("page") ?? 1),
      search: searchParams.get("search") ?? "",
      statusFilter: searchParams.get("statusFilter")?.split(",") ?? [],
      analysisIds: searchParams.get("analysisIds")?.split(",") ?? [],
    };
  }, [searchParams]);

  const debouncedFetchWordsPage = useMemo(() => {
    const fn = (
      page: number,
      statusFilter: number[],
      search: string,
      analysisIds: string[],
    ) => {
      dispatch(
        fetchWordsPage({
          page,
          pageSize: PAGE_SIZE,
          statusFilter,
          search,
          analysisIds,
        }),
      );
    };

    const debounced = debounce(fn as (...args: unknown[]) => void, 300);
    return debounced;
  }, [dispatch]);

  useEffect(() => {
    debouncedFetchWordsPage(
      pageParam,
      statusFilterParam.map(Number),
      searchParam,
      analysisIdsParam,
    );
    setPage(pageParam);
    setStatusFilter(statusFilterParam);
    setSearch(searchParam);
    setAnalysisIds(analysisIdsParam);
    return () => {
      debouncedFetchWordsPage.cancel();
    };
  }, [pageParam, statusFilterParam, searchParam, analysisIdsParam]);

  useEffect(() => {
    if (!user?.uid) return;
    dispatch(fetchAnalysesForFilter("en"));
  }, [dispatch]);

  const handlePageChange = (page: number) => {
    updateQueryParam("page", page);
  };

  const handleSearchChange = (search: string) => {
    setSearch(search);
  };

  const handleStatusFilterChange = (statusFilter: number[]) => {
    updateQueryParam("statusFilter", statusFilter.map(String));
  };

  const handleSilentRefetchPage = () => {
    dispatch(silentRefetchPage({ page, pageSize: PAGE_SIZE }));
  };

  const handleAnalysisIdsChange = (analysisIds: string[]) => {
    updateQueryParam("analysisIds", analysisIds.map(String));
  };

  const handleSearch = () => {
    console.log("handleSearch", search, page, statusFilter, analysisIds);

    updateQueryParamsBatch({
      search,
      page: 1,
      statusFilter: statusFilter.map(String),
      analysisIds: analysisIds.map(String),
    });
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
        onSearch={handleSearch}
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
