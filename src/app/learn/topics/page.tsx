
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Users, Utensils, MapPin, Users2, Clock, Lightbulb, ShoppingCart, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { slugify } from '@/lib/utils'; 

const sampleTopics = [
  { name: "Greetings & Introductions", icon: Users, dataAiHint: "handshake people", ariaLabel: "Explore Greetings and Introductions topic", category: "Greetings" },
  { name: "Food & Dining", icon: Utensils, dataAiHint: "restaurant food", ariaLabel: "Explore Food and Dining topic", category: "Food" },
  { name: "Travel & Directions", icon: MapPin, dataAiHint: "map location", ariaLabel: "Explore Travel and Directions topic", category: "Travel" },
  { name: "Family & Relationships", icon: Users2, dataAiHint: "family people", ariaLabel: "Explore Family and Relationships topic", category: "Family" },
  { name: "Numbers & Time", icon: Clock, dataAiHint: "clock calendar", ariaLabel: "Explore Numbers and Time topic", category: "Numbers" },
  { name: "Common Verbs", icon: Lightbulb, dataAiHint: "idea action", ariaLabel: "Explore Common Verbs topic", category: "Verbs" },
  { name: "Shopping", icon: ShoppingCart, dataAiHint: "store cart", ariaLabel: "Explore Shopping topic", category: "Shopping" },
  { name: "Work & School", icon: Building2, dataAiHint: "office study", ariaLabel: "Explore Work and School topic", category: "Work" },
];


export default function ExploreTopicsPage() {
  const { targetLanguage } = useGlobalAppContext();

  // Categories that are currently active and will have clickable links
  const activeTopics = ["Greetings", "Food", "Travel", "Family", "Numbers", "Verbs", "Shopping", "Work"]; 

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-start sm:items-center gap-3 mb-2">
              <BookOpen className="w-10 h-10 text-primary flex-shrink-0 mt-1 sm:mt-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" aria-label={`Explore ${targetLanguage} Topics`}>Explore {targetLanguage} Topics</h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground">
              Dive into specific themes to expand your {targetLanguage} vocabulary and understanding. Select a topic to begin.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-center mt-4 sm:mt-0">
            <Link href="/learn">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Learn Menu
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sampleTopics.map((topic) => {
            const topicSlug = slugify(topic.category || topic.name);
            // Check if the topic's category is in the activeTopics array
            const isTopicActive = activeTopics.includes(topic.category || topic.name);

            return (
              <Card 
                key={topic.name} 
                className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group flex flex-col"
                aria-label={topic.ariaLabel}
              >
                <CardHeader className="pb-3 flex-grow">
                  <div className="flex flex-col items-center text-center h-full">
                    <topic.icon className="w-12 h-12 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-xl">{topic.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground text-center">
                    Learn words related to {topic.name.toLowerCase()} in {targetLanguage}.
                  </p>
                </CardContent>
                <CardFooter className="pt-3 mt-auto">
                  {isTopicActive ? (
                    <Button asChild className="w-full group-hover:bg-primary/90" variant="default">
                      <Link href={`/learn/topics/${topicSlug}`}>
                        Explore Topic <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full text-primary group-hover:bg-primary/10" disabled>
                      Explore (Soon)
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
         <p className="text-center text-muted-foreground mt-12">
            More topics and interactive content for each topic are on their way!
          </p>
      </div>
    </AppLayout>
  );
}
