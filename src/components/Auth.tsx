import React, { useState } from 'react';
import { supabase, hasSupabaseConfig } from '../utils/supabase';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthProps {
  isDarkMode: boolean;
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ isDarkMode, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Supabase not configured. App will use local storage only.
          </p>
          <button
            onClick={onAuthSuccess}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue with Local Storage
          </button>
        </div>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setMessageType('success');
      setMessage('Signing you in...');
      setTimeout(() => onAuthSuccess(), 1000);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      
      if (error) throw error;
      
      setMessageType('success');
      setMessage('Check your email for the magic link!');
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className={`max-w-md w-full space-y-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Welcome Back
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Sign in to access your data
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              messageType === 'success' 
                ? isDarkMode
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : 'bg-green-100 text-green-700 border border-green-200'
                : isDarkMode
                  ? 'bg-red-900/50 text-red-300 border border-red-700'
                  : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              <span>{loading ? 'Processing...' : 'Sign In'}</span>
            </button>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading || !email}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                loading || !email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Send Magic Link
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Single-user application
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={onAuthSuccess}
            className={`text-sm hover:underline ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Continue with Local Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
