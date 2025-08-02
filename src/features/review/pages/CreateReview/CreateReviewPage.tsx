import { useCallback, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../../../shared/model/store";
import { selectCreateReview } from "../../model/createReviewModel/createReviewSelectors";
import { setTitle } from "../../model/createReviewModel/createReviewSlice";
import {
  parseReview,
  saveReviewData,
} from "../../model/createReviewModel/createReviewThunks";

import { AnalysisResults, FileUpload, TextInput } from "./ui";

export const CreateReviewPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const parsedReview = useAppSelector(selectCreateReview);

  const [title, setTitleValue] = useState("");
  const [text, setText] = useState("");

  const handleFileUpload = useCallback(async (file: File) => {
    dispatch(parseReview(file));
  }, []);

  const handleTextUpload = useCallback(async () => {
    dispatch(setTitle(title));
    dispatch(parseReview(text));
  }, [dispatch, text]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {!parsedReview.parsed && (
          <>
            <FileUpload
              onFileUpload={handleFileUpload}
              loading={parsedReview.processing}
            />
            {!parsedReview.processing && (
              <TextInput
                text={text}
                onTextChange={setText}
                onAnalyze={handleTextUpload}
                loading={parsedReview.processing}
                title={title}
                onTitleChange={setTitle}
              />
            )}
          </>
        )}

        {/* {analysisResult && ( */}
        <AnalysisResults
          // analysisResult={analysisResult}
          onSave={async () => {
            dispatch(
              saveReviewData({
                lang_code: "en",
                title: parsedReview.title,
                word_entries: parsedReview.words.map((word) => ({
                  text: word.text,
                  usage_count: word.usageCount,
                })),
                sentences: parsedReview.sentences,
                document_link: null,
              }),
            );
          }}
          saving={parsedReview.processing}
          // isSaved={parsedReview.saved}
          onTitleChange={(newTitle) => {
            setTitleValue(newTitle);
          }}
        />
        {/* )} */}
      </div>
    </div>
  );
};
