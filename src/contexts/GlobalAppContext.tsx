
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { WordEntry, Language, QuizScore } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const initialWords: WordEntry[] = [
  // === Greetings ===
  { id: uuidv4(), word: "Hello", meaning: "Kumusta", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 300000 },
  { id: uuidv4(), word: "Good morning", meaning: "Magandang umaga", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 260000 },
  { id: uuidv4(), word: "Good afternoon", meaning: "Magandang hapon", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 255000 },
  { id: uuidv4(), word: "Good evening", meaning: "Magandang gabi", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 254000 },
  { id: uuidv4(), word: "Goodbye", meaning: "Paalam", language: "English", targetLanguage: "Tagalog", category: "Greetings", createdAt: Date.now() - 250000 },
  
  { id: uuidv4(), word: "Hello", meaning: "Kumusta", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 200000 },
  { id: uuidv4(), word: "Good morning", meaning: "Maayong buntag", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 160000 },
  { id: uuidv4(), word: "Good afternoon", meaning: "Maayong hapon", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 155000 },
  { id: uuidv4(), word: "Good evening", meaning: "Maayong gabii", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 154000 },
  { id: uuidv4(), word: "Goodbye", meaning: "Babay", language: "English", targetLanguage: "Bisaya", category: "Greetings", createdAt: Date.now() - 150000 },

  { id: uuidv4(), word: "Hello", meaning: "Kumusta", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 100000 },
  { id: uuidv4(), word: "Good morning", meaning: "Maupay nga aga", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 60000 },
  { id: uuidv4(), word: "Good afternoon", meaning: "Maupay nga kulop", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 55000 },
  { id: uuidv4(), word: "Good evening", meaning: "Maupay nga gab-i", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 54000 },
  { id: uuidv4(), word: "Goodbye", meaning: "Pag-laom / Bye", language: "English", targetLanguage: "Waray-Waray", category: "Greetings", createdAt: Date.now() - 50000 },
  
  // === Common Phrases ===
  { id: uuidv4(), word: "Thank you", meaning: "Salamat", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 280000 },
  { id: uuidv4(), word: "You're welcome", meaning: "Walang anuman", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 270000 },
  { id: uuidv4(), word: "Yes", meaning: "Oo", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 240000 },
  { id: uuidv4(), word: "No", meaning: "Hindi", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 220000 },
  { id: uuidv4(), word: "Please", meaning: "Pakiusap", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 215000 },
  { id: uuidv4(), word: "Excuse me", meaning: "Paumanhin", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 210000 },
  { id: uuidv4(), word: "I don't understand", meaning: "Hindi ko maintindihan", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 205000 },
  { id: uuidv4(), word: "How are you?", meaning: "Kamusta ka?", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 204000 },
  { id: uuidv4(), word: "I'm fine", meaning: "Mabuti naman", language: "English", targetLanguage: "Tagalog", category: "Common Phrases", createdAt: Date.now() - 203000 },

  { id: uuidv4(), word: "Thank you", meaning: "Salamat", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 180000 },
  { id: uuidv4(), word: "You're welcome", meaning: "Way sapayan", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 170000 },
  { id: uuidv4(), word: "Yes", meaning: "Oo", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 140000 },
  { id: uuidv4(), word: "No", meaning: "Dili", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 120000 },
  { id: uuidv4(), word: "Please", meaning: "Palihug", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 115000 },
  { id: uuidv4(), word: "Excuse me", meaning: "Pasayloa ko", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 110000 },
  { id: uuidv4(), word: "I don't understand", meaning: "Wala ko kasabot", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 105000 },
  { id: uuidv4(), word: "How are you?", meaning: "Kumusta ka?", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 104000 },
  { id: uuidv4(), word: "I'm fine", meaning: "Maayo man", language: "English", targetLanguage: "Bisaya", category: "Common Phrases", createdAt: Date.now() - 103000 },

  { id: uuidv4(), word: "Thank you", meaning: "Salamat", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 80000 },
  { id: uuidv4(), word: "You're welcome", meaning: "Waray sapayan / Dire bale", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 70000 },
  { id: uuidv4(), word: "Yes", meaning: "Oo", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 40000 },
  { id: uuidv4(), word: "No", meaning: "Dire", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 20000 },
  { id: uuidv4(), word: "Please", meaning: "Palihog", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 15000 },
  { id: uuidv4(), word: "Excuse me", meaning: "Pasayloa gad", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 10000 },
  { id: uuidv4(), word: "I don't understand", meaning: "Diri ak nakaintindi", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 5000 },
  { id: uuidv4(), word: "How are you?", meaning: "Kumusta ka?", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 4000 },
  { id: uuidv4(), word: "I'm fine", meaning: "Maupay man", language: "English", targetLanguage: "Waray-Waray", category: "Common Phrases", createdAt: Date.now() - 3000 },

  // === Numbers ===
  ...Array.from({ length: 10 }, (_, i) => i + 1).flatMap(num => {
    const translations: { [key in Language]?: string } = {
      English: ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"][num-1],
      Tagalog: ["Isa", "Dalawa", "Tatlo", "Apat", "Lima", "Anim", "Pito", "Walo", "Siyam", "Sampu"][num-1],
      Bisaya: ["Usa", "Duha", "Tulo", "Upat", "Lima", "Unom", "Pito", "Walo", "Siyam", "Napulo"][num-1],
      Waray: ["Usá", "Duhá", "Tuló", "Upat", "Limá", "Unom", "Pitó", "Waló", "Siyám", "Napúlô"][num-1]
    };
    return [
      { id: uuidv4(), word: translations.English!, meaning: translations.Tagalog!, language: "English", targetLanguage: "Tagalog", category: "Numbers", createdAt: Date.now() - 500000 + num * 1000 },
      { id: uuidv4(), word: translations.English!, meaning: translations.Bisaya!, language: "English", targetLanguage: "Bisaya", category: "Numbers", createdAt: Date.now() - 450000 + num * 1000 },
      { id: uuidv4(), word: translations.English!, meaning: translations.Waray!, language: "English", targetLanguage: "Waray-Waray", category: "Numbers", createdAt: Date.now() - 400000 + num * 1000 },
    ]
  }),

  // === Colors ===
  { id: uuidv4(), word: "Red", meaning: "Pula", language: "English", targetLanguage: "Tagalog", category: "Colors", createdAt: Date.now() - 350000 },
  { id: uuidv4(), word: "Blue", meaning: "Asul/Bughaw", language: "English", targetLanguage: "Tagalog", category: "Colors", createdAt: Date.now() - 340000 },
  { id: uuidv4(), word: "Yellow", meaning: "Dilaw", language: "English", targetLanguage: "Tagalog", category: "Colors", createdAt: Date.now() - 330000 },
  { id: uuidv4(), word: "Green", meaning: "Berde/Luntian", language: "English", targetLanguage: "Tagalog", category: "Colors", createdAt: Date.now() - 329000 },
  { id: uuidv4(), word: "Black", meaning: "Itim", language: "English", targetLanguage: "Tagalog", category: "Colors", createdAt: Date.now() - 328000 },
  { id: uuidv4(), word: "White", meaning: "Puti", language: "English", targetLanguage: "Tagalog", category: "Colors", createdAt: Date.now() - 327000 },

  { id: uuidv4(), word: "Red", meaning: "Pula", language: "English", targetLanguage: "Bisaya", category: "Colors", createdAt: Date.now() - 320000 },
  { id: uuidv4(), word: "Blue", meaning: "Asul/Bughaw", language: "English", targetLanguage: "Bisaya", category: "Colors", createdAt: Date.now() - 310000 },
  { id: uuidv4(), word: "Yellow", meaning: "Dalag/Amarilyo", language: "English", targetLanguage: "Bisaya", category: "Colors", createdAt: Date.now() - 300000 },
  { id: uuidv4(), word: "Green", meaning: "Berde/Lunhaw", language: "English", targetLanguage: "Bisaya", category: "Colors", createdAt: Date.now() - 299000 },
  { id: uuidv4(), word: "Black", meaning: "Itom", language: "English", targetLanguage: "Bisaya", category: "Colors", createdAt: Date.now() - 298000 },
  { id: uuidv4(), word: "White", meaning: "Puti", language: "English", targetLanguage: "Bisaya", category: "Colors", createdAt: Date.now() - 297000 },
  
  { id: uuidv4(), word: "Red", meaning: "Pula", language: "English", targetLanguage: "Waray-Waray", category: "Colors", createdAt: Date.now() - 290000 },
  { id: uuidv4(), word: "Blue", meaning: "Asul/Bughaw", language: "English", targetLanguage: "Waray-Waray", category: "Colors", createdAt: Date.now() - 280000 },
  { id: uuidv4(), word: "Yellow", meaning: "Darag/Amarilyo", language: "English", targetLanguage: "Waray-Waray", category: "Colors", createdAt: Date.now() - 270000 },
  { id: uuidv4(), word: "Green", meaning: "Berde/Lunhaw", language: "English", targetLanguage: "Waray-Waray", category: "Colors", createdAt: Date.now() - 269000 },
  { id: uuidv4(), word: "Black", meaning: "Itom", language: "English", targetLanguage: "Waray-Waray", category: "Colors", createdAt: Date.now() - 268000 },
  { id: uuidv4(), word: "White", meaning: "Puti", language: "English", targetLanguage: "Waray-Waray", category: "Colors", createdAt: Date.now() - 267000 },

  // === Days of the Week ===
  ...["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].flatMap((day, i) => {
    const translations: { [key in Language]?: string } = {
      English: day,
      Tagalog: ["Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado", "Linggo"][i],
      Bisaya: ["Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado", "Dominggo"][i],
      Waray: ["Lunes", "Martes", "Miyerkules", "Huwebes", "Biyernes", "Sabado", "Dominggo"][i]
    };
    return [
      { id: uuidv4(), word: translations.English!, meaning: translations.Tagalog!, language: "English", targetLanguage: "Tagalog", category: "Days", createdAt: Date.now() - 260000 + i * 1000 },
      { id: uuidv4(), word: translations.English!, meaning: translations.Bisaya!, language: "English", targetLanguage: "Bisaya", category: "Days", createdAt: Date.now() - 230000 + i * 1000 },
      { id: uuidv4(), word: translations.English!, meaning: translations.Waray!, language: "English", targetLanguage: "Waray-Waray", category: "Days", createdAt: Date.now() - 200000 + i * 1000 },
    ]
  }),
  
  // === Food ===
  { id: uuidv4(), word: "Eat", meaning: "Kain", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 210000 },
  { id: uuidv4(), word: "Water", meaning: "Tubig", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 205000 },
  { id: uuidv4(), word: "Rice", meaning: "Kanin", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 202000 },
  { id: uuidv4(), word: "Delicious", meaning: "Masarap", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 201000 },
  { id: uuidv4(), word: "Chicken", meaning: "Manok", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 200000 },
  { id: uuidv4(), word: "Fish", meaning: "Isda", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 199000 },
  { id: uuidv4(), word: "Vegetable", meaning: "Gulay", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 198000 },
  { id: uuidv4(), word: "Fruit", meaning: "Prutas", language: "English", targetLanguage: "Tagalog", category: "Food", createdAt: Date.now() - 197000 },

  { id: uuidv4(), word: "Eat", meaning: "Kaon", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 110000 },
  { id: uuidv4(), word: "Water", meaning: "Tubig", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 105000 },
  { id: uuidv4(), word: "Rice", meaning: "Kanon/Humay", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 102000 }, // Bugas is uncooked
  { id: uuidv4(), word: "Delicious", meaning: "Lami", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 101000 },
  { id: uuidv4(), word: "Chicken", meaning: "Manok", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 100000 },
  { id: uuidv4(), word: "Fish", meaning: "Isda", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 99000 },
  { id: uuidv4(), word: "Vegetable", meaning: "Utan", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 98000 },
  { id: uuidv4(), word: "Fruit", meaning: "Prutas", language: "English", targetLanguage: "Bisaya", category: "Food", createdAt: Date.now() - 97000 },

  { id: uuidv4(), word: "Eat", meaning: "Kaon", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 10000 },
  { id: uuidv4(), word: "Water", meaning: "Tubig", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 5000 },
  { id: uuidv4(), word: "Rice", meaning: "Kan-on", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 2000 }, // Bugas is uncooked
  { id: uuidv4(), word: "Delicious", meaning: "Marasa", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 1000 },
  { id: uuidv4(), word: "Chicken", meaning: "Manok", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 900 },
  { id: uuidv4(), word: "Fish", meaning: "Isda", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 800 },
  { id: uuidv4(), word: "Vegetable", meaning: "Gulay/Utan", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 700 },
  { id: uuidv4(), word: "Fruit", meaning: "Prutas", language: "English", targetLanguage: "Waray-Waray", category: "Food", createdAt: Date.now() - 600 },

  // === Travel ===
  { id: uuidv4(), word: "Where is...", meaning: "Nasaan ang...", language: "English", targetLanguage: "Tagalog", category: "Travel", createdAt: Date.now() - 90000 },
  { id: uuidv4(), word: "Left", meaning: "Kaliwa", language: "English", targetLanguage: "Tagalog", category: "Travel", createdAt: Date.now() - 89000 },
  { id: uuidv4(), word: "Right", meaning: "Kanan", language: "English", targetLanguage: "Tagalog", category: "Travel", createdAt: Date.now() - 88000 },
  { id: uuidv4(), word: "Straight", meaning: "Diretso", language: "English", targetLanguage: "Tagalog", category: "Travel", createdAt: Date.now() - 87000 },
  { id: uuidv4(), word: "Street", meaning: "Kalsada/Daán", language: "English", targetLanguage: "Tagalog", category: "Travel", createdAt: Date.now() - 86000 },

  { id: uuidv4(), word: "Where is...", meaning: "Hain ang...", language: "English", targetLanguage: "Bisaya", category: "Travel", createdAt: Date.now() - 80000 },
  { id: uuidv4(), word: "Left", meaning: "Wala", language: "English", targetLanguage: "Bisaya", category: "Travel", createdAt: Date.now() - 79000 },
  { id: uuidv4(), word: "Right", meaning: "Tuo", language: "English", targetLanguage: "Bisaya", category: "Travel", createdAt: Date.now() - 78000 },
  { id: uuidv4(), word: "Straight", meaning: "Diretso", language: "English", targetLanguage: "Bisaya", category: "Travel", createdAt: Date.now() - 77000 },
  { id: uuidv4(), word: "Street", meaning: "Kalsada/Dalan", language: "English", targetLanguage: "Bisaya", category: "Travel", createdAt: Date.now() - 76000 },

  { id: uuidv4(), word: "Where is...", meaning: "Hain/Diin an...", language: "English", targetLanguage: "Waray-Waray", category: "Travel", createdAt: Date.now() - 70000 },
  { id: uuidv4(), word: "Left", meaning: "Wala", language: "English", targetLanguage: "Waray-Waray", category: "Travel", createdAt: Date.now() - 69000 },
  { id: uuidv4(), word: "Right", meaning: "Tuo", language: "English", targetLanguage: "Waray-Waray", category: "Travel", createdAt: Date.now() - 68000 },
  { id: uuidv4(), word: "Straight", meaning: "Diretso", language: "English", targetLanguage: "Waray-Waray", category: "Travel", createdAt: Date.now() - 67000 },
  { id: uuidv4(), word: "Street", meaning: "Kalsada/Dalan", language: "English", targetLanguage: "Waray-Waray", category: "Travel", createdAt: Date.now() - 66000 },

  // === Family ===
  { id: uuidv4(), word: "Mother", meaning: "Nanay/Ina", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 10000 },
  { id: uuidv4(), word: "Father", meaning: "Tatay/Ama", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 9000 },
  { id: uuidv4(), word: "Sibling", meaning: "Kapatid", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 8000 },
  { id: uuidv4(), word: "Child", meaning: "Anak", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 7500 },
  { id: uuidv4(), word: "Grandmother", meaning: "Lola", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 7400 },
  { id: uuidv4(), word: "Grandfather", meaning: "Lolo", language: "English", targetLanguage: "Tagalog", category: "Family", createdAt: Date.now() - 7300 },

  { id: uuidv4(), word: "Mother", meaning: "Nanay/Inahan", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 7000 },
  { id: uuidv4(), word: "Father", meaning: "Tatay/Amahan", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 6000 },
  { id: uuidv4(), word: "Sibling", meaning: "Igsoon", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 5000 },
  { id: uuidv4(), word: "Child", meaning: "Anak", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 4500 },
  { id: uuidv4(), word: "Grandmother", meaning: "Lola/Apohan nga babaye", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 4400 },
  { id: uuidv4(), word: "Grandfather", meaning: "Lolo/Apohan nga lalaki", language: "English", targetLanguage: "Bisaya", category: "Family", createdAt: Date.now() - 4300 },

  { id: uuidv4(), word: "Mother", meaning: "Nanay/Iroy", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 4000 },
  { id: uuidv4(), word: "Father", meaning: "Tatay/Amay", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 3000 },
  { id: uuidv4(), word: "Sibling", meaning: "Bugto", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 2000 },
  { id: uuidv4(), word: "Child", meaning: "Anak", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 1500 },
  { id: uuidv4(), word: "Grandmother", meaning: "Lola/Apoy nga babaye", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 1400 },
  { id: uuidv4(), word: "Grandfather", meaning: "Lolo/Apoy nga lalaki", language: "English", targetLanguage: "Waray-Waray", category: "Family", createdAt: Date.now() - 1300 },

  // === Adjectives ===
  { id: uuidv4(), word: "Big", meaning: "Malaki", language: "English", targetLanguage: "Tagalog", category: "Adjectives", createdAt: Date.now() - 60000 },
  { id: uuidv4(), word: "Small", meaning: "Maliit", language: "English", targetLanguage: "Tagalog", category: "Adjectives", createdAt: Date.now() - 59000 },
  { id: uuidv4(), word: "Happy", meaning: "Masaya", language: "English", targetLanguage: "Tagalog", category: "Adjectives", createdAt: Date.now() - 58000 },
  { id: uuidv4(), word: "Beautiful", meaning: "Maganda", language: "English", targetLanguage: "Tagalog", category: "Adjectives", createdAt: Date.now() - 57000 },

  { id: uuidv4(), word: "Big", meaning: "Dako", language: "English", targetLanguage: "Bisaya", category: "Adjectives", createdAt: Date.now() - 50000 },
  { id: uuidv4(), word: "Small", meaning: "Gamay", language: "English", targetLanguage: "Bisaya", category: "Adjectives", createdAt: Date.now() - 49000 },
  { id: uuidv4(), word: "Happy", meaning: "Malipayon", language: "English", targetLanguage: "Bisaya", category: "Adjectives", createdAt: Date.now() - 48000 },
  { id: uuidv4(), word: "Beautiful", meaning: "Gwapa/Matahom", language: "English", targetLanguage: "Bisaya", category: "Adjectives", createdAt: Date.now() - 47000 },

  { id: uuidv4(), word: "Big", meaning: "Dako", language: "English", targetLanguage: "Waray-Waray", category: "Adjectives", createdAt: Date.now() - 40000 },
  { id: uuidv4(), word: "Small", meaning: "Gamay", language: "English", targetLanguage: "Waray-Waray", category: "Adjectives", createdAt: Date.now() - 39000 },
  { id: uuidv4(), word: "Happy", meaning: "Malipayon", language: "English", targetLanguage: "Waray-Waray", category: "Adjectives", createdAt: Date.now() - 38000 },
  { id: uuidv4(), word: "Beautiful", meaning: "Mahusay/Gwapa", language: "English", targetLanguage: "Waray-Waray", category: "Adjectives", createdAt: Date.now() - 37000 },

  // === Verbs ===
  { id: uuidv4(), word: "Go", meaning: "Punta", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 30000 },
  { id: uuidv4(), word: "Want", meaning: "Gusto", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 29000 },
  { id: uuidv4(), word: "Read", meaning: "Basa", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 28000 },
  { id: uuidv4(), word: "Write", meaning: "Sulat", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 27500 },
  { id: uuidv4(), word: "Speak", meaning: "Salita", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 27400 },
  { id: uuidv4(), word: "See", meaning: "Kita", language: "English", targetLanguage: "Tagalog", category: "Verbs", createdAt: Date.now() - 27300 },

  { id: uuidv4(), word: "Go", meaning: "Adto/Larga", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 27000 },
  { id: uuidv4(), word: "Want", meaning: "Gusto/Buot", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 26000 },
  { id: uuidv4(), word: "Read", meaning: "Basa", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 25000 },
  { id: uuidv4(), word: "Write", meaning: "Sulat", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 24500 },
  { id: uuidv4(), word: "Speak", meaning: "Sulti/Isturya", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 24400 },
  { id: uuidv4(), word: "See", meaning: "Kita/Tan-aw", language: "English", targetLanguage: "Bisaya", category: "Verbs", createdAt: Date.now() - 24300 },

  { id: uuidv4(), word: "Go", meaning: "Kadto/Lakat", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 24000 },
  { id: uuidv4(), word: "Want", meaning: "Gusto/Buot", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 23000 },
  { id: uuidv4(), word: "Read", meaning: "Basa", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 22000 },
  { id: uuidv4(), word: "Write", meaning: "Surat", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 21500 },
  { id: uuidv4(), word: "Speak", meaning: "Yakan/Sulti", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 21400 },
  { id: uuidv4(), word: "See", meaning: "Kita/Tan-aw", language: "English", targetLanguage: "Waray-Waray", category: "Verbs", createdAt: Date.now() - 21300 },
];


