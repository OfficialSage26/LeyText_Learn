
"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import QuizDisplay from '@/components/QuizDisplay';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { type Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from '@/components/LanguageSelector'; 
import { BarChart, Info, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from '@/components/ui/scroll-area';

const ALL_CATEGORIES_OPTION_VALUE = "__ALL_CATEGORIES__";

export default function QuizzesPage() {
  const { words, categories, sourceLanguage, targetLanguage, addQuizScore, quizScores, clearQuizScores } = useGlobalAppContext();
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  const [quizInProgress, setQuizInProgress] = useState(false);
  const { toast } = useToast();

  const wordsForQuiz = useMemo(() => {
    return words.filter(word => 
      word.language === sourceLanguage && 
      word.targetLanguage === targetLanguage &&
      (selectedCategory ? word.category === selectedCategory : true)
    );
  }, [words, sourceLanguage, targetLanguage, selectedCategory]);

  const handleStartQuiz = () => {
    if (wordsForQuiz.length < 4) { 
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
      language: sourceLanguage, 
      category: selectedCategory || undefined, // Store empty string as undefined for 'All Categories'
      score,
      totalQuestions,
    });
    toast({
      title: "Quiz Finished!",
      description: `You scored ${score}/${totalQuestions}. Your result has been saved.`,
    });
    setQuizInProgress(false);
  };

  const handleClearScores = () => {
    clearQuizScores();
    toast({
      title: "Quiz Scores Cleared",
      description: "All your past quiz scores have been removed.",
    });
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

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center">
                <BarChart className="mr-3 h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-semibold">Quiz Statistics</CardTitle>
              </div>
              {quizScores.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All Scores
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your quiz scores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearScores} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Yes, delete all
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <CardDescription>
              Review your past performance and track your progress.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizScores.length === 0 ? (
              <div className="text-center py-8">
                <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No quiz scores recorded yet. Take a quiz to see your progress!
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                  {quizScores.sort((a, b) => b.date - a.date).map((score, index) => (
                    <div key={index} className="p-3 rounded-md bg-muted/50 space-y-1">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span>{score.language} - {score.category || "All Categories"}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(score.date), "MMM d, yyyy, h:mm a")}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-semibold text-primary">
                          {score.score}/{score.totalQuestions}
                        </span>
                        <span className="text-xl font-bold">
                          {score.totalQuestions > 0 ? Math.round((score.score / score.totalQuestions) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

    