
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import FlashcardDisplay from '@/components/FlashcardDisplay';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSelector from '@/components/LanguageSelector';
import { useMounted } from '@/hooks/useMounted';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';

export default function FlashcardsPage() {
  const { getWordsForFlashcards, sourceLanguage: globalSourceLanguage, targetLanguage: globalTargetLanguage } = useGlobalAppContext();
  const wordsForFlashcards = getWordsForFlashcards();
  const mounted = useMounted();

  const [displaySourceLang, setDisplaySourceLang] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [displayTargetLang, setDisplayTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[1]);

  useEffect(() => {
    if (mounted) {
      setDisplaySourceLang(globalSourceLanguage);
      setDisplayTargetLang(globalTargetLanguage);
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Interactive Flashcards</CardTitle>
            <CardDescription>
              Practice your vocabulary. Select your source and target languages below.
              Cards will show words from '{mounted ? displaySourceLang : SUPPORTED_LANGUAGES[0]}' to be translated to '{mounted ? displayTargetLang : SUPPORTED_LANGUAGES[1]}'.
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
