'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Authentication removed, redirect to dashboard
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
      <p className="text-muted-foreground animate-pulse">Redirecting to system...</p>
    </div>
  );
}
