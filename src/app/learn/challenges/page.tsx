
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';

export default function PracticeChallengesPage() {
  const { targetLanguage } = useGlobalAppContext();

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div className="flex items-start sm:items-center gap-3">
                    <Zap className="w-10 h-10 text-primary flex-shrink-0 mt-1 sm:mt-0" />
                    <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">{targetLanguage} Practice Challenges</CardTitle>
                </div>
                <Button asChild variant="outline" className="self-start sm:self-center mt-4 sm:mt-0 whitespace-nowrap">
                    <Link href="/learn">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Learn Menu
                    </Link>
                </Button>
            </div>
            <CardDescription className="text-base sm:text-lg mt-4">
              Test your {targetLanguage} skills with interactive exercises, quizzes, and real-world scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative w-full max-w-2xl mx-auto aspect-[2/1] mb-6">
              <Image 
                src="https://placehold.co/800x400.png" 
                alt="Illustration of game elements like puzzles or achievement badges, representing practice challenges." 
                layout="fill"
                objectFit="contain"
                className="rounded-lg shadow-md"
                data-ai-hint="game puzzle achievement"
              />
            </div>
            <p className="text-muted-foreground text-lg sm:text-xl mb-8">
              Engaging challenges and skill-testing activities will be available soon!
            </p>
            {/* The Back to Learn Menu button is now in the header for this page layout */}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
