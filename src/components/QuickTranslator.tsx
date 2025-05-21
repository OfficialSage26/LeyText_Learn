
"use client";

import React, { useState, useEffect } from 'react';
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

export default function QuickTranslator() {
  const { sourceLanguage: globalSourceLang, targetLanguage: globalTargetLang } = useGlobalAppContext();
  const { toast } = useToast();

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<Language>(globalSourceLang);
  const [targetLang, setTargetLang] = useState<Language>(globalTargetLang);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize local languages from global, ensuring they are different
    if (globalSourceLang === globalTargetLang) {
      const newTarget = SUPPORTED_LANGUAGES.find(l => l !== globalSourceLang) || SUPPORTED_LANGUAGES[1];
      setSourceLang(globalSourceLang);
      setTargetLang(newTarget);
    } else {
      setSourceLang(globalSourceLang);
      setTargetLang(globalTargetLang);
    }
  }, [globalSourceLang, globalTargetLang]);

  // Update local state if global languages change, but only if not currently translating
  useEffect(() => {
    if (!isLoading) {
        if (globalSourceLang !== sourceLang) setSourceLang(globalSourceLang);
        if (globalTargetLang !== targetLang) {
            if (globalTargetLang !== sourceLang) { // Ensure target is not same as current source
                setTargetLang(globalTargetLang);
            } else {
                 // If global target becomes same as local source, pick a different target
                const newTarget = SUPPORTED_LANGUAGES.find(l => l !== sourceLang) || SUPPORTED_LANGUAGES.find(l => l !== globalSourceLang) || SUPPORTED_LANGUAGES[1];
                if (newTarget) setTargetLang(newTarget);
            }
        }
    }
  }, [globalSourceLang, globalTargetLang, isLoading, sourceLang]);


  const handleSwapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

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
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold flex items-center">
          <Languages className="inline-block mr-2 h-7 w-7 text-primary" />
          Quick Translator
        </CardTitle>
        <CardDescription>
          Instantly translate text between supported languages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Label htmlFor="quick-source-language" className="mb-1 block text-sm font-medium">From</Label>
            <Select 
              value={sourceLang} 
              onValueChange={(value) => setSourceLang(value as Language)}
            >
              <SelectTrigger id="quick-source-language" className="w-full">
                <SelectValue placeholder="Select source language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={`quick-source-${lang}`} value={lang} disabled={lang === targetLang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="self-center pt-0 sm:pt-5">
            <Button variant="ghost" size="icon" onClick={handleSwapLanguages} aria-label="Swap languages">
              <ArrowRightLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 w-full">
            <Label htmlFor="quick-target-language" className="mb-1 block text-sm font-medium">To</Label>
            <Select 
              value={targetLang} 
              onValueChange={(value) => setTargetLang(value as Language)}
            >
              <SelectTrigger id="quick-target-language" className="w-full">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <SelectItem key={`quick-target-${lang}`} value={lang} disabled={lang === sourceLang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Textarea
          placeholder={`Enter text in ${sourceLang}...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          className="resize-none text-base p-3 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          aria-label={`Input text in ${sourceLang}`}
        />
        <Textarea
          placeholder={`Translation in ${targetLang} will appear here...`}
          value={outputText}
          readOnly
          rows={4}
          className="bg-muted/30 resize-none text-base p-3 rounded-md shadow-sm border-dashed"
          aria-label={`Output text in ${targetLang}`}
        />
        
        <Button 
          onClick={handleTranslate} 
          disabled={isLoading || !inputText.trim()} 
          className="w-full py-2.5 text-base font-semibold"
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
  );
}

