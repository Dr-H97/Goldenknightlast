import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import GoogleIcon from '../components/icons/GoogleIcon';

const FirebaseLogin = () => {
  const { t } = useTranslation();
  const { user, loading, login } = useFirebaseAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  const handleGoogleLogin = async () => {
    try {
      const result = await login();
      if (result.success) {
        navigate('/');
      } else {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <PageTransition>
      <div className="flex min-h-screen bg-background">
        {/* Login Form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary">
                {t('login.welcome')}
              </h1>
              <p className="mt-2 text-sm text-textSecondary">
                {t('login.signInTo')} {t('app.title')}
              </p>
            </div>
            
            <div className="space-y-6">
              <button
                onClick={handleGoogleLogin}
                className="group relative w-full flex justify-center py-3 px-4 border border-surface rounded-md shadow-sm text-sm font-medium text-text bg-surface hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <GoogleIcon className="h-5 w-5 text-primary group-hover:text-primary/80" />
                </span>
                {t('login.signInWithGoogle')}
              </button>
              
              <div className="text-center">
                <p className="text-xs text-textSecondary">
                  {t('login.bySigningIn')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Section */}
        <div className="hidden md:flex md:w-1/2 bg-primary/10 items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold text-primary">
              {t('app.title')}
            </h2>
            <p className="mt-4 text-textSecondary">
              {t('login.heroText')}
            </p>
            <div className="mt-8">
              <img
                src="/logo-large.svg"
                alt="Chess Club Logo"
                className="mx-auto w-48 h-48"
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FirebaseLogin;