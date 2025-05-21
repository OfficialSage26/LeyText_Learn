
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { ArrowRightLeft, Languages, Loader2 } from 'lucide-react';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';
import { translateText } from '@/ai/flows/translate-text-flow';
import { useToast } from "@/hooks/use-toast";
import { useMounted } from '@/hooks/useMounted';

export default function TranslatePage() {
  const {
    sourceLanguage: globalSourceLanguage,
    setSourceLanguage: setGlobalSourceLanguage,
    targetLanguage: globalTargetLanguage,
    setTargetLanguage: setGlobalTargetLanguage,
  } = useGlobalAppContext();
  const { toast } = useToast();
  const mounted = useMounted();

  // Local state for UI display, initialized to server-consistent defaults
  const [currentSourceLang, setCurrentSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [currentTargetLang, setCurrentTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[1]);

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local UI languages with global context after mount and on global changes
  useEffect(() => {
    if (mounted) {
      setCurrentSourceLang(globalSourceLanguage);
      setCurrentTargetLang(globalTargetLanguage);
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage]);

  // Effect to ensure global source and target languages are different
  useEffect(() => {
    if (mounted) {
      if (globalSourceLanguage === globalTargetLanguage) {
        const newTarget = SUPPORTED_LANGUAGES.find(l => l !== globalSourceLanguage) ||
                           (globalSourceLanguage === SUPPORTED_LANGUAGES[0] ? SUPPORTED_LANGUAGES[1] : SUPPORTED_LANGUAGES[0]) || // Ensure it's different
                           SUPPORTED_LANGUAGES[1]; // Absolute fallback
        if (newTarget && newTarget !== globalTargetLanguage) {
          setGlobalTargetLanguage(newTarget);
        }
      }
    }
  }, [mounted, globalSourceLanguage, globalTargetLanguage, setGlobalTargetLanguage]);


  const handleSwapLanguages = () => {
    setGlobalSourceLanguage(globalTargetLanguage); // Update global context
    setGlobalTargetLanguage(globalSourceLanguage); // Update global context

    if (outputText.trim() !== '') {
        setInputText(outputText);
        setOutputText(inputText);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }
    // Use global languages for the actual translation logic
    if (globalSourceLanguage === globalTargetLanguage) {
      setOutputText(inputText);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage: globalSourceLanguage, // Use global context for API
        targetLanguage: globalTargetLanguage, // Use global context for API
      });
      setOutputText(result.translatedText);
    } catch (e) {
      console.error("Translation error:", e);
      setError("Failed to translate text. Please try again.");
      toast({
        title: "Translation Error",
        description: "Could not translate the text. Please check your connection or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              <Languages className="inline-block mr-2 h-8 w-8 text-primary" />
              LeyText Learn Translator
            </CardTitle>
            <CardDescription>
              Translate text between {SUPPORTED_LANGUAGES.join(', ').replace(/, ([^,]*)$/, ' and $1')}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <Label htmlFor="source-language-select" className="mb-1 block text-sm font-medium">From</Label>
                <Select
                  value={currentSourceLang} // Use local state for display
                  onValueChange={(value) => { if (mounted) setGlobalSourceLanguage(value as Language)}} // Update global context
                  disabled={!mounted}
                >
                  <SelectTrigger id="source-language-select" className="w-full">
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={`source-${lang}`} value={lang} disabled={lang === currentTargetLang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="self-center pt-0 sm:pt-5">
                <Button variant="ghost" size="icon" onClick={handleSwapLanguages} aria-label="Swap languages" disabled={!mounted}>
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 w-full">
                <Label htmlFor="target-language-select" className="mb-1 block text-sm font-medium">To</Label>
                <Select
                  value={currentTargetLang} // Use local state for display
                  onValueChange={(value) => { if (mounted) setGlobalTargetLanguage(value as Language)}} // Update global context
                  disabled={!mounted}
                >
                  <SelectTrigger id="target-language-select" className="w-full">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={`target-${lang}`} value={lang} disabled={lang === currentSourceLang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Textarea
                placeholder={`Enter text in ${currentSourceLang}...`} // Use local display state
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none text-base p-4 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                aria-label={`Input text in ${currentSourceLang}`} // Use local display state
                disabled={!mounted || isLoading}
              />
              <Textarea
                placeholder={`Translation in ${currentTargetLang} will appear here...`} // Use local display state
                value={outputText}
                readOnly
                rows={6}
                className="bg-muted/30 resize-none text-base p-4 rounded-md shadow-sm border-dashed"
                aria-label={`Output text in ${currentTargetLang}`} // Use local display state
              />
            </div>

            <Button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim() || !mounted}
              className="w-full py-3 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Languages className="mr-2 h-5 w-5" />
              )}
              Translate
            </Button>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
