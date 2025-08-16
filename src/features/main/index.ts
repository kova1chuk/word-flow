// Main feature exports - only essential modules to avoid circular dependencies
export {
  WordStatsChart,
  WordStatsChartSkeleton,
} from "./components/WordStatsChart";

export { default as NavigationLinks } from "./components/NavigationLinks";
export { default as WelcomeScreen } from "./components/WelcomeScreen";

// Model exports
export { default as mainSlice } from "./model/mainSlice";
export * from "./model/selectors";
export * from "./model/thunks";
