
"use client";

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2, Info, BookOpenText } from 'lucide-react';
import Link from 'next/link';
import type { WordEntry, Language } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getLessonBySlug, getUnitById } from '@/config/learningPath';
import { SUPPORTED_LANGUAGES } from '@/types';
import { useMounted } from '@/hooks/useMounted';

interface LessonWordDisplay extends WordEntry {
  aiExamples?: string[];
  isLoadingExamples?: boolean;
}

export default function LessonPage({ params: paramsPromise }: { params: { unitId: string; lessonSlug: string } }) {
  const params = use(paramsPromise as Promise<{ unitId: string; lessonSlug: string }>);
  const { unitId, lessonSlug } = params;

  const { 
    targetLanguage: learningLanguage, 
    sourceLanguage: globalSourceLanguage, 
    words: allWords 
  } = useGlobalAppContext();
  const { toast } = useToast();
  const mounted = useMounted();

  const [lessonWords, setLessonWords] = useState<LessonWordDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unit = getUnitById(unitId);
  const lesson = getLessonBySlug(unitId, lessonSlug);

  useEffect(() => {
    if (!mounted) {
      setIsLoading(true); // Keep loading if not mounted
      return;
    }

    setIsLoading(true); // Set loading true at the start of processing
    if (lesson && learningLanguage && allWords) {
      let relevantLessonWords: LessonWordDisplay[] = [];
      const categoryToFilter = lesson.category.toLowerCase();

      if (learningLanguage === 'English') {
        const meaningLanguage = (globalSourceLanguage !== 'English' ? globalSourceLanguage : SUPPORTED_LANGUAGES.find(l => l !== 'English')) || 'Tagalog' as Language;
        
        relevantLessonWords = allWords
          .filter(w =>
            w.language === 'English' &&
            w.targetLanguage === meaningLanguage &&
            w.category?.toLowerCase() === categoryToFilter
          )
          .map(w_entry => ({
            ...w_entry,
            word: w_entry.word,
            meaning: w_entry.meaning,
            language: 'English',
            targetLanguage: meaningLanguage,
            aiExamples: w_entry.aiSentences || [],
            isLoadingExamples: false,
          }));
      } else { 
        relevantLessonWords = allWords
          .filter(w =>
            w.language === 'English' &&
            w.targetLanguage === learningLanguage &&
            w.category?.toLowerCase() === categoryToFilter
          )
          .map(w_entry => ({
            ...w_entry,
            word: w_entry.meaning,
            meaning: w_entry.word,
            language: learningLanguage,
            targetLanguage: 'English',
            aiExamples: w_entry.aiSentences || [],
            isLoadingExamples: false,
          }));
      }
      setLessonWords(relevantLessonWords.slice(0, 30));
    } else {
      setLessonWords([]);
    }
    setIsLoading(false);
  }, [unitId, lessonSlug, learningLanguage, globalSourceLanguage, allWords, lesson, mounted]);

  const handleGetAIExamples = async (wordId: string) => {
    const wordIndex = lessonWords.findIndex(w => w.id === wordId);
    if (wordIndex === -1) return;

    const specificWord = lessonWords[wordIndex];
    
    setLessonWords(prev => prev.map((w, idx) => idx === wordIndex ? { ...w, isLoadingExamples: true } : w));

    try {
      const result = await generateExampleSentences({
        wordOrPhrase: specificWord.word,
        language: specificWord.language,
      });
      setLessonWords(prev => prev.map((w, idx) => idx === wordIndex ? { ...w, aiExamples: result.sentences, isLoadingExamples: false } : w));
      toast({ title: "AI Examples Generated", description: `Examples for "${specificWord.word}" loaded.` });
    } catch (error) {
      console.error("Error generating AI examples:", error);
      toast({ title: "Error", description: "Could not load AI examples.", variant: "destructive" });
      setLessonWords(prev => prev.map((w, idx) => idx === wordIndex ? { ...w, isLoadingExamples: false } : w));
    }
  };
  
  if (!unit || !lesson) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold">Lesson Not Found</CardTitle>
              <CardDescription className="text-lg">The lesson or unit you are looking for does not exist.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href={`/learn/path/unit/${unitId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Unit
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/learn/path">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  
  const LessonIcon = lesson.icon || BookOpenText;

  // Define text based on mounted state to prevent hydration mismatch
  const displayedLearningLanguage = mounted ? learningLanguage : "language";
  const displayedMeaningLanguage = mounted 
    ? (learningLanguage === 'English' 
        ? ((globalSourceLanguage !== 'English' ? globalSourceLanguage : SUPPORTED_LANGUAGES.find(l => l !== 'English')) || 'Tagalog') 
        : 'English') 
    : "meaning language";

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-grow">
            <div className="flex items-start sm:items-center gap-3 mb-2">
              <LessonIcon className="w-10 h-10 text-primary flex-shrink-0 mt-1 sm:mt-0" />
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold" aria-label={`Lesson: ${lesson.title}`}>
                {unit.title}: {lesson.title}
              </CardTitle>
            </div>
            <CardDescription className="text-base sm:text-lg">
              Learning {displayedLearningLanguage}. {lesson.description}
            </CardDescription>
          </div>
           <Button asChild variant="outline" className="self-start sm:self-center mt-4 sm:mt-0">
            <Link href={`/learn/path/unit/${unitId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Unit
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Vocabulary for this Lesson</CardTitle>
            <CardDescription>
              Words and phrases in {displayedLearningLanguage}. Meanings are shown in {displayedMeaningLanguage}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(!mounted || isLoading) ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading lesson content...</p>
              </div>
            ) : lessonWords.length === 0 ? (
               <div className="text-center py-6">
                <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No vocabulary found for {displayedLearningLanguage} in the category "{lesson.category}" for this lesson.
                  Consider adding relevant words to your Word List under this category.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessonWords.map((wordItem) => (
                  <Card key={wordItem.id} className="p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="text-xl font-semibold text-primary">{wordItem.word}</h4>
                        <p className="text-sm text-muted-foreground">({wordItem.meaning} - in {wordItem.targetLanguage})</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGetAIExamples(wordItem.id)}
                        disabled={wordItem.isLoadingExamples}
                        className="mt-2 sm:mt-0 w-full sm:w-auto"
                        aria-label={`Get AI example sentences for ${wordItem.word}`}
                      >
                        {wordItem.isLoadingExamples ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Get AI Examples
                      </Button>
                    </div>
                    {wordItem.aiExamples && wordItem.aiExamples.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed" aria-live="polite">
                        <h5 className="text-sm font-medium mb-1">Example Sentences (in {wordItem.language}):</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {wordItem.aiExamples.map((ex, i) => <li key={i}><em>{ex}</em></li>)}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
