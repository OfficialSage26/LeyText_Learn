
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, Map, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';

const learningSections = [
  {
    title: "Your Learning Path",
    description: "Follow guided lessons and track your progress through different language levels.",
    icon: Map,
    href: "/learn/path",
    imageSrc: "https://img.freepik.com/premium-vector/path-icon-vector-illustration_118339-2634.jpg?w=900",
    altText: "Illustration of a winding path representing a learning journey.",
    dataAiHint: "path journey",
    cta: "Start Path",
  },
  {
    title: "Explore Topics",
    description: "Dive into specific themes like travel, food, or business conversations.",
    icon: BookOpen,
    href: "/learn/topics",
    imageSrc: "https://ocrelationshipcenter.com/wp-content/uploads/2018/09/topic.jpg",
    altText: "Illustration representing topic exploration.",
    dataAiHint: "topic discussion",
    cta: "Browse Topics",
  },
  {
    title: "Practice Challenges",
    description: "Test your skills with interactive exercises and real-world scenarios.",
    icon: Zap,
    href: "/learn/challenges",
    imageSrc: "https://th.bing.com/th/id/OIP.GtGSWulfLvjfOIbQ5RAWmgHaHa?rs=1&pid=ImgDetMain",
    altText: "Illustration of game elements representing practice challenges.",
    dataAiHint: "challenge game",
    cta: "Take a Challenge",
  }
];

export default function LearnPage() {
  const { targetLanguage } = useGlobalAppContext();

  return (
    <AppLayout>
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Let's Learn {targetLanguage}!
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Embark on your language learning journey in {targetLanguage}. Explore structured paths, dive into topics, or challenge your skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {learningSections.map((section) => (
          <Card key={section.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative w-full h-40 sm:h-48">
              <Image 
                src={section.imageSrc} 
                alt={section.altText}
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
              <Button asChild className="w-full">
                <Link href={section.href}>{section.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Image 
              src="https://placehold.co/150x150.png" 
              alt="LeyText Learn mascot, an owl with a book." 
              width={150} 
              height={150} 
              className="rounded-lg shadow-md w-24 h-24 sm:w-36 sm:h-36"
              data-ai-hint="owl book"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Ready to Start Learning {targetLanguage}?</h2>
            <p className="text-muted-foreground mb-4">
              Choose a section above to begin your adventure. New content and features will be added regularly to help you achieve fluency in {targetLanguage}!
            </p>
            <Button variant="outline" disabled>
              View Progress (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/learn/select-language">
            <ArrowLeft className="mr-2 h-4 w-4" /> Change Language to Learn
          </Link>
        </Button>
      </div>
    </AppLayout>
  );
}
