
import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { worker } from '../lib/worker';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'client' | 'admin';
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const response = await worker.post('/get-user-profile', { userId: user.uid });
          const userProfile = await response.json();
          setProfile(userProfile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setError('Failed to fetch user profile');
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const response = await worker.post('/get-user-profile', { userId: user.uid });
      const userProfile: Profile = await response.json();
      setUser(user);
      setProfile(userProfile);
      if (userProfile.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/client');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const response = await worker.post('/get-user-profile', { userId: user.uid, fullName, phone });
      const userProfile: Profile = await response.json();
      setUser(user);
      setProfile(userProfile);
      navigate('/dashboard/client');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (requireAuth = false, requiredRole?: 'admin' | 'client') => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  useEffect(() => {
    if (!context.loading) {
      if (requireAuth && !context.user) {
        navigate('/auth');
      }
      if (requiredRole && context.profile?.role !== requiredRole) {
        navigate(context.profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard/client');
      }
    }
  }, [context.loading, context.user, context.profile, requireAuth, requiredRole, navigate]);

  return context;
};
