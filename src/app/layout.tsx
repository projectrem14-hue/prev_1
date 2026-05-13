import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { AuthProvider } from '@/lib/AuthContext';
import { DataProvider } from '@/lib/DataContext';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'GapLogic | Analyze Behavior-Intention Discrepancies',
  description: 'Novel AI-driven approach for enhancing lifestyle consistency.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body selection:bg-primary/30 selection:text-primary bg-background antialiased min-h-screen overflow-y-auto">
        <FirebaseClientProvider>
          <AuthProvider>
            <DataProvider>
              {children}
              <Toaster />
              <FirebaseErrorListener />
            </DataProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}