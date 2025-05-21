
"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import QuizDisplay from '@/components/QuizDisplay';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from '@/components/LanguageSelector'; // Re-use for consistency

const ALL_CATEGORIES_OPTION_VALUE = "__ALL_CATEGORIES__";

export default function QuizzesPage() {
  const { words, categories, sourceLanguage, targetLanguage, addQuizScore } = useGlobalAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Empty string means all categories
  const [quizInProgress, setQuizInProgress] = useState(false);
  const { toast } = useToast();

  const wordsForQuiz = useMemo(() => {
    // Quiz words should be based on the selected source language, for translation to target language
    return words.filter(word => 
      word.language === sourceLanguage && 
      word.targetLanguage === targetLanguage &&
      (selectedCategory ? word.category === selectedCategory : true)
    );
  }, [words, sourceLanguage, targetLanguage, selectedCategory]);

  const handleStartQuiz = () => {
    if (wordsForQuiz.length < 4) { // Minimum options for a question
      toast({
        title: "Not Enough Words",
        description: `You need at least 4 words in ${sourceLanguage} (for category: ${selectedCategory || 'All'}) to start a quiz.`,
        variant: "destructive",
      });
      return;
    }
    setQuizInProgress(true);
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    addQuizScore({
      language: sourceLanguage, // Quiz was based on source language words
      category: selectedCategory || undefined,
      score,
      totalQuestions,
    });
    toast({
      title: "Quiz Finished!",
      description: `You scored ${score}/${totalQuestions}. Your result has been saved.`,
    });
    setQuizInProgress(false);
  };

  if (quizInProgress) {
    return (
      <AppLayout>
        <QuizDisplay
          words={wordsForQuiz}
          category={selectedCategory}
          language={sourceLanguage}
          targetLanguage={targetLanguage}
          onQuizComplete={handleQuizComplete}
        />
         <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => setQuizInProgress(false)}>
              Back to Quiz Setup
            </Button>
          </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Language Quizzes</CardTitle>
            <CardDescription>
              Test your knowledge. Select languages and an optional category to begin.
              Quizzes will test your vocabulary from '{sourceLanguage}' to '{targetLanguage}'.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LanguageSelector />
            
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium mb-1">
                Category (Optional)
              </label>
              <Select
                value={selectedCategory === '' ? ALL_CATEGORIES_OPTION_VALUE : selectedCategory}
                onValueChange={(value) => {
                  if (value === ALL_CATEGORIES_OPTION_VALUE) {
                    setSelectedCategory('');
                  } else {
                    setSelectedCategory(value);
                  }
                }}
              >
                <SelectTrigger id="category-select" className="w-full sm:w-[300px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES_OPTION_VALUE}>All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleStartQuiz} size="lg" className="w-full sm:w-auto" disabled={wordsForQuiz.length < 4}>
              Start Quiz
            </Button>
             {wordsForQuiz.length < 4 && (
                <p className="text-sm text-destructive mt-2">
                  You need at least 4 words for the selected criteria to start a quiz.
                </p>
              )}
          </CardContent>
        </Card>

        {/* Optionally, display past quiz scores or stats here */}
      </div>
    </AppLayout>
  );
}
