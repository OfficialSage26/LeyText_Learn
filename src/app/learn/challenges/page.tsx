
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, Puzzle, ListChecks, Ear } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';

const challengeTypes = [
  {
    title: "Vocabulary Speed Quiz",
    description: "Test your word recognition against the clock.",
    icon: Zap,
    dataAiHint: "stopwatch quiz",
    status: "Coming Soon"
  },
  {
    title: "Sentence Builder",
    description: "Drag and drop words to form correct sentences.",
    icon: Puzzle,
    dataAiHint: "puzzle blocks",
    status: "Coming Soon"
  },
  {
    title: "Listening Comprehension",
    description: "Listen to audio clips and answer questions.",
    icon: Ear,
    dataAiHint: "headphones audio",
    status: "Coming Soon"
  },
   {
    title: "Translation Challenge",
    description: "Translate phrases from and to your target language.",
    icon: ListChecks, // Using ListChecks as a generic "task" icon
    dataAiHint: "translate checklist",
    status: "Coming Soon"
  }
];

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
              Test your {targetLanguage} skills with interactive exercises. Select a challenge type below to get started (more coming soon!).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challengeTypes.map((challenge) => (
                <Card key={challenge.title} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <challenge.icon className="w-7 h-7 text-primary" />
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    </div>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow" />
                  <CardFooter>
                    <Button className="w-full" disabled>
                      {challenge.status}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <Image 
            src="https://placehold.co/800x300.png" 
            alt="Banner showing diverse learning activities and challenges." 
            width={800}
            height={300}
            className="rounded-lg shadow-md mx-auto"
            data-ai-hint="learning game achievement"
          />
          <p className="text-muted-foreground text-lg sm:text-xl mt-6 mb-8">
            More engaging challenges and skill-testing activities are being developed and will be available soon! Get ready to put your {targetLanguage} knowledge to the test.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
