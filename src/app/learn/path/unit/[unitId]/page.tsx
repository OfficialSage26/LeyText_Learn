
"use client";

import React, { use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { getUnitById } from '@/config/learningPath';

export default function UnitPage({ params: paramsPromise }: { params: { unitId: string } }) {
  const params = use(paramsPromise as Promise<{ unitId: string }>);
  const { unitId } = params;
  const { targetLanguage } = useGlobalAppContext();

  const unit = getUnitById(unitId);

  if (!unit) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <Card className="max-w-lg mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold">Unit Not Found</CardTitle>
              <CardDescription className="text-lg">The unit ID "{unitId}" does not correspond to any known unit.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/learn/path">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-grow">
            <div className="flex items-start sm:items-center gap-3 mb-2">
              <unit.icon className="w-10 h-10 text-primary flex-shrink-0 mt-1 sm:mt-0" />
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">{unit.title} - Learning {targetLanguage}</CardTitle>
            </div>
            <CardDescription className="text-base sm:text-lg">{unit.description}</CardDescription>
          </div>
          <Button asChild variant="outline" className="self-start sm:self-center mt-4 sm:mt-0">
            <Link href="/learn/path">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Learning Path
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Lessons in this Unit</CardTitle>
            <CardDescription>Select a lesson to start learning specific vocabulary and concepts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {unit.lessons && unit.lessons.length > 0 ? (
              unit.lessons.map((lesson) => (
                <Card 
                  key={lesson.slug} 
                  className="hover:shadow-md transition-shadow duration-200"
                  aria-labelledby={`lesson-title-${lesson.slug}`}
                  aria-describedby={`lesson-desc-${lesson.slug}`}
                >
                  <Link href={`/learn/path/unit/${unitId}/lesson/${lesson.slug}`} className="block p-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <lesson.icon className="w-7 h-7 text-primary flex-shrink-0" />
                        <div>
                           <h3 id={`lesson-title-${lesson.slug}`} className="text-lg font-semibold group-hover:text-primary">{lesson.title}</h3>
                           <p id={`lesson-desc-${lesson.slug}`} className="text-sm text-muted-foreground">{lesson.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                </Card>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="mx-auto h-10 w-10 mb-3" />
                Lessons for this unit are coming soon!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
