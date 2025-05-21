
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
  const { sourceLanguage: globalSourceLang, targetLanguage: globalTargetLang } = useGlobalAppContext();
  const { toast } = useToast();
  const mounted = useMounted();

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');

  // Initialize with fixed defaults for SSR, then update on client mount
  const [sourceLang, setSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState<Language>(() => {
    const initialDefaultSource = SUPPORTED_LANGUAGES[0];
    let initialDefaultTarget = SUPPORTED_LANGUAGES[1];
    if (initialDefaultSource === initialDefaultTarget) {
      initialDefaultTarget = SUPPORTED_LANGUAGES.find(lang => lang !== initialDefaultSource) 
                           || SUPPORTED_LANGUAGES[0];
    }
    return initialDefaultTarget;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mounted) {
      let newSourceLang = globalSourceLang;
      let newTargetLang = globalTargetLang;

      if (globalSourceLang === globalTargetLang) {
        newTargetLang = SUPPORTED_LANGUAGES.find(l => l !== globalSourceLang) ||
                        SUPPORTED_LANGUAGES.find(l => l !== SUPPORTED_LANGUAGES[0]) || 
                        SUPPORTED_LANGUAGES[1];
      }
      
      if (newSourceLang !== sourceLang) {
        setSourceLang(newSourceLang);
      }
      if (newTargetLang !== targetLang && newTargetLang) {
        setTargetLang(newTargetLang);
      }
    }
  }, [mounted, globalSourceLang, globalTargetLang, sourceLang, targetLang]);


  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    // Swap text only if output text is present
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
    if (sourceLang === targetLang) {
      setOutputText(inputText);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
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
              LinguaLeap Translator
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
                  value={sourceLang} 
                  onValueChange={(value) => { if (mounted) setSourceLang(value as Language)}}
                  disabled={!mounted}
                >
                  <SelectTrigger id="source-language-select" className="w-full">
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={`source-${lang}`} value={lang} disabled={lang === targetLang}>
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
                  value={targetLang} 
                  onValueChange={(value) => { if (mounted) setTargetLang(value as Language)}}
                  disabled={!mounted}
                >
                  <SelectTrigger id="target-language-select" className="w-full">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={`target-${lang}`} value={lang} disabled={lang === sourceLang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Textarea
                placeholder={`Enter text in ${sourceLang}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="resize-none text-base p-4 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                aria-label={`Input text in ${sourceLang}`}
                disabled={!mounted}
              />
              <Textarea
                placeholder={`Translation in ${targetLang} will appear here...`}
                value={outputText}
                readOnly
                rows={6}
                className="bg-muted/30 resize-none text-base p-4 rounded-md shadow-sm border-dashed"
                aria-label={`Output text in ${targetLang}`}
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
