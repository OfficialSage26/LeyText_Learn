
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, Map } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const learningSections = [
  {
    title: "Your Learning Path",
    description: "Follow guided lessons and track your progress through different language levels.",
    icon: Map,
    href: "/learn/path", // Placeholder link
    imageSrc: "https://placehold.co/600x400.png",
    dataAiHint: "map journey",
    cta: "Start Path",
  },
  {
    title: "Explore Topics",
    description: "Dive into specific themes like travel, food, or business conversations.",
    icon: BookOpen,
    href: "/learn/topics", // Placeholder link
    imageSrc: "https://placehold.co/600x400.png",
    dataAiHint: "books library",
    cta: "Browse Topics",
  },
  {
    title: "Practice Challenges",
    description: "Test your skills with interactive exercises and real-world scenarios.",
    icon: Zap,
    href: "/learn/challenges", // Placeholder link
    imageSrc: "https://placehold.co/600x400.png",
    dataAiHint: "game controller",
    cta: "Take a Challenge",
  }
];

export default function LearnPage() {
  return (
    <AppLayout>
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Let's Learn!
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Embark on your language learning journey. Explore structured paths, dive into topics, or challenge your skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {learningSections.map((section) => (
          <Card key={section.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-full h-48">
              <Image 
                src={section.imageSrc} 
                alt={section.title} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={section.dataAiHint}
              />
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <section.icon className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow" />
            <CardContent className="p-6 pt-0">
               {/* Hiding button for now as links are placeholders */}
              {/* <Button asChild className="w-full">
                <Link href={section.href}>{section.cta}</Link>
              </Button> */}
               <p className="text-sm text-muted-foreground text-center">Content coming soon!</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Image 
              src="https://placehold.co/150x150.png" 
              alt="LeyText Learn mascot" 
              width={150} 
              height={150} 
              className="rounded-lg shadow-md"
              data-ai-hint="owl book"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Ready to Start Learning?</h2>
            <p className="text-muted-foreground mb-4">
              Choose a section above to begin your adventure. New content and features will be added regularly to help you achieve fluency!
            </p>
            <Button variant="outline" disabled>
              View Progress (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

    </AppLayout>
  );
}
