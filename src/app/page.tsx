"use client";

import AppLayout from '@/components/layout/AppLayout';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Layers, HelpCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const featureCards = [
  {
    title: 'Custom Word Lists',
    description: 'Create, manage, and categorize your personal vocabulary lists.',
    icon: BookOpen,
    href: '/word-lists',
    color: 'text-purple-500',
    dataAiHint: 'notebook pen',
  },
  {
    title: 'Interactive Flashcards',
    description: 'Practice vocabulary with engaging, swipeable flashcards.',
    icon: Layers,
    href: '/flashcards',
    color: 'text-blue-500',
    dataAiHint: 'cards learning',
  },
  {
    title: 'Language Quizzes',
    description: 'Test your knowledge with multiple-choice quizzes.',
    icon: HelpCircle,
    href: '/quizzes',
    color: 'text-green-500',
    dataAiHint: 'quiz test',
  },
  {
    title: 'AI Example Sentences',
    description: 'Get AI-powered example sentences to understand context better.',
    icon: Sparkles,
    href: '/word-lists', // Integrated into word lists
    color: 'text-yellow-500',
    dataAiHint: 'ai robot',
  },
];

export default function HomePage() {
  return (
    <AppLayout>
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="text-primary">LinguaLeap</span>!
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your personal guide to mastering Tagalog, English, Bisaya, and Waray-Waray. 
          Start your language learning journey today!
        </p>
      </div>

      <LanguageSelector />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {featureCards.map((feature) => (
          <Link href={feature.href} key={feature.title} legacyBehavior>
            <a className="block hover:no-underline">
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <feature.icon className={`w-10 h-10 ${feature.color} group-hover:scale-110 transition-transform`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
      
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Image 
              src="https://placehold.co/200x200.png" 
              alt="Learn Languages" 
              width={150} 
              height={150} 
              className="rounded-lg shadow-md"
              data-ai-hint="language book" 
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Ready to Dive In?</h2>
            <p className="text-muted-foreground mb-4">
              Select your languages above and explore the features to start learning. 
              Add words to your list, practice with flashcards, and test yourself with quizzes!
            </p>
            <Button asChild size="lg">
              <Link href="/word-lists">Get Started <BookOpen className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

    </AppLayout>
  );
}
