import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveTab,
  AudioTrack,
  QuickGame,
  ThoughtEntry,
  UserPreferences,
  ClinicalTreatmentPlan,
  AppNotification
} from './types';
import { INITIAL_NOTIFICATIONS } from './data/mockData';
import {
  getOrCreateUserAccount,
  updateUserAccountData,
  saveActiveSession,
  getActiveSession,
  validateAndGetActiveSession,
  loadUserAccount,
  clearActiveSession,
  UserAccountRecord
} from './lib/userAccountStore';
import { evaluateAndGenerateNotifications } from './lib/notificationManager';

// Layout & Splash Components
import { SplashScreen } from './components/SplashScreen';
import { AuthFlow, AuthScreenType } from './components/AuthFlow';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AudioPlayerBar } from './components/AudioPlayerBar';

// Views
import { HomeView } from './components/HomeView';
import { CbtiView } from './components/CbtiView';
import { MonitorView } from './components/MonitorView';
import { ExercisesView } from './components/ExercisesView';
import { DaytimeActivitiesView } from './components/DaytimeActivitiesView';
import { SleepDiaryView } from './components/SleepDiaryView';
import { ProfileView } from './components/ProfileView';

// Modals
import { ThoughtEntryModal } from './components/ThoughtEntryModal';
import { BreathingExerciseModal } from './components/BreathingExerciseModal';
import { PmrExerciseModal } from './components/PmrExerciseModal';
import { QuickGamesModal } from './components/QuickGamesModal';
import { ClinicalPlanModal } from './components/ClinicalPlanModal';
import { NotificationCenter } from './components/NotificationCenter';
import { VoiceCompanionModal } from './components/VoiceCompanionModal';
import { stopSpeech } from './lib/audioSynth';

export type AuthState = 'AUTHENTICATING' | 'AUTHENTICATED' | 'UNAUTHENTICATED' | 'ERROR';

