import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ShieldAlert } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { initializeAuthUsers } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const { setRole } = useUser();
  const { signIn } = useAuth();
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize auth users when the component mounts
    initializeAuthUsers();
  }, []);

  const handleLoginAsUser = async () => {
    try {
      setLoading(true);
      setError('');
      await signIn('user@example.com', 'user123');
      setRole('user');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (username === 'admin' && password === 'password') {
        await signIn('admin@example.com', 'admin123');
        setRole('admin');
        navigate('/', { replace: true });
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showAdminForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center space-y-6">
            <BarChart3 className="h-16 w-16 text-black" />
            <h1 className="font-bree text-3xl text-blue-dark text-center">
              Administrator Login
            </h1>

            <form onSubmit={handleAdminLogin} className="w-full space-y-4">
              <div className="space-y-2">
                <label className="block text-gray font-din">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-gray font-din">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue focus:border-blue outline-none font-din"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-dark text-white font-din py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShieldAlert className="h-5 w-5" />
                      <span>Sign in as Administrator</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAdminForm(false);
                    setError('');
                    setUsername('');
                    setPassword('');
                  }}
                  className="text-gray hover:text-primary transition-colors"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          <BarChart3 className="h-16 w-16 text-black" />
          <h1 className="font-bree text-3xl text-blue-dark text-center">
            IT Capability Framework
          </h1>
          
          <button
            onClick={handleLoginAsUser}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-din py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Sign in as Regular User'
            )}
          </button>
          
          <button
            onClick={() => setShowAdminForm(true)}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary-dark text-white font-din py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShieldAlert className="h-5 w-5" />
            <span>Sign in as Administrator</span>
          </button>
        </div>
      </div>
    </div>
  );
}