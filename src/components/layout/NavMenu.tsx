
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, HelpCircle, Languages, GraduationCap } from 'lucide-react';

const navItems = [
  { href: '/learn/select-language', label: 'Learn', icon: GraduationCap }, // Updated Link
  { href: '/word-lists', label: 'Word Lists', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  { href: '/translate', label: 'Translate', icon: Languages },
];

type NavMenuProps = {
  isMobile?: boolean;
};

export default function NavMenu({ isMobile = false }: NavMenuProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/learn/select-language') {
      // Highlight "Learn" if on /learn/select-language or any page under /learn/*
      return pathname === href || pathname.startsWith('/learn');
    }
    // For other top-level links, exact match or startsWith is usually fine.
    return pathname === href || (pathname.startsWith(href) && href !== '/');
  };

  const navLinkClass = "flex items-center space-x-2";

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-2 p-4"> {/* Added padding for mobile */}
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "secondary" : "ghost"}
            asChild
            className="justify-start w-full text-left" /* Ensure full width and left alignment */
          >
            <Link 
              href={item.href} 
              className={navLinkClass}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" /> {/* Slightly larger icons for mobile */}
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-1 lg:space-x-2"> {/* Adjusted spacing for desktop */}
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={isActive(item.href) ? "secondary" : "ghost"}
          asChild
          size="sm"
        >
          <Link 
            href={item.href} 
            className={cn(navLinkClass, "px-3 py-2")} /* Added padding for desktop */
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
