import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  
  type AuthMode = 'signin' | 'signup' | 'reset';
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      switch (mode) {
        case 'signin':
          await signIn(formData.email, formData.password);
          toast({
            title: 'Welcome back!',
            description: 'Successfully signed in.'
          });
          break;

        case 'signup':
          await signUp(formData.email, formData.password, formData.name);
          toast({
            title: 'Welcome!',
            description: 'Your account has been created.'
          });
          // Redirect new users to complete their profile
          navigate('/profile?onboard=true');
          return;

        case 'reset':
          await sendPasswordReset(formData.email);
          toast({
            title: 'Check your email',
            description: 'A password reset link has been sent.'
          });
          break;
      }

      // If we're not in reset mode and not a new signup, handle redirect
      if (mode !== 'reset') {
        const returnTo = searchParams.get('returnTo');
        navigate(returnTo || '/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">
            {mode === 'signin' ? "Welcome Back" : 
             mode === 'signup' ? "Join Girls I Save" :
             "Reset Password"}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' ? "Sign in to access your dashboard" :
             mode === 'signup' ? "Create your account to get started" :
             "Enter your email to receive a reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleInput}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInput}
                required
              />
            </div>
            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInput}
                  required={['signin', 'signup'].includes(mode)}
                  minLength={6}
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              variant="default"
              disabled={loading}
            >
              {loading ? "Please wait..." : mode === 'signin' ? "Sign In" :
                mode === 'signup' ? "Create Account" : "Reset Password"}
            </Button>

            <div className="text-center space-y-2 mt-4">
              {mode === 'signin' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="block w-full text-sm text-muted-foreground hover:text-primary"
                  >
                    Forgot your password?
                  </button>
                </>
              ) : mode === 'signup' ? (
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Already have an account? Sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
