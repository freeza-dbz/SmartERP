import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Check } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

export function RegisterPage() {
  const { setUser, setCurrentPage, addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const config = [
      { label: 'Very Weak', color: 'bg-error-500' },
      { label: 'Weak', color: 'bg-warning-500' },
      { label: 'Fair', color: 'bg-warning-400' },
      { label: 'Good', color: 'bg-success-500' },
      { label: 'Strong', color: 'bg-success-600' },
    ];

    return { score, ...config[score - 1] || { label: '', color: '' } };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // 1. Register User
      await api.post('/users/register', {
        fullName: name,
        email,
        password,
        username: email.split('@')[0],
      });

      // 2. Auto Login
      const loginResponse = await api.post('/users/login', { email, password });
      const { user: loggedInUser, token } = loginResponse.data.data;

      localStorage.setItem('token', token);

      setUser({
        id: loggedInUser.id.toString(),
        name: loggedInUser.name,
        email: loggedInUser.email,
      });

      addToast({ type: 'success', title: 'Account created', message: 'Welcome to SmartERP!' });
      setCurrentPage('company-selection');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Registration failed', message: err.message || 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-xl">SmartERP</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Get started with SmartERP for free
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                required
                leftIcon={<Lock className="w-4 h-4" />}
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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strength.label}</p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                I agree to the{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button type="submit" fullWidth loading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Account
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 dark:bg-slate-900 text-slate-500">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button variant="outline" type="button">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.31 1.08-3.71 1.08-2.86 0-5.3-1.93-6.16-4.53H2.18v2.84C4 20.54 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.12c-.22-.68-.34-1.4-.34-2.12s.13-1.44.34-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l2.68-2.09.98-.75z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.04l3.66 2.84c.86-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentPage('login')}
              className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Everything You Need<br />in One Place
          </h1>
          <p className="text-primary-100 text-lg max-w-md mb-8">
            Manage accounting, inventory, GST compliance, and more with our comprehensive ERP solution.
          </p>

          <div className="space-y-4">
            {[
              'Complete accounting & bookkeeping',
              'Inventory & stock management',
              'GST-ready invoicing & compliance',
              'Banking & reconciliation',
              'Comprehensive reporting suite',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-primary-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
