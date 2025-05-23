
"use client";

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2, ChevronRight, BookOpenText, Info, Briefcase } from 'lucide-react';
import Link from 'next/link';
import type { WordEntry, Language } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { SUPPORTED_LANGUAGES } from '@/types';

// Overall unit information (could be expanded or moved to a central place)
const unitsData: { [key: string]: { title: string; description: string; icon: React.ElementType } } = {
  unit1: { title: "Unit 1: Foundations", description: "Learning basic greetings and phrases.", icon: BookOpenText },
  unit2: { title: "Unit 2: Everyday Greetings & Introductions", description: "Master common greetings, introductions, and essential polite phrases.", icon: BookOpenText },
  unit3: { title: "Unit 3: People & Family", description: "Talk about yourself, family members, and describe people.", icon: BookOpenText },
  unit4: { title: "Unit 4: Basic Verbs & Actions", description: "Learn essential verbs and how to form simple sentences about actions.", icon: Briefcase },
};

interface UnitLessonConfig {
  lessonTitle: string;
  categories: string[]; // Now an array of categories
  lessonDescription: string;
}

// Specific lesson content configuration for each unit
const unitLessonData: { [key: string]: UnitLessonConfig } = {
  unit1: { 
    lessonTitle: "Lesson 1: Basic Greetings", 
    categories: ["Greetings"],
    lessonDescription: "Learn some common greetings in {LANGUAGE}. Click the button to see AI-generated example sentences."
  },
  unit2: { 
    lessonTitle: "Lesson 1: Common Phrases", 
    categories: ["Common Phrases"],
    lessonDescription: "Practice everyday phrases in {LANGUAGE}. See how they are used in context."
  },
  unit3: { 
    lessonTitle: "Lesson 1: Family Members", 
    categories: ["Family"],
    lessonDescription: "Learn vocabulary related to family members in {LANGUAGE}."
  },
  unit4: {
    lessonTitle: "Lesson 1: Basic Verbs",
    categories: ["Verbs"],
    lessonDescription: "Learn essential verbs in {LANGUAGE} and see how they are used."
  }
};

interface LessonWordDisplay extends WordEntry {
  aiExamples?: string[];
  isLoadingExamples?: boolean;
}

