import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_KEY = 'ff-session-timestamp';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) {
        sessionStorage.setItem(SESSION_KEY, Date.now().toString());
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for session timeout every minute
  useEffect(() => {
    if (!session) return;

    const checkTimeout = setInterval(() => {
      const timestamp = sessionStorage.getItem(SESSION_KEY);
      if (timestamp && Date.now() - parseInt(timestamp) > SESSION_TIMEOUT) {
        supabase.auth.signOut();
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = '/admin/login';
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTimeout);
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    }
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
