
"use client";

import AppLayout from '@/components/layout/AppLayout';
import QuickTranslator from '@/components/QuickTranslator'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Layers, HelpCircle, Sparkles, Languages, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const featureCards = [
  {
    title: 'Embark on a Learning Journey',
    description: 'Access guided lessons, tutorials, and challenges like Duolingo.',
    icon: GraduationCap,
    href: '/learn/select-language', // Updated Link
    color: 'text-indigo-500',
    dataAiHint: 'graduation cap book',
  },
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
  }
];

export default function HomePage() {
  return (
    <AppLayout>
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Welcome to <span className="text-primary">LeyText Learn</span>!
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your personal guide to mastering Tagalog, English, Bisaya, and Waray-Waray. 
          Start your language learning journey today!
        </p>
      </div>

      <div className="mb-12">
        <QuickTranslator /> 
      </div>
      
      <h2 className="text-3xl font-bold text-center mb-8">Explore Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
              src="https://placehold.co/150x150.png" 
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
              Explore the features or kickstart your structured learning journey to master your chosen languages!
            </p>
            <Button asChild size="lg">
              <Link href="/learn/select-language">Let's Learn <GraduationCap className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

    </AppLayout>
  );
}
