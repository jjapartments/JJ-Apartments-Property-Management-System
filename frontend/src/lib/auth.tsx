'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: string | null;
  login: (username: string, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  getToken: () => string | null;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on component mount
    const storedUser = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    
    // Only set user if both username and token exist
    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, token: string) => {
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    localStorage.setItem('isLoggedIn', 'true');
    setUser(username);
    router.push('/admin-portal/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    router.push('/admin-portal/login');
  };

  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  return { user, login, logout, isLoading, getToken };
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin-portal/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
};