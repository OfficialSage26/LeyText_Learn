
"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import QuickTranslator from '@/components/QuickTranslator'; // Import the QuickTranslator

export default function HomePage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center text-center space-y-8 py-10">
        
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="text-primary">LeyText Learn</span>!
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            Your personal guide to mastering Tagalog, English, Bisaya, and Waray-Waray. Translate instantly or start your learning journey.
          </p>
        </div>

        {/* Embed the QuickTranslator component */}
        <div className="w-full max-w-2xl">
          <QuickTranslator />
        </div>

        <div className="mt-8"> {/* Added margin-top for spacing */}
          <Button asChild size="lg" className="px-10 py-6 text-lg">
            <Link href="/learn/select-language">
              <GraduationCap className="mr-3 h-6 w-6" />
              Start Learning
            </Link>
          </Button>
        </div>
        
        {/* Removed the LeyText Learn App Icon Image as QuickTranslator now takes prominence */}
        {/* Removed the small feature card as well */}

      </div>
    </AppLayout>
  );
}
