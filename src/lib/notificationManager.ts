import { AppNotification, UserPreferences, ClinicalTreatmentPlan } from '../types';
import { getUserSleepSessions } from './sleepDataStore';

export interface EvaluateNotificationsOptions {
  currentNotifications: AppNotification[];
  preferences: UserPreferences;
  activeClinicalPlan: ClinicalTreatmentPlan | null;
  isSleepTracking: boolean;
  userId: string;
}

export function evaluateAndGenerateNotifications(
  options: EvaluateNotificationsOptions
): { notifications: AppNotification[]; addedCount: number } {
  const {
    currentNotifications = [],
    preferences,
    activeClinicalPlan,
    isSleepTracking,
    userId
  } = options;

  // Global notification switch check
  if (preferences?.notificationEnabled === false) {
    return { notifications: currentNotifications, addedCount: 0 };
  }

  const newNotifications: AppNotification[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayDateStr = `${year}-${month}-${day}`;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Helper: check if event key already exists in existing or newly created list
  const hasEventKey = (key: string): boolean => {
    return (
      currentNotifications.some((n) => n.eventKey === key) ||
      newNotifications.some((n) => n.eventKey === key)
    );
  };

  // 1. WAKE-UP ALERT
  if (preferences?.wakeupAlertEnabled !== false) {
    const wakeKey = `wake-up-${todayDateStr}`;
    if (!hasEventKey(wakeKey)) {
      const wakeTimeStr = activeClinicalPlan?.wakeUpTarget || '07:00 AM';
      const wakeMinutes = parseTimeToMinutes(wakeTimeStr);

      if (currentMinutes >= wakeMinutes) {
        newNotifications.push({
          id: `notif-wake-${todayDateStr}-${Date.now()}`,
          eventKey: wakeKey,
          type: 'wake_up',
          title: '🌅 Wake-up time',
          body: `Good morning. Your planned wake-up time is ${wakeTimeStr}.`,
          timestamp: `Today, ${wakeTimeStr}`,
          createdAt: now.toISOString(),
          read: false,
          dismissed: false,
          actionText: 'View Diary',
          targetView: 'sleep-diary'
        });
      }
    }
  }

  // 2. WIND-DOWN REMINDER
  if (preferences?.windDownReminderEnabled !== false) {
    const windKey = `wind-down-${todayDateStr}`;
    if (!hasEventKey(windKey)) {
      const windTimeStr = activeClinicalPlan?.sleepWindowStart || '11:30 PM';
      const windMinutes = parseTimeToMinutes(windTimeStr);

      if (currentMinutes >= windMinutes - 30) {
        newNotifications.push({
          id: `notif-wind-${todayDateStr}-${Date.now()}`,
          eventKey: windKey,
          type: 'wind_down',
          title: '🌙 Wind-down reminder',
          body: `Your planned sleep window begins at ${windTimeStr}.`,
          timestamp: `Today, ${windTimeStr}`,
          createdAt: now.toISOString(),
          read: false,
          dismissed: false,
          actionText: 'Start Wind-down',
          targetView: 'exercises'
        });
      }
    }
  }

  // 3. SLEEP TRACKING REMINDER
  if (preferences?.sleepTrackingReminderEnabled !== false) {
    const trackKey = `sleep-tracking-${todayDateStr}`;
    if (!hasEventKey(trackKey)) {
      const windTimeStr = activeClinicalPlan?.sleepWindowStart || '11:30 PM';
      const windMinutes = parseTimeToMinutes(windTimeStr);

      if (!isSleepTracking && currentMinutes >= windMinutes) {
        newNotifications.push({
          id: `notif-track-${todayDateStr}-${Date.now()}`,
          eventKey: trackKey,
          type: 'sleep_tracking',
          title: '🌙 Sleep tracking reminder',
          body: 'Your planned sleep window has started. Start sleep tracking when you are ready.',
          timestamp: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          createdAt: now.toISOString(),
          read: false,
          dismissed: false,
          actionText: 'Start Tracking',
          targetView: 'monitor'
        });
      }
    }
  }

  // 4. CBT-I TASK REMINDER
  if (preferences?.cbtiTaskReminderEnabled !== false && activeClinicalPlan) {
    let incompleteTaskTitle = '';
    let taskId = '';

    if (activeClinicalPlan.weeks) {
      for (const w of activeClinicalPlan.weeks) {
        for (const t of w.tasks || []) {
          if (!t.completed) {
            incompleteTaskTitle = t.title;
            taskId = t.id;
            break;
          }
        }
        if (taskId) break;
      }
    }

    if (!taskId && activeClinicalPlan.unorganizedTasks) {
      for (const t of activeClinicalPlan.unorganizedTasks) {
        if (!t.completed) {
          incompleteTaskTitle = t.title;
          taskId = t.id;
          break;
        }
      }
    }

    if (taskId) {
      const cbtiKey = `cbti-task-${todayDateStr}-${taskId}`;
      if (!hasEventKey(cbtiKey)) {
        newNotifications.push({
          id: `notif-cbti-${todayDateStr}-${Date.now()}`,
          eventKey: cbtiKey,
          type: 'cbti_task',
          title: '🧠 CBT-I task',
          body: `You have a CBT-I task to complete today: "${incompleteTaskTitle}".`,
          timestamp: `Today, 8:00 AM`,
          createdAt: now.toISOString(),
          read: false,
          dismissed: false,
          actionText: 'View Task',
          targetView: 'cbti'
        });
      }
    }
  }

  // 5. SLEEP DIARY REMINDER
  if (preferences?.sleepDiaryReminderEnabled !== false) {
    const diaryKey = `sleep-diary-${todayDateStr}`;
    if (!hasEventKey(diaryKey)) {
      const sessions = getUserSleepSessions(userId);
      const hasTodaySession = sessions.some((s) => s.date === todayDateStr && s.status === 'completed');

      if (!hasTodaySession && currentMinutes >= 450) { // 7:30 AM
        newNotifications.push({
          id: `notif-diary-${todayDateStr}-${Date.now()}`,
          eventKey: diaryKey,
          type: 'sleep_diary',
          title: '📔 Sleep Diary',
          body: "Record last night's sleep in your Sleep Diary.",
          timestamp: `Today, 7:30 AM`,
          createdAt: now.toISOString(),
          read: false,
          dismissed: false,
          actionText: 'Record Now',
          targetView: 'sleep-diary'
        });
      }
    }
  }

  if (newNotifications.length === 0) {
    return { notifications: currentNotifications, addedCount: 0 };
  }

  return {
    notifications: [...newNotifications, ...currentNotifications],
    addedCount: newNotifications.length
  };
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 7 * 60;
  try {
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const parts = clean.replace(/(AM|PM)/g, '').trim().split(':');
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } catch {
    return 7 * 60;
  }
}
