"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { WordEntry } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Shuffle, RotateCcw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashcardDisplayProps {
  words: WordEntry[];
}

export default function FlashcardDisplay({ words }: FlashcardDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<WordEntry[]>([]);
  const [showPronunciation, setShowPronunciation] = useState(false);

  useEffect(() => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = useMemo(() => {
    if (shuffledWords.length === 0) return null;
    return shuffledWords[currentIndex % shuffledWords.length];
  }, [shuffledWords, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsFlipped(false);
    setShowPronunciation(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length);
    setIsFlipped(false);
    setShowPronunciation(false);
  };

  const handleShuffle = () => {
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowPronunciation(false);
  };

  if (shuffledWords.length === 0) {
    return (
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardContent className="p-8">
          <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No words available for flashcards.</h3>
          <p className="text-muted-foreground">Add some words to your word list first, ensuring they match your selected source and target languages.</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentWord) return null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-6">
      <div 
        className={cn(
          "relative w-full h-80 perspective cursor-pointer rounded-xl shadow-xl",
          "transition-transform duration-700 transform-style-preserve-3d",
          isFlipped ? "rotate-y-180" : ""
        )}
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard for ${currentWord.word}. Click to flip.`}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped(!isFlipped)}
      >
        {/* Front of the card */}
        <Card className="absolute w-full h-full backface-hidden bg-card flex flex-col items-center justify-center p-6 text-center">
          <CardContent className="flex flex-col items-center justify-center w-full">
            <p className="text-xs text-muted-foreground mb-2">{currentWord.language}</p>
            <h2 className="text-4xl font-bold mb-4">{currentWord.word}</h2>
            {currentWord.pronunciation && (
              <p 
                className={cn(
                  "text-muted-foreground text-sm transition-opacity duration-300",
                  showPronunciation ? "opacity-100" : "opacity-0"
                )}
              >
                {currentWord.pronunciation}
              </p>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 text-xs"
              onClick={(e) => { e.stopPropagation(); setShowPronunciation(!showPronunciation); }}
              aria-pressed={showPronunciation}
            >
              {showPronunciation ? "Hide" : "Show"} Pronunciation
            </Button>
          </CardContent>
        </Card>

        {/* Back of the card */}
        <Card className="absolute w-full h-full backface-hidden rotate-y-180 bg-accent text-accent-foreground flex flex-col items-center justify-center p-6 text-center">
          <CardContent className="flex flex-col items-center justify-center w-full">
            <p className="text-xs text-accent-foreground/80 mb-2">{currentWord.targetLanguage}</p>
            <h3 className="text-3xl font-semibold mb-3">{currentWord.meaning}</h3>
            {currentWord.userSentence && <p className="text-sm italic mb-2">"{currentWord.userSentence}"</p>}
            {currentWord.aiSentences && currentWord.aiSentences.length > 0 && (
              <div className="text-xs mt-2 text-accent-foreground/80">
                <p className="font-medium mb-1">AI Examples:</p>
                <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                  {currentWord.aiSentences.map((s, i) => <li key={i}><em>{s}</em></li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <style jsx>{`
        .perspective { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      <div className="flex items-center justify-between w-full max-w-md">
        <Button variant="outline" onClick={handlePrev} aria-label="Previous card">
          <ArrowLeft className="mr-2 h-4 w-4" /> Prev
        </Button>
        <p className="text-sm text-muted-foreground">
          {currentIndex % shuffledWords.length + 1} / {shuffledWords.length}
        </p>
        <Button variant="outline" onClick={handleNext} aria-label="Next card">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <Button variant="secondary" onClick={handleShuffle} aria-label="Shuffle cards">
        <Shuffle className="mr-2 h-4 w-4" /> Shuffle
      </Button>
      <div className="text-center text-muted-foreground text-sm mt-4">
        <RotateCcw className="inline-block mr-1 h-4 w-4 align-text-bottom" />
        Tap card to flip
      </div>
    </div>
  );
}
