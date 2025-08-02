
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  userRole: string;
  loading: boolean;
}

export const useAuth = (requireAuth = false, requiredRole?: string) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userRole: 'client',
    loading: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener - NEVER use async directly in callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous updates in callback
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false
        }));

        // Defer async operations to prevent deadlock
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
              
              console.log('Profile fetch result:', { profile, error, userId: session.user.id });
              
              const userRole = profile?.role || 'client';
              console.log('Setting user role to:', userRole);
              
              setAuthState(prev => ({
                ...prev,
                userRole
              }));

              // Handle route protection after role is fetched
              if (requireAuth && !session) {
                navigate('/auth');
              } else if (requiredRole && userRole !== requiredRole) {
                const dashboardPath = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/client';
                navigate(dashboardPath);
              }
            } catch (error) {
              console.error('Error fetching user role:', error);
              setAuthState(prev => ({
                ...prev,
                userRole: 'client'
              }));
            }
          }, 0);
        } else {
          // No session - handle route protection immediately
          if (requireAuth) {
            setTimeout(() => navigate('/auth'), 0);
          }
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let userRole = 'client';
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profile) {
            userRole = profile.role;
          }
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          userRole,
          loading: false
        });

        // Handle route protection
        if (requireAuth && !session) {
          navigate('/auth');
        } else if (requiredRole && userRole !== requiredRole) {
          const dashboardPath = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/client';
          navigate(dashboardPath);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setAuthState({
          user: null,
          session: null,
          userRole: 'client',
          loading: false
        });
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [requireAuth, requiredRole, navigate]);

  return authState;
};