export function App() {
  // Authentication State
  const [authState, setAuthState] = useState<AuthState>('AUTHENTICATING');
  const [appPhase, setAppPhase] = useState<'splash' | 'auth' | 'main'>('splash');
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('login');
  const [prefilledEmail, setPrefilledEmail] = useState<string>('');

  // Active User Account state
  const [activeAccount, setActiveAccount] = useState<UserAccountRecord | null>(null);
  const [userName, setUserName] = useState<string>('Alex');
  const [userEmail, setUserEmail] = useState<string>('alex@example.com');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [isGuestUser, setIsGuestUser] = useState<boolean>(false);

  // User Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    textSize: 'normal',
    voiceGuidanceEnabled: true,
    animationEnabled: true,
    hapticEnabled: true,
    notificationEnabled: true,
    preferredAudioVolume: 80,
    preferredActivityDuration: 10
  });

  // User Account Data states
  const [savedThoughts, setSavedThoughts] = useState<ThoughtEntry[]>([]);
  const [activeClinicalPlan, setActiveClinicalPlan] = useState<ClinicalTreatmentPlan | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Active audio player & quick game state
  const [activeAudioTrack, setActiveAudioTrack] = useState<AudioTrack | null>(null);
  const [activeGame, setActiveGame] = useState<QuickGame | null>(null);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Modal open states
  const [isThoughtModalOpen, setIsThoughtModalOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [isPmrModalOpen, setIsPmrModalOpen] = useState(false);
  const [isGamesModalOpen, setIsGamesModalOpen] = useState(false);
  const [isClinicalPlanModalOpen, setIsClinicalPlanModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Ref to track state changes internally for popstate
  const isSyncingFromHash = useRef(false);

  // Theme application
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.theme]);

  // Sync state changes back to user account store
  useEffect(() => {
    if (activeAccount && userEmail && authState === 'AUTHENTICATED') {
      updateUserAccountData(userEmail, {
        name: userName,
        avatarUrl: userAvatar,
        preferences,
        savedThoughts,
        activeClinicalPlan,
        notifications
      });
    }
  }, [preferences, savedThoughts, activeClinicalPlan, notifications, userName, userAvatar, activeAccount, userEmail, authState]);

  // Helper to load user account data into React state
  const applyAccountData = useCallback((account: UserAccountRecord) => {
    setActiveAccount(account);
    setUserName(account.name);
    setUserEmail(account.email);
    setUserAvatar(account.avatarUrl || '');
    setIsGuestUser(account.isGuest || false);
    if (account.preferences) setPreferences(account.preferences);
    if (account.savedThoughts) setSavedThoughts(account.savedThoughts);
    if (account.activeClinicalPlan !== undefined) setActiveClinicalPlan(account.activeClinicalPlan);
    if (account.notifications && Array.isArray(account.notifications)) {
      setNotifications(account.notifications);
    }
  }, []);

  // Evaluate & generate event-driven notifications without duplicates
  useEffect(() => {
    if (authState === 'AUTHENTICATED' && userEmail) {
      setNotifications((prev) => {
        const { notifications: updated } = evaluateAndGenerateNotifications({
          currentNotifications: prev,
          preferences,
          activeClinicalPlan,
          isSleepTracking: false,
          userId: userEmail
        });
        return updated;
      });
    }
  }, [authState, userEmail, preferences, activeClinicalPlan]);

  // Handler when splash screen finishes
  const handleSplashFinished = () => {
    // Validate existing active session
    const validSession = validateAndGetActiveSession();
    if (validSession) {
      const account = loadUserAccount(validSession.email);
      if (account) {
        applyAccountData(account);
        setAuthState('AUTHENTICATED');
        setAppPhase('main');
        setActiveTab('home');
        if (window.location.hash !== '#/home') {
          window.history.replaceState(null, '', '#/home');
        }
        return;
      }
    }

    // Session expired or invalid -> Show Login page
    const lastSession = getActiveSession();
    if (lastSession?.email) {
      setPrefilledEmail(lastSession.email);
    }
    setAuthState('UNAUTHENTICATED');
    setAppPhase('auth');
    setAuthScreen('login');
    if (window.location.hash !== '#/login') {
      window.history.replaceState(null, '', '#/login');
    }
  };

  // Auth Flow Completion Handler
  const handleAuthSuccess = (user: { name: string; email: string; avatarUrl?: string; isGuest?: boolean }) => {
    setAuthState('AUTHENTICATING');

    setTimeout(() => {
      try {
        const account = getOrCreateUserAccount({
          name: user.name,
          email: user.email || (user.isGuest ? 'guest@dreamora.app' : 'user@dreamora.app'),
          avatarUrl: user.avatarUrl,
          isGuest: !!user.isGuest
        });

        applyAccountData(account);
        saveActiveSession(account.email, account.name, !!account.isGuest);

        setAuthState('AUTHENTICATED');
        setAppPhase('main');
        setActiveTab('home');

        if (window.location.hash !== '#/home') {
          window.location.hash = '#/home';
        }
      } catch (err) {
        console.error('Failed to complete auth:', err);
        setAuthState('ERROR');
      }
    }, 400);
  };

  const handleGuestContinue = () => {
    handleAuthSuccess({
      name: 'Guest',
      email: 'guest@dreamora.app',
      isGuest: true
    });
  };

  const handleLogout = () => {
    clearActiveSession();
    setActiveAccount(null);
    setAuthState('UNAUTHENTICATED');
    setAppPhase('auth');
    setAuthScreen('login');
    if (window.location.hash !== '#/login') {
      window.history.replaceState(null, '', '#/login');
    }
  };

  // Navigation & Route Hash Handler
  const syncRouteFromHash = useCallback(() => {
    stopSpeech();
    const rawHash = window.location.hash || '#/login';

    if (authState !== 'AUTHENTICATED') {
      if (rawHash !== '#/login' && rawHash !== '#/welcome' && rawHash !== '#/register' && rawHash !== '#/forgot') {
        window.history.replaceState(null, '', '#/login');
      }
      return;
    }

    // Authenticated Guard
    if (rawHash === '#/login' || rawHash === '#/welcome' || rawHash === '#/register' || rawHash === '#/' || !rawHash) {
      window.history.replaceState(null, '', '#/home');
      setActiveTab('home');
      setIsThoughtModalOpen(false);
      setIsBreathingModalOpen(false);
      setIsPmrModalOpen(false);
      setIsGamesModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);
      return;
    }

    isSyncingFromHash.current = true;

    // Map Hash to Tabs & Modals
    if (rawHash === '#/home') {
      setActiveTab('home');
      setIsThoughtModalOpen(false);
      setIsBreathingModalOpen(false);
      setIsPmrModalOpen(false);
      setIsGamesModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);
    } else if (rawHash === '#/cbti') {
      setActiveTab('cbti');
      setIsThoughtModalOpen(false);
      setIsBreathingModalOpen(false);
      setIsPmrModalOpen(false);
      setIsGamesModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);
    } else if (rawHash === '#/monitor') {
      setActiveTab('monitor');
      setIsThoughtModalOpen(false);
      setIsBreathingModalOpen(false);
      setIsPmrModalOpen(false);
      setIsGamesModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);
    } else if (rawHash.startsWith('#/exercises')) {
      setActiveTab('exercises');
      setIsThoughtModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);

      if (rawHash === '#/exercises/breathing') {
        setIsBreathingModalOpen(true);
        setIsPmrModalOpen(false);
        setIsGamesModalOpen(false);
      } else if (rawHash === '#/exercises/pmr') {
        setIsPmrModalOpen(true);
        setIsBreathingModalOpen(false);
        setIsGamesModalOpen(false);
      } else if (rawHash === '#/exercises/games') {
        setIsGamesModalOpen(true);
        setIsBreathingModalOpen(false);
        setIsPmrModalOpen(false);
      } else {
        setIsBreathingModalOpen(false);
        setIsPmrModalOpen(false);
        setIsGamesModalOpen(false);
      }
    } else if (rawHash === '#/diary') {
      setActiveTab('diary');
      setIsThoughtModalOpen(false);
      setIsBreathingModalOpen(false);
      setIsPmrModalOpen(false);
      setIsGamesModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);
    } else if (rawHash === '#/daytime') {
      setActiveTab('daytime');
      setIsThoughtModalOpen(false);
      setIsBreathingModalOpen(false);
      setIsPmrModalOpen(false);
      setIsGamesModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);
    } else if (rawHash === '#/profile') {
      setActiveTab('profile');
      setIsThoughtModalOpen(false);
      setIsBreathingModalOpen(false);
      setIsPmrModalOpen(false);
      setIsGamesModalOpen(false);
      setIsClinicalPlanModalOpen(false);
      setIsNotificationOpen(false);
      setIsVoiceModalOpen(false);
    } else if (rawHash === '#/thoughts/new') {
      setIsThoughtModalOpen(true);
    } else if (rawHash === '#/notifications') {
      setIsNotificationOpen(true);
    } else if (rawHash === '#/clinical-plan') {
      setIsClinicalPlanModalOpen(true);
    } else if (rawHash === '#/voice') {
      setIsVoiceModalOpen(true);
    }

    setTimeout(() => {
      isSyncingFromHash.current = false;
    }, 50);
  }, [authState]);

  // Window Listeners for Back/Forward Navigation
  useEffect(() => {
    const handlePopState = () => {
      syncRouteFromHash();
    };

    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('popstate', handlePopState);

    if (authState === 'AUTHENTICATED' && appPhase === 'main') {
      syncRouteFromHash();
    }

    return () => {
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [authState, appPhase, syncRouteFromHash]);

  // Stop speech synthesis whenever the active tab changes
  useEffect(() => {
    stopSpeech();
  }, [activeTab]);

  // UI Action Helpers for Hash Stack
  const navigateToTab = (tab: ActiveTab) => {
    stopSpeech();
    setActiveTab(tab);
    const targetHash = `#/${tab}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  const openModalWithHash = (modalPath: string, setOpenState: (v: boolean) => void) => {
    setOpenState(true);
    const targetHash = `#/${modalPath}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  };

  const closeModalWithHash = (setOpenState: (v: boolean) => void) => {
    setOpenState(false);
    if (window.location.hash.includes('/') && window.location.hash !== `#/${activeTab}`) {
      window.history.back();
    }
  };

  const toggleTheme = () => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateProfile = (profile: { firstName?: string; lastName?: string; email?: string; avatarUrl?: string }) => {
    if (profile.firstName) setUserName(profile.firstName);
    if (profile.email) setUserEmail(profile.email);
    if (profile.avatarUrl !== undefined) setUserAvatar(profile.avatarUrl);
  };

  const handleSaveThought = (entry: ThoughtEntry) => {
    setSavedThoughts((prev) => [entry, ...prev]);
  };

  const handleSaveClinicalPlan = (plan: ClinicalTreatmentPlan) => {
    setActiveClinicalPlan(plan);
  };

  const handleStartGame = (game: QuickGame) => {
    setActiveGame(game);
    openModalWithHash('exercises/games', setIsGamesModalOpen);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    closeModalWithHash(setIsNotificationOpen);

    if (notif.targetView) {
      if (notif.targetView === 'sleep-diary') navigateToTab('diary');
      else if (notif.targetView === 'cbti') navigateToTab('cbti');
      else if (notif.targetView === 'exercises') navigateToTab('exercises');
      else if (notif.targetView === 'daytime') navigateToTab('daytime');
      else if (notif.targetView === 'profile') navigateToTab('profile');
      else if (notif.targetView === 'monitor') navigateToTab('monitor');
      else if (notif.targetView === 'home') navigateToTab('home');
    } else {
      if (notif.type === 'sleep_diary' || notif.type === 'wake_up') navigateToTab('diary');
      else if (notif.type === 'cbti' || notif.type === 'cbti_task') navigateToTab('cbti');
      else if (notif.type === 'wind_down' || notif.type === 'audio') navigateToTab('exercises');
      else if (notif.type === 'sleep_tracking') navigateToTab('monitor');
      else if (notif.type === 'daytime_activity') navigateToTab('daytime');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length;

  return (
    <div className="min-h-[100dvh] w-full bg-[#faf6f0] dark:bg-[#05020a] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans antialiased selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Background glow layer */}
      <div className="atmosphere fixed inset-0 pointer-events-none" />

      {/* 1. SPLASH SCREEN */}
      {appPhase === 'splash' && (
        <SplashScreen onFinish={handleSplashFinished} durationMs={1800} />
      )}

      {/* 2. AUTHENTICATION / LOGIN SCREEN */}
      {appPhase === 'auth' && (
        <AuthFlow
          initialScreen={authScreen}
          prefilledEmail={prefilledEmail}
          onLoginSuccess={handleAuthSuccess}
          onGuestContinue={handleGuestContinue}
        />
      )}

      {/* 3. MAIN AUTHENTICATED APPLICATION */}
      {appPhase === 'main' && authState === 'AUTHENTICATED' && (
        <div className="max-w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto h-[100dvh] min-h-[100dvh] w-full bg-[#faf6f0]/95 dark:bg-[#090514]/95 backdrop-blur-xl shadow-2xl dark:shadow-purple-950/50 relative flex flex-col border-x border-amber-900/10 dark:border-purple-500/15 overflow-hidden transition-all duration-300">
          {/* Header Bar */}
          <Header
            activeTab={activeTab}
            theme={preferences.theme}
            onToggleTheme={toggleTheme}
            unreadNotificationCount={unreadCount}
            onOpenNotifications={() => openModalWithHash('notifications', setIsNotificationOpen)}
            onOpenProfile={() => navigateToTab('profile')}
            onOpenDaytimeActivities={() => navigateToTab('daytime')}
            onOpenVoiceCompanion={() => openModalWithHash('voice', setIsVoiceModalOpen)}
            userName={userName}
            userAvatar={userAvatar}
          />

          {/* View Routing */}
          <main className="flex-1 overflow-y-auto px-4 pt-3 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] w-full box-border">
            {activeTab === 'home' && (
              <HomeView
                userName={userName}
                userId={userEmail}
                onOpenThoughtModal={() => openModalWithHash('thoughts/new', setIsThoughtModalOpen)}
                onOpenDaytimeView={() => navigateToTab('daytime')}
                onOpenCbtiView={() => navigateToTab('cbti')}
                onOpenExercisesView={() => navigateToTab('exercises')}
                onOpenMonitorView={() => navigateToTab('monitor')}
                onStartExerciseModal={(exerciseId) => {
                  if (exerciseId === 'ex-breathing') openModalWithHash('exercises/breathing', setIsBreathingModalOpen);
                  else openModalWithHash('exercises/pmr', setIsPmrModalOpen);
                }}
                savedThoughts={savedThoughts}
                language={preferences.language}
              />
            )}

            {activeTab === 'cbti' && (
              <CbtiView
                activeClinicalPlan={activeClinicalPlan}
                onUpdateClinicalPlan={(plan) => handleSaveClinicalPlan(plan!)}
                onOpenThoughtModal={() => openModalWithHash('thoughts/new', setIsThoughtModalOpen)}
                onOpenClinicalPlanModal={() => openModalWithHash('clinical-plan', setIsClinicalPlanModalOpen)}
                onNavigateTab={(tab) => navigateToTab(tab)}
                onOpenPmrModal={() => openModalWithHash('exercises/pmr', setIsPmrModalOpen)}
                onOpenBreathingModal={() => openModalWithHash('exercises/breathing', setIsBreathingModalOpen)}
                savedThoughts={savedThoughts}
                language={preferences.language}
              />
            )}

            {activeTab === 'monitor' && (
              <MonitorView userName={userName} userId={userEmail} language={preferences.language} />
            )}

            {activeTab === 'exercises' && (
              <ExercisesView
                onStartBreathingModal={() => openModalWithHash('exercises/breathing', setIsBreathingModalOpen)}
                onStartPmrModal={() => openModalWithHash('exercises/pmr', setIsPmrModalOpen)}
                onSelectAudioTrack={(track) => setActiveAudioTrack(track)}
                language={preferences.language}
              />
            )}

            {activeTab === 'daytime' && (
              <DaytimeActivitiesView onStartGame={handleStartGame} />
            )}

            {activeTab === 'diary' && <SleepDiaryView userId={userEmail} />}

            {activeTab === 'profile' && (
              <ProfileView
                userProfile={{
                  id: 'u-1',
                  firstName: userName,
                  lastName: '',
                  email: userEmail,
                  avatarUrl: userAvatar,
                  timezone: 'UTC',
                  language: preferences.language,
                  emailVerified: true,
                  createdAt: new Date().toISOString(),
                  hasCompletedOnboarding: true
                }}
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onUpdateProfile={handleUpdateProfile}
                activeClinicalPlan={activeClinicalPlan}
                onOpenClinicalPlanModal={() => openModalWithHash('clinical-plan', setIsClinicalPlanModalOpen)}
                onUpdateClinicalPlan={(plan) => handleSaveClinicalPlan(plan!)}
                onLogout={handleLogout}
              />
            )}
          </main>

          {/* Global Audio Player Floating Bar */}
          {activeAudioTrack && (
            <AudioPlayerBar
              track={activeAudioTrack}
              onCloseTrack={() => setActiveAudioTrack(null)}
            />
          )}

          {/* Bottom Navigation */}
          <BottomNav activeTab={activeTab} onChangeTab={navigateToTab} language={preferences.language} />
        </div>
      )}

      {/* Feature Modals */}
      <ThoughtEntryModal
        isOpen={isThoughtModalOpen}
        onClose={() => closeModalWithHash(setIsThoughtModalOpen)}
        onSaveThought={handleSaveThought}
        language={preferences.language}
      />

      <BreathingExerciseModal
        isOpen={isBreathingModalOpen}
        onClose={() => closeModalWithHash(setIsBreathingModalOpen)}
        onCompleteExercise={() => {}}
        language={preferences.language}
      />

      <PmrExerciseModal
        isOpen={isPmrModalOpen}
        onClose={() => closeModalWithHash(setIsPmrModalOpen)}
        onCompleteExercise={() => {}}
        language={preferences.language}
      />

      <QuickGamesModal
        isOpen={isGamesModalOpen}
        onClose={() => closeModalWithHash(setIsGamesModalOpen)}
        selectedGame={activeGame}
      />

      <ClinicalPlanModal
        isOpen={isClinicalPlanModalOpen}
        onClose={() => closeModalWithHash(setIsClinicalPlanModalOpen)}
        onSavePlan={handleSaveClinicalPlan}
        activePlan={activeClinicalPlan}
      />

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => closeModalWithHash(setIsNotificationOpen)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onMarkAsRead={handleMarkNotificationRead}
        onDismissNotification={handleDismissNotification}
        onSelectNotification={handleSelectNotification}
      />

      <VoiceCompanionModal
        isOpen={isVoiceModalOpen}
        onClose={() => closeModalWithHash(setIsVoiceModalOpen)}
        userName={userName}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onSaveThought={(entry) =>
          handleSaveThought({
            id: 'thought-' + Date.now(),
            userId: 'user-1',
            createdAt: new Date().toISOString(),
            thoughtText: entry.thoughtText,
            emotion: entry.emotion || 'Sleep Concern',
            emotionIntensity: 6
          })
        }
        onOpenExercise={(ex) => {
          if (ex.includes('Breathing')) openModalWithHash('exercises/breathing', setIsBreathingModalOpen);
          else if (ex.includes('Pmr')) openModalWithHash('exercises/pmr', setIsPmrModalOpen);
          else navigateToTab('exercises');
        }}
        targetWakeTime={activeClinicalPlan?.wakeUpTarget || '07:00 AM'}
      />
    </div>
  );
}

export default App;

