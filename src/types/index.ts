export const SUPPORTED_LANGUAGES = ["English", "Tagalog", "Bisaya", "Waray-Waray"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export interface WordEntry {
  id: string;
  word: string;
  meaning: string;
  language: Language; // Language of the 'word' field
  targetLanguage: Language; // Language of the 'meaning' field
  userSentence?: string;
  pronunciation?: string;
  category?: string;
  aiSentences?: string[];
  createdAt: number; // timestamp
}

export interface QuizScore {
  language: Language;
  category?: string;
  score: number;
  totalQuestions: number;
  date: number; // timestamp
}
