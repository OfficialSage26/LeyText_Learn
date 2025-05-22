
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center text-center space-y-8 py-10">
        <Image 
          src="https://placehold.co/200x200.png" 
          alt="LeyText Learn App Icon - a stylized representation of language and learning." 
          width={150} 
          height={150} 
          className="rounded-2xl shadow-lg"
          data-ai-hint="language learning mobile app" 
        />
        
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="text-primary">LeyText Learn</span>!
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">
            Your personal guide to mastering Tagalog, English, Bisaya, and Waray-Waray on the go.
          </p>
        </div>

        <Button asChild size="lg" className="px-10 py-6 text-lg">
          <Link href="/learn/select-language">
            <GraduationCap className="mr-3 h-6 w-6" />
            Start Learning
          </Link>
        </Button>

        <Card className="mt-10 w-full max-w-md bg-secondary/30">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Explore features like Word Lists, Flashcards, Quizzes, and the Translator using the navigation menu.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
