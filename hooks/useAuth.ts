import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { config } from '@/lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Minimal app user mapped from Supabase
export type AppUser = {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isGuest?: boolean;
};

// AsyncStorage keys
const AUTH_USER_KEY = '@auth_user';
const AUTH_SESSION_KEY = '@auth_session';

// Save authentication state to AsyncStorage
async function saveAuthState(user: AppUser | null) {
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (error) {
    console.error('Error saving auth state to AsyncStorage:', error);
  }
}

// Load authentication state from AsyncStorage
async function loadAuthState(): Promise<AppUser | null> {
  try {
    const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading auth state from AsyncStorage:', error);
    return null;
  }
}

// Ensure a profile row exists in Supabase
async function ensureSupabaseProfile(userId: string, email: string | null, fullName?: string | null) {
  try {
    const { data: existing, error: existErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (existErr && existErr.code !== 'PGRST116') throw existErr;
    if (!existing) {
      const { error: insertErr } = await supabase.from('profiles').insert({
        user_id: userId,
      });
      if (insertErr) throw insertErr;
    }
  } catch (e) {
    console.error('Error ensuring Supabase profile:', e);
  }
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isGuest = user?.isGuest === true;

  // Supabase auth state changes
  useEffect(() => {
    let isMounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔴 Supabase auth state changed:', event, session?.user?.email);
      const supaUser = session?.user || null;

      if (supaUser) {
        const appUser: AppUser = {
          uid: supaUser.id,
          email: supaUser.email ?? null,
          displayName: supaUser.user_metadata?.full_name || null,
          photoURL: supaUser.user_metadata?.avatar_url || null,
        };
        console.log('🔴 Setting user in auth state:', appUser.email);
        if (isMounted) {
          setUser(appUser);
          await saveAuthState(appUser);
        }
      } else {
        console.log('🔴 Clearing user from auth state');
        if (isMounted) {
          setUser(null);
          await saveAuthState(null);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    // Initialize current session with AsyncStorage fallback
    const initializeAuth = async () => {
      try {
        // First try to get session from Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('🔴 Initial Supabase session check:', sessionData.session?.user?.email);

        if (sessionData.session?.user) {
          const supaUser = sessionData.session.user;
          const appUser: AppUser = {
            uid: supaUser.id,
            email: supaUser.email ?? null,
            displayName: supaUser.user_metadata?.full_name || null,
            photoURL: supaUser.user_metadata?.avatar_url || null,
          };
          console.log('🔴 Setting user from active Supabase session:', appUser.email);
          if (isMounted) {
            setUser(appUser);
            await saveAuthState(appUser);
          }
        } else {
          // No active Supabase session, try to load from AsyncStorage
          console.log('🔴 No Supabase session, checking AsyncStorage...');
          const storedUser = await loadAuthState();

          if (storedUser && !storedUser.isGuest) {
            // Try to restore Supabase session for non-guest users
            console.log('🔴 Found stored non-guest user, attempting to restore session...');
            
            // First try to get the current session again (might have been updated)
            const { data: currentSession } = await supabase.auth.getSession();
            if (currentSession.session?.user) {
              console.log('🔴 Session restored after getSession retry');
              const restoredUser: AppUser = {
                uid: currentSession.session.user.id,
                email: currentSession.session.user.email ?? null,
                displayName: currentSession.session.user.user_metadata?.full_name || null,
                photoURL: currentSession.session.user.user_metadata?.avatar_url || null,
              };
              if (isMounted) {
                setUser(restoredUser);
                await saveAuthState(restoredUser);
              }
            } else {
              // Try to refresh the session
              console.log('🔴 Attempting to refresh session...');
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              
              if (refreshError) {
                console.log('🔴 Session refresh failed:', refreshError.message);
                // Could not restore session, clear stored data
                console.log('🔴 Could not restore session, clearing stored auth data');
                if (isMounted) {
                  setUser(null);
                  await saveAuthState(null);
                }
              } else if (refreshData.session?.user) {
                console.log('🔴 Session refreshed successfully');
                const restoredUser: AppUser = {
                  uid: refreshData.session.user.id,
                  email: refreshData.session.user.email ?? null,
                  displayName: refreshData.session.user.user_metadata?.full_name || null,
                  photoURL: refreshData.session.user.user_metadata?.avatar_url || null,
                };
                if (isMounted) {
                  setUser(restoredUser);
                  await saveAuthState(restoredUser);
                }
              } else {
                // No session after refresh, clear stored data
                console.log('🔴 No session after refresh, clearing stored auth data');
                if (isMounted) {
                  setUser(null);
                  await saveAuthState(null);
                }
              }
            }
          } else if (storedUser && storedUser.isGuest) {
            // Restore guest user from storage
            console.log('🔴 Restoring guest user from storage');
            if (isMounted) {
              setUser(storedUser);
            }
          } else {
            // No stored user data
            console.log('🔴 No stored user data found');
            if (isMounted) {
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('🔴 Error initializing auth:', error);
        // Fallback to stored data if available
        const storedUser = await loadAuthState();
        console.log('🔴 Fallback to stored user after error:', storedUser?.email);
        if (isMounted) {
          setUser(storedUser);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      if (!u) throw new Error('No user returned');
      await ensureSupabaseProfile(u.id, u.email ?? null, u.user_metadata?.full_name);
      const appUser: AppUser = { uid: u.id, email: u.email ?? null, displayName: u.user_metadata?.full_name || null, photoURL: u.user_metadata?.avatar_url || null };
      return { data: { user: appUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign in:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      const u = data.user;
      if (!u) return { data: { user: null }, error: null };
      await ensureSupabaseProfile(u.id, u.email ?? null, fullName);
      const appUser: AppUser = { uid: u.id, email: u.email ?? null, displayName: fullName, photoURL: null };
      return { data: { user: appUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign up:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signInAsGuest = async () => {
    try {
      // Create a guest user object with a more persistent ID
      const guestUser: AppUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: null,
        displayName: 'Guest User',
        isGuest: true,
      };

      console.log('🔴 Guest login successful:', guestUser.uid);
      setUser(guestUser);
      await saveAuthState(guestUser);

      return { data: { user: guestUser }, error: null };
    } catch (error: any) {
      console.error('🔴 Error during guest login:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };

  const signOut = async () => {
    try {
      // Only sign out from Supabase if it's not a guest user
      if (!user?.isGuest) {
        await supabase.auth.signOut();
        console.log('🔴 Supabase sign out successful');
      } else {
        console.log('🔴 Guest user signed out');
      }

      setUser(null);
      await saveAuthState(null);
      return { error: null };
    } catch (error: any) {
      console.error('🔴 Error during sign out:', error);
      const authError = getAuthErrorMessage(error);

      // Clear the local user state even if sign out fails
      setUser(null);
      await saveAuthState(null);

      return {
        error: authError,
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // Send OTP code for password reset instead of magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Don't create new users, only reset existing ones
          emailRedirectTo: `${config.app.scheme}://reset-password`,
        },
      });
      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('🔴 Error during forgot password:', error);
      const authError = getAuthErrorMessage(error);

      return {
        error: authError,
      };
    }
  };

  const resetPasswordWithCode = async (email: string, code: string, newPassword: string) => {
    try {
      // Verify OTP code for password reset
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      // Set the session with the verified token
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      return { data, error: null };
    } catch (error: any) {
      console.error('🔴 Error during password reset with code:', error);
      const authError = getAuthErrorMessage(error);

      return {
        data: null,
        error: authError,
      };
    }
  };





  const deleteAccount = async () => {
    try {
      if (!user || user.isGuest) {
        throw new Error('No authenticated user found');
      }

      console.log('🔴 Starting account deletion for user:', user.uid);

      // Use the database function to delete all user data in a single transaction
      const { error: deleteDataError } = await supabase
        .rpc('delete_user_data', { user_id: user.uid });

      if (deleteDataError) {
        console.error('🔴 Error deleting user data via function:', deleteDataError);
        throw deleteDataError;
      }

      console.log('🔴 User data deleted successfully via database function');

      // Generate a random password for security
      const randomPassword = Math.random().toString(36) + Math.random().toString(36);

      // Update the user's account to be disabled/deleted state
      const { error: updateError } = await supabase.auth.updateUser({
        password: randomPassword,
        data: {
          deleted_at: new Date().toISOString(),
          status: 'deleted'
        }
      });

      if (updateError) {
        console.error('🔴 Error updating user account:', updateError);
        throw updateError;
      }

      // Sign out the user
      await supabase.auth.signOut();

      console.log('🔴 Account deletion process completed');
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error('🔴 Error during account deletion:', error);
      const authError = getAuthErrorMessage(error);

      return {
        error: authError,
      };
    }
  };


  return {
    user,
    isAuthenticated,
    isGuest,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOut,
    forgotPassword,
    resetPasswordWithCode,
    deleteAccount,
  };
}