import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (name: string, email: string) => void;
  onStartOnboarding: (name: string, email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onStartOnboarding
}) => {
  const [screen, setScreen] = useState<'welcome' | 'login' | 'register' | 'forgot' | 'verify'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passwordScore = [hasMinLength, hasUpperLower, hasNumber, hasSpecial].filter(Boolean).length;
  const passwordStrengthLabel =
    passwordScore <= 1 ? 'Weak' : passwordScore === 2 ? 'Fair' : passwordScore === 3 ? 'Good' : 'Strong';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage("Email or password doesn't match."); // Non-enumerated friendly error
      return;
    }
    onSuccessLogin(firstName || 'Alex', email);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (passwordScore < 2) {
      setErrorMessage('Please choose a stronger password.');
      return;
    }
    setScreen('verify');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. WELCOME SCREEN */}
        {screen === 'welcome' && (
          <div className="py-2 space-y-4">
            <div className="flex justify-center mb-2">
              <Logo size="lg" showTagline={true} />
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Better nights start with understanding your sleep.
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              Track your sleep, follow your CBT-I plan, practice helpful exercises, and build healthier sleep routines.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setScreen('register')}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => setScreen('login')}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Log In
              </button>
            </div>

            <p className="text-[10px] text-slate-400 pt-2">
              Your sleep information is private and securely protected.
            </p>
          </div>
        )}

        {/* 2. LOGIN SCREEN */}
        {screen === 'login' && (
          <form onSubmit={handleLogin} className="py-2 space-y-3 text-left">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 text-center mb-3">Welcome Back</h2>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1">
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <input type="checkbox" defaultChecked className="rounded text-indigo-600" /> Remember me
              </label>
              <button
                type="button"
                onClick={() => setScreen('forgot')}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm mt-2"
            >
              Log In
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">New to Dreamora? </span>
              <button
                type="button"
                onClick={() => setScreen('register')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* 3. CREATE ACCOUNT SCREEN */}
        {screen === 'register' && (
          <form onSubmit={handleRegister} className="py-2 space-y-3 text-left">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 text-center mb-1">Create Account</h2>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Alex"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[10px]">
                <div className="flex justify-between font-semibold">
                  <span>Password strength:</span>
                  <span className={passwordScore >= 3 ? 'text-emerald-600' : 'text-amber-600'}>
                    {passwordStrengthLabel}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 rounded-full ${
                        passwordScore >= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm mt-2"
            >
              Create Account
            </button>
          </form>
        )}

        {/* 4. EMAIL VERIFICATION SIMULATION */}
        {screen === 'verify' && (
          <div className="py-4 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-indigo-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Check Your Email</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              We sent a verification link to <span className="font-semibold text-slate-800 dark:text-slate-200">{email || 'alex@example.com'}</span>.
            </p>

            <button
              onClick={() => {
                onStartOnboarding(firstName || 'Alex', email || 'alex@example.com');
                onClose();
              }}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
            >
              Verified! Continue to Onboarding <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 5. FORGOT PASSWORD */}
        {screen === 'forgot' && (
          <div className="py-2 space-y-3 text-left">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 text-center">Reset Your Password</h2>
            <p className="text-xs text-slate-500">
              Enter your email and if an account exists, we'll send instructions to reset your password.
            </p>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />

            <button
              onClick={() => setScreen('login')}
              className="w-full py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
            >
              Send Reset Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
