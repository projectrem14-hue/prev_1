
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, signIn } from '@/lib/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp && password !== confirmPassword) {
      toast({ variant: "destructive", title: "Auth Error", description: "Passwords do not match." });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({ variant: "destructive", title: "Auth Error", description: "Password must be at least 6 characters." });
      setLoading(false);
      return;
    }

    if (!auth || !auth.app) {
      toast({ 
        variant: "destructive", 
        title: "Configuration Error", 
        description: "Firebase is not correctly configured. Please check your .env files." 
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        await signUp(auth, email, password);
        toast({ title: "Welcome to GapLogic", description: "Your account has been created." });
      } else {
        await signIn(auth, email, password);
        toast({ title: "Welcome Back", description: "Successfully authenticated." });
      }
      router.push('/');
    } catch (error: any) {
      let message = error.message || "An error occurred during authentication.";
      if (error.code === 'auth/wrong-password') message = "Incorrect password. Try again.";
      if (error.code === 'auth/user-not-found') message = "No account found. Please sign up.";
      if (error.code === 'auth/email-already-in-use') message = "Email is already registered.";
      if (error.code === 'auth/invalid-api-key') message = "Invalid Firebase API Key. Check your configuration.";
      
      toast({ variant: "destructive", title: "Auth Failed", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <BrainCircuit className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-headline tracking-tight">GapLogic</h1>
          <p className="text-muted-foreground">Master the gap between intention and reality.</p>
        </div>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Join the behavioral audit community.' : 'Access your cognitive dashboard.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" type="email" placeholder="name@example.com" 
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-background/50 h-12 rounded-xl" required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" type="password" placeholder="••••••••" 
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="pl-10 bg-background/50 h-12 rounded-xl" required
                  />
                </div>
              </div>
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" type="password" placeholder="••••••••" 
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-background/50 h-12 rounded-xl" required
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? <><UserPlus className="w-5 h-5 mr-2" /> Sign Up</> : <><LogIn className="w-5 h-5 mr-2" /> Sign In</>)}
              </Button>
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
