import { useAnalyze } from "../lib/useAnalyze";
import { FileUpload } from "./FileUpload";
import { TextInput } from "./TextInput";
import { AnalysisResults } from "./AnalysisResults";
import { StatusMessages } from "./StatusMessages";
import PageLoader from "@/components/PageLoader";

export const AnalyzePage: React.FC = () => {
  const {
    text,
    analysisResult,
    loadingAnalysis,
    saving,
    error,
    success,
    setText,
    handleFileUpload,
    analyzeText,
    handleSaveAnalysis,
  } = useAnalyze();

  if (loadingAnalysis) {
    return <PageLoader text="Analyzing text..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <StatusMessages error={error} success={success} />

        {!analysisResult && (
          <>
            <FileUpload onFileUpload={handleFileUpload} />
            <TextInput
              text={text}
              onTextChange={setText}
              onAnalyze={analyzeText}
              loading={loadingAnalysis}
            />
          </>
        )}

        {analysisResult && (
          <AnalysisResults
            analysisResult={analysisResult}
            onSave={handleSaveAnalysis}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
};
