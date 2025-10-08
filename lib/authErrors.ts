// Authentication error handling utilities

export interface AuthError {
  message: string;
  code: string;
  userFriendlyMessage?: string;
}

export const getAuthErrorMessage = (error: any): AuthError => {
  const errorCode = error.code || error.message || 'unknown';
  const errorMessage = error.message || 'An unexpected error occurred. Please try again.';

  // Supabase-specific error handling
  const errorMessages: Record<string, string> = {
    // Supabase Auth Errors
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'email_not_confirmed': 'Please confirm your email address before signing in.',
    'weak_password': 'Password should be at least 6 characters long.',
    'email_already_exists': 'An account with this email already exists. Please sign in instead.',
    'user_already_registered': 'An account with this email already exists. Please sign in instead.',
    
    // Firebase-compatible error codes for consistency
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/account-exists-with-different-credential': 'Account exists with different credentials.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in request was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
    'auth/unauthorized-domain': 'Domain not authorized for OAuth operations.',
    'cancelled': 'Sign-in was cancelled.',
    'in-progress': 'Sign-in is already in progress.',
    'play-services-not-available': 'Google Play Services not available.',
    'oauth-config-error': 'OAuth configuration error. Please check your settings.',
    'no-user': 'No user returned from authentication.',
  };

  // Check for Supabase error patterns in the message
  let userFriendlyMessage = errorMessages[errorCode];
  
  if (!userFriendlyMessage) {
    if (errorMessage.includes('Invalid login credentials')) {
      userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (errorMessage.includes('User already registered')) {
      userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
    } else if (errorMessage.includes('Email not confirmed')) {
      userFriendlyMessage = 'Please confirm your email address before signing in.';
    } else if (errorMessage.includes('Weak password')) {
      userFriendlyMessage = 'Password should be at least 6 characters long.';
    } else {
      userFriendlyMessage = 'An unexpected error occurred. Please try again.';
    }
  }

  return {
    message: errorMessage,
    code: errorCode,
    userFriendlyMessage,
  };
};

export const isAuthError = (error: any): error is AuthError => {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
};