export type ThemeMode = 'light' | 'dark';
export type ActiveTab = 'home' | 'cbti' | 'monitor' | 'diary' | 'profile' | 'exercises' | 'daytime';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  timezone: string;
  language: string;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
}

export interface UserPreferences {
  theme: ThemeMode;
  language: string;
  textSize: 'normal' | 'large';
  voiceGuidanceEnabled: boolean;
  animationEnabled: boolean;
  hapticEnabled: boolean;
  notificationEnabled: boolean;
  preferredAudioVolume: number;
  preferredActivityDuration: number;
  voiceAssistantEnabled?: boolean;
  voiceLanguage?: string;
  voiceSpeed?: 'slow' | 'normal';
  voiceVolume?: number;
  wakeupAlertEnabled?: boolean;
  windDownReminderEnabled?: boolean;
  sleepDiaryReminderEnabled?: boolean;
  cbtiTaskReminderEnabled?: boolean;
  sleepTrackingReminderEnabled?: boolean;
}

export interface SleepTrackingState {
  isTracking: boolean;
  startedAt: string | null;
  bedtime: string | null;
  elapsedSeconds: number;
  wakeUpTime: string | null;
  lastEndedSummary?: {
    bedtime: string;
    wakeUpTime: string;
    durationMinutes: number;
    formattedDuration: string;
  };
}

export interface NightAwakenings {
  wokeUpCount: number;
  gotOutOfBedCount: number;
}

export interface SleepDiaryEntry {
  id: string;
  userId: string;
  sleepDate: string; // YYYY-MM-DD
  bedtime: string; // HH:MM AM/PM
  estimatedSleepOnsetMinutes: number;
  finalWakeTime: string; // HH:MM AM/PM
  outOfBedTime: string; // HH:MM AM/PM
  numberOfAwakenings: number;
  totalAwakeMinutes: number;
  sleepQuality: number; // 1-5
  userNotes?: string;
  dataSource: 'manual' | 'wearable' | 'automatic_tracking';
  calculatedTotalSleepMinutes?: number;
  calculatedSleepEfficiency?: number;
}

export interface ThoughtEntry {
  id: string;
  userId: string;
  createdAt: string;
  thoughtText: string;
  emotion: string;
  emotionIntensity: number; // 1-10
  context?: string;
  aiReflection?: string;
  guidedReflection?: {
    evidenceFor?: string;
    evidenceAgainst?: string;
    alternativePerspective?: string;
    balancedThought?: string;
  };
}

export interface CbtiPlanItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'exercise' | 'daytime' | 'routine';
  durationMinutes: number;
  completed: boolean;
  iconName: string;
  assignedByClinician?: boolean;
}

export type ClinicalTaskCategory = 
  | 'sleep_education'
  | 'sleep_restriction'
  | 'stimulus_control'
  | 'cognitive_restructuring'
  | 'relaxation'
  | 'pmr'
  | 'breathing'
  | 'storytelling'
  | 'sleep_hygiene'
  | 'relapse_prevention'
  | 'sleep_diary'
  | 'daytime_activity'
  | 'sleep_monitoring'
  | 'custom';

export interface ClinicalPlanTask {
  id: string;
  title: string;
  category: ClinicalTaskCategory;
  instruction: string;
  completed?: boolean;
  linkedFeature?: 'education' | 'thoughts' | 'diary' | 'exercises' | 'pmr' | 'breathing' | 'storytelling' | 'daytime' | 'monitor';
}

export interface ClinicalPlanWeek {
  weekNumber: number;
  title?: string;
  startDate?: string;
  endDate?: string;
  tasks: ClinicalPlanTask[];
}

export interface ClinicalTreatmentPlan {
  id: string;
  userId: string;
  clinicianName: string;
  clinicName?: string;
  startDate: string;
  wakeUpTarget: string; // e.g. "07:00 AM"
  sleepWindowStart: string; // e.g. "11:30 PM"
  sleepWindowEnd: string; // e.g. "07:00 AM"
  assignedExercises: string[];
  bedtimeGuidance?: string;
  notes?: string;
  status: 'draft' | 'pending_review' | 'active' | 'archived';
  sourceType: 'pdf' | 'text' | 'image' | 'document' | 'secure_link' | 'manual';
  confidenceStatus?: 'high' | 'needs_review';
  hasExplicitWeeks?: boolean;
  weeks?: ClinicalPlanWeek[];
  unorganizedTasks?: ClinicalPlanTask[];
  suggestedWeeks?: ClinicalPlanWeek[];
  activationDate?: string;
  currentWeekNumber?: number;
  originalDocumentText?: string;
}

export interface EducationArticle {
  id: string;
  category: 'sleep_basics' | 'sleep_pressure' | 'circadian_rhythm' | 'sleep_habits' | 'sleep_beliefs';
  title: string;
  summary: string;
  content: string;
  durationMinutes: number;
  audioAvailable: boolean;
}

export interface ExerciseItem {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'progressive_muscle_relaxation';
  durationMinutes: number;
  voiceAvailable: boolean;
  animationAvailable: boolean;
  audioAvailable: boolean;
  iconName: string;
  assignedByClinician?: boolean;
}

export type StoryTag = 'Calm' | 'Nature' | 'Peaceful' | 'Bedtime' | 'Stress Relief';
export type StoryLengthCategory = 'short' | 'medium' | 'longer';

export interface SleepStory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  lengthCategory: StoryLengthCategory;
  tags: StoryTag[];
  bgMusicType: 'piano' | 'rain' | 'waves' | 'forest' | 'wind' | 'ambient';
  author: string;
  coverGradient: string;
  iconName: string;
  fullNarrative: string;
  narratives?: {
    en?: string;
    ta?: string;
    te?: string;
    ml?: string;
    kn?: string;
    hi?: string;
  };
  titles?: {
    en?: string;
    ta?: string;
    te?: string;
    ml?: string;
    kn?: string;
    hi?: string;
  };
}

export interface AudioTrack {
  id: string;
  title: string;
  category: 'soft_piano' | 'rain' | 'ocean' | 'forest' | 'fireplace' | 'wind' | 'night_ambience' | 'nature' | 'instrumental';
  durationSeconds: number;
  synthType: 'piano' | 'rain' | 'waves' | 'forest' | 'fireplace' | 'wind' | 'ambient';
  iconName: string;
}

export interface DaytimeActivity {
  id: string;
  title: string;
  description: string;
  category: 'movement' | 'outdoor' | 'mind_focus' | 'everyday' | 'social';
  durationMinutes: number;
  activityType: 'timed' | 'guided' | 'self_reported';
  appropriateFor: string[]; // feelings like ['sleepy', 'bored', 'low']
  iconName: string;
}

export interface QuickGame {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  gameType: 'memory_match' | 'word_challenge' | 'number_puzzle' | 'pattern_game';
  iconName: string;
}

export type NotificationType =
  | 'wake_up'
  | 'wind_down'
  | 'sleep_tracking'
  | 'cbti_task'
  | 'sleep_diary'
  | 'encouragement'
  | 'cbti'
  | 'daytime_activity'
  | 'audio'
  | 'sleep_schedule';

export interface AppNotification {
  id: string;
  eventKey?: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  createdAt: string;
  read: boolean;
  dismissed?: boolean;
  actionText?: string;
  targetView?: 'home' | 'cbti' | 'exercises' | 'sleep-diary' | 'daytime' | 'profile' | 'monitor';
}

export interface OnboardingData {
  goals: string[];
  wakeUpTime: string;
  sleepDiaryReminders: boolean;
  hasClinicalPlan: boolean;
}
