
"use client";

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { SUPPORTED_LANGUAGES, type Language } from '@/types';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface LanguageOption {
  name: Language;
  description: string;
  imageSrc: string;
  altText: string;
  dataAiHint: string;
}

const languageOptions: LanguageOption[] = [
  {
    name: "Tagalog",
    description: "Widely spoken in the Philippines, especially in Manila and surrounding regions.",
    imageSrc: "https://placehold.co/600x400.png",
    altText: "Illustration representing Tagalog language or culture, like the Philippine flag.",
    dataAiHint: "Philippines flag"
  },
  {
    name: "English",
    description: "A global language, often used as a second language in the Philippines.",
    imageSrc: "https://placehold.co/600x400.png",
    altText: "Illustration representing English language, like a book and a globe.",
    dataAiHint: "book globe"
  },
  {
    name: "Bisaya",
    description: "Predominantly spoken in the Visayas region, including Cebu, Bohol, and parts of Mindanao.",
    imageSrc: "https://placehold.co/600x400.png",
    altText: "Illustration representing Bisaya language or Visayas region, like a landmark from Cebu.",
    dataAiHint: "Cebu landmark"
  },
  {
    name: "Waray-Waray",
    description: "Mainly spoken in Eastern Visayas, including Samar and Leyte islands.",
    imageSrc: "https://placehold.co/600x400.png",
    altText: "Illustration representing Waray-Waray language or Eastern Visayas, like the San Juanico Bridge.",
    dataAiHint: "Leyte bridge"
  }
];

export default function SelectLanguagePage() {
  const router = useRouter();
  const { setTargetLanguage, setSourceLanguage } = useGlobalAppContext();

  const handleLanguageSelect = (chosenLearnLanguage: Language) => {
    setTargetLanguage(chosenLearnLanguage);

    if (chosenLearnLanguage === "English") {
      // If the user wants to learn English, set the source to a non-English language.
      // Default to Tagalog or the first available non-English language.
      const newSource = SUPPORTED_LANGUAGES.find(l => l !== "English") || SUPPORTED_LANGUAGES[0];
      setSourceLanguage(newSource);
    } else {
      // If the user wants to learn a non-English language, set the source to English.
      setSourceLanguage("English");
    }
    router.push('/learn');
  };

  return (
    <AppLayout>
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          What language do you want to learn?
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose your target language to personalize your learning experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {languageOptions.map((option) => (
          <Card 
            key={option.name} 
            className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col"
            onClick={() => handleLanguageSelect(option.name)}
            role="button"
            tabIndex={0}
            aria-label={`Learn ${option.name}`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleLanguageSelect(option.name)}
          >
            <div className="relative w-full h-40 sm:h-48">
              <Image 
                src={option.imageSrc} 
                alt={option.altText}
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={option.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{option.name}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardContent className="p-6 pt-0">
              <Button className="w-full" tabIndex={-1}> {/* Button made non-focusable as Card is the primary target */}
                Learn {option.name} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
