
"use client";

import React, { useState, useEffect } from 'react';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useMounted } from '@/hooks/useMounted';

export default function LanguageSelector() {
  const { 
    sourceLanguage: globalSourceLanguage, 
    setSourceLanguage: setGlobalSourceLanguage, 
    targetLanguage: globalTargetLanguage, 
    setTargetLanguage: setGlobalTargetLanguage 
  } = useGlobalAppContext();
  
  const mounted = useMounted();

  // Local state for UI display, initialized to server-consistent defaults
  const [currentSourceLang, setCurrentSourceLang] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [currentTargetLang, setCurrentTargetLang] = useState<Language>(SUPPORTED_LANGUAGES[1]);

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
                           (globalSourceLanguage === SUPPORTED_LANGUAGES[0] ? SUPPORTED_LANGUAGES[1] : SUPPORTED_LANGUAGES[0]) || 
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
  };

  const handleSourceLanguageChange = (value: string) => {
    if (mounted) {
      setGlobalSourceLanguage(value as Language);
    }
  };

  const handleTargetLanguageChange = (value: string) => {
    if (mounted) {
      setGlobalTargetLanguage(value as Language);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 my-6 p-4 border rounded-lg shadow-sm bg-card">
      <div className="flex-1 w-full">
        <Label htmlFor="source-language" className="mb-2 block text-sm font-medium">Source Language</Label>
        <Select 
          value={currentSourceLang} // Use local state for display
          onValueChange={handleSourceLanguageChange} // Update global context
          disabled={!mounted}
        >
          <SelectTrigger id="source-language" className="w-full">
            <SelectValue placeholder="Select source language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(lang => (
              <SelectItem key={`selector-source-${lang}`} value={lang} disabled={lang === currentTargetLang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-5 sm:pt-0">
        <Button variant="ghost" size="icon" onClick={handleSwapLanguages} aria-label="Swap languages" disabled={!mounted}>
          <ArrowRightLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 w-full">
        <Label htmlFor="target-language" className="mb-2 block text-sm font-medium">Target Language</Label>
        <Select 
          value={currentTargetLang} // Use local state for display
          onValueChange={handleTargetLanguageChange} // Update global context
          disabled={!mounted}
        >
          <SelectTrigger id="target-language" className="w-full">
            <SelectValue placeholder="Select target language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(lang => (
              <SelectItem key={`selector-target-${lang}`} value={lang} disabled={lang === currentSourceLang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
