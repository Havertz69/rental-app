import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoadingAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get('role');
  const redirectTo = searchParams.get('redirect');

  console.log('Login component rendering');
  console.log('Login component state:', { selectedRole, redirectTo, isLoadingAuth });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const res = await login({ email, password });
      if (res.success) {
        // Navigate to appropriate dashboard based on user role or redirect URL
        const loggedInUser = res.user || user;
        if (redirectTo) {
          navigate(redirectTo);
        } else if (loggedInUser?.user_type === 'admin') {
          navigate('/admin-dashboard');
        } else if (loggedInUser?.user_type === 'tenant') {
          navigate('/user-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (redirectTo) {
        navigate(redirectTo);
      } else if (user.user_type === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.user_type === 'tenant') {
        navigate('/user-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  }, [user, navigate, redirectTo]);

  // Show loading while auth is initializing
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account</p>
          {selectedRole && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {selectedRole === 'admin' ? 'Property Manager' : 'User'} Portal
            </div>
          )}
        </div>
        
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              placeholder="Enter your password"
              required 
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg transition-all duration-200">
              {error}
            </div>
          )}
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">Contact admin</a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <a href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">← Back to Home</a>
          </p>
        </div>
      </div>
    </div>
  );
}
