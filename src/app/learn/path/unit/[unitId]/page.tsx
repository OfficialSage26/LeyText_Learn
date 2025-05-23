
"use client";

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronRight, BookOpen, Info, Palette, Hash, CalendarDays, MessageSquare, Users2, Brain, Utensils, MapPin, Building2, ShoppingCart, PaletteIcon, Loader2 } from 'lucide-react'; 
import Link from 'next/link';
import { getUnitById, learningPathConfig, type LessonConfig } from '@/config/learningPath';
import { useMounted } from '@/hooks/useMounted';
import type { Language } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';

// Minimal types to avoid full import of SUPPORTED_LANGUAGES if not needed elsewhere for the const
// const SUPPORTED_LANGUAGES_CONST = ["English", "Tagalog", "Bisaya", "Waray-Waray"] as const;
// type LanguageConst = (typeof SUPPORTED_LANGUAGES_CONST)[number];


export default function UnitPage({ params: paramsPromise }: { params: { unitId: string } }) {
  const params = use(paramsPromise as Promise<{ unitId: string }>);
  const { unitId } = params;
  const { targetLanguage: globalTargetLanguage, words: allWords } = useGlobalAppContext();
  const mounted = useMounted();

  const [displayLearningLanguage, setDisplayLearningLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  const unit = getUnitById(unitId);

  // Determine if this unit page should display combined vocabulary (like old Unit 1)
  // or a list of lessons. For now, we are moving towards list of lessons for all.
  const isMultiCategoryUnit = false; 

  const [lessonWords, setLessonWords] = React.useState<any[]>([]); 
  const [isLoadingWords, setIsLoadingWords] = React.useState(false);

  useEffect(() => {
    if (mounted) {
      setDisplayLearningLanguage(globalTargetLanguage);
    }
  }, [mounted, globalTargetLanguage]);

  React.useEffect(() => {
    if (mounted && isMultiCategoryUnit && unitId === "unit1" && globalTargetLanguage && allWords) {
      setIsLoadingWords(true);
      const unitConfig = learningPathConfig.find(u => u.id === "unit1");
      const categoriesToLoad = unitConfig?.lessons.map(l => l.category.toLowerCase()) || [];
      
      let relevantWords: any[] = [];
      if (globalTargetLanguage === 'English') {
        const meaningLanguage = SUPPORTED_LANGUAGES.find(l => l !== 'English') || 'Tagalog';
        relevantWords = allWords
          .filter(w =>
            w.language === 'English' &&
            w.targetLanguage === meaningLanguage &&
            w.category && categoriesToLoad.includes(w.category.toLowerCase())
          )
          .map(w_entry => ({
            ...w_entry,
            displayWord: w_entry.word,
            displayMeaning: w_entry.meaning,
            displayLanguage: 'English',
            meaningLanguage: meaningLanguage,
          }));
      } else {
        relevantWords = allWords
          .filter(w =>
            w.language === 'English' &&
            w.targetLanguage === globalTargetLanguage &&
            w.category && categoriesToLoad.includes(w.category.toLowerCase())
          )
          .map(w_entry => ({
            ...w_entry,
            displayWord: w_entry.meaning,
            displayMeaning: w_entry.word,
            displayLanguage: globalTargetLanguage,
            meaningLanguage: 'English',
          }));
      }
      
      // Group by category for display
      const groupedWords: {[key: string]: any[]} = {};
      relevantWords.forEach(word => {
        const category = word.category || "Uncategorized";
        if (!groupedWords[category]) {
          groupedWords[category] = [];
        }
        groupedWords[category].push(word);
      });
      setLessonWords(Object.entries(groupedWords).map(([category, words]) => ({ category, words: words.slice(0,10) }))); // Slice per category
      setIsLoadingWords(false);
    }
  }, [isMultiCategoryUnit, unitId, globalTargetLanguage, allWords, mounted]);


  // Icons for categories - can be moved to a shared utility
  const categoryIcons: { [key: string]: React.ElementType } = {
    "Greetings": MessageSquare,
    "Common Phrases": MessageSquare,
    "Numbers": Hash,
    "Colors": Palette,
    "Days": CalendarDays,
    "Family": Users2,
    "Adjectives": PaletteIcon,
    "Verbs": Brain,
    "Food": Utensils,
    "Travel": MapPin,
    // ... add more as needed
  };

  if (!unit) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <Card className="max-w-lg mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold">Unit Not Found</CardTitle>
              <CardDescription className="text-lg">The unit ID "{unitId}" does not correspond to any known unit.</CardDescription>
            </CardHeader>
            <CardContent>
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
  const UnitIcon = unit.icon || BookOpen;

  if (!mounted) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
              <UnitIcon className="w-10 h-10 text-primary flex-shrink-0 mt-1 sm:mt-0" />
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">{unit.title} - Learning {displayLearningLanguage}</CardTitle>
            </div>
            <CardDescription className="text-base sm:text-lg">{unit.description}</CardDescription>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-center mt-4 sm:mt-0">
            <Link href="/learn/path">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Lessons in this Unit</CardTitle>
            <CardDescription>Select a lesson to start learning specific vocabulary and concepts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unit.lessons && unit.lessons.length > 0 ? (
              unit.lessons.map((lesson) => {
                const LessonIcon = lesson.icon || BookOpen; 
                return (
                  <Card 
                    key={lesson.slug} 
                    className="hover:shadow-md transition-shadow duration-200"
                    aria-labelledby={`lesson-title-${lesson.slug}`}
                    aria-describedby={`lesson-desc-${lesson.slug}`}
                  >
                    <Link href={`/learn/path/unit/${unitId}/lesson/${lesson.slug}`} className="block p-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <LessonIcon className="w-7 h-7 text-primary flex-shrink-0" />
                          <div>
                             <h3 id={`lesson-title-${lesson.slug}`} className="text-lg font-semibold group-hover:text-primary">{lesson.title}</h3>
                             <p id={`lesson-desc-${lesson.slug}`} className="text-sm text-muted-foreground">{lesson.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="mx-auto h-10 w-10 mb-3" />
                Lessons for this unit are coming soon!
              </div>
            )}
          </CardContent>
        </Card>

        
        {isMultiCategoryUnit && unitId === "unit1" && (
           <Card>
           <CardHeader>
             <CardTitle className="text-xl sm:text-2xl">Unit 1: Foundational Vocabulary</CardTitle>
             <CardDescription>
               Learn essential words across different categories for {displayLearningLanguage}. Meanings in {displayLearningLanguage === 'English' ? (SUPPORTED_LANGUAGES.find(l=> l !== 'English') || 'Tagalog') : 'English'}.
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             {isLoadingWords ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading words...</p>
                </div>
             ) : lessonWords.length === 0 ? (
               <div className="text-center py-6">
                 <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                 <p className="text-muted-foreground">No foundational vocabulary found for {displayLearningLanguage}.</p>
               </div>
             ) : (
               lessonWords.map((group, index) => {
                 const CategoryIcon = categoryIcons[group.category] || Info;
                 return (
                   <div key={index} className="space-y-3">
                     <div className="flex items-center gap-2 border-b pb-2">
                       <CategoryIcon className="w-5 h-5 text-primary" />
                       <h4 className="text-lg font-semibold">{group.category}</h4>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                       {group.words.map((item: any) => (
                         <Card key={item.id} className="p-3 text-sm shadow-sm">
                           <p className="font-medium text-primary">{item.displayWord}</p>
                           <p className="text-xs text-muted-foreground">({item.displayMeaning} - {item.meaningLanguage})</p>
                         </Card>
                       ))}
                     </div>
                   </div>
                 );
                })
             )}
           </CardContent>
         </Card>
        )}
      </div>
    </AppLayout>
  );
}
