'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isOwner: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
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
      router.push('/admin-portal/login');
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

            <div className="flex items-center">
              <input
                id="isOwner"
                name="isOwner"
                type="checkbox"
                checked={formData.isOwner}
                disabled={isLoading}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label htmlFor="isOwner" className="ml-2 block text-sm text-gray-700">
                Register as property owner
              </label>
            </div>

            <Button 
              type="submit" 
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
              <a href="/admin-portal/login" className="text-yellow-500 hover:text-yellow-600">
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
