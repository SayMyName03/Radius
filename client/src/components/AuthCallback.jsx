/**
 * OAuth Callback Handler
 * Handles the redirect from Google OAuth
 * 
 * Flow:
 * 1. Google redirects to /auth/callback?token=xxx or ?error=xxx
 * 2. This component extracts token/error from URL
 * 3. If token, log user in and redirect to app
 * 4. If error, show error and redirect to login
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      // Get token or error from URL parameters
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('[OAuth] Authentication failed:', error);
        setStatus('error');
        
        // Redirect to login after showing error
        setTimeout(() => {
          navigate('/login', {
            state: { error: `Google authentication failed: ${error}` },
          });
        }, 2000);
        return;
      }

      if (token) {
        console.log('[OAuth] Token received, logging in...');
        
        try {
          // Log user in with the token and wait for completion
          await loginWithGoogle(token);
          setStatus('success');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        } catch (err) {
          console.error('[OAuth] Login failed:', err);
          setStatus('error');
          
          setTimeout(() => {
            navigate('/login', {
              state: { error: 'Failed to complete Google login' },
            });
          }, 2000);
        }
      } else {
        // No token or error - redirect to login
        console.error('[OAuth] No token or error in callback');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <svg className="animate-spin h-12 w-12 text-gray-900 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Completing Google Sign-In...
            </h2>
            <p className="text-gray-600 text-sm">
              Please wait while we log you in
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600 text-sm">
              Redirecting you to the app...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 text-sm">
              Redirecting to login page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
