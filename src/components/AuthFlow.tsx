import React, { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
  Check,
  ArrowRight,
  ShieldCheck,
  Moon,
  Sparkles
} from 'lucide-react';
import { Logo } from './Logo';

export type AuthScreenType =
  | 'welcome'
  | 'login'
  | 'register'
  | 'forgot'
  | 'success'
  | 'onboarding';

interface AuthFlowProps {
  initialScreen?: AuthScreenType;
  prefilledEmail?: string;
  onLoginSuccess: (user: { name: string; email: string; avatarUrl?: string; isGuest?: boolean }) => void;
  onGuestContinue: () => void;
}

const SLEEP_GOALS = [
  { id: 'quality', label: '😴 Improve overall sleep quality' },
  { id: 'schedule', label: '🌙 Build a consistent sleep schedule' },
  { id: 'falling_asleep', label: '⏱️ Reduce difficulty falling asleep' },
  { id: 'awakenings', label: '🛌 Reduce nighttime awakenings' },
  { id: 'cbti', label: '🧠 Follow a clinician or CBT-I plan' },
];

export const AuthFlow: React.FC<AuthFlowProps> = ({
  initialScreen = 'login',
  prefilledEmail = '',
  onLoginSuccess,
  onGuestContinue,
}) => {
  const [screen, setScreen] = useState<AuthScreenType>(initialScreen);

  // Form states
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // UI Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot Password state
  const [resetSent, setResetSent] = useState(false);

  // Onboarding states
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['quality', 'schedule']);
  const [wakeUpTime, setWakeUpTime] = useState('07:00 AM');
  const [bedtime, setBedtime] = useState('11:00 PM');
  const [enableReminders, setEnableReminders] = useState(true);

  // Password Strength calculation
  const hasMinLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasMinLength, hasUpperLower, hasNumber, hasSpecial].filter(Boolean).length;

  const strengthText =
    password.length === 0
      ? ''
      : score <= 1
      ? 'Weak'
      : score === 2
      ? 'Fair'
      : score === 3
      ? 'Good'
      : 'Strong';

  const strengthColor =
    score <= 1
      ? 'bg-rose-500'
      : score === 2
      ? 'bg-amber-500'
      : score === 3
      ? 'bg-blue-500'
      : 'bg-emerald-500';

  // Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simulate successful login
      const nameFromEmail = email.split('@')[0];
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      onLoginSuccess({
        name: fullName || formattedName || 'Alex',
        email: email,
        isGuest: false,
      });
    }, 800);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setScreen('success');
    }, 800);
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);

    let authHandled = false;
    let popupTimer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (popupTimer) clearInterval(popupTimer);
      window.removeEventListener('message', handleMessage);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.user) {
        authHandled = true;
        cleanup();
        setIsLoading(false);
        const gUser = event.data.user;
        onLoginSuccess({
          name: gUser.name || 'Dreamora User',
          email: gUser.email || 'user@gmail.com',
          avatarUrl: gUser.avatarUrl || '',
          isGuest: false,
        });
      } else if (event.data?.type === 'GOOGLE_AUTH_CANCELLED') {
        authHandled = true;
        cleanup();
        setIsLoading(false);
        setErrorMessage('Google sign-in was cancelled');
      }
    };

    window.addEventListener('message', handleMessage);

    try {
      let authUrl = '';
      try {
        const res = await fetch('/api/auth/google/url');
        if (res.ok) {
          const data = await res.json();
          authUrl = data.url;
        }
      } catch (err) {
        console.warn('Could not fetch OAuth URL from backend:', err);
      }

      if (!authUrl) {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const clientId = '1081324838634-google-oauth.apps.googleusercontent.com';
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'id_token token',
          scope: 'openid email profile',
          prompt: 'select_account',
          nonce: Math.random().toString(36).substring(2)
        });
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      }

      const width = 500;
      const height = 620;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        authUrl,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!authWindow) {
        cleanup();
        setIsLoading(false);
        setErrorMessage('Popup blocked. Please allow popups for this site to sign in with Google.');
        return;
      }

      popupTimer = setInterval(() => {
        if (authWindow.closed) {
          if (!authHandled) {
            authHandled = true;
            cleanup();
            setIsLoading(false);
            setErrorMessage('Google sign-in was cancelled');
          } else {
            cleanup();
          }
        }
      }, 500);
    } catch (err) {
      cleanup();
      setIsLoading(false);
      setErrorMessage('Google sign-in was cancelled');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 800);
  };

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleFinishOnboarding = () => {
    onLoginSuccess({
      name: fullName || 'Alex',
      email: email || 'user@dreamora.app',
      isGuest: false,
    });
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-4 bg-[#faf6f0] dark:bg-[#05020a] text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-md bg-white/95 dark:bg-[#090514]/95 border border-purple-200/60 dark:border-purple-500/20 rounded-3xl p-6 shadow-2xl dark:shadow-purple-950/40 relative overflow-hidden my-auto animate-fade-in">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* 1. WELCOME SCREEN */}
        {screen === 'welcome' && (
          <div className="flex flex-col items-center text-center space-y-5 py-2">
            <div className="p-3 bg-purple-100/60 dark:bg-purple-950/40 rounded-2xl border border-purple-200/60 dark:border-purple-500/30">
              <Logo size="lg" showText={false} />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Welcome to Dreamora
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-2 font-medium">
                A gentle companion for your sleep and CBT-I journey.
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-2">
              <button
                onClick={() => {
                  setErrorMessage('');
                  setScreen('login');
                }}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all active:scale-[0.98]"
              >
                Log In
              </button>

              <button
                onClick={() => {
                  setErrorMessage('');
                  setScreen('register');
                }}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs rounded-2xl border border-slate-200 dark:border-slate-700 transition-all active:scale-[0.98]"
              >
                Create Account
              </button>

              {/* Guest mode button & explanation */}
              <div className="pt-2">
                <button
                  onClick={onGuestContinue}
                  className="w-full py-2.5 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-800 dark:text-purple-300 font-semibold text-xs rounded-2xl border border-purple-300/60 dark:border-purple-500/30 transition-all"
                >
                  Continue as Guest
                </button>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-tight px-1">
                  Guest mode lets you explore features. Clinical treatment plans and synchronized sleep logs require an account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. LOGIN SCREEN */}
        {screen === 'login' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setErrorMessage('');
                setScreen('welcome');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 dark:text-purple-300 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Continue your sleep journey.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-purple-700 focus:ring-purple-500"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setScreen('forgot');
                  }}
                  className="font-bold text-purple-700 dark:text-purple-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setErrorMessage('');
                  setScreen('register');
                }}
                className="font-bold text-purple-700 dark:text-purple-300 hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        )}

        {/* 3. REGISTER / CREATE ACCOUNT SCREEN */}
        {screen === 'register' && (
          <div className="space-y-3.5">
            <button
              onClick={() => {
                setErrorMessage('');
                setScreen('welcome');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 dark:text-purple-300 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Create your Dreamora account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Start building healthier sleep habits.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-medium">Password strength:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{strengthText}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${(score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-purple-700 focus:ring-purple-500"
                  />
                  <span>
                    I agree to the <span className="font-bold text-purple-700 dark:text-purple-300">Terms</span> and{' '}
                    <span className="font-bold text-purple-700 dark:text-purple-300">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign up with Google
            </button>

            <p className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium pt-1">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setErrorMessage('');
                  setScreen('login');
                }}
                className="font-bold text-purple-700 dark:text-purple-300 hover:underline"
              >
                Log In
              </button>
            </p>
          </div>
        )}

        {/* 4. FORGOT PASSWORD SCREEN */}
        {screen === 'forgot' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setErrorMessage('');
                setResetSent(false);
                setScreen('login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 dark:text-purple-300 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Reset your password
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Enter your registered email to receive a password reset link.
              </p>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-semibold leading-relaxed">
                  Check your email for instructions to reset your password.
                </p>
                <button
                  onClick={() => {
                    setResetSent(false);
                    setScreen('login');
                  }}
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-left">
                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 5. SUCCESS / ACCOUNT SETUP SCREEN */}
        {screen === 'success' && (
          <div className="text-center py-4 space-y-4 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-lg">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Account created
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Welcome to Dreamora, <span className="font-bold text-purple-700 dark:text-purple-300">{fullName || 'friend'}</span>.
              </p>
            </div>

            <button
              onClick={() => setScreen('onboarding')}
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 6. FIRST-TIME ONBOARDING SCREEN */}
        {screen === 'onboarding' && (
          <div className="space-y-4">
            {/* Step progress bar */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1, 2, 3].map((st) => (
                <div
                  key={st}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    st === onboardingStep
                      ? 'w-8 bg-purple-700 dark:bg-purple-400'
                      : st < onboardingStep
                      ? 'w-3 bg-purple-300 dark:bg-purple-800'
                      : 'w-3 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-3 text-left">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    What is your primary sleep goal?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select options that best describe your focus:
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {SLEEP_GOALS.map((g) => {
                    const isSelected = selectedGoals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className={`w-full p-3 rounded-2xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-purple-100/80 dark:bg-purple-950/80 border-purple-400 text-purple-950 dark:text-purple-200 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span>{g.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-purple-700 dark:text-purple-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleFinishOnboarding}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="py-2.5 px-5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-3.5 text-left">
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Your Typical Schedule
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Consistent schedules strengthen your body's circadian rhythm.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Typical Bedtime
                    </label>
                    <input
                      type="text"
                      value={bedtime}
                      onChange={(e) => setBedtime(e.target.value)}
                      placeholder="11:00 PM"
                      className="w-full p-2.5 text-xs font-bold text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Typical Wake-up Time
                    </label>
                    <input
                      type="text"
                      value={wakeUpTime}
                      onChange={(e) => setWakeUpTime(e.target.value)}
                      placeholder="07:00 AM"
                      className="w-full p-2.5 text-xs font-bold text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="py-2.5 px-5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-3.5 text-center">
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Sleep Diary Reminders
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Would you like a gentle morning notification to log your sleep efficiency?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnableReminders(true)}
                    className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                      enableReminders
                        ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Yes, remind me
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableReminders(false)}
                    className={`p-4 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                      !enableReminders
                        ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-slate-400" />
                    Not now
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all mt-4"
                >
                  Enter Dreamora
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
