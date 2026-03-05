import { supabase } from '@/lib/supabase';

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Erro ao criar conta' };

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      name,
    },
    error: null,
  };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: 'Erro ao fazer login' };

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      name: (data.user.user_metadata?.name as string) ?? '',
    },
    error: null,
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;

  const user = data.session.user;
  return {
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.name as string) ?? '',
  };
}

export function onAuthChange(callback: (user: { id: string; email: string; name: string } | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email ?? '',
        name: (session.user.user_metadata?.name as string) ?? '',
      });
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}
