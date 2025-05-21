"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, Layers, HelpCircle } from 'lucide-react';

const navItems = [
  { href: '/word-lists', label: 'Word Lists', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/quizzes', label: 'Quizzes', icon: HelpCircle },
];

type NavMenuProps = {
  isMobile?: boolean;
};

export default function NavMenu({ isMobile = false }: NavMenuProps) {
  const pathname = usePathname();

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-2 px-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            asChild
            className="justify-start"
          >
            <Link href={item.href} className="flex items-center space-x-2">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-2 lg:space-x-4">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          asChild
          size="sm"
        >
          <Link href={item.href} className="flex items-center">
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
