'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast({ variant: "destructive", title: "Auth Error", description: "Password must be at least 6 characters." });
      setLoading(false);
      return;
    }

    // Handle session creation
    login(email);
    toast({ 
      title: isSignUp ? "Account Created" : "Welcome Back", 
      description: `Logged in as ${email}` 
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <BrainCircuit className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold font-headline tracking-tight">GapLogic</h1>
          <p className="text-muted-foreground text-sm">Analyze and bridge the gap between intention and reality.</p>
        </div>

        <Card className="glass-card border-none">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? "Join GapLogic to start your behavioral audit." : "Enter your credentials to access your dashboard."}
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
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="confirm-password" type="password" placeholder="••••••••" 
                      className="pl-10 bg-background/50 h-12 rounded-xl" required
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-primary"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
