
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import type { WordEntry, Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlusCircle, Edit, Trash2, Search, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { generateExampleSentences } from '@/ai/flows/generate-example-sentences';
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_LANGUAGES } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMounted } from '@/hooks/useMounted';

const wordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  meaning: z.string().min(1, "Meaning is required"),
  language: z.custom<Language>((val) => SUPPORTED_LANGUAGES.includes(val as Language), "Invalid language"),
  targetLanguage: z.custom<Language>((val) => SUPPORTED_LANGUAGES.includes(val as Language), "Invalid target language"),
  userSentence: z.string().optional(),
  pronunciation: z.string().optional(),
  category: z.string().optional(),
}).refine(data => data.language !== data.targetLanguage, {
  message: "Source and target languages must be different.",
  path: ["targetLanguage"], 
});

type WordFormData = z.infer<typeof wordSchema>;

const ALL_CATEGORIES_OPTION_VALUE = "__ALL_CATEGORIES__";

export default function WordListsPage() {
  const { words: allWordsFromContext, addWord, editWord, deleteWord, sourceLanguage, targetLanguage, categories, clearWords } = useGlobalAppContext();
  const { toast } = useToast();
  const mounted = useMounted();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredWords, setFilteredWords] = useState<WordEntry[] | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<WordEntry | null>(null);
  const [isGeneratingAiSentences, setIsGeneratingAiSentences] = useState(false);

  const form = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
    // Default values will be set in useEffect based on context and editingWord
  });

  useEffect(() => {
    if (mounted) {
      const newFiltered = allWordsFromContext
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
        .sort((a, b) => b.createdAt - a.createdAt);
      setFilteredWords(newFiltered);
    } else {
      setFilteredWords(null); // Ensure it's null if not mounted
    }
  }, [allWordsFromContext, searchTerm, selectedCategory, mounted]);

  useEffect(() => {
    if (mounted) {
      if (isFormOpen) {
        form.reset(editingWord ? {
          word: editingWord.word,
          meaning: editingWord.meaning,
          language: editingWord.language,
          targetLanguage: editingWord.targetLanguage,
          userSentence: editingWord.userSentence || '',
          pronunciation: editingWord.pronunciation || '',
          category: editingWord.category || '',
        } : {
          word: '',
          meaning: '',
          language: sourceLanguage,
          targetLanguage: targetLanguage,
          userSentence: '',
          pronunciation: '',
          category: '',
        });
      }
    }
  }, [isFormOpen, editingWord, form, sourceLanguage, targetLanguage, mounted]);

  const onSubmit = (data: WordFormData) => {
    if (editingWord) {
      editWord({ ...editingWord, ...data });
      toast({ title: "Word Updated", description: `"${data.word}" has been updated.` });
    } else {
      const newWord = addWord(data);
      toast({ title: "Word Added", description: `"${newWord.word}" has been added to your list.` });
    }
    setIsFormOpen(false);
    setEditingWord(null);
  };

  const handleGenerateAISentences = async (wordEntry: WordEntry) => {
    setIsGeneratingAiSentences(true);
    try {
      const result = await generateExampleSentences({
        wordOrPhrase: wordEntry.word,
        language: wordEntry.language,
      });
      if (result.sentences && result.sentences.length > 0) {
        editWord({ ...wordEntry, aiSentences: result.sentences });
        toast({
          title: "AI Sentences Generated",
          description: `Example sentences for "${wordEntry.word}" have been added.`,
        });
      } else {
        toast({
          title: "AI Sentences",
          description: `No example sentences generated for "${wordEntry.word}".`,
        });
      }
    } catch (error) {
      console.error("Error generating AI sentences:", error);
      toast({
        title: "AI Error",
        description: "Could not generate example sentences. Please try again.",
        variant: "destructive",
      });
    }
    setIsGeneratingAiSentences(false);
  };
  
  if (!mounted || filteredWords === null) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-3 text-lg text-muted-foreground">Loading words...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">My Word Lists</CardTitle>
            <CardDescription>Manage your vocabulary. Add, edit, or delete words and phrases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search words, meanings, categories..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!mounted}
                />
              </div>
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
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES_OPTION_VALUE}>All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingWord(null); }}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto" disabled={!mounted}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Word
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingWord ? 'Edit Word' : 'Add New Word'}</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Word Language (Source)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} defaultValue={sourceLanguage}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SUPPORTED_LANGUAGES.map(lang => <SelectItem key={'form-source-'+lang} value={lang}>{lang}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="targetLanguage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meaning Language (Target)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} defaultValue={targetLanguage}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SUPPORTED_LANGUAGES.map(lang => <SelectItem key={'form-target'+lang} value={lang}>{lang}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="word"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Word / Phrase</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="meaning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meaning / Translation</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="userSentence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Example Sentence (Optional)</FormLabel>
                            <FormControl><Textarea {...field} placeholder="E.g., The quick brown fox..." /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pronunciation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pronunciation (Optional)</FormLabel>
                              <FormControl><Input {...field} placeholder="e.g., /kwɪk braʊn fɒks/" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category (Optional)</FormLabel>
                              <FormControl><Input {...field} placeholder="e.g., Food, Travel" list="wordlist-categories-list" /></FormControl>
                              <datalist id="wordlist-categories-list">
                                {categories.map(cat => <option key={`cat-opt-${cat}`} value={cat} />)}
                              </datalist>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit"> {editingWord ? 'Save Changes' : 'Add Word'}</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {allWordsFromContext.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your Word List is Empty</h3>
              <p className="text-muted-foreground mb-4">Start building your vocabulary by adding new words and phrases.</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Word
              </Button>
            </CardContent>
          </Card>
        ) : filteredWords.length === 0 ? (
           <Card className="text-center py-12">
            <CardContent>
              <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Words Found</h3>
              <p className="text-muted-foreground">Try adjusting your search term or category filter.</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-400px)] pr-3"> 
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWords.map(word => (
                <Card key={word.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{word.word}</CardTitle>
                        <CardDescription>{word.language} &rarr; {word.targetLanguage}</CardDescription>
                      </div>
                      {word.category && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full whitespace-nowrap">{word.category}</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <p><strong className="font-medium">Meaning:</strong> {word.meaning}</p>
                    {word.pronunciation && <p><strong className="font-medium">Pronunciation:</strong> {word.pronunciation}</p>}
                    {word.userSentence && <p><strong className="font-medium">Example:</strong> <em>{word.userSentence}</em></p>}
                    
                    {word.aiSentences && word.aiSentences.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dashed">
                        <p className="font-medium text-sm mb-1 flex items-center gap-1"><Sparkles size={14} className="text-primary"/>AI Examples ({word.language}):</p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                          {word.aiSentences.map((s, i) => <li key={`ai-ex-${word.id}-${i}`}><em>{s}</em></li>)}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateAISentences(word)}
                      disabled={isGeneratingAiSentences}
                      className="w-full sm:w-auto"
                    >
                      {isGeneratingAiSentences ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      AI Sentences
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingWord(word); setIsFormOpen(true); }}
                       className="w-full sm:w-auto"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the word "{word.word}" from your list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteWord(word.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
         {allWordsFromContext.length > 0 && (
          <div className="mt-8 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={!mounted}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear All Words
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all words from your list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearWords} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Yes, delete all</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
