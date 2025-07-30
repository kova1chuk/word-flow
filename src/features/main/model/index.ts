export { default as mainSlice } from "./mainSlice";
export {
  clearError,
  clearDictionaryStats,
  setDictionaryStats,
} from "./mainSlice";

export * from "./selectors";
export { fetchDictionaryStats } from "./thunks";

export type { MainState } from "./mainSlice";
