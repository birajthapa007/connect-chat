import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
    
    if (displayName.length < 2) {
      toast({
        title: 'Invalid name',
        description: 'Please enter your first and last name.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Generate username from first name + random suffix
    const username = `${firstName.toLowerCase().replace(/\s+/g, '')}${Math.floor(Math.random() * 1000)}`;

    const { error } = await signUp(email, password, username, displayName);

    if (error) {
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    } else {
      toast({
        title: 'Account created!',
        description: 'Welcome to Messenger.',
      });
      navigate('/');
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join Messenger today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="input-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="input-glow"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-glow"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-glow"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-accent text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}