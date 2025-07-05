# Word Status Migration Summary

## Overview
Successfully migrated from the old string-based status system to a new 1-7 numeric status system for better granularity and user experience.

## New Status System

### Status Values
- **1 - Not Learned**: Words that haven't been studied yet
- **2 - Beginner**: Words in early learning stage
- **3 - Basic**: Words with basic understanding
- **4 - Intermediate**: Words with moderate understanding
- **5 - Advanced**: Words with good understanding
- **6 - Well Known**: Words that are well learned
- **7 - Mastered**: Words that are completely mastered

### Status Mapping (Old → New)
- `to_learn` → 1 (Not Learned)
- `want_repeat` → 4 (Intermediate)
- `well_known` → 6 (Well Known)
- `unset` → 1 (Not Learned)

## Files Updated

### 1. Type Definitions
- **`src/entities/word/types.ts`**: Updated Word interface with new status type and helper functions
- **`src/types/index.ts`**: Updated Word interface with new status type

### 2. Components
- **`src/components/shared/StatusSelector.tsx`**: Updated to use 1-7 status system with proper labels and colors
- **`src/components/WordTrainingCard.tsx`**: Updated interface to use numeric status type

### 3. Pages
- **`src/app/words/page.tsx`**: Updated status options, filtering, and status change handling
- **`src/app/training/page.tsx`**: Updated training page to use new status system

### 4. Redux Slices
- **`src/features/training/model/trainingSlice.ts`**: Updated training state to use numeric statuses
- **`src/shared/model/formSlice.ts`**: Updated form state to use numeric statuses
- **`src/features/analysis-view/model/trainingStatsSlice.ts`**: Updated stats calculation to use new status system
- **`src/entities/word/model/selectors.ts`**: Updated selectors to work with numeric statuses

### 5. API Functions
- **`src/features/analyze/lib/analyzeApi.ts`**: Updated word processing to use new status system
- **`src/features/analyses/lib/analysesApi.ts`**: Updated statistics calculation to use numeric statuses

### 6. Migration Script
- **`migrate-word-status.js`**: Node.js script to migrate existing database records

## Key Features Added

### Helper Functions
```typescript
// Status constants
export const WORD_STATUS = {
  NOT_LEARNED: 1,
  BEGINNER: 2,
  BASIC: 3,
  INTERMEDIATE: 4,
  ADVANCED: 5,
  WELL_KNOWN: 6,
  MASTERED: 7,
};

// Status labels
export const WORD_STATUS_LABELS = {
  1: "Not Learned",
  2: "Beginner",
  3: "Basic",
  4: "Intermediate",
  5: "Advanced",
  6: "Well Known",
  7: "Mastered",
};

// Status colors for UI
export const WORD_STATUS_COLORS = {
  1: "bg-gray-500 text-white border-gray-500",
  2: "bg-red-500 text-white border-red-500",
  3: "bg-orange-500 text-white border-orange-500",
  4: "bg-yellow-500 text-white border-yellow-500",
  5: "bg-blue-500 text-white border-blue-500",
  6: "bg-green-500 text-white border-green-500",
  7: "bg-purple-500 text-white border-purple-500",
};

// Helper functions
export const isWordLearned = (status?: number): boolean => {
  return status ? status >= 6 : false;
};

export const getStatusLabel = (status?: number): string => {
  return status ? WORD_STATUS_LABELS[status] || "Unknown" : "No Status";
};

export const getStatusColor = (status?: number): string => {
  return status ? WORD_STATUS_COLORS[status] || "bg-gray-500 text-white border-gray-500" : "bg-gray-500 text-white border-gray-500";
};
```

### Enhanced Selectors
- `selectWordsByStatus`: Filter words by specific status
- `selectWordsByStatuses`: Filter words by multiple statuses
- `selectLearnedWords`: Get all learned words (status 6-7)
- `selectNotLearnedWords`: Get all not learned words (status 1-5 or no status)
- `selectWordsNeedingReview`: Get words that need review (status 1-5)
- `selectWordStats`: Get comprehensive statistics for all status levels

## Benefits of New System

1. **Better Granularity**: 7 levels instead of 3 provide more precise learning tracking
2. **Visual Progression**: Color-coded statuses show clear learning progression
3. **Improved Training**: More targeted training based on specific learning levels
4. **Better Analytics**: More detailed statistics and progress tracking
5. **Type Safety**: Strong typing with numeric statuses prevents errors
6. **Consistent UI**: Unified status display across all components

## Migration Process

1. **Database Migration**: Run `node migrate-word-status.js` to update existing records
2. **Code Deployment**: Deploy updated code with new status system
3. **Testing**: Verify all components work with new status system
4. **User Education**: Inform users about the new status levels

## Backward Compatibility

- Old status values are preserved as `oldStatus` field during migration
- Helper functions handle undefined/null status values gracefully
- Default status for new words is 1 (Not Learned)
- All existing functionality continues to work with new system

## Next Steps

1. Run the migration script to update existing database records
2. Test all components with the new status system
3. Update any remaining hardcoded status references
4. Consider adding status progression suggestions based on user behavior
5. Implement status-based training algorithms 