'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading, login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.replace('/admin-portal/dashboard');
    }
  }, [isLoggedIn, authLoading, router]);

  // Handle browser back button to ensure proper navigation flow
  useEffect(() => {
    const handlePopState = () => {
      if (isLoggedIn) {
        router.replace('/admin-portal/dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLoggedIn, router]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't render if user is logged in (prevents flash)
  if (isLoggedIn) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;          
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.username.trim()) {
      setError('Please enter your username.');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Failed to login';

        switch (errorData.error) {
          case 'ACCOUNT_NOT_FOUND':
            errorMessage = 'Account does not exist. Please check your username or create a new account.';
            break;
          case 'INVALID_PASSWORD':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          default:
            if (response.status === 401) {
              errorMessage = 'Invalid credentials. Please check your username and password.';
            } else if (response.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            break;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Use the login function from useAuth for proper history management
      login(data.username, data.token);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log in. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-100">
        <Image 
          src="/apartment.png" 
          alt="JJ Apartments Building" 
          width={700}
          height={900}
          className="object-cover w-full h-full"
          priority
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Image 
              src="/JJ-Apartments-Logo.png"
              alt="JJ Apartments Logo" 
              width={250}
              height={80}
              className="object-contain mx-auto mb-6"
              priority
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in to your account</h2>
            <p className="text-gray-600">Access your property management dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                disabled={isLoading}
                onChange={handleChange}
                className="w-full h-12 px-4 border-gray-300 focus:border-yellow-400 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  disabled={isLoading}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-12 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-black hover:bg-black text-yellow-300 font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/admin-portal/signup" className="text-yellow-500 hover:text-yellow-600">
                Sign up here
              </a>
            </p>
          </div>

          <div className="lg:hidden text-center pt-8">
            <Image 
              src="/apartment.png" 
              alt="JJ Apartments Building" 
              width={300}
              height={400}
              className="object-contain mx-auto opacity-20"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
