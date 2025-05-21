"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import FlashcardDisplay from '@/components/FlashcardDisplay';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSelector from '@/components/LanguageSelector';

export default function FlashcardsPage() {
  const { getWordsForFlashcards, sourceLanguage, targetLanguage } = useGlobalAppContext();
  const wordsForFlashcards = getWordsForFlashcards();

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Interactive Flashcards</CardTitle>
            <CardDescription>
              Practice your vocabulary. Select your source and target languages below.
              Cards will show words from '{sourceLanguage}' to be translated to '{targetLanguage}'.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSelector />
          </CardContent>
        </Card>
        
        <FlashcardDisplay words={wordsForFlashcards} />
      </div>
    </AppLayout>
  );
}