interface GlobalAppContextType {
  sourceLanguage: Language;
  setSourceLanguage: (language: Language) => void;
  targetLanguage: Language;
  setTargetLanguage: (language: Language) => void;
  words: WordEntry[];
  addWord: (word: Omit<WordEntry, 'id' | 'createdAt' | 'aiSentences'>) => WordEntry;
  editWord: (updatedWord: WordEntry) => void;
  deleteWord: (wordId: string) => void;
  getWordsForCategory: (language: Language, category?: string) => WordEntry[];
  getWordsForFlashcards: () => WordEntry[];
  categories: string[];
  quizScores: QuizScore[];
  addQuizScore: (score: Omit<QuizScore, 'date'>) => void;
  clearWords: () => void;
  clearQuizScores: () => void;
}

const GlobalAppContext = createContext<GlobalAppContextType | undefined>(undefined);

export function GlobalAppContextProvider({ children }: { children: ReactNode }) {
  const [sourceLanguage, setSourceLanguage] = useLocalStorage<Language>('sourceLanguage', SUPPORTED_LANGUAGES[0]);
  const [targetLanguage, setTargetLanguage] = useLocalStorage<Language>('targetLanguage', SUPPORTED_LANGUAGES[1]);
  const [words, setWords] = useLocalStorage<WordEntry[]>('wordList', initialWords);
  const [quizScores, setQuizScores] = useLocalStorage<QuizScore[]>('quizScores', []);

  const addWord = useCallback((wordData: Omit<WordEntry, 'id' | 'createdAt' | 'aiSentences'>): WordEntry => {
    const newWord: WordEntry = {
      ...wordData,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    setWords(prevWords => [...prevWords, newWord]);
    return newWord;
  }, [setWords]);

  const editWord = useCallback((updatedWord: WordEntry) => {
    setWords(prevWords => prevWords.map(w => w.id === updatedWord.id ? updatedWord : w));
  }, [setWords]);

  const deleteWord = useCallback((wordId: string) => {
    setWords(prevWords => prevWords.filter(w => w.id !== wordId));
  }, [setWords]);

  const clearWords = useCallback(() => {
    setWords([]);
  }, [setWords]);
  
  const getWordsForCategory = useCallback((language: Language, category?: string): WordEntry[] => {
    return words.filter(word => 
      word.language === language && 
      (category ? word.category?.toLowerCase() === category.toLowerCase() : true)
    );
  }, [words]);

  const getWordsForFlashcards = useCallback((): WordEntry[] => {
    return words.filter(word => word.language === sourceLanguage && word.targetLanguage === targetLanguage);
  }, [words, sourceLanguage, targetLanguage]);

  const categories = React.useMemo(() => {
    const allCategories = new Set(words.map(w => w.category).filter(Boolean) as string[]);
    return Array.from(allCategories).sort((a,b) => a.localeCompare(b));
  }, [words]);

  const addQuizScore = useCallback((scoreData: Omit<QuizScore, 'date'>) => {
    const newScore: QuizScore = {
      ...scoreData,
      date: Date.now(),
    };
    setQuizScores(prevScores => [...prevScores, newScore]);
  }, [setQuizScores]);

  const clearQuizScores = useCallback(() => {
    setQuizScores([]);
  }, [setQuizScores]);

  return (
    <GlobalAppContext.Provider value={{
      sourceLanguage,
      setSourceLanguage,
      targetLanguage,
      setTargetLanguage,
      words,
      addWord,
      editWord,
      deleteWord,
      getWordsForCategory,
      getWordsForFlashcards,
      categories,
      quizScores,
      addQuizScore,
      clearWords,
      clearQuizScores
    }}>
      {children}
    </GlobalAppContext.Provider>
  );
}

export default GlobalAppContext;
