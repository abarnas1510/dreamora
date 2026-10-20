import {
  ThoughtEntry,
  UserPreferences,
  ClinicalTreatmentPlan,
  AppNotification
} from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';

export interface UserAccountRecord {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
  isGuest: boolean;
  preferences: UserPreferences;
  savedThoughts: ThoughtEntry[];
  activeClinicalPlan: ClinicalTreatmentPlan | null;
  notifications: AppNotification[];
  createdAt: string;
  lastLoginAt: string;
}

const STORAGE_KEY_ACCOUNTS = 'dreamora_user_accounts_v2';
const STORAGE_KEY_ACTIVE_SESSION = 'dreamora_active_session_v2';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  language: 'en',
  textSize: 'normal',
  voiceGuidanceEnabled: true,
  animationEnabled: true,
  hapticEnabled: true,
  notificationEnabled: true,
  preferredAudioVolume: 80,
  preferredActivityDuration: 10
};

function getAllAccounts(): Record<string, UserAccountRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error parsing dreamora accounts:', e);
    return {};
  }
}

function saveAllAccounts(accounts: Record<string, UserAccountRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving dreamora accounts:', e);
  }
}

export function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase() || 'guest@dreamora.app';
}

export function loadUserAccount(email: string): UserAccountRecord | null {
  const norm = normalizeEmail(email);
  const accounts = getAllAccounts();
  return accounts[norm] || null;
}

export function getOrCreateUserAccount(user: {
  name: string;
  email: string;
  isGuest?: boolean;
  avatarUrl?: string;
}): UserAccountRecord {
  const normEmail = normalizeEmail(user.email);
  const accounts = getAllAccounts();

  let existing = accounts[normEmail];
  const now = new Date().toISOString();

  if (existing) {
    existing.lastLoginAt = now;
    if (user.name && user.name !== 'Guest') {
      existing.name = user.name;
    }
    if (user.avatarUrl) {
      existing.avatarUrl = user.avatarUrl;
    }
    accounts[normEmail] = existing;
    saveAllAccounts(accounts);
    return existing;
  }

  // Create new account with initial seed data
  const newAccount: UserAccountRecord = {
    userId: `usr-${Date.now()}`,
    email: normEmail,
    name: user.name || 'Dreamora User',
    avatarUrl: user.avatarUrl || '',
    isGuest: !!user.isGuest,
    preferences: { ...DEFAULT_PREFERENCES },
    savedThoughts: [],
    activeClinicalPlan: null,
    notifications: [...INITIAL_NOTIFICATIONS],
    createdAt: now,
    lastLoginAt: now
  };

  accounts[normEmail] = newAccount;
  saveAllAccounts(accounts);
  return newAccount;
}

export function updateUserAccountData(
  email: string,
  partialData: Partial<UserAccountRecord>
): UserAccountRecord | null {
  const normEmail = normalizeEmail(email);
  const accounts = getAllAccounts();

  if (!accounts[normEmail]) return null;

  accounts[normEmail] = {
    ...accounts[normEmail],
    ...partialData
  };

  saveAllAccounts(accounts);
  return accounts[normEmail];
}

export interface ActiveSessionRecord {
  email: string;
  name: string;
  isGuest: boolean;
  loginTime: string;
  expiresAt: string;
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days session validity

export function saveActiveSession(email: string, name: string, isGuest: boolean): void {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();
    const session: ActiveSessionRecord = {
      email: normalizeEmail(email),
      name,
      isGuest,
      loginTime: now.toISOString(),
      expiresAt
    };
    localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving active session:', e);
  }
}

export function getActiveSession(): ActiveSessionRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function validateAndGetActiveSession(): ActiveSessionRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (!raw) return null;

    const session: ActiveSessionRecord = JSON.parse(raw);
    if (!session || !session.email || !session.expiresAt) {
      clearActiveSession();
      return null;
    }

    // Check expiration timestamp
    const expiresMs = new Date(session.expiresAt).getTime();
    if (isNaN(expiresMs) || Date.now() > expiresMs) {
      console.warn('Active session has expired');
      clearActiveSession();
      return null;
    }

    // Check user account exists
    const account = loadUserAccount(session.email);
    if (!account) {
      clearActiveSession();
      return null;
    }

    return session;
  } catch (e) {
    clearActiveSession();
    return null;
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
  } catch (e) {
    console.error('Error clearing active session:', e);
  }
}
