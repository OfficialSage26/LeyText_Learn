
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useGlobalAppContext } from '@/hooks/useGlobalAppContext';

export default function LearningPathPage() {
  const { targetLanguage } = useGlobalAppContext();

  return (
    <AppLayout>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
                <Map className="w-10 h-10 text-primary" />
                <CardTitle className="text-3xl sm:text-4xl font-bold">Your Learning Path for {targetLanguage}</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Follow guided lessons, progress through levels, and build a strong foundation in {targetLanguage}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Image 
              src="https://placehold.co/800x400.png" 
              alt="Learning Path Illustration" 
              width={800} 
              height={400} 
              className="rounded-lg shadow-md mx-auto mb-6"
              data-ai-hint="road map progress"
            />
            <p className="text-muted-foreground text-xl mb-8">
              Exciting learning content coming soon! Stay tuned for structured lessons and activities.
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
