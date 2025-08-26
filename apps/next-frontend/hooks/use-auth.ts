import { useUser, useAuth as useClerkAuth, useSignIn, useSignUp } from '@clerk/nextjs';

export const useAuth = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn, isLoaded: isAuthLoaded } = useClerkAuth();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

  const signInWithGoogle = async () => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return {
    data: user,
    isLoading: !isUserLoaded || !isAuthLoaded || !isSignInLoaded || !isSignUpLoaded,
    error: null,
    isSignedIn,
    user,
    isLoaded: isUserLoaded && isAuthLoaded && isSignInLoaded && isSignUpLoaded,
    signIn: signIn?.authenticateWithRedirect,
    signUp: signUp?.create,
    signInWithGoogle,
  };
};
