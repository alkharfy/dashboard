"use client";

import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider, useLanguage } from '@/contexts/language-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { useEffect } from 'react';

// This can't be in a server component
// export const metadata: Metadata = {
//   title: 'CV Assistant',
//   description: 'Bilingual Internal CV Management UI',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LangHTML>
          <body className="font-body antialiased">
            {children}
            <Toaster />
          </body>
        </LangHTML>
      </LanguageProvider>
    </AuthProvider>
  );
}

function LangHTML({ children }: { children: React.ReactNode }) {
  return (
    <ClientHtml>
        {children}
    </ClientHtml>
  );
}

function ClientHtml({ children }: { children: React.ReactNode }) {
  const { lang, dir } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = lang === 'ar' ? 'مساعد السيرة الذاتية' : 'CV Assistant';
  }, [lang, dir]);

  return (
    <html lang={lang} dir={dir}>
      <head>
        <title>CV Assistant</title>
        <meta name="description" content="Bilingual Internal CV Management UI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      {children}
    </html>
  );
}