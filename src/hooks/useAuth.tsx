

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  user: any;
  token: string | null;
  userRole: string;
  loading: boolean;
  error: string | null;
}

export const useAuth = (requireAuth = false, requiredRole?: string) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    userRole: 'client',
    loading: false,
    error: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Load token from localStorage and validate
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Optionally validate token with backend
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'validate' })
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setAuthState(prev => ({ ...prev, token, user: { email: data.email }, loading: false }));
          } else {
            localStorage.removeItem('auth_token');
            setAuthState(prev => ({ ...prev, token: null, user: null, loading: false }));
            if (requireAuth) navigate('/auth');
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          setAuthState(prev => ({ ...prev, token: null, user: null, loading: false }));
          if (requireAuth) navigate('/auth');
        });
    } else {
      setAuthState(prev => ({ ...prev, token: null, user: null, loading: false }));
      if (requireAuth) navigate('/auth');
    }
  }, [requireAuth, navigate]);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'login' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('auth_token', data.token);
      setAuthState(prev => ({ ...prev, token: data.token, user: { email }, loading: false }));
      navigate('/dashboard/client');
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const signUp = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action: 'register' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('auth_token', data.token);
      setAuthState(prev => ({ ...prev, token: data.token, user: { email }, loading: false }));
      navigate('/dashboard/client');
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setAuthState({ user: null, token: null, userRole: 'client', loading: false, error: null });
    navigate('/auth');
  };

  return { ...authState, signIn, signUp, signOut };
};
