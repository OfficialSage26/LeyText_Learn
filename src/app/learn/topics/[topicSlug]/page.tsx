
"use client";

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Loader2, Info, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { WordEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { deslugify } from '@/lib/utils'; // We'll create this utility

interface TopicWordDisplay extends WordEntry {
  aiExamples?: string[];
  isLoadingExamples?: boolean;
}

// Mapping topic slugs to categories or display names
const topicDetails: { [key: string]: { displayName: string; category: string } } = {
  'greetings': { displayName: "Greetings & Introductions", category: "Greetings" },
  'food': { displayName: "Food & Dining", category: "Food" },
  'travel': { displayName: "Travel & Directions", category: "Travel" },
  // Add more mappings as needed
};

export default function TopicPage({ params: paramsPromise }: { params: { topicSlug: string } }) {
  const params = use(paramsPromise as Promise<{ topicSlug: string }>);
  const { topicSlug } = params;

  const { 
    targetLanguage: learningLanguage, 
    sourceLanguage: meaningLanguage, 
    words: allWords 
  } = useGlobalAppContext();
  const { toast } = useToast();

  const [topicWords, setTopicWords] = useState<TopicWordDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentTopic = topicDetails[topicSlug] || { displayName: deslugify(topicSlug), category: deslugify(topicSlug) };

  useEffect(() => {
    setIsLoading(true);
    if (learningLanguage && currentTopic.category) {
      const categoryToFilter = currentTopic.category;
      
      // Words from the source language translated *to* the learning language
      const wordsInLearningLanguage = allWords
        .filter(w => 
            w.language === meaningLanguage && 
            w.targetLanguage === learningLanguage &&
            w.category?.toLowerCase() === categoryToFilter.toLowerCase()
        )
        .map(w_entry => ({
          ...w_entry,
          word: w_entry.meaning, // This is the word in the learning language
          meaning: w_entry.word, // This is the meaning in the source (e.g., English)
          language: learningLanguage, // Language of the word for AI examples
          targetLanguage: meaningLanguage, // Language of the meaning
          aiExamples: w_entry.aiSentences || [],
          isLoadingExamples: false,
        }));

      // Words originally in the learning language translated *from* it
      const wordsFromLearningLanguage = allWords
        .filter(w => 
            w.language === learningLanguage && 
            w.targetLanguage === meaningLanguage &&
            w.category?.toLowerCase() === categoryToFilter.toLowerCase()
        )
         .map(w_entry => ({
          ...w_entry,
          // word, meaning, language, targetLanguage are already correct
          aiExamples: w_entry.aiSentences || [],
          isLoadingExamples: false,
        }));
      
      // Combine and remove duplicates (e.g., if English->Tagalog and Tagalog->English for same concept exists)
      const combined = [...wordsInLearningLanguage, ...wordsFromLearningLanguage];
      const uniqueWords = Array.from(new Map(combined.map(item => [item.word.toLowerCase() + '-' + item.language, item])).values());

      setTopicWords(uniqueWords.slice(0, 10)); // Limit to 10 for display
    }
    setIsLoading(false);
  }, [learningLanguage, meaningLanguage, allWords, currentTopic.category]);

  const handleGetAIExamples = async (wordIndex: number) => {
    const specificWord = topicWords[wordIndex];
    if (!specificWord) return;

    setTopicWords(prev => prev.map((w, idx) => idx === wordIndex ? { ...w, isLoadingExamples: true } : g));

    try {
      const result = await generateExampleSentences({
        wordOrPhrase: specificWord.word,
        language: specificWord.language,
      });
      setTopicWords(prev => prev.map((w, idx) => idx === wordIndex ? { ...w, aiExamples: result.sentences, isLoadingExamples: false } : w));
      toast({ title: "AI Examples Generated", description: `Examples for "${specificWord.word}" loaded.` });
    } catch (error) {
      console.error("Error generating AI examples:", error);
      toast({ title: "Error", description: "Could not load AI examples.", variant: "destructive" });
      setTopicWords(prev => prev.map((w, idx) => idx === wordIndex ? { ...w, isLoadingExamples: false } : w));
    }
  };

  if (!topicDetails[topicSlug] && topicSlug !== 'greetings-introductions') { // Allow greetings-introductions as a fallback
     // A more robust check or data source for valid topics would be better
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h1 className="text-3xl font-bold mb-4">Topic Not Found</h1>
          <p className="text-muted-foreground mb-8">The topic "{deslugify(topicSlug)}" does not have specific content yet.</p>
          <Button asChild variant="outline">
            <Link href="/learn/topics">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }


  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-grow">
            <div className="flex items-start sm:items-center gap-3 mb-2">
              <BookOpen className="w-10 h-10 text-primary flex-shrink-0 mt-1 sm:mt-0" />
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Topic: {currentTopic.displayName}
              </CardTitle>
            </div>
            <CardDescription className="text-base sm:text-lg">
              Learn vocabulary related to {currentTopic.displayName.toLowerCase()} in {learningLanguage}.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-center mt-4 sm:mt-0">
            <Link href="/learn/topics">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Topics
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Vocabulary for {currentTopic.displayName}</CardTitle>
            <CardDescription>
              Words and phrases in {learningLanguage} related to this topic. Meanings are shown in {meaningLanguage}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading vocabulary...</p>
              </div>
            ) : topicWords.length === 0 ? (
              <div className="text-center py-10">
                <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No words found for this topic.</h3>
                <p className="text-muted-foreground">
                  Try adding words to your Word List under the category "{currentTopic.category}" 
                  with {learningLanguage} as the target language.
                </p>
              </div>
            ) : (
              topicWords.map((word, index) => (
                <Card key={word.id || index} className="p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="text-xl font-semibold text-primary">{word.word}</h3>
                      <p className="text-sm text-muted-foreground">({word.meaning} - in {word.targetLanguage})</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGetAIExamples(index)}
                      disabled={word.isLoadingExamples}
                      className="mt-2 sm:mt-0 w-full sm:w-auto"
                      aria-label={`Get AI example sentences for ${word.word}`}
                    >
                      {word.isLoadingExamples ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Get AI Examples
                    </Button>
                  </div>
                  {word.aiExamples && word.aiExamples.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed" aria-live="polite">
                      <h4 className="text-sm font-medium mb-1">Example Sentences (in {word.language}):</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {word.aiExamples.map((ex, i) => <li key={i}><em>{ex}</em></li>)}
                      </ul>
                    </div>
                  )}
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground mt-12">
          More content and interactive exercises for this topic are coming soon!
        </p>
      </div>
    </AppLayout>
  );
}
