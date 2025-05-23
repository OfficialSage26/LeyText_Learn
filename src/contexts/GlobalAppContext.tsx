
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { WordEntry, Language, QuizScore } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const initialWords: WordEntry[] = [
  // Greetings
  { id: uuidv4(), word: "Hello", meaning: "Kumusta", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 300000 },
  { id: uuidv4(), word: "Good morning", meaning: "Magandang umaga", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 260000 },
  { id: uuidv4(), word: "Goodbye", meaning: "Paalam", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 250000 },
  { id: uuidv4(), word: "Hello", meaning: "Kumusta", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 200000 },
  { id: uuidv4(), word: "Good morning", meaning: "Maayong buntag", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 160000 },
  { id: uuidv4(), word: "Goodbye", meaning: "Babay", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 150000 },
  { id: uuidv4(), word: "Hello", meaning: "Kumusta", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 100000 },
  { id: uuidv4(), word: "Good morning", meaning: "Maupay nga aga", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 60000 },
  { id: uuidv4(), word: "Goodbye", meaning: "Pag-laom / Bye", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 50000 },
  
  // Common Phrases
  { id: uuidv4(), word: "Thank you", meaning: "Salamat", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 280000 },
  { id: uuidv4(), word: "Yes", meaning: "Oo", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 240000 },
  { id: uuidv4(), word: "No", meaning: "Hindi", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 220000 },
  { id: uuidv4(), word: "Please", meaning: "Pakiusap", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 215000 },
  { id: uuidv4(), word: "Excuse me", meaning: "Paumanhin", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 210000 },
  { id: uuidv4(), word: "I don't understand", meaning: "Hindi ko maintindihan", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 205000 },

  { id: uuidv4(), word: "Thank you", meaning: "Salamat", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 180000 },
  { id: uuidv4(), word: "Yes", meaning: "Oo", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 140000 },
  { id: uuidv4(), word: "No", meaning: "Dili", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 120000 },
  { id: uuidv4(), word: "Please", meaning: "Palihug", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 115000 },
  { id: uuidv4(), word: "Excuse me", meaning: "Pasayloa ko", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 110000 },
  { id: uuidv4(), word: "I don't understand", meaning: "Wala ko kasabot", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 105000 },

  { id: uuidv4(), word: "Thank you", meaning: "Salamat", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 80000 },
  { id: uuidv4(), word: "Yes", meaning: "Oo", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 40000 },
  { id: uuidv4(), word: "No", meaning: "Dire", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 20000 },
  { id: uuidv4(), word: "Please", meaning: "Palihog", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 15000 },
  { id: uuidv4(), word: "Excuse me", meaning: "Pasayloa gad", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 10000 },
  { id: uuidv4(), word: "I don't understand", meaning: "Diri ak nakaintindi", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 5000 },

  // Food
  { id: uuidv4(), word: "Eat", meaning: "Kain", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 210000 },
  { id: uuidv4(), word: "Water", meaning: "Tubig", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 205000 },
  { id: uuidv4(), word: "Rice", meaning: "Kanin", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 202000 },
  { id: uuidv4(), word: "Delicious", meaning: "Masarap", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 201000 },
  { id: uuidv4(), word: "Eat", meaning: "Kaon", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 110000 },
  { id: uuidv4(), word: "Water", meaning: "Tubig", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 105000 },
  { id: uuidv4(), word: "Rice", meaning: "Bugas/Kanon", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 102000 },
  { id: uuidv4(), word: "Delicious", meaning: "Lami", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 101000 },
  { id: uuidv4(), word: "Eat", meaning: "Kaon", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 10000 },
  { id: uuidv4(), word: "Water", meaning: "Tubig", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 5000 },
  { id: uuidv4(), word: "Rice", meaning: "Kan-on/Bugas", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 2000 },
  { id: uuidv4(), word: "Delicious", meaning: "Marasa", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 1000 },

  // Family
  { id: uuidv4(), word: "Mother", meaning: "Nanay/Ina", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 10000 },
  { id: uuidv4(), word: "Father", meaning: "Tatay/Ama", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 9000 },
  { id: uuidv4(), word: "Sibling", meaning: "Kapatid", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 8000 },
  { id: uuidv4(), word: "Child", meaning: "Anak", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 7500 },
  { id: uuidv4(), word: "Mother", meaning: "Nanay/Inahan", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 7000 },
  { id: uuidv4(), word: "Father", meaning: "Tatay/Amahan", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 6000 },
  { id: uuidv4(), word: "Sibling", meaning: "Igsoon", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 5000 },
  { id: uuidv4(), word: "Child", meaning: "Anak", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 4500 },
  { id: uuidv4(), word: "Mother", meaning: "Nanay/Iroy", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 4000 },
  { id: uuidv4(), word: "Father", meaning: "Tatay/Amay", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 3000 },
  { id: uuidv4(), word: "Sibling", meaning: "Bugto", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 2000 },
  { id: uuidv4(), word: "Child", meaning: "Anak", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 1500 },

  // Verbs
  { id: uuidv4(), word: "Go", meaning: "Punta", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 30000 },
  { id: uuidv4(), word: "Want", meaning: "Gusto", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 29000 },
  { id: uuidv4(), word: "Read", meaning: "Basa", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 28000 },
  { id: uuidv4(), word: "Go", meaning: "Adto/Larga", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 27000 },
  { id: uuidv4(), word: "Want", meaning: "Gusto/Buot", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 26000 },
  { id: uuidv4(), word: "Read", meaning: "Basa", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 25000 },
  { id: uuidv4(), word: "Go", meaning: "Kadto/Lakat", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 24000 },
  { id: uuidv4(), word: "Want", meaning: "Gusto/Buot", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 23000 },
  { id: uuidv4(), word: "Read", meaning: "Basa", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 22000 },
];


