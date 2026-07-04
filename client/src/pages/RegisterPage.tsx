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
