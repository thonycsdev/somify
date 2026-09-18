import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { Provider } from '@/components/ui/provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
const spaceGrotesk = Space_Grotesk({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'somify — Economize. Cresça. Conquiste.',
  description:
    'Registre seus gastos, defina metas de economia e acompanhe sua evolução financeira até a liberdade financeira.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
