"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { WordEntry, Language, QuizScore } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

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
}

const GlobalAppContext = createContext<GlobalAppContextType | undefined>(undefined);

export function GlobalAppContextProvider({ children }: { children: ReactNode }) {
  const [sourceLanguage, setSourceLanguage] = useLocalStorage<Language>('sourceLanguage', SUPPORTED_LANGUAGES[0]);
  const [targetLanguage, setTargetLanguage] = useLocalStorage<Language>('targetLanguage', SUPPORTED_LANGUAGES[1]);
  const [words, setWords] = useLocalStorage<WordEntry[]>('wordList', []);
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
    // For flashcards, we typically use words where the word's language matches the source language
    // and the meaning's language matches the target language.
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
      clearWords
    }}>
      {children}
    </GlobalAppContext.Provider>
  );
}

export default GlobalAppContext;
