
"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import type { WordEntry } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import LanguageSelector from '@/components/LanguageSelector';
import { BookMarked, Search, MessageSquare } from 'lucide-react';

const ALL_CATEGORIES_OPTION_VALUE = "__ALL_CATEGORIES__";

export default function DictionaryPage() {
  const { words, categories, sourceLanguage, targetLanguage } = useGlobalAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredWords = useMemo(() => {
    return words
      .filter(word => {
        // Filter by selected source and target languages for the dictionary view
        return word.language === sourceLanguage && word.targetLanguage === targetLanguage;
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
      .sort((a, b) => a.word.localeCompare(b.word)); // Sort alphabetically by word
  }, [words, searchTerm, selectedCategory, sourceLanguage, targetLanguage]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookMarked className="w-10 h-10 text-primary" />
              <CardTitle className="text-3xl font-bold">Dialect Dictionary</CardTitle>
            </div>
            <CardDescription>
              Browse words and translations. Use the selectors below to choose languages and filters.
              Displaying words in '{sourceLanguage}' with translations in '{targetLanguage}'.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LanguageSelector />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search in ${sourceLanguage} words, meanings, categories...`}
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search dictionary"
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

        {filteredWords.length === 0 ? (
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
              <ScrollArea className="h-[calc(100vh-550px)] sm:h-[calc(100vh-500px)] pr-3"> {/* Adjust height as needed */}
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
                      <div className="mt-2">
                        <p><strong className="font-medium">Meaning ({word.targetLanguage}):</strong> {word.meaning}</p>
                        {word.pronunciation && <p className="text-sm"><strong className="font-medium">Pronunciation:</strong> {word.pronunciation}</p>}
                        {word.userSentence && <p className="text-sm italic"><strong className="font-medium">Example:</strong> "{word.userSentence}"</p>}
                         {word.aiSentences && word.aiSentences.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-dashed">
                            <p className="font-medium text-xs mb-1">AI Examples ({word.language}):</p>
                            <ul className="list-disc list-inside text-xs space-y-0.5 text-muted-foreground">
                              {word.aiSentences.map((s, i) => <li key={i}><em>{s}</em></li>)}
                            </ul>
                          </div>
                        )}
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
