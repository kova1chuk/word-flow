// Translation service using API route
export const translateSentence = async (text: string): Promise<string> => {
  try {
    const response = await fetch("/api/oxford", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, type: "translate" }),
    });

    if (!response.ok) {
      throw new Error("Translation request failed");
    }

    const data = await response.json();
    return data.translation || "Translation not available";
  } catch (error) {
    console.error("Error translating text:", error);
    throw new Error("Failed to translate text");
  }
};

// Fetch word information (definition, pronunciation, etc.)
export const fetchWordInfo = async (
  word: string,
): Promise<{
  definition?: string;
  pronunciation?: string;
  examples?: string[];
}> => {
  try {
    const response = await fetch("/api/oxford", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: word, type: "definition" }),
    });

    if (!response.ok) {
      throw new Error("Word info request failed");
    }

    const data = await response.json();
    return {
      definition: data.definition,
      pronunciation: data.pronunciation,
      examples: data.examples || [],
    };
  } catch (error) {
    console.error("Error fetching word info:", error);
    throw new Error("Failed to fetch word information");
  }
};

// Re-export functions from analysisService
export {
  fetchAnalysisDetails,
  fetchSentencesPage,
} from "@/entities/analysis/api/analysisService";

// Reading progress and user settings functions
export const loadReadingProgress = async (
  userId: string,
  analysisId: string,
): Promise<{ currentPage: number; sentenceIndex: number } | null> => {
  // TODO: Implement Supabase reading progress loading
  console.log("Loading reading progress for:", { userId, analysisId });
  return null;
};

export const saveReadingProgress = async (
  userId: string,
  analysisId: string,
  page: number,
  sentenceIndex: number = 0,
): Promise<void> => {
  // TODO: Implement Supabase reading progress saving
  console.log("Saving reading progress:", {
    userId,
    analysisId,
    page,
    sentenceIndex,
  });
};

export const loadUserSettings = async (
  userId: string,
): Promise<{ sentencesPerPage: number } | null> => {
  // TODO: Implement Supabase user settings loading
  console.log("Loading user settings for:", userId);
  return { sentencesPerPage: 10 }; // Default value
};

export const saveUserSettings = async (
  userId: string,
  settings: { sentencesPerPage: number },
): Promise<void> => {
  // TODO: Implement Supabase user settings saving
  console.log("Saving user settings:", { userId, settings });
};
