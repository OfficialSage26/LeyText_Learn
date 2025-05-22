
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
            <div className="flex items-center gap-3 mb-2">
                <Zap className="w-10 h-10 text-primary" />
                <CardTitle className="text-3xl sm:text-4xl font-bold">{targetLanguage} Practice Challenges</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Test your {targetLanguage} skills with interactive exercises, quizzes, and real-world scenarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Image 
              src="https://placehold.co/800x400.png" 
              alt="Illustration of game elements like puzzles or achievement badges, representing practice challenges." 
              width={800} 
              height={400} 
              className="rounded-lg shadow-md mx-auto mb-6"
              data-ai-hint="game puzzle achievement"
            />
            <p className="text-muted-foreground text-xl mb-8">
              Engaging challenges and skill-testing activities will be available soon!
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href="/learn">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Learn Menu
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
