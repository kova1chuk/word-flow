import React, { Suspense } from "react";

import { WordsListRTKSkeleton } from "./WordsListRTKSkeleton";

import type { Word } from "@/types";

interface WordsListRTKWithSuspenseProps {
  currentPage: number;
  pageSize: number;
  onWordAction: (action: string, word: Word, data?: unknown) => void;
}

// Lazy load the WordsListRTK component
const LazyWordsListRTK = React.lazy(() => import("./WordsListRTK"));

export const WordsListRTKWithSuspense: React.FC<
  WordsListRTKWithSuspenseProps
> = ({ currentPage, pageSize, onWordAction }) => {
  return (
    <Suspense fallback={<WordsListRTKSkeleton count={3} />}>
      <LazyWordsListRTK
        currentPage={currentPage}
        pageSize={pageSize}
        onWordAction={onWordAction}
      />
    </Suspense>
  );
};
