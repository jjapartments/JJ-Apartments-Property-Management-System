'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    registrationKey: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center" data-cy="auth-loading">
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!formData.username.trim()) {
      setError('Please enter a username.');
      return;
    }
    
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Please enter a password.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error || 'Failed to sign up';
        
        // Map specific backend errors to user-friendly messages
        if (errorMessage.includes('already taken')) {
          errorMessage = 'This username is already taken. Please choose a different username.';
        } else if (response.status === 400) {
          errorMessage = errorMessage; // Keep the original message for validation errors
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      alert('Account created successfully! You can now log in.');
      router.replace('/admin-portal/login');
    } catch (err) {
      console.error('Sign-up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
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
              src="/JJ Apartments Logo.png" 
              alt="JJ Apartments Logo" 
              width={250}
              height={80}
              className="object-contain mx-auto mb-6"
              priority
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Sign up to access the property management system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-cy="signup-form">
            {error && (
              <Alert variant="destructive" data-cy="error-alert">
                <AlertDescription data-cy="error-message">{error}</AlertDescription>
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
                data-cy="username-input"
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
                  data-cy="password-input"
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
                  data-cy="toggle-password"
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

            <div className="space-y-2">
              <Label htmlFor="registrationKey" className="text-sm font-medium text-gray-700">
                Registration Key
              </Label>
              <div className="relative">
                <Input
                  id="registrationKey"
                  name="registrationKey"
                  type={showPassword ? 'text' : 'password'} // same toggle as password
                  data-cy="registration-key-input"
                  placeholder="Enter registration key"
                  value={formData.registrationKey}
                  disabled={isLoading}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-12 border-gray-300 focus:border-yellow-400 focus:ring-yellow-400"
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
                    {showPassword ? 'Hide registration key' : 'Show registration key'}
                  </span>
                </Button>
              </div>
            </div>

            <Button 
              type="submit"
              data-cy="submit-button"
              className="w-full h-12 bg-black hover:bg-black text-yellow-300 font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a 
                href="/admin-portal/login" 
                data-cy="login-link"
                className="text-yellow-500 hover:text-yellow-600"
              >
                Sign in here
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