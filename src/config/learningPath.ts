
import type { LucideIcon } from 'lucide-react';
import { BookOpenText, MessageSquare, Hash, Palette, CalendarDays, Users, Briefcase, Lightbulb, Info, Utensils, MapPin, Building2, ShoppingCart } from 'lucide-react';

export interface LessonConfig {
  slug: string;
  title: string;
  category: string; // Category from WordEntry
  icon: LucideIcon;
  description: string;
}

export interface UnitConfig {
  id: string; // e.g., "unit1"
  title: string;
  description: string;
  icon: LucideIcon;
  lessons: LessonConfig[];
}

// Helper to get an icon based on category, can be expanded
const getIconForCategory = (category: string): LucideIcon => {
  const catLower = category.toLowerCase();
  if (catLower.includes('greeting')) return MessageSquare;
  if (catLower.includes('phrase')) return MessageSquare;
  if (catLower.includes('number')) return Hash;
  if (catLower.includes('color')) return Palette;
  if (catLower.includes('day')) return CalendarDays;
  if (catLower.includes('famil')) return Users;
  if (catLower.includes('verb')) return Briefcase;
  if (catLower.includes('food') || catLower.includes('dining')) return Utensils;
  if (catLower.includes('travel') || catLower.includes('direction')) return MapPin;
  if (catLower.includes('shopping')) return ShoppingCart;
  if (catLower.includes('work') || catLower.includes('school')) return Building2;
  return Info;
};


export const learningPathConfig: UnitConfig[] = [
  {
    id: "unit1",
    title: "Unit 1: Foundations",
    description: "Build your core vocabulary with essential greetings, phrases, numbers, colors, and days.",
    icon: BookOpenText,
    lessons: [
      { slug: "greetings", title: "Lesson 1: Basic Greetings", category: "Greetings", icon: getIconForCategory("Greetings"), description: "Learn to greet people and introduce yourself." },
      { slug: "common-phrases", title: "Lesson 2: Common Phrases", category: "Common Phrases", icon: getIconForCategory("Common Phrases"), description: "Master everyday useful phrases." },
      { slug: "numbers", title: "Lesson 3: Numbers (1-5)", category: "Numbers", icon: getIconForCategory("Numbers"), description: "Learn to count and use basic numbers." },
      { slug: "colors", title: "Lesson 4: Basic Colors", category: "Colors", icon: getIconForCategory("Colors"), description: "Identify and name common colors." },
      { slug: "days", title: "Lesson 5: Days of the Week", category: "Days", icon: getIconForCategory("Days"), description: "Learn the days of the week." },
    ],
  },
  {
    id: "unit2",
    title: "Unit 2: Everyday Interactions",
    description: "Focus on practical conversations for daily life. (Content Coming Soon)",
    icon: MessageSquare,
    lessons: [
      // Example: { slug: "ordering-food", title: "Lesson 1: Ordering Food", category: "Food", icon: getIconForCategory("Food"), description: "Learn how to order at a restaurant." },
    ],
  },
  {
    id: "unit3",
    title: "Unit 3: People & Descriptions",
    description: "Learn to talk about people, family, and describe things. (Content Coming Soon)",
    icon: Users,
    lessons: [
      // Example: { slug: "family-members", title: "Lesson 1: Family Members", category: "Family", icon: getIconForCategory("Family"), description: "Learn vocabulary for family members." },
    ],
  },
  {
    id: "unit4",
    title: "Unit 4: Actions & Verbs",
    description: "Expand your knowledge of common verbs and how to use them. (Content Coming Soon)",
    icon: Briefcase,
    lessons: [
       // Example: { slug: "common-verbs-1", title: "Lesson 1: Common Verbs Part 1", category: "Verbs", icon: getIconForCategory("Verbs"), description: "Learn essential verbs." },
    ],
  },
];

export const getUnitById = (unitId: string): UnitConfig | undefined => {
  return learningPathConfig.find(unit => unit.id === unitId);
};

export const getLessonBySlug = (unitId: string, lessonSlug: string): LessonConfig | undefined => {
  const unit = getUnitById(unitId);
  return unit?.lessons.find(lesson => lesson.slug === lessonSlug);
};
