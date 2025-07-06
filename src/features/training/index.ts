// Training components
export { TrainingQuestionCard } from "./ui/TrainingQuestionCard";
export { TrainingSessionSummary } from "./ui/TrainingSessionSummary";

// Training hooks
export { useTrainingSession } from "./lib/useTrainingSession";

// Training utilities
export { TrainingQuestionGenerator } from "./lib/trainingQuestionGenerator";

// Training types
export type {
  TrainingType,
  TrainingQuestion,
  TrainingSession,
  TrainingSettings,
  TrainingResult,
  UserWord,
} from "@/types";
