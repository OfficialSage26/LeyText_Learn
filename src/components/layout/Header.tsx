"use client";

import Link from 'next/link';
import { LogoIcon } from '@/components/icons/LogoIcon';
import NavMenu from './NavMenu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

export default function Header() {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <LogoIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">LinguaLeap</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {/* Placeholder for mobile menu if needed, or full menu on desktop */}
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <LogoIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">LinguaLeap</span>
        </Link>
        
        <div className="hidden md:flex flex-1 items-center justify-end">
          <NavMenu />
        </div>

        <div className="md:hidden flex flex-1 items-center justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] p-0">
              <div className="p-4">
                <Link href="/" className="flex items-center space-x-2 mb-4">
                  <LogoIcon className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">LinguaLeap</span>
                </Link>
              </div>
              <NavMenu isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
