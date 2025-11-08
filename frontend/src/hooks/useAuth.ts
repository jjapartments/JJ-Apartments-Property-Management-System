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
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const storedUsername = localStorage.getItem('username') || '';
          
          // User is logged in if they have a valid token
          const loggedIn = !!token;
          
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
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
      setUsername('');
      
      window.history.replaceState(null, '', '/admin-portal/login');
      router.replace('/admin-portal/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.replace('/admin-portal/login');
    }
  };

  const login = (username: string, token: string) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setUsername(username);
      
      window.history.replaceState(null, '', '/admin-portal/dashboard');
      router.replace('/admin-portal/dashboard');
    } catch (error) {
      console.error('Error during login:', error);
      router.replace('/admin-portal/dashboard');
    }
  };

  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  return { isLoggedIn, username, isLoading, logout, login, getToken };
}