import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, Checkbox } from '../components/ui';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

export function LoginPage() {
  const { setUser, setCurrentPage } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/users/login', { email, password });
      const { user: loggedInUser, token } = response.data.data;

      localStorage.setItem('token', token);

      setUser({
        id: loggedInUser.id.toString(),
        name: loggedInUser.name,
        email: loggedInUser.email,
      });
      setCurrentPage('company-selection');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="grid grid-cols-3 gap-4 opacity-20">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-16 h-16 border-2 border-white rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold text-2xl">S</span>
            </div>
            <span className="font-bold text-3xl">SmartERP</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Streamline Your<br />Business Operations
          </h1>
          <p className="text-primary-100 text-lg max-w-md">
            Complete accounting, inventory, and GST management solution for modern businesses.
            Built for efficiency, designed for growth.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-primary-200 text-sm">Active Businesses</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50M+</div>
              <div className="text-primary-200 text-sm">Invoices Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-primary-200 text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-xl">SmartERP</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <button
                type="button"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>



          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentPage('register')}
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
