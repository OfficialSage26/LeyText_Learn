
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, BookOpenText, MessageCircle, Building, Briefcase, Star } from 'lucide-react';
import Link from 'next/link';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';

const learningUnits = [
  {
    id: "unit1",
    title: "Unit 1: Foundations",
    description: "Learn the absolute basics: alphabet, pronunciation, and simple greetings.",
    icon: BookOpenText,
    status: "Not Started",
    lessons: 5,
    dataAiHint: "alphabet book",
  },
  {
    id: "unit2",
    title: "Unit 2: Everyday Greetings & Introductions",
    description: "Master common greetings, introductions, and essential polite phrases.",
    icon: MessageCircle,
    status: "Not Started",
    lessons: 8,
    dataAiHint: "chat conversation",
  },
  {
    id: "unit3",
    title: "Unit 3: People & Family",
    description: "Talk about yourself, family members, and describe people.",
    icon: Building, // Using Building as a placeholder, could be Users icon
    status: "Not Started",
    lessons: 7,
    dataAiHint: "family people",
  },
  {
    id: "unit4",
    title: "Unit 4: Basic Verbs & Actions",
    description: "Learn essential verbs and how to form simple sentences about actions.",
    icon: Briefcase, // Using Briefcase as placeholder for actions
    status: "Not Started",
    lessons: 10,
    dataAiHint: "action run",
  },
];

export default function LearningPathPage() {
  const { targetLanguage } = useGlobalAppContext();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <Map className="w-10 h-10 text-primary" />
                <CardTitle className="text-3xl sm:text-4xl font-bold">Your Learning Path for {targetLanguage}</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Follow these units to build your {targetLanguage} skills step by step. Each unit contains lessons and activities.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="mt-4 sm:mt-0">
            <Link href="/learn">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Learn Menu
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningUnits.map((unit, index) => (
            <Card key={unit.id} className="shadow-lg flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <unit.icon className="w-8 h-8 text-primary" />
                    <CardTitle className="text-xl">{unit.title}</CardTitle>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    unit.status === "Completed" ? "bg-green-100 text-green-700" : 
                    unit.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {unit.status}
                  </span>
                </div>
                <CardDescription>{unit.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">Contains approximately {unit.lessons} lessons.</p>
              </CardContent>
              <CardFooter>
                {unit.id === "unit1" ? (
                  <Button asChild className="w-full">
                    <Link href={`/learn/path/unit/${unit.id}`}>
                      <Star className="mr-2 h-4 w-4" /> Start Unit {index + 1}
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" disabled> 
                    <Star className="mr-2 h-4 w-4" /> Start Unit {index + 1} (Soon)
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12">
          More units and interactive lessons are coming soon! Track your progress as you complete each one.
        </p>
      </div>
    </AppLayout>
  );
}
