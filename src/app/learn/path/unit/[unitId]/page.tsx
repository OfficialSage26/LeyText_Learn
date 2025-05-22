
"use client";

import React, { useState, useEffect, useMemo, use } from 'react'; // Import 'use'
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2, ChevronRight, BookOpenText } from 'lucide-react';
import Link from 'next/link';
import type { WordEntry, Language } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_LANGUAGES } from '@/types';

// Placeholder for unit data - in a real app, this might come from a CMS or a more complex data structure
const unitsData: { [key: string]: { title: string; description: string; } } = {
  unit1: { title: "Unit 1: Foundations", description: "Learning basic greetings and phrases." },
  // Add other units here if needed
};

interface GreetingDisplay extends WordEntry {
  aiExamples?: string[];
  isLoadingExamples?: boolean;
}

export default function UnitPage({ params: paramsPromise }: { params: { unitId: string } }) {
  const params = use(paramsPromise as Promise<{ unitId: string }>);
  const { unitId } = params;

  const { targetLanguage: learningLanguage, sourceLanguage: globalSourceLanguage, words: allWords } = useGlobalAppContext();
  const { toast } = useToast();

  const [greetings, setGreetings] = useState<GreetingDisplay[]>([]);

  const unitInfo = unitsData[unitId] || { title: "Unknown Unit", description: "Content not found." };

  useEffect(() => {
    if (unitId === 'unit1' && learningLanguage) {
      let relevantDisplayGreetings: GreetingDisplay[] = [];

      if (learningLanguage === 'English') {
        // User is learning English. Meanings should be in another language (e.g., globalSourceLanguage or Tagalog fallback).
        const meaningLanguage = (globalSourceLanguage !== 'English' ? globalSourceLanguage : SUPPORTED_LANGUAGES.find(l => l !== 'English')) || 'Tagalog' as Language;
        
        relevantDisplayGreetings = allWords
          .filter(w =>
            w.language === 'English' && // The original word is English
            w.targetLanguage === meaningLanguage && // Its meaning is in meaningLanguage
            w.category?.toLowerCase() === 'greetings'
          )
          .map(w_entry => ({
            ...w_entry, // Spread original WordEntry fields like id, createdAt
            word: w_entry.word, // The English word is what's being learned
            meaning: w_entry.meaning, // The meaning in meaningLanguage
            language: 'English', // The language of 'word' is English (for AI examples)
            targetLanguage: meaningLanguage, // The language of 'meaning' field
            aiExamples: [],
            isLoadingExamples: false,
          }));
      } else {
        // User is learning a non-English language. Meanings should be in English.
        relevantDisplayGreetings = allWords
          .filter(w =>
            w.language === 'English' && // Original word is English
            w.targetLanguage === learningLanguage && // Its meaning is in the language being learned
            w.category?.toLowerCase() === 'greetings'
          )
          .map(w_entry => ({
            ...w_entry, // Spread original WordEntry fields
            word: w_entry.meaning, // The word in the language being learned
            meaning: w_entry.word, // The English meaning
            language: learningLanguage, // The language of 'word' (for AI examples)
            targetLanguage: 'English', // The language of the 'meaning' field
            aiExamples: [],
            isLoadingExamples: false,
          }));
      }
      setGreetings(relevantDisplayGreetings.slice(0, 5)); // Show up to 5 greetings
    }
  }, [unitId, learningLanguage, globalSourceLanguage, allWords]);

  const handleGetAIExamples = async (greetingIndex: number) => {
    const specificGreeting = greetings[greetingIndex];
    if (!specificGreeting) return;

    setGreetings(prev => prev.map((g, idx) => idx === greetingIndex ? { ...g, isLoadingExamples: true } : g));

    try {
      const result = await generateExampleSentences({
        wordOrPhrase: specificGreeting.word, 
        language: specificGreeting.language, 
      });
      setGreetings(prev => prev.map((g, idx) => idx === greetingIndex ? { ...g, aiExamples: result.sentences, isLoadingExamples: false } : g));
      toast({ title: "AI Examples Generated", description: `Examples for "${specificGreeting.word}" loaded.` });
    } catch (error) {
      console.error("Error generating AI examples:", error);
      toast({ title: "Error", description: "Could not load AI examples.", variant: "destructive" });
      setGreetings(prev => prev.map((g, idx) => idx === greetingIndex ? { ...g, isLoadingExamples: false } : g));
    }
  };
  
  if (unitId !== 'unit1') {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h1 className="text-3xl font-bold mb-4">Content Coming Soon!</h1>
          <p className="text-muted-foreground mb-8">This unit ({unitInfo.title}) is currently under development.</p>
          <Button asChild variant="outline">
            <Link href="/learn/path">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpenText className="w-10 h-10 text-primary" />
              <CardTitle className="text-3xl sm:text-4xl font-bold">{unitInfo.title} - Learning {learningLanguage}</CardTitle>
            </div>
            <CardDescription className="text-lg">{unitInfo.description}</CardDescription>
          </div>
           <Button asChild variant="outline">
            <Link href="/learn/path">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Lesson 1: Basic Greetings</CardTitle>
            <CardDescription>Learn some common greetings in {learningLanguage}. Click the button to see AI-generated example sentences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {greetings.length === 0 && (
              <p className="text-muted-foreground">
                No greetings found for {learningLanguage} in the initial word set for this unit. 
                Consider adding some "Greetings" to your Word List for English words translated to {learningLanguage === 'English' ? (globalSourceLanguage !== 'English' ? globalSourceLanguage : 'Tagalog') : learningLanguage}.
              </p>
            )}
            {greetings.map((greeting, index) => (
              <Card key={greeting.id} className="p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{greeting.word}</h3>
                    <p className="text-sm text-muted-foreground">({greeting.meaning} - in {greeting.targetLanguage})</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleGetAIExamples(index)}
                    disabled={greeting.isLoadingExamples}
                    className="mt-2 sm:mt-0"
                    aria-label={`Get AI example sentences for ${greeting.word}`}
                  >
                    {greeting.isLoadingExamples ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Get AI Examples
                  </Button>
                </div>
                {greeting.aiExamples && greeting.aiExamples.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dashed" aria-live="polite">
                    <h4 className="text-sm font-medium mb-1">Example Sentences (in {greeting.language}):</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {greeting.aiExamples.map((ex, i) => <li key={i}><em>{ex}</em></li>)}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson (Soon)
          </Button>
          <Button disabled>
            Next Lesson (Soon) <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
