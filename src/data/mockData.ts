import {
  EducationArticle,
  ExerciseItem,
  AudioTrack,
  DaytimeActivity,
  QuickGame,
  CbtiPlanItem,
  AppNotification,
  SleepDiaryEntry
} from '../types';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-seed-wakeup-1',
    eventKey: 'wake-up-2026-08-11',
    type: 'wake_up',
    title: '🌅 Wake-up time',
    body: 'Good morning. Your planned wake-up time is 7:00 AM.',
    timestamp: 'Yesterday, 7:00 AM',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    dismissed: false,
    actionText: 'View Diary',
    targetView: 'sleep-diary'
  },
  {
    id: 'notif-seed-winddown-1',
    eventKey: 'wind-down-2026-08-11',
    type: 'wind_down',
    title: '🌙 Wind-down reminder',
    body: 'Your planned sleep window begins at 11:30 PM.',
    timestamp: 'Yesterday, 11:30 PM',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    read: true,
    dismissed: false,
    actionText: 'Start Wind-down',
    targetView: 'exercises'
  },
  {
    id: 'notif-seed-diary-1',
    eventKey: 'sleep-diary-2026-08-12',
    type: 'sleep_diary',
    title: '📔 Sleep Diary',
    body: 'Record last night’s sleep in your Sleep Diary.',
    timestamp: 'Today, 7:30 AM',
    createdAt: new Date().toISOString(),
    read: false,
    dismissed: false,
    actionText: 'Record Now',
    targetView: 'sleep-diary'
  },
  {
    id: 'notif-seed-cbti-1',
    eventKey: 'cbti-task-2026-08-12-task1',
    type: 'cbti_task',
    title: '🧠 CBT-I task',
    body: 'You have a CBT-I task to complete today: Cognitive Restructuring.',
    timestamp: 'Today, 8:00 AM',
    createdAt: new Date().toISOString(),
    read: false,
    dismissed: false,
    actionText: 'View Task',
    targetView: 'cbti'
  }
];

export const INITIAL_CBTI_PLAN: CbtiPlanItem[] = [
  {
    id: 'plan-1',
    title: 'CBT-I Exercise',
    subtitle: 'Challenge a sleep-related thought',
    category: 'exercise',
    durationMinutes: 10,
    completed: false,
    iconName: 'Brain',
    assignedByClinician: true
  },
  {
    id: 'plan-2',
    title: 'Daytime Activity',
    subtitle: '20-minute outdoor walk in daylight',
    category: 'daytime',
    durationMinutes: 20,
    completed: false,
    iconName: 'Sunrise',
    assignedByClinician: false
  },
  {
    id: 'plan-3',
    title: 'Evening Sleep Routine',
    subtitle: 'Progressive muscle relaxation before bed',
    category: 'routine',
    durationMinutes: 10,
    completed: false,
    iconName: 'Moon',
    assignedByClinician: true
  }
];

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: 'edu-1',
    category: 'sleep_pressure',
    title: 'How Sleep Pressure Works',
    summary: 'Your body builds sleep pressure the longer you stay awake.',
    content: 'Sleep pressure (adenosine accumulation) accumulates continuously during waking hours. The longer you stay awake and active during the day, the stronger your natural drive to fall asleep at night. Avoiding unplanned daytime naps helps preserve high sleep pressure for your target bedtime.',
    durationMinutes: 3,
    audioAvailable: true
  },
  {
    id: 'edu-2',
    category: 'circadian_rhythm',
    title: 'Your Body Clock & Light',
    summary: 'Morning sunlight sets your internal circadian rhythm.',
    content: 'Exposure to bright natural light shortly after waking sends a strong signal to your brain’s suprachiasmatic nucleus. This resets your circadian master clock, improving alertness during the day and preparing melatonin release approximately 14-16 hours later.',
    durationMinutes: 4,
    audioAvailable: true
  },
  {
    id: 'edu-3',
    category: 'sleep_habits',
    title: 'Stimulus Control Principles',
    summary: 'Re-associate your bed strictly with restful sleep.',
    content: 'In CBT-I, stimulus control ensures your brain connects the bed with sleep rather than wakeful anxiety or frustration. Use your bed only for sleep. If you find yourself awake for more than 20 minutes, gently step out of bed and engage in a quiet activity until sleepy.',
    durationMinutes: 5,
    audioAvailable: true
  },
  {
    id: 'edu-4',
    category: 'sleep_beliefs',
    title: 'Common Sleep Beliefs & Myths',
    summary: 'Unpacking thoughts like "I must get 8 hours every night".',
    content: 'Sleep needs vary between individuals and night to night. Worrying about exact hour targets often increases sleep anxiety. Focus on sleep quality and consistency rather than rigid duration goals.',
    durationMinutes: 4,
    audioAvailable: true
  }
];

