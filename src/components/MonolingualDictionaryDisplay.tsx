
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Language } from '@/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Volume2, MessageSquare } from 'lucide-react'; // Assuming Volume2 for pronunciation icon

interface MonolingualWordEntry {
  id: string;
  word: string;
  definition: string; // Definition in the same language as the word
  pronunciation?: string;
  language: Language;
}

// MOCK DATA - Replace with actual Firestore fetching
const mockDictionaryData: MonolingualWordEntry[] = [
  // Tagalog Examples
  { id: 'tg1', language: 'Tagalog', word: 'bahay', definition: 'Isang estrukturang ginagamit bilang tirahan ng mga tao o pamilya.', pronunciation: '/ba·háy/' },
  { id: 'tg2', language: 'Tagalog', word: 'araw', definition: 'Ang bituin sa gitna ng sistemang solar na nagbibigay ng liwanag at init; maaari ding tumukoy sa isang yugto ng panahon mula pagsikat hanggang paglubog nito.', pronunciation: '/á·raw/' },
  { id: 'tg3', language: 'Tagalog', word: 'tubig', definition: 'Isang likido na mahalaga sa lahat ng anyo ng buhay, walang kulay, walang lasa, at walang amoy sa dalisay nitong anyo.', pronunciation: '/tú·big/' },
  { id: 'tg4', language: 'Tagalog', word: 'pagkain', definition: 'Anumang sustansya na kinokonsumo upang magbigay ng nutrisyonal na suporta para sa isang organismo.', pronunciation: '/pag·ká·in/' },

  // Bisaya (Cebuano) Examples
  { id: 'bs1', language: 'Bisaya', word: 'balay', definition: 'Usa ka gambalay o estructura nga gipuy-an sa tawo o pamilya.', pronunciation: '/ba·láy/' },
  { id: 'bs2', language: 'Bisaya', word: 'adlaw', definition: 'Ang bituon sa sentro sa sistemang solar nga naghatag kahayag ug kainit; mahimo usab magpasabot sa yugto sa panahon gikan sa pagsidlak hangtod sa pagsalop niini.', pronunciation: '/ád·law/' },
  { id: 'bs3', language: 'Bisaya', word: 'tubig', definition: 'Usa ka likido nga importante sa tanang matang sa kinabuhi, walay kolor, walay lami, ug walay baho sa iyang lunsay nga porma.', pronunciation: '/tú·big/' },
  { id: 'bs4', language: 'Bisaya', word: 'pagkaon', definition: 'Bisan unsang substansiya nga gikaon aron makahatag og nutrisyon sa usa ka organismo.', pronunciation: '/pag·ká·on/' },

  // Waray-Waray Examples
  { id: 'wr1', language: 'Waray-Waray', word: 'balay', definition: 'Usa nga lugar o estructura nga gin-uukyan hin tawo o pamilya.', pronunciation: '/ba·láy/' },
  { id: 'wr2', language: 'Waray-Waray', word: 'adlaw', definition: 'An bituon ha sentro han sistema solar nga nahatag kapawa ngan kapaso; puydi liwat magpasabot han espasyo hin panahon tikang ha pagsirang ngadto ha pagtunod.', pronunciation: '/ád·law/' },
  { id: 'wr3', language: 'Waray-Waray', word: 'tubig', definition: 'Usa nga likido nga importante ha ngatanan nga klase hin kinabuhi, waray kolor, waray rasa, ngan waray baho ha iya puro nga forma.', pronunciation: '/tú·big/' },
  { id: 'wr4', language: 'Waray-Waray', word: 'pagkaon', definition: 'Bisan ano nga sustansya nga ginkakaon para makahatag hin nutrisyon ha usa ka organismo.', pronunciation: '/pag·ká·on/' },

  // English Examples
  { id: 'en1', language: 'English', word: 'house', definition: 'A building for human habitation, especially one that is lived in by a family or small group of people.', pronunciation: '/haʊs/' },
  { id: 'en2', language: 'English', word: 'sun', definition: 'The star at the center of the Solar System, which gives light and heat to the Earth.', pronunciation: '/sʌn/' },
  { id: 'en3', language: 'English', word: 'water', definition: 'A colorless, transparent, odorless liquid that forms the seas, lakes, rivers, and rain and is the basis of the fluids of living organisms.', pronunciation: '/ˈwɔ·tər/' },
  { id: 'en4', language: 'English', word: 'food', definition: 'Any nutritious substance that people or animals eat or drink, or that plants absorb, in order to maintain life and growth.', pronunciation: '/fuːd/' },
];

interface MonolingualDictionaryDisplayProps {
  language: Language;
}

export default function MonolingualDictionaryDisplay({ language }: MonolingualDictionaryDisplayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allWordsForLanguage, setAllWordsForLanguage] = useState<MonolingualWordEntry[]>([]);

  useEffect(() => {
    // Simulate fetching data for the selected language
    // In a real app, this is where you'd fetch from Firestore:
    // e.g., const words = await fetchWordsFromFirestore(language);
    const words = mockDictionaryData.filter(entry => entry.language === language);
    setAllWordsForLanguage(words.sort((a, b) => a.word.localeCompare(b.word)));
    setSearchTerm(''); // Reset search term when language changes
  }, [language]);

  const filteredWords = useMemo(() => {
    if (!searchTerm) {
      return allWordsForLanguage;
    }
    const searchLower = searchTerm.toLowerCase();
    return allWordsForLanguage.filter(entry =>
      entry.word.toLowerCase().includes(searchLower) ||
      entry.definition.toLowerCase().includes(searchLower)
    );
  }, [allWordsForLanguage, searchTerm]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{language} Dictionary</CardTitle>
        <CardDescription>
          Browse words, definitions, and pronunciations in {language}.
          Currently showing {filteredWords.length} of {allWordsForLanguage.length} entries.
        </CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search in ${language} words or definitions...`}
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={`Search ${language} dictionary`}
          />
        </div>
      </CardHeader>
      <CardContent>
        {allWordsForLanguage.length === 0 ? (
          <div className="text-center py-10">
             <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No words available for the {language} dictionary yet.</p>
            <p className="text-xs text-muted-foreground mt-1">(This is using mock data. You'll need to connect to Firestore.)</p>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-10">
             <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No words match your search term "{searchTerm}".</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-450px)] sm:h-[calc(100vh-400px)] pr-3">
            <div className="space-y-4">
              {filteredWords.map(entry => (
                <Card key={entry.id} className="p-4 shadow-sm break-inside-avoid">
                  <h4 className="text-xl font-semibold text-primary">{entry.word}</h4>
                  {entry.pronunciation && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Volume2 size={16} /> {entry.pronunciation}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed">{entry.definition}</p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
