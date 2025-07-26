import { createApi } from "@reduxjs/toolkit/query/react";

import { supabaseRpcBaseQuery } from "@/shared/api";

interface ReloadWordDefinitionResponse {
  definition: string;
  newPhoneticText: string;
  newPhoneticAudioLink: string;
}

interface ReloadWordDefinitionRow {
  definition: string;
  phonetic_text: string;
  phonetic_audio_link: string;
}

interface ReloadWordTranslationResponse {
  translation: string;
}

interface ReloadWordTranslationRow {
  translations_text: string;
}

export const wordApi = createApi({
  reducerPath: "wordApi",
  baseQuery: supabaseRpcBaseQuery,
  tagTypes: ["Word"],
  endpoints: (builder) => ({
    reloadWordDefinition: builder.mutation<
      ReloadWordDefinitionResponse,
      {
        langCode: string;
        id: string;
        definition: string | null;
        newPhoneticText: string | null;
        newPhoneticAudioLink: string | null;
      }
    >({
      query: ({
        langCode,
        id,
        definition,
        newPhoneticText,
        newPhoneticAudioLink,
      }) => ({
        functionName: "update_word_definition",
        args: {
          lang_code: langCode,
          word_id: id,
          new_definition: definition,
          new_phonetic_text: newPhoneticText,
          new_phonetic_audio_link: newPhoneticAudioLink,
        },
      }),
      invalidatesTags: ["Word"],
      transformResponse: (response: ReloadWordDefinitionRow) => {
        return {
          definition: response.definition,
          newPhoneticText: response.phonetic_text,
          newPhoneticAudioLink: response.phonetic_audio_link,
        };
      },
    }),

    reloadWordTranslation: builder.mutation<
      ReloadWordTranslationResponse,
      {
        langCode: string;
        id: string;
        translation: string | null;
      }
    >({
      query: ({ langCode, id, translation }) => ({
        functionName: "update_translation_word_details",
        args: {
          lang_code: langCode,
          target_lang_code: "uk",
          p_word_id: id,
          p_translations_text: translation ?? "",
          p_definition: "",
        },
      }),
      transformResponse: (response: ReloadWordTranslationRow) => {
        return {
          translation: response.translations_text,
        };
      },
    }),

    removeWordFromDictionary: builder.mutation<
      void,
      {
        langCode: string;
        id: string;
      }
    >({
      query: ({ langCode, id }) => ({
        functionName: "remove_word_from_dictionary",
        args: {
          lang_code: langCode,
          p_word_id: id,
        },
      }),
    }),
  }),
});
