'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username') || '';

        const loggedIn = !!token;
        setIsLoggedIn(loggedIn);
        setUsername(loggedIn ? storedUsername : '');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsLoggedIn(false);
      setUsername('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
      }
      setIsLoggedIn(false);
      setUsername('');
      router.replace('/admin-portal/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.replace('/admin-portal/login');
    }
  };

  const login = (username: string, token: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
      }
      setIsLoggedIn(true);
      setUsername(username);
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
