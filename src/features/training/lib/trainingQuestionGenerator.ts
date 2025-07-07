import type { Word, TrainingQuestion, TrainingType } from "@/types";

export class TrainingQuestionGenerator {
  private static generateId(): string {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate a question based on the word and training type
  static generateQuestion(word: Word, type: TrainingType): TrainingQuestion {
    switch (type) {
      case "input_word":
        return this.generateInputWordQuestion(word);
      case "choose_translation":
        return this.generateChooseTranslationQuestion(word);
      case "context_usage":
        return this.generateContextUsageQuestion(word);
      case "synonym_match":
        return this.generateSynonymMatchQuestion(word);
      case "audio_dictation":
        return this.generateAudioDictationQuestion(word);
      default:
        throw new Error(`Unknown training type: ${type}`);
    }
  }

  // 1. Input the English Word
  private static generateInputWordQuestion(word: Word): TrainingQuestion {
    return {
      id: this.generateId(),
      wordId: word.id,
      type: "input_word",
      question: `Type the English word for: "${
        word.translation || "No translation available"
      }"`,
      correctAnswer: word.word.toLowerCase().trim(),
    };
  }

  // 2. Choose the Correct Translation
  private static generateChooseTranslationQuestion(
    word: Word
  ): TrainingQuestion {
    // Generate fake translations for multiple choice
    const fakeTranslations = [
      "дом",
      "книга",
      "машина",
      "дерево",
      "вода",
      "небо",
      "земля",
      "сонце",
    ];

    const correctTranslation = word.translation || "No translation";
    const options = [correctTranslation];

    // Add 3 random fake translations
    const shuffledFakes = fakeTranslations.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3 && i < shuffledFakes.length; i++) {
      if (shuffledFakes[i] !== correctTranslation) {
        options.push(shuffledFakes[i]);
      }
    }

    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      id: this.generateId(),
      wordId: word.id,
      type: "choose_translation",
      question: `Choose the correct translation for: "${word.word}"`,
      correctAnswer: correctTranslation,
      options: shuffledOptions,
    };
  }

  // 3. Usage in Context
  private static generateContextUsageQuestion(word: Word): TrainingQuestion {
    const example =
      word.examples?.[0] ||
      word.details?.meanings?.[0]?.definitions?.[0]?.example;
    const examples = example
      ? [example]
      : [`I need to use the word "${word.word}" in a sentence.`];

    const context = examples[0].replace(word.word, "_____");

    return {
      id: this.generateId(),
      wordId: word.id,
      type: "context_usage",
      question: `Complete the sentence with the correct word:`,
      correctAnswer: word.word.toLowerCase().trim(),
      context,
    };
  }

  // 4. Synonym/Antonym Match
  private static generateSynonymMatchQuestion(word: Word): TrainingQuestion {
    const synonyms =
      word.synonyms ||
      word.details?.meanings?.[0]?.definitions?.[0]?.synonyms ||
      [];
    const antonyms =
      word.antonyms ||
      word.details?.meanings?.[0]?.definitions?.[0]?.antonyms ||
      [];

    // Decide whether to ask for synonym or antonym
    const isSynonym = Math.random() > 0.5;
    const availableOptions = isSynonym ? synonyms : antonyms;

    if (availableOptions.length === 0) {
      // Fallback to translation choice if no synonyms/antonyms
      return this.generateChooseTranslationQuestion(word);
    }

    const correctAnswer = availableOptions[0];
    const fakeOptions = ["similar", "different", "opposite", "related"];
    const options = [correctAnswer, ...fakeOptions.slice(0, 3)];
    const shuffledOptions = options.sort(() => Math.random() - 0.5);

    return {
      id: this.generateId(),
      wordId: word.id,
      type: "synonym_match",
      question: `Choose a ${isSynonym ? "synonym" : "antonym"} for: "${
        word.word
      }"`,
      correctAnswer,
      options: shuffledOptions,
    };
  }

  // 5. Audio Dictation
  private static generateAudioDictationQuestion(word: Word): TrainingQuestion {
    return {
      id: this.generateId(),
      wordId: word.id,
      type: "audio_dictation",
      question: `Listen to the audio and type what you hear:`,
      correctAnswer: word.word.toLowerCase().trim(),
      audioUrl: word.audioUrl || word.details?.phonetics?.[0]?.audio,
    };
  }

  // Generate a random training type for a word
  static generateRandomType(word: Word): TrainingType {
    const availableTypes: TrainingType[] = ["input_word", "choose_translation"];

    // Add context usage if word has examples
    if (
      (word.examples && word.examples.length > 0) ||
      word.details?.meanings?.[0]?.definitions?.[0]?.example
    ) {
      availableTypes.push("context_usage");
    }

    // Add synonym match if word has synonyms or antonyms
    if (
      (word.synonyms && word.synonyms.length > 0) ||
      (word.antonyms && word.antonyms.length > 0) ||
      word.details?.meanings?.[0]?.definitions?.[0]?.synonyms ||
      word.details?.meanings?.[0]?.definitions?.[0]?.antonyms
    ) {
      availableTypes.push("synonym_match");
    }

    // Add audio dictation if word has audio
    if (word.audioUrl || word.details?.phonetics?.[0]?.audio) {
      availableTypes.push("audio_dictation");
    }

    // Return random type from available ones
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }

  // Generate multiple questions for a word
  static generateQuestionsForWord(
    word: Word,
    types: TrainingType[] = []
  ): TrainingQuestion[] {
    if (types.length === 0) {
      // Generate one random question
      const randomType = this.generateRandomType(word);
      return [this.generateQuestion(word, randomType)];
    }

    return types.map((type) => this.generateQuestion(word, type));
  }
}
