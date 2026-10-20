import React, { useState, useRef } from 'react';
import {
  User,
  Moon,
  Bell,
  Palette,
  ShieldCheck,
  LogOut,
  ChevronRight,
  AlertTriangle,
  FileText,
  Globe,
  Volume2,
  Edit3,
  Check,
  Camera,
  Upload,
  Trash2,
  X,
  Cpu,
  Wifi
} from 'lucide-react';
import { UserProfile, UserPreferences, ClinicalTreatmentPlan } from '../types';
import { getTranslations } from '../lib/i18n';

interface ProfileViewProps {
  userProfile: UserProfile;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onUpdateProfile?: (profile: Partial<UserProfile>) => void;
  activeClinicalPlan: ClinicalTreatmentPlan | null;
  onOpenClinicalPlanModal: () => void;
  onUpdateClinicalPlan?: (plan: ClinicalTreatmentPlan | null) => void;
  onLogout: () => void;
}

const PRESET_AVATARS = [
  { id: 'moon', name: 'Peaceful Moon', url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=200&auto=format&fit=crop&q=80' },
  { id: 'night', name: 'Starry Night', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200&auto=format&fit=crop&q=80' },
  { id: 'zen', name: 'Zen Water', url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=200&auto=format&fit=crop&q=80' },
  { id: 'aurora', name: 'Cosmic Glow', url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=200&auto=format&fit=crop&q=80' },
  { id: 'forest', name: 'Silent Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&auto=format&fit=crop&q=80' },
  { id: 'sunset', name: 'Twilight Sky', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&auto=format&fit=crop&q=80' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'zh', name: '中文 (Mandarin)' },
  { code: 'ja', name: '日本語 (Japanese)' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  preferences,
  onUpdatePreferences,
  onUpdateProfile,
  activeClinicalPlan,
  onOpenClinicalPlanModal,
  onUpdateClinicalPlan,
  onLogout
}) => {
  const t = getTranslations(preferences.language || 'en');

  // Modal open states
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showDeviceSupportModal, setShowDeviceSupportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);

  // Photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(userProfile.avatarUrl || '');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit profile form state
  const [editFirstName, setEditFirstName] = useState(userProfile.firstName || 'Dreamora');
  const [editLastName, setEditLastName] = useState(userProfile.lastName || 'User');
  const [editEmail, setEditEmail] = useState(userProfile.email || 'user@dreamora.app');

  const handleOpenPhotoModal = () => {
    setSelectedPhotoUrl(userProfile.avatarUrl || '');
    setPhotoError(null);
    setIsPhotoModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Image size exceeds 5MB limit. Please choose a smaller file.');
        return;
      }
      setPhotoError(null);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ avatarUrl: selectedPhotoUrl });
    }
    setIsPhotoModalOpen(false);
  };

  const handleRemovePhoto = () => {
    setSelectedPhotoUrl('');
  };

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail
      });
    }
    setIsEditingAccount(false);
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === (preferences.language || 'en'));
  const currentLangName = currentLangObj ? currentLangObj.name : 'English';
  const isVoiceEnabled = preferences.voiceAssistantEnabled !== false;
  const isNotifEnabled = preferences.notificationEnabled !== false;
  const currentThemeLabel = preferences.theme === 'light' ? 'Light 🌞' : 'Dark 🌙';

  return (
    <div className="pb-24 space-y-3 animate-fade-in w-full max-w-lg mx-auto text-left">
      {/* 1. PROFILE HEADER */}
      <section className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 bg-purple-50/80 dark:bg-gradient-to-br dark:from-purple-950/60 dark:via-indigo-950/40 dark:to-slate-900 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <button
              onClick={handleOpenPhotoModal}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-400 text-white flex items-center justify-center font-bold text-lg shadow-md border border-purple-400/30 overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-purple-400"
              title="Change Profile Photo"
            >
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.firstName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{editFirstName ? editFirstName[0] : 'D'}</span>
              )}
            </button>
            <button
              onClick={handleOpenPhotoModal}
              className="absolute -bottom-0.5 -right-0.5 p-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-xs border border-white dark:border-slate-900"
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {userProfile.firstName || 'Dreamora User'} {userProfile.lastName || ''}
            </h2>
            <p className="text-xs text-slate-500 dark:text-purple-200 truncate mt-0.5">
              {userProfile.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditingAccount(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 border border-purple-200 dark:border-purple-400/30 text-purple-900 dark:text-purple-200 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </section>

      {/* 2. CLINICAL TREATMENT PLAN */}
      <section className="glass-card p-3.5 border border-purple-200 dark:border-purple-500/25 bg-purple-50/40 dark:bg-slate-900/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Clinical Treatment Plan
            </h3>
          </div>
          {activeClinicalPlan && (
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-300/40">
              ✓ Active
            </span>
          )}
        </div>

        {activeClinicalPlan ? (
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-500/15 space-y-1.5 text-xs">
            <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
              <span>Week {activeClinicalPlan.currentWeekNumber || 1} of {activeClinicalPlan.weeks?.length || 4}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Wake target:</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">{activeClinicalPlan.wakeUpTarget}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Sleep window:</span>
              <span className="font-bold text-purple-700 dark:text-purple-300">
                {activeClinicalPlan.sleepWindowStart} – {activeClinicalPlan.sleepWindowEnd}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No active clinician plan connected.
          </p>
        )}

        <button
          onClick={onOpenClinicalPlanModal}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-98"
        >
          View Plan
        </button>
      </section>

      {/* 3. LANGUAGE */}
      <div
        onClick={() => setShowLanguageModal(true)}
        className="glass-card p-3.5 border border-slate-200 dark:border-slate-800 hover:border-purple-400 flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Globe className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Language</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
          <span>{currentLangName}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 4. VOICE COMPANION */}
      <div
        onClick={() => setShowVoiceModal(true)}
        className="glass-card p-3.5 border border-slate-200 dark:border-slate-800 hover:border-purple-400 flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Dreamora Voice</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
          <span>{isVoiceEnabled ? 'Enabled' : 'Disabled'}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 5. NOTIFICATIONS */}
      <div
        onClick={() => setShowNotificationsModal(true)}
        className="glass-card p-3.5 border border-slate-200 dark:border-slate-800 hover:border-purple-400 flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Bell className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
          <span>{isNotifEnabled ? 'Enabled' : 'Disabled'}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 6. APPEARANCE */}
      <div
        onClick={() => setShowAppearanceModal(true)}
        className="glass-card p-3.5 border border-slate-200 dark:border-slate-800 hover:border-purple-400 flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Palette className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Appearance</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
          <span>{currentThemeLabel}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 7. DEVICE & TECHNICAL SUPPORT */}
      <div
        onClick={() => setShowDeviceSupportModal(true)}
        className="glass-card p-3.5 border border-slate-200 dark:border-slate-800 hover:border-purple-400 flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Device & Technical Support
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 8. PRIVACY & DATA */}
      <div
        onClick={() => setShowPrivacyModal(true)}
        className="glass-card p-3.5 border border-slate-200 dark:border-slate-800 hover:border-purple-400 flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Privacy & Data</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 9. LOG OUT */}
      <div className="pt-4 text-center">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200/60 dark:border-rose-900/40"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* MODAL: LANGUAGE SELECTION */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                Select App Language
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onUpdatePreferences({ language: lang.code, voiceLanguage: lang.code });
                    setShowLanguageModal(false);
                  }}
                  className={`p-3 rounded-2xl border text-left font-semibold text-xs transition-all flex items-center justify-between ${
                    (preferences.language || 'en') === lang.code
                      ? 'bg-purple-100 dark:bg-purple-950 border-purple-600 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-300'
                  }`}
                >
                  <span className="truncate">{lang.name}</span>
                  {(preferences.language || 'en') === lang.code && (
                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VOICE COMPANION SETTINGS */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600" />
                Dreamora Voice Settings
              </h3>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Voice Companion</span>
                  <span className="text-[10px] text-slate-500">Enable audio reading for guidance</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.voiceAssistantEnabled !== false}
                  onChange={(e) => onUpdatePreferences({ voiceAssistantEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Voice Language
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold">
                  {currentLangName} (Synced with App Language)
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Voice Speed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdatePreferences({ voiceSpeed: 'slow' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      preferences.voiceSpeed === 'slow'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Slow (Calm)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdatePreferences({ voiceSpeed: 'normal' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      preferences.voiceSpeed !== 'slow'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Normal
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowVoiceModal(false)}
              className="w-full py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NOTIFICATION SETTINGS */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notification Settings
              </h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* WAKE-UP ALERT */}
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100">Wake-up Alert</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                    Target: {activeClinicalPlan?.wakeUpTarget || '07:00 AM'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.wakeupAlertEnabled !== false}
                  onChange={(e) => onUpdatePreferences({ wakeupAlertEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              {/* WIND-DOWN REMINDER */}
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100">Wind-down Reminder</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                    Target: {activeClinicalPlan?.sleepWindowStart || '11:30 PM'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.windDownReminderEnabled !== false}
                  onChange={(e) => onUpdatePreferences({ windDownReminderEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              {/* SLEEP DIARY REMINDER */}
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100">Sleep Diary Reminder</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                    Morning reminder at 7:30 AM
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.sleepDiaryReminderEnabled !== false}
                  onChange={(e) => onUpdatePreferences({ sleepDiaryReminderEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>

              {/* CBT-I TASK REMINDER */}
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold block text-slate-900 dark:text-slate-100">CBT-I Task Reminder</span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                    Alerts for active incomplete CBT-I tasks
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.cbtiTaskReminderEnabled !== false}
                  onChange={(e) => onUpdatePreferences({ cbtiTaskReminderEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL: APPEARANCE SETTINGS */}
      {showAppearanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Theme Appearance
              </h3>
              <button
                onClick={() => setShowAppearanceModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  onUpdatePreferences({ theme: 'light' });
                  setShowAppearanceModal(false);
                }}
                className={`w-full p-3 rounded-2xl border text-left font-bold text-xs flex items-center justify-between ${
                  preferences.theme === 'light'
                    ? 'bg-amber-100 border-amber-400 text-amber-950'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>Light Theme 🌞</span>
                {preferences.theme === 'light' && <Check className="w-4 h-4 text-amber-800" />}
              </button>

              <button
                onClick={() => {
                  onUpdatePreferences({ theme: 'dark' });
                  setShowAppearanceModal(false);
                }}
                className={`w-full p-3 rounded-2xl border text-left font-bold text-xs flex items-center justify-between ${
                  preferences.theme === 'dark'
                    ? 'bg-purple-950 border-purple-500 text-purple-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>Dark Theme 🌙</span>
                {preferences.theme === 'dark' && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRIVACY & DATA */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Privacy & Data Controls
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Dreamora stores your sleep data securely. You can manage your account retention or perform a full data deletion below.
              </p>

              <button
                onClick={() => {
                  setShowPrivacyModal(false);
                  setShowDeleteModal(true);
                }}
                className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center justify-between hover:bg-rose-100 transition-colors"
              >
                <span>Delete Account & Data</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DEVICE SUPPORT DIAGNOSTICS */}
      {showDeviceSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/20 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Device Support Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setShowDeviceSupportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Hardware, firmware, and cloud connection diagnostics for support and developers.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Device Connection</span>
                  <span className="text-emerald-600 dark:text-emerald-400">🟢 Connected</span>
                </div>
                <p className="text-[11px] text-slate-500">ESP32 Bedside Controller • Firmware v2.4.1</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Cloud API Sync Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400">🟢 Operational</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono">/api/telemetry/ingest</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Sensor Diagnostics</span>
                  <span className="text-indigo-600 dark:text-indigo-400">5/5 Channels Active</span>
                </div>
                <p className="text-[11px] text-slate-500">EEG Lead Line, Optical PPG, Digital Thermal, 3-Axis Motion, Respiration Band</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDeviceSupportModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACCOUNT PROFILE */}
      {isEditingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-purple-600" />
              Edit Account Information
            </h3>

            <div className="flex items-center gap-3 p-3 bg-purple-50/80 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/40">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-200 dark:bg-purple-900 shrink-0 border border-purple-300 flex items-center justify-center">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-purple-800 dark:text-purple-200">{editFirstName ? editFirstName[0] : 'D'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Profile Picture</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Upload photo or pick a preset</span>
              </div>
              <button
                type="button"
                onClick={handleOpenPhotoModal}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                Change
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">First Name</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Last Name</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditingAccount(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROFILE PHOTO */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 text-left relative">
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Camera className="w-4.5 h-4.5 text-purple-600" />
              Update Profile Photo
            </h3>

            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="w-20 h-20 rounded-full border-2 border-purple-500 shadow-lg overflow-hidden relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {selectedPhotoUrl ? (
                  <img src={selectedPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-400 text-white flex items-center justify-center font-bold text-2xl">
                    {editFirstName ? editFirstName[0] : 'D'}
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedPhotoUrl ? 'Photo preview ready' : 'Default avatar'}
              </p>
            </div>

            {photoError && (
              <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-xl text-center font-medium">
                {photoError}
              </p>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="space-y-2 pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Photo from Device
              </button>

              {selectedPhotoUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Photo
                </button>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Or choose a serene preset avatar:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPhotoUrl(preset.url);
                      setPhotoError(null);
                    }}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all p-1 flex flex-col items-center gap-1 group ${
                      selectedPhotoUrl === preset.url
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 ring-1 ring-purple-400 scale-105'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 relative">
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {selectedPhotoUrl === preset.url && (
                        <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate w-full text-center">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePhoto}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ACCOUNT CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-3 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete your Dreamora account?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete your account and associated sleep data according to our retention policy.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  onLogout();
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOGOUT CONFIRMATION */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-3 text-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Log out of Dreamora?</h3>
            <p className="text-xs text-slate-500">
              Your local session will be cleared safely.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  onLogout();
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
