
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
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: false,
    error: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await worker.post('/get-user-profile', { userId: user.uid });
          const profile = await response.json();
          setAuthState({ user, profile, loading: false, error: null });
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setAuthState({ user, profile: null, loading: false, error: 'Failed to fetch user profile' });
        }
      } else {
        setAuthState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const response = await worker.post('/get-user-profile', { userId: user.uid });
      const profile: Profile = await response.json();
      setAuthState({ user, profile, loading: false, error: null });
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard/client');
      }
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const response = await worker.post('/get-user-profile', { userId: user.uid, fullName, phone });
      const profile: Profile = await response.json();
      setAuthState({ user, profile, loading: false, error: null });
      navigate('/dashboard/client');
    } catch (err: any) {
      setAuthState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAuthState({ user: null, profile: null, loading: false, error: null });
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
