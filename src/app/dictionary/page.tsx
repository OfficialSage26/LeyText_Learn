
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import type { WordEntry, Language } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import LanguageSelector from '@/components/LanguageSelector';
import { BookMarked, Search, MessageSquare, Sparkles, Loader2, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { fetchTatoebaSentences, type FetchTatoebaSentencesOutput } from '@/ai/flows/fetch-tatoeba-sentences-flow';
import { useMounted } from '@/hooks/useMounted';

const ALL_CATEGORIES_OPTION_VALUE = "__ALL_CATEGORIES__";

interface TatoebaSentenceState {
  isLoading: boolean;
  sentences: FetchTatoebaSentencesOutput['sentences'] | null;
  error: string | null;
}

export default function DictionaryPage() {
  const { words, categories, sourceLanguage, targetLanguage } = useGlobalAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();
  const [tatoebaExamples, setTatoebaExamples] = useState<Record<string, TatoebaSentenceState>>({});
  const mounted = useMounted();

  useEffect(() => {
    if (mounted) {
      // Ensure filters are reset on client mount if needed, or if you want to persist them,
      // this step might not be necessary if their initial `useState('')` is sufficient.
      // For consistency with WordListsPage and to avoid potential edge cases:
      setSearchTerm('');
      setSelectedCategory('');
    }
  }, [mounted]);

  const filteredWords = useMemo(() => {
    if (!mounted) return []; // Don't compute until client-side and words from context are stable

    return words
      .filter(word => {
        // Ensure word.language and word.targetLanguage are defined before filtering
        return word.language && word.targetLanguage &&
               word.language === sourceLanguage && 
               word.targetLanguage === targetLanguage;
      })
      .filter(word => {
        const searchLower = searchTerm.toLowerCase();
        const categoryMatch = selectedCategory ? word.category?.toLowerCase() === selectedCategory.toLowerCase() : true;
        const termMatch = searchLower === '' ||
          word.word.toLowerCase().includes(searchLower) ||
          word.meaning.toLowerCase().includes(searchLower) ||
          word.category?.toLowerCase().includes(searchLower) ||
          word.pronunciation?.toLowerCase().includes(searchLower);
        return categoryMatch && termMatch;
      })
      .sort((a, b) => a.word.localeCompare(b.word));
  }, [words, searchTerm, selectedCategory, sourceLanguage, targetLanguage, mounted]);

  const handleFetchTatoebaExamples = async (wordEntry: WordEntry) => {
    const currentWordState = tatoebaExamples[wordEntry.id];

    // If sentences are already loaded and not currently loading, toggle visibility (conceptual)
    // For now, we just re-fetch or show if already there.
    // A more sophisticated toggle would involve another state like `isVisible`.
    if (currentWordState?.sentences && !currentWordState.isLoading) {
        // Simple approach: if you click again and it has sentences, just re-evaluate (currently re-fetches)
        // To implement toggle: add a visibility flag to TatoebaSentenceState and toggle here.
        // For this fix, let's keep it simple and allow re-fetch.
    }

    setTatoebaExamples(prev => ({
      ...prev,
      [wordEntry.id]: { isLoading: true, sentences: prev[wordEntry.id]?.sentences || null, error: null }
    }));

    try {
      const result = await fetchTatoebaSentences({
        word: wordEntry.word,
        sourceLanguage: wordEntry.language,
        targetLanguage: wordEntry.targetLanguage,
      });
      
      if (result.sentences && result.sentences.length > 0) {
        setTatoebaExamples(prev => ({
          ...prev,
          [wordEntry.id]: { isLoading: false, sentences: result.sentences, error: null }
        }));
      } else {
        setTatoebaExamples(prev => ({
          ...prev,
          [wordEntry.id]: { isLoading: false, sentences: [], error: "No example sentences found on Tatoeba." }
        }));
        toast({
          title: "Tatoeba Examples",
          description: `No example sentences found for "${wordEntry.word}".`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching Tatoeba examples:", error);
      setTatoebaExamples(prev => ({
        ...prev,
        [wordEntry.id]: { isLoading: false, sentences: null, error: "Could not load Tatoeba examples." }
      }));
      toast({
        title: "Error",
        description: "Could not load Tatoeba examples.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookMarked className="w-10 h-10 text-primary" />
              <CardTitle className="text-3xl font-bold">Dialect Dictionary (Bilingual)</CardTitle>
            </div>
            <CardDescription>
              Browse words and translations. Use the selectors below to choose languages and filters.
              {mounted && ` Displaying words in '${sourceLanguage}' with translations in '${targetLanguage}'.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LanguageSelector />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={mounted ? `Search in ${sourceLanguage} words, meanings...` : "Search..."}
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search dictionary"
                  disabled={!mounted}
                />
              </div>
              <div>
                <label htmlFor="dict-category-select" className="block text-sm font-medium mb-1">
                  Filter by Category
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
                  disabled={!mounted}
                >
                  <SelectTrigger id="dict-category-select" className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORIES_OPTION_VALUE}>All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={`dict-cat-${cat}`} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!mounted ? (
          <Card className="text-center py-12">
            <CardContent className="flex items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Loading dictionary...</p>
            </CardContent>
          </Card>
        ) : filteredWords.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Words Found</h3>
              <p className="text-muted-foreground">
                No words match your current filters for {sourceLanguage} translated to {targetLanguage}. <br />
                Try adjusting your search, category, or language selection, or add more words via the "Word Lists" page.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Found {filteredWords.length} word(s)</CardTitle>
              <CardDescription>Displaying words in {sourceLanguage} with their {targetLanguage} meanings.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-550px)] sm:h-[calc(100vh-500px)] pr-3">
                <div className="space-y-4">
                  {filteredWords.map(word => (
                    <Card key={word.id} className="p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-semibold text-primary">{word.word}</h4>
                          <p className="text-sm text-muted-foreground">({word.language})</p>
                        </div>
                        {word.category && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full whitespace-nowrap">{word.category}</span>}
                      </div>
                      <div className="mt-2 space-y-1">
                        <p><strong className="font-medium">Meaning ({word.targetLanguage}):</strong> {word.meaning}</p>
                        {word.pronunciation && <p className="text-sm"><strong className="font-medium">Pronunciation:</strong> {word.pronunciation}</p>}
                        {word.userSentence && <p className="text-sm italic"><strong className="font-medium">Example:</strong> "{word.userSentence}"</p>}
                         {word.aiSentences && word.aiSentences.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-dashed">
                            <p className="font-medium text-xs mb-1 flex items-center gap-1"><Sparkles size={14} className="text-primary"/>AI Examples ({word.language}):</p>
                            <ul className="list-disc list-inside text-xs space-y-0.5 text-muted-foreground">
                              {word.aiSentences.map((s, i) => <li key={`ai-ex-${i}`}><em>{s}</em></li>)}
                            </ul>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFetchTatoebaExamples(word)}
                                disabled={tatoebaExamples[word.id]?.isLoading}
                                className="w-full sm:w-auto"
                            >
                                {tatoebaExamples[word.id]?.isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <BookText className="mr-2 h-4 w-4" />
                                )}
                                {tatoebaExamples[word.id]?.sentences && tatoebaExamples[word.id]?.sentences?.length ? 'Hide' : 'Show'} Tatoeba Sentences
                            </Button>

                            {tatoebaExamples[word.id]?.sentences && tatoebaExamples[word.id]!.sentences!.length > 0 && (
                                <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                                    <h5 className="font-medium text-primary">Tatoeba Examples:</h5>
                                    {tatoebaExamples[word.id]!.sentences!.map((ex, i) => (
                                        <div key={`tatoeba-${word.id}-${i}`} className="p-2 border rounded-md bg-muted/30">
                                            <p><strong>{ex.sourceLang}:</strong> <em>{ex.sourceText}</em></p>
                                            <p><strong>{ex.targetLang}:</strong> <em>{ex.targetText}</em></p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tatoebaExamples[word.id]?.error && (
                                <p className="text-xs text-destructive mt-1">{tatoebaExamples[word.id]?.error}</p>
                            )}
                        </div>

                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

