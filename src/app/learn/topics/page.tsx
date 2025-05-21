
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Users, Utensils, MapPin, Users2, Clock, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';

const sampleTopics = [
  { name: "Greetings & Introductions", icon: Users, dataAiHint: "handshake people" },
  { name: "Food & Dining", icon: Utensils, dataAiHint: "restaurant food" },
  { name: "Travel & Directions", icon: MapPin, dataAiHint: "map location" },
  { name: "Family & Relationships", icon: Users2, dataAiHint: "family people" },
  { name: "Numbers & Time", icon: Clock, dataAiHint: "clock calendar" },
  { name: "Common Verbs", icon: Lightbulb, dataAiHint: "idea action" },
  { name: "Shopping", icon: Users, dataAiHint: "store cart" }, // Re-using Users icon for variety
  { name: "Work & School", icon: BookOpen, dataAiHint: "office study" },
];


export default function ExploreTopicsPage() {
  const { targetLanguage } = useGlobalAppContext();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-10 h-10 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold">Explore {targetLanguage} Topics</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Dive into specific themes to expand your {targetLanguage} vocabulary and understanding. Select a topic to begin (further content coming soon).
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/learn">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Learn Menu
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleTopics.map((topic) => (
            <Card 
              key={topic.name} 
              className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
              tabIndex={0} // Make it focusable
              // onClick={() => alert(`Navigating to ${topic.name} - Content coming soon!`)} // Placeholder action
              // onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && alert(`Navigating to ${topic.name} - Content coming soon!`)} // Placeholder action
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col items-center text-center">
                  <topic.icon className="w-12 h-12 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl">{topic.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground text-center">
                  Learn words and phrases related to {topic.name.toLowerCase()} in {targetLanguage}.
                </p>
              </CardContent>
              {/* <CardFooter className="pt-3">
                <Button variant="ghost" className="w-full text-primary group-hover:bg-primary/10">
                  Explore Topic (Soon)
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
         <p className="text-center text-muted-foreground mt-12">
            More topics and interactive content for each topic are on their way!
          </p>
      </div>
    </AppLayout>
  );
}
