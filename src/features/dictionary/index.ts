// Dictionary feature exports - only essential modules to avoid circular dependencies
export { WordsPage } from "./pages/WordsPage";
export { selectWordById, selectPaginatedWordIds } from "./model/selectors";
export {
  addWord,
  reloadWordDefinition,
  reloadWordTranslation,
  removeWordFromDictionary,
  updateWordStatus,
} from "./model/thunks";
export { fetchWordTranslation } from "./lib";

// Note: WordsList and WordCard are not exported to avoid circular dependencies
// They should be imported directly from their respective files when needed
