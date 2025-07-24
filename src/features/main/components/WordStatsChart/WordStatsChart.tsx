"use client";

import { useEffect } from "react";

import { useSelector } from "react-redux";

import WithSkeleton from "@/shared/hocs/WithSceleton";
import { useAppDispatch } from "@/shared/model/store";

import { selectMainChartDataLoading } from "../../model";
import { fetchDictionaryStats } from "../../model/thunks";

import ChartComponent from "./ChartComponent";
import WordStatsChartSkeleton from "./WordStatsChartSkeleton";

import "./chartConfig";

export default function WordStatsChart() {
  const dispatch = useAppDispatch();
  const isStatLoading = useSelector(selectMainChartDataLoading);

  useEffect(() => {
    dispatch(fetchDictionaryStats({ langCode: "en" }));
  }, [dispatch]);

  return (
    <WithSkeleton
      isLoading={isStatLoading}
      skeleton={<WordStatsChartSkeleton />}
    >
      <ChartComponent />
    </WithSkeleton>
  );
}
