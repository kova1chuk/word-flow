import { useState } from "react";

import { AnalysisResult } from "../lib/analyzeApi";
import { useAnalyze } from "../lib/useAnalyze";

import { AnalysisResults } from "./AnalysisResults";
import { FileUpload } from "./FileUpload";
import { TextInput } from "./TextInput";

export const AnalyzePage: React.FC = () => {
  const {
    text,
    analysisResult,
    loadingAnalysis,
    saving,
    savedAnalysisId,
    setText,
    setAnalysisResult,
    handleFileUpload,
    analyzeText,
    handleSaveAnalysis,
  } = useAnalyze();

  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!analysisResult && (
          <>
            <FileUpload
              onFileUpload={handleFileUpload}
              loading={loadingAnalysis}
            />
            {!loadingAnalysis && (
              <TextInput
                text={text}
                onTextChange={setText}
                onAnalyze={analyzeText}
                loading={loadingAnalysis}
              />
            )}
          </>
        )}

        {analysisResult && (
          <AnalysisResults
            analysisResult={analysisResult}
            onSave={async () => {
              await handleSaveAnalysis();
              setIsSaved(true);
            }}
            saving={saving}
            isSaved={isSaved}
            analysisId={savedAnalysisId}
            onTitleChange={(newTitle) => {
              // Update the analysis result title
              setAnalysisResult((prev: AnalysisResult | null) =>
                prev ? { ...prev, title: newTitle } : null
              );
            }}
          />
        )}
      </div>
    </div>
  );
};