export default function UnitPage({ params: paramsPromise }: { params: { unitId: string } }) {
  const params = use(paramsPromise as Promise<{ unitId: string }>);
  const { unitId } = params;

  const { targetLanguage: learningLanguage, sourceLanguage: globalSourceLanguage, words: allWords } = useGlobalAppContext();
  const { toast } = useToast();

  const [lessonWords, setLessonWords] = useState<LessonWordDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const unitInfo = unitsData[unitId] || { title: `Unit ${unitId.replace('unit','')}`, description: "Content for this unit is under development.", icon: BookOpenText };
  const currentLessonConfig = unitLessonData[unitId];

  useEffect(() => {
    setIsLoading(true);
    if (currentLessonConfig && learningLanguage && allWords) {
      let relevantLessonWords: LessonWordDisplay[] = [];
      const categoriesToFilter = currentLessonConfig.categories.map(c => c.toLowerCase());

      if (learningLanguage === 'English') {
        // Determine a non-English language to show as the 'meaning'
        const meaningLanguage = (globalSourceLanguage !== 'English' ? globalSourceLanguage : SUPPORTED_LANGUAGES.find(l => l !== 'English')) || 'Tagalog' as Language;
        
        relevantLessonWords = allWords
          .filter(w =>
            w.language === 'English' && 
            w.targetLanguage === meaningLanguage && 
            w.category && categoriesToFilter.includes(w.category.toLowerCase())
          )
          .map(w_entry => ({
            ...w_entry, 
            word: w_entry.word, // English word
            meaning: w_entry.meaning, // Meaning in meaningLanguage
            language: 'English', // Word is in English
            targetLanguage: meaningLanguage, // Meaning is in meaningLanguage
            aiExamples: w_entry.aiSentences || [],
            isLoadingExamples: false,
          }));
      } else { // Learning a non-English language
        relevantLessonWords = allWords
          .filter(w =>
            w.language === 'English' && // Assuming English is the base for initialWords meanings
            w.targetLanguage === learningLanguage && 
            w.category && categoriesToFilter.includes(w.category.toLowerCase())
          )
          .map(w_entry => ({
            ...w_entry, 
            word: w_entry.meaning, // Word in the learning language
            meaning: w_entry.word, // Meaning in English
            language: learningLanguage, // Word is in learningLanguage
            targetLanguage: 'English', // Meaning is in English
            aiExamples: w_entry.aiSentences || [],
            isLoadingExamples: false,
          }));
      }
      setLessonWords(relevantLessonWords.slice(0, 10)); // Show up to 10 words per lesson
    } else {
      setLessonWords([]);
    }
    setIsLoading(false);
  }, [unitId, learningLanguage, globalSourceLanguage, allWords, currentLessonConfig]);

  const handleGetAIExamples = async (wordIndex: number) => {
    const specificWord = lessonWords[wordIndex];
    if (!specificWord) return;

    setLessonWords(prev => prev.map((g, idx) => idx === wordIndex ? { ...g, isLoadingExamples: true } : g));

    try {
      const result = await generateExampleSentences({
        wordOrPhrase: specificWord.word, 
        language: specificWord.language, 
      });
      setLessonWords(prev => prev.map((g, idx) => idx === wordIndex ? { ...g, aiExamples: result.sentences, isLoadingExamples: false } : g));
      toast({ title: "AI Examples Generated", description: `Examples for "${specificWord.word}" loaded.` });
    } catch (error) {
      console.error("Error generating AI examples:", error);
      toast({ title: "Error", description: "Could not load AI examples.", variant: "destructive" });
      setLessonWords(prev => prev.map((g, idx) => idx === wordIndex ? { ...g, isLoadingExamples: false } : g));
    }
  };
  
  if (!currentLessonConfig) {
    return (
      <AppLayout>
        <div className="text-center py-10">
           <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 mb-2">
                <unitInfo.icon className="w-12 h-12 text-primary" />
                <CardTitle className="text-2xl sm:text-3xl font-bold">{unitInfo.title}</CardTitle>
              </div>
              <CardDescription className="text-lg">Learning {learningLanguage}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-8">
                Detailed lessons and activities for this unit are currently under development or this unit ID is not configured. Please check back soon!
              </p>
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

  const lessonDescription = currentLessonConfig.lessonDescription.replace('{LANGUAGE}', learningLanguage);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-grow">
            <div className="flex items-start sm:items-center gap-3 mb-2">
              <unitInfo.icon className="w-10 h-10 text-primary flex-shrink-0 mt-1 sm:mt-0" />
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">{unitInfo.title} - Learning {learningLanguage}</CardTitle>
            </div>
            <CardDescription className="text-base sm:text-lg">{unitInfo.description}</CardDescription>
          </div>
           <Button asChild variant="outline" className="self-start sm:self-center mt-4 sm:mt-0">
            <Link href="/learn/path">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{currentLessonConfig.lessonTitle}</CardTitle>
            <CardDescription>{lessonDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading lesson content...</p>
              </div>
            ) : lessonWords.length === 0 ? (
              <p className="text-muted-foreground">
                No vocabulary found for {learningLanguage} in the category "{currentLessonConfig.categories.join(', ')}" for this lesson. 
                Consider adding relevant words to your Word List.
              </p>
            ) : (
              lessonWords.map((wordItem, index) => (
                <Card key={wordItem.id} className="p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">{wordItem.word}</h3>
                      <p className="text-sm text-muted-foreground">({wordItem.meaning} - in {wordItem.targetLanguage})</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleGetAIExamples(index)}
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
                      <h4 className="text-sm font-medium mb-1">Example Sentences (in {wordItem.language}):</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {wordItem.aiExamples.map((ex, i) => <li key={i}><em>{ex}</em></li>)}
                      </ul>
                    </div>
                  )}
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <Button variant="outline" disabled className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Lesson (Soon)
          </Button>
          <Button disabled className="w-full sm:w-auto">
            Next Lesson (Soon) <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

    
