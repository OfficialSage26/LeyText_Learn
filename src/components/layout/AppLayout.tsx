import type { ReactNode } from 'react';
import Header from './Header';

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="text-center py-6 text-sm text-muted-foreground border-t bg-background">
        LinguaLeap &copy; {new Date().getFullYear()} - John Ashly O. Gasacao (BSIT-1B)
      </footer>
    </div>
  );
}
