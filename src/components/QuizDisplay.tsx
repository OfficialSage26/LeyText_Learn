"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { WordEntry, Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Info, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext'; // Assuming you'll add addQuizScore here


interface QuizQuestion {
  wordEntry: WordEntry;
  questionText: string;
  options: string[];
  correctAnswer: string;
  questionType: 'wordToMeaning' | 'meaningToWord';
}

interface QuizDisplayProps {
  words: WordEntry[];
  category?: string;
  language: Language; // This is the primary language of the words in the quiz (source language)
  targetLanguage: Language; // This is the target language for translation
  onQuizComplete: (score: number, totalQuestions: number) => void;
}

const NUM_OPTIONS = 4;
const QUIZ_LENGTH = 10; // Max number of questions per quiz

export default function QuizDisplay({ words, category, language, targetLanguage, onQuizComplete }: QuizDisplayProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const generateQuestions = useMemo(() => {
    if (words.length < NUM_OPTIONS) return []; // Not enough words to form options

    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    const quizWords = shuffledWords.slice(0, QUIZ_LENGTH);

    return quizWords.map(wordEntry => {
      // Decide question type: 50% chance for wordToMeaning, 50% for meaningToWord
      const questionType = Math.random() < 0.5 ? 'wordToMeaning' : 'meaningToWord';
      
      let questionText: string;
      let correctAnswer: string;
      let incorrectOptionsPool: string[];

      if (questionType === 'wordToMeaning') {
        questionText = `What is the meaning of "${wordEntry.word}" (in ${targetLanguage})?`;
        correctAnswer = wordEntry.meaning;
        incorrectOptionsPool = words
          .filter(w => w.id !== wordEntry.id && w.targetLanguage === targetLanguage)
          .map(w => w.meaning);
      } else { // meaningToWord
        questionText = `Which word means "${wordEntry.meaning}" (in ${language})?`;
        correctAnswer = wordEntry.word;
        incorrectOptionsPool = words
          .filter(w => w.id !== wordEntry.id && w.language === language)
          .map(w => w.word);
      }

      // Ensure enough unique incorrect options
      const uniqueIncorrectOptions = Array.from(new Set(incorrectOptionsPool));
      const finalIncorrectOptions = uniqueIncorrectOptions
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, NUM_OPTIONS - 1);

      // If not enough incorrect options, fill with placeholders (less ideal but handles edge cases)
      while (finalIncorrectOptions.length < NUM_OPTIONS - 1) {
        finalIncorrectOptions.push(`Placeholder Option ${finalIncorrectOptions.length + 1}`);
      }
      
      const options = [...finalIncorrectOptions, correctAnswer].sort(() => 0.5 - Math.random());

      return { wordEntry, questionText, options, correctAnswer, questionType };
    });
  }, [words, language, targetLanguage]);


  useEffect(() => {
    setQuestions(generateQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizEnded(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [generateQuestions]);
  
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (showFeedback) return; // Prevent answering again if feedback is shown

    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizEnded(true);
      onQuizComplete(score, questions.length);
    }
  };

  const restartQuiz = () => {
    setQuestions(generateQuestions); // Re-generate/shuffle
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizEnded(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  if (words.length < NUM_OPTIONS) {
     return (
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardContent className="p-8">
          <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Not enough words for a quiz.</h3>
          <p className="text-muted-foreground">
            You need at least {NUM_OPTIONS} words in the selected language ({language} &rarr; {targetLanguage})
            {category ? ` and category "${category}"` : ''} to start a quiz.
            Currently, you have {words.length}.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (questions.length === 0) {
     return (
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardContent className="p-8">
          <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Quiz Loading...</h3>
          <p className="text-muted-foreground">Preparing your questions.</p>
        </CardContent>
      </Card>
    );
  }


  if (quizEnded) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
          <CardDescription>You scored {score} out of {questions.length}.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold text-primary">{percentage}%</div>
          <Progress value={percentage} className="w-full h-4" />
          <p>{percentage >= 80 ? "Excellent work! 🎉" : percentage >= 50 ? "Good effort! 👍" : "Keep practicing! 💪"}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={restartQuiz} className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" /> Play Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full mt-2 h-2" />
        <p className="text-lg font-semibold mt-4 pt-4 border-t">{currentQuestion.questionText}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentQuestion.options.map(option => {
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = option === selectedAnswer;
          
          let variant: "outline" | "default" | "secondary" | "destructive" = "outline";
          if (showFeedback) {
            if (isCorrect) variant = "default"; // Correct answer shown in primary/default color
            else if (isSelected) variant = "destructive"; // Incorrectly selected answer
          } else if (isSelected) {
            variant = "secondary"; // Tentatively selected
          }

          return (
            <Button
              key={option}
              variant={variant}
              className={cn("w-full justify-start text-left h-auto py-3", {
                "border-green-500 ring-2 ring-green-500": showFeedback && isCorrect,
                "border-red-500 ring-2 ring-red-500": showFeedback && isSelected && !isCorrect,
              })}
              onClick={() => handleAnswer(option)}
              disabled={showFeedback}
            >
              {option}
              {showFeedback && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
              {showFeedback && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-red-500" />}
            </Button>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        {showFeedback && (
          <div className="text-center mb-4 p-3 rounded-md bg-muted">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <p className="text-green-600 font-semibold">Correct!</p>
            ) : (
              <p className="text-red-600 font-semibold">Incorrect. The correct answer is: {currentQuestion.correctAnswer}</p>
            )}
          </div>
        )}
        <Button 
          onClick={handleNextQuestion} 
          disabled={!selectedAnswer && !showFeedback}
          className="w-full"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );
}
