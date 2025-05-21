"use client";

import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft } from 'lucide-react';
import { Button } from './ui/button';

export default function LanguageSelector() {
  const { sourceLanguage, setSourceLanguage, targetLanguage, setTargetLanguage } = useGlobalAppContext();

  const handleSwapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 my-6 p-4 border rounded-lg shadow-sm bg-card">
      <div className="flex-1 w-full">
        <Label htmlFor="source-language" className="mb-2 block text-sm font-medium">Source Language</Label>
        <Select value={sourceLanguage} onValueChange={(value) => setSourceLanguage(value as Language)}>
          <SelectTrigger id="source-language" className="w-full">
            <SelectValue placeholder="Select source language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(lang => (
              <SelectItem key={lang} value={lang} disabled={lang === targetLanguage}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-5 sm:pt-0">
        <Button variant="ghost" size="icon" onClick={handleSwapLanguages} aria-label="Swap languages">
          <ArrowRightLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 w-full">
        <Label htmlFor="target-language" className="mb-2 block text-sm font-medium">Target Language</Label>
        <Select value={targetLanguage} onValueChange={(value) => setTargetLanguage(value as Language)}>
          <SelectTrigger id="target-language" className="w-full">
            <SelectValue placeholder="Select target language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(lang => (
              <SelectItem key={lang} value={lang} disabled={lang === sourceLanguage}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
