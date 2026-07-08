import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import Nav from '@/components/Nav';
import { LanguageProvider } from '@/components/LanguageProvider';
import CommandPalette from '@/components/CommandPalette';
import type { Lang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Solo Worker OS',
  description: 'A one-person business operating system powered by AI.',
  keywords: ['freelance', 'solo', 'AI assistant', 'project management', 'invoicing'],
  openGraph: {
    title: 'Solo Worker OS',
    description: 'Manage your freelance business through natural conversation.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const rawLang = cookieStore.get('solo-lang')?.value;
  const initialLang: Lang = rawLang === 'zh' ? 'zh' : 'en';

  return (
    <html lang={initialLang} className="scroll-smooth">
      <body className="min-h-screen font-sans antialiased">
        <LanguageProvider initialLang={initialLang}>
          <Nav />
          <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            {children}
          </main>
          <CommandPalette />
        </LanguageProvider>
      </body>
    </html>
  );
}
