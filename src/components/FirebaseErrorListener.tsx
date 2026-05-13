'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // In a real development environment, this would surface more context.
      // We use toast for user-facing errors only when central handling isn't enough.
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `You don't have permission to ${error.context.operation} data at ${error.context.path}.`,
      });
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
