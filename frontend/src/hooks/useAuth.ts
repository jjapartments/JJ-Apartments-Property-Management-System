'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we're in the browser environment
        if (typeof window !== 'undefined') {
          const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
          const storedUsername = localStorage.getItem('username') || '';
          
          setIsLoggedIn(loggedIn);
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoggedIn(false);
        setUsername('');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
      setUsername('');
      
      // Clear the browser history to prevent back navigation to authenticated pages
      // This replaces the entire history stack with just the login page
      window.history.replaceState(null, '', '/admin-portal/login');
      
      // Use replace instead of push to prevent back navigation issues
      router.replace('/admin-portal/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force navigation even if localStorage fails
      router.replace('/admin-portal/login');
    }
  };

  const login = (username: string) => {
    try {
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setUsername(username);
      
      // Clear the browser history to prevent back navigation to login/signup pages
      // This replaces the entire history stack with just the home page
      window.history.replaceState(null, '', '/admin-portal/dashboard');
      
      // Use replace instead of push to prevent back navigation issues
      router.replace('/admin-portal/dashboard');
    } catch (error) {
      console.error('Error during login:', error);
      // Force navigation even if localStorage fails
      router.replace('/admin-portal/dashboard');
    }
  };

  return { isLoggedIn, username, isLoading, logout, login };
}