export const EXERCISE_ITEMS: ExerciseItem[] = [
  {
    id: 'ex-breathing',
    title: '5-Minute Breathing Exercise',
    description: 'Follow a gentle visual breathing guide to slow your heart rate.',
    category: 'breathing',
    durationMinutes: 5,
    voiceAvailable: true,
    animationAvailable: true,
    audioAvailable: true,
    iconName: 'Wind'
  },
  {
    id: 'ex-pmr',
    title: 'Progressive Muscle Relaxation',
    description: 'Release tension by gently tensing and relaxing major muscle groups.',
    category: 'progressive_muscle_relaxation',
    durationMinutes: 10,
    voiceAvailable: true,
    animationAvailable: true,
    audioAvailable: true,
    iconName: 'Activity',
    assignedByClinician: true
  }
];

export const AUDIO_TRACKS: AudioTrack[] = [
  { id: 'audio-1', title: 'Soft Piano Chords', category: 'soft_piano', durationSeconds: 1800, synthType: 'piano', iconName: 'Music' },
  { id: 'audio-2', title: 'Gentle Rain', category: 'rain', durationSeconds: 3600, synthType: 'rain', iconName: 'CloudRain' },
  { id: 'audio-3', title: 'Ocean Waves', category: 'ocean', durationSeconds: 2400, synthType: 'waves', iconName: 'Waves' },
  { id: 'audio-4', title: 'Forest Breeze', category: 'forest', durationSeconds: 1800, synthType: 'forest', iconName: 'Trees' },
  { id: 'audio-5', title: 'Soft Fireplace Crackle', category: 'fireplace', durationSeconds: 2400, synthType: 'fireplace', iconName: 'Flame' },
  { id: 'audio-6', title: 'Calm Wind', category: 'wind', durationSeconds: 1800, synthType: 'wind', iconName: 'Wind' },
  { id: 'audio-7', title: 'Night Ambience', category: 'night_ambience', durationSeconds: 3600, synthType: 'ambient', iconName: 'Moon' }
];

export const DAYTIME_ACTIVITIES: DaytimeActivity[] = [
  {
    id: 'day-walk',
    title: 'Short Outdoor Walk',
    description: 'Get gentle physical movement and natural daylight exposure.',
    category: 'outdoor',
    durationMinutes: 15,
    activityType: 'timed',
    appropriateFor: ['sleepy', 'bored', 'tired', 'low', 'energetic'],
    iconName: 'Footprints'
  },
  {
    id: 'day-stretching',
    title: 'Gentle Body Stretching',
    description: 'Light posture adjustments and neck/shoulder relief.',
    category: 'movement',
    durationMinutes: 10,
    activityType: 'guided',
    appropriateFor: ['tired', 'stressed', 'low', 'energetic'],
    iconName: 'Activity'
  },
  {
    id: 'day-puzzle',
    title: 'Quick Mind Engagement',
    description: 'Focus your mind on a short puzzle or word search.',
    category: 'mind_focus',
    durationMinutes: 8,
    activityType: 'guided',
    appropriateFor: ['bored', 'sleepy', 'good'],
    iconName: 'Puzzle'
  },
  {
    id: 'day-reading',
    title: 'Reading an Enjoyable Book',
    description: 'Engage with a relaxing story or article.',
    category: 'mind_focus',
    durationMinutes: 20,
    activityType: 'self_reported',
    appropriateFor: ['bored', 'stressed', 'good'],
    iconName: 'BookOpen'
  },
  {
    id: 'day-household',
    title: 'Light Household Activity',
    description: 'Tidy up a space or water plants to stay gently active.',
    category: 'everyday',
    durationMinutes: 10,
    activityType: 'self_reported',
    appropriateFor: ['sleepy', 'bored', 'energetic'],
    iconName: 'Home'
  },
  {
    id: 'day-social',
    title: 'Connect with a Friend',
    description: 'Send a message or place a short call to family or a friend.',
    category: 'social',
    durationMinutes: 15,
    activityType: 'self_reported',
    appropriateFor: ['bored', 'low', 'good'],
    iconName: 'PhoneCall'
  }
];

export const QUICK_GAMES: QuickGame[] = [
  {
    id: 'game-memory',
    name: 'Memory Match',
    description: 'Match pairs of tranquil sleep icons in 5 minutes.',
    durationMinutes: 5,
    gameType: 'memory_match',
    iconName: 'Grid'
  },
  {
    id: 'game-word',
    name: 'Word Challenge',
    description: 'Form soothing 4-letter and 5-letter words from letter tiles.',
    durationMinutes: 5,
    gameType: 'word_challenge',
    iconName: 'Type'
  },
  {
    id: 'game-pattern',
    name: 'Pattern Memory',
    description: 'Observe and repeat calm color glowing sequences.',
    durationMinutes: 4,
    gameType: 'pattern_game',
    iconName: 'Eye'
  }
];

export const SAMPLE_SLEEP_DIARIES: SleepDiaryEntry[] = [];