interface GlobalAppContextType {
  sourceLanguage: Language;
  setSourceLanguage: (language: Language) => void;
  targetLanguage: Language;
  setTargetLanguage: (language: Language) => void;
  words: WordEntry[];
  addWord: (word: Omit<WordEntry, 'id' | 'createdAt' | 'aiSentences'>) => WordEntry;
  editWord: (updatedWord: WordEntry) => void;
  deleteWord: (wordId: string) => void;
  getWordsForCategory: (language: Language, category?: string) => WordEntry[];
  getWordsForFlashcards: () => WordEntry[];
  categories: string[];
  quizScores: QuizScore[];
  addQuizScore: (score: Omit<QuizScore, 'date'>) => void;
  clearWords: () => void;
  clearQuizScores: () => void;
}

const GlobalAppContext = createContext<GlobalAppContextType | undefined>(undefined);

export function GlobalAppContextProvider({ children }: { children: ReactNode }) {
  const [sourceLanguage, setSourceLanguage] = useLocalStorage<Language>('sourceLanguage', SUPPORTED_LANGUAGES[0]);
  const [targetLanguage, setTargetLanguage] = useLocalStorage<Language>('targetLanguage', SUPPORTED_LANGUAGES[1]);
  const [words, setWords] = useLocalStorage<WordEntry[]>('wordList', initialWords);
  const [quizScores, setQuizScores] = useLocalStorage<QuizScore[]>('quizScores', []);

  const addWord = useCallback((wordData: Omit<WordEntry, 'id' | 'createdAt' | 'aiSentences'>): WordEntry => {
    const newWord: WordEntry = {
      ...wordData,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    setWords(prevWords => [...prevWords, newWord]);
    return newWord;
  }, [setWords]);

  const editWord = useCallback((updatedWord: WordEntry) => {
    setWords(prevWords => prevWords.map(w => w.id === updatedWord.id ? updatedWord : w));
  }, [setWords]);

  const deleteWord = useCallback((wordId: string) => {
    setWords(prevWords => prevWords.filter(w => w.id !== wordId));
  }, [setWords]);

  const clearWords = useCallback(() => {
    setWords([]);
  }, [setWords]);
  
  const getWordsForCategory = useCallback((language: Language, category?: string): WordEntry[] => {
    return words.filter(word => 
      word.language === language && 
      (category ? word.category?.toLowerCase() === category.toLowerCase() : true)
    );
  }, [words]);

  const getWordsForFlashcards = useCallback((): WordEntry[] => {
    return words.filter(word => word.language === sourceLanguage && word.targetLanguage === targetLanguage);
  }, [words, sourceLanguage, targetLanguage]);

  const categories = React.useMemo(() => {
    const allCategories = new Set(words.map(w => w.category).filter(Boolean) as string[]);
    return Array.from(allCategories).sort((a,b) => a.localeCompare(b));
  }, [words]);

  const addQuizScore = useCallback((scoreData: Omit<QuizScore, 'date'>) => {
    const newScore: QuizScore = {
      ...scoreData,
      date: Date.now(),
    };
    setQuizScores(prevScores => [...prevScores, newScore]);
  }, [setQuizScores]);

  const clearQuizScores = useCallback(() => {
    setQuizScores([]);
  }, [setQuizScores]);

  return (
    <GlobalAppContext.Provider value={{
      sourceLanguage,
      setSourceLanguage,
      targetLanguage,
      setTargetLanguage,
      words,
      addWord,
      editWord,
      deleteWord,
      getWordsForCategory,
      getWordsForFlashcards,
      categories,
      quizScores,
      addQuizScore,
      clearWords,
      clearQuizScores
    }}>
      {children}
    </GlobalAppContext.Provider>
  );
}

export default GlobalAppContext;

    
