
"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import MonolingualDictionaryDisplay from '@/components/MonolingualDictionaryDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText } from 'lucide-react';
import type { Language } from '@/types'; // Assuming Language type includes 'Tagalog', 'Bisaya', 'Waray-Waray', 'English'

const SUPPORTED_MONOLINGUAL_LANGUAGES: Language[] = ["Tagalog", "Bisaya", "Waray-Waray", "English"];

export default function MonolingualDictionaryPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookText className="w-10 h-10 text-primary" />
              <CardTitle className="text-3xl font-bold">Monolingual Dictionaries</CardTitle>
            </div>
            <CardDescription>
              Explore definitions and pronunciations within a single language. 
              Select a language below to view its dictionary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {SUPPORTED_MONOLINGUAL_LANGUAGES.map(lang => (
                <Button
                  key={lang}
                  variant={selectedLanguage === lang ? "default" : "outline"}
                  onClick={() => setSelectedLanguage(lang)}
                  className="min-w-[150px] py-3 text-base"
                >
                  {lang} Dictionary
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedLanguage && (
          <MonolingualDictionaryDisplay language={selectedLanguage} />
        )}

        {!selectedLanguage && (
            <Card className="mt-6">
                <CardContent className="p-10 text-center">
                    <p className="text-lg text-muted-foreground">Please select a language above to view its dictionary.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
