import { SleepDiaryEntry } from '../types';

export interface SensorTelemetryPoint {
  timestamp: string; // ISO string
  user_id: string;
  device_id: string;
  session_id: string;
  eegMicrovolts: number;
  heartRateBpm: number;
  spo2Percent: number;
  skinTempC: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  piezoRespirationBpm: number;
}

export interface SleepSession {
  session_id: string;
  user_id: string;
  device_id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string
  endTime: string | null; // ISO string
  status: 'active' | 'completed';
  
  bedtime: string;
  wakeTime: string;
  durationMinutes: number;
  sleepLatency: number; // in minutes to fall asleep
  awakeningsCount: number;
  sleepQualityRating: number; // 1-5 rating
  morningFeeling: string; // Refreshed, Somewhat Rested, Tired, Groggy, Very Exhausted
  notes: string;
  source: 'Home Sleep Tracking' | 'Manual Diary Entry';
  createdAt: string;
  updatedAt: string;
  
  // Real calculated health metrics from telemetry (used exclusively by Monitor)
  avgHeartRate?: number;
  minHeartRate?: number;
  maxHeartRate?: number;
  avgSpo2?: number;
  minSpo2?: number;
  avgSkinTemp?: number;
  avgRespirationRate?: number;
  movementIndex?: number;
  eegSummary?: string;
  piezoSummary?: string;
  aiAnalysis?: string | null;
  aiAnalyzedAt?: string | null;
  telemetryPoints: SensorTelemetryPoint[];
}

const STORAGE_PREFIX = 'dreamora_sleep_sessions_v1_';

function getStorageKey(userId: string): string {
  const cleanId = (userId || 'guest').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  return `${STORAGE_PREFIX}${cleanId}`;
}

export function getUserSleepSessions(userId: string): SleepSession[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const sessions: SleepSession[] = JSON.parse(raw);
    if (!Array.isArray(sessions)) return [];
    
    // Sort chronologically (newest first)
    return sessions.sort((a, b) => {
      const timeA = new Date(b.startTime || b.createdAt || 0).getTime();
      const timeB = new Date(a.startTime || a.createdAt || 0).getTime();
      return timeA - timeB;
    });
  } catch (e) {
    console.error('Failed to load user sleep sessions:', e);
    return [];
  }
}

export function saveUserSleepSessions(userId: string, sessions: SleepSession[]): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save user sleep sessions:', e);
  }
}

export function getActiveSleepSession(userId: string): SleepSession | null {
  const sessions = getUserSleepSessions(userId);
  return sessions.find(s => s.status === 'active') || null;
}

export function startSleepSession(userId: string, deviceId: string = 'HOME_TRACKING'): SleepSession {
  const sessions = getUserSleepSessions(userId);
  const now = new Date();
  const nowISO = now.toISOString();
  const todayDate = now.toISOString().split('T')[0];

  // End any existing active sessions
  sessions.forEach(s => {
    if (s.status === 'active') {
      s.status = 'completed';
      s.endTime = nowISO;
      s.updatedAt = nowISO;
    }
  });

  const bedtimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newSession: SleepSession = {
    session_id: `ses-${Date.now()}`,
    user_id: userId,
    device_id: deviceId,
    date: todayDate,
    startTime: nowISO,
    endTime: null,
    status: 'active',
    bedtime: bedtimeStr,
    wakeTime: '',
    durationMinutes: 0,
    sleepLatency: 15,
    awakeningsCount: 0,
    sleepQualityRating: 4,
    morningFeeling: 'Refreshed',
    notes: '',
    source: deviceId === 'MANUAL_ENTRY' ? 'Manual Diary Entry' : 'Home Sleep Tracking',
    createdAt: nowISO,
    updatedAt: nowISO,
    telemetryPoints: []
  };

  sessions.unshift(newSession);
  saveUserSleepSessions(userId, sessions);
  return newSession;
}

export function addTelemetryPoint(
  userId: string,
  sessionId: string,
  point: Omit<SensorTelemetryPoint, 'user_id' | 'session_id'>
): void {
  const sessions = getUserSleepSessions(userId);
  const session = sessions.find(s => s.session_id === sessionId);
  if (!session) return;

  const fullPoint: SensorTelemetryPoint = {
    ...point,
    user_id: userId,
    session_id: sessionId
  };

  session.telemetryPoints.push(fullPoint);
  recalculateSessionStats(session);
  saveUserSleepSessions(userId, sessions);
}

export function endSleepSession(
  userId: string,
  sessionId: string,
  manualDiaryData?: Partial<SleepDiaryEntry>
): SleepSession | null {
  const sessions = getUserSleepSessions(userId);
  const session = sessions.find(s => s.session_id === sessionId);
  if (!session) return null;

  const now = new Date();
  const nowISO = now.toISOString();
  session.status = 'completed';
  session.endTime = nowISO;
  session.wakeTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  session.updatedAt = nowISO;

  if (session.startTime) {
    const diffMs = now.getTime() - new Date(session.startTime).getTime();
    session.durationMinutes = Math.max(1, Math.floor(diffMs / 60000));
  }

  if (manualDiaryData) {
    if (manualDiaryData.sleepQuality) session.sleepQualityRating = manualDiaryData.sleepQuality;
    if (manualDiaryData.userNotes) session.notes = manualDiaryData.userNotes;
    if (manualDiaryData.bedtime) session.bedtime = manualDiaryData.bedtime;
    if (manualDiaryData.finalWakeTime) session.wakeTime = manualDiaryData.finalWakeTime;
    if (manualDiaryData.numberOfAwakenings !== undefined) session.awakeningsCount = manualDiaryData.numberOfAwakenings;
  }

  recalculateSessionStats(session);
  saveUserSleepSessions(userId, sessions);
  return session;
}

export function addManualSleepEntry(
  userId: string,
  entry: {
    date: string;
    bedtime: string;
    wakeTime: string;
    durationMinutes: number;
    sleepLatency?: number;
    awakeningsCount?: number;
    sleepQualityRating?: number;
    morningFeeling?: string;
    notes?: string;
  }
): SleepSession {
  const sessions = getUserSleepSessions(userId);
  const nowISO = new Date().toISOString();
  const sessionDate = entry.date || nowISO.split('T')[0];

  const newSession: SleepSession = {
    session_id: `manual-${Date.now()}`,
    user_id: userId,
    device_id: 'MANUAL_ENTRY',
    date: sessionDate,
    startTime: `${sessionDate}T00:00:00.000Z`,
    endTime: nowISO,
    status: 'completed',
    bedtime: entry.bedtime,
    wakeTime: entry.wakeTime,
    durationMinutes: entry.durationMinutes || 420,
    sleepLatency: entry.sleepLatency ?? 15,
    awakeningsCount: entry.awakeningsCount ?? 0,
    sleepQualityRating: entry.sleepQualityRating ?? 4,
    morningFeeling: entry.morningFeeling || 'Refreshed',
    notes: entry.notes || '',
    source: 'Manual Diary Entry',
    createdAt: nowISO,
    updatedAt: nowISO,
    telemetryPoints: []
  };

  sessions.unshift(newSession);
  saveUserSleepSessions(userId, sessions);
  return newSession;
}

export function updateSleepSessionDetails(
  userId: string,
  sessionId: string,
  updates: {
    date?: string;
    bedtime?: string;
    wakeTime?: string;
    durationMinutes?: number;
    sleepLatency?: number;
    awakeningsCount?: number;
    sleepQualityRating?: number;
    morningFeeling?: string;
    notes?: string;
  }
): SleepSession | null {
  const sessions = getUserSleepSessions(userId);
  const session = sessions.find(s => s.session_id === sessionId);
  if (!session) return null;

  if (updates.date !== undefined) session.date = updates.date;
  if (updates.bedtime !== undefined) session.bedtime = updates.bedtime;
  if (updates.wakeTime !== undefined) session.wakeTime = updates.wakeTime;
  if (updates.durationMinutes !== undefined) session.durationMinutes = updates.durationMinutes;
  if (updates.sleepLatency !== undefined) session.sleepLatency = updates.sleepLatency;
  if (updates.awakeningsCount !== undefined) session.awakeningsCount = updates.awakeningsCount;
  if (updates.sleepQualityRating !== undefined) session.sleepQualityRating = updates.sleepQualityRating;
  if (updates.morningFeeling !== undefined) session.morningFeeling = updates.morningFeeling;
  if (updates.notes !== undefined) session.notes = updates.notes;
  session.updatedAt = new Date().toISOString();

  saveUserSleepSessions(userId, sessions);
  return session;
}

export function updateSleepSessionTimes(
  userId: string,
  sessionId: string,
  bedtime: string,
  wakeTime: string,
  durationMinutes: number
): SleepSession | null {
  return updateSleepSessionDetails(userId, sessionId, { bedtime, wakeTime, durationMinutes });
}

export function updateActiveSessionStartTime(
  userId: string,
  sessionId: string,
  startTimeISO: string,
  bedtime: string
): SleepSession | null {
  const sessions = getUserSleepSessions(userId);
  const session = sessions.find(s => s.session_id === sessionId);
  if (!session) return null;

  session.startTime = startTimeISO;
  session.bedtime = bedtime;
  session.updatedAt = new Date().toISOString();

  saveUserSleepSessions(userId, sessions);
  return session;
}

export function updateSessionAwakenings(
  userId: string,
  sessionId: string,
  awakeningsCount: number
): SleepSession | null {
  return updateSleepSessionDetails(userId, sessionId, { awakeningsCount });
}

export function deleteSleepSession(userId: string, sessionId: string): void {
  let sessions = getUserSleepSessions(userId);
  sessions = sessions.filter(s => s.session_id !== sessionId);
  saveUserSleepSessions(userId, sessions);
}

export interface SleepTrendsSummary {
  days: 7 | 30;
  totalSessions: number;
  avgDurationMinutes: number;
  avgDurationFormatted: string;
  avgQuality: number;
  avgLatencyMinutes: number;
  avgAwakenings: number;
  consistency: string;
}

export function calculateSleepTrends(userId: string, days: 7 | 30 = 7): SleepTrendsSummary {
  const sessions = getUserSleepSessions(userId).filter(s => s.status === 'completed');
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  
  const filtered = sessions.filter(s => {
    const time = new Date(s.startTime || s.createdAt || 0).getTime();
    return time >= cutoffMs;
  });

  if (filtered.length === 0) {
    return {
      days,
      totalSessions: 0,
      avgDurationMinutes: 0,
      avgDurationFormatted: '0h 0m',
      avgQuality: 0,
      avgLatencyMinutes: 0,
      avgAwakenings: 0,
      consistency: 'No data'
    };
  }

  const totalDur = filtered.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const avgDur = Math.round(totalDur / filtered.length);
  const hours = Math.floor(avgDur / 60);
  const mins = avgDur % 60;

  const totalQual = filtered.reduce((acc, s) => acc + (s.sleepQualityRating || 4), 0);
  const avgQual = Number((totalQual / filtered.length).toFixed(1));

  const totalLat = filtered.reduce((acc, s) => acc + (s.sleepLatency || 15), 0);
  const avgLat = Math.round(totalLat / filtered.length);

  const totalAwak = filtered.reduce((acc, s) => acc + (s.awakeningsCount || 0), 0);
  const avgAwak = Number((totalAwak / filtered.length).toFixed(1));

  // Consistency check based on standard deviation of duration
  let consistency = 'High';
  if (filtered.length < 2) {
    consistency = 'Building history';
  } else {
    const variance = filtered.reduce((acc, s) => acc + Math.pow((s.durationMinutes || 0) - avgDur, 2), 0) / filtered.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev > 90) consistency = 'Variable';
    else if (stdDev > 45) consistency = 'Moderate';
    else consistency = 'High';
  }

  return {
    days,
    totalSessions: filtered.length,
    avgDurationMinutes: avgDur,
    avgDurationFormatted: `${hours}h ${mins}m`,
    avgQuality: avgQual,
    avgLatencyMinutes: avgLat,
    avgAwakenings: avgAwak,
    consistency
  };
}

export function recalculateSessionStats(session: SleepSession): void {
  const points = session.telemetryPoints || [];
  if (points.length === 0) {
    if (session.startTime && session.endTime) {
      const ms = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      session.durationMinutes = Math.max(1, Math.floor(ms / 60000));
    }
    return;
  }

  // Calculate actual metrics from real telemetry timestamps and values
  const firstTime = new Date(points[0].timestamp).getTime();
  const lastTime = new Date(points[points.length - 1].timestamp).getTime();
  const durationMs = Math.max(0, lastTime - firstTime);
  session.durationMinutes = Math.max(1, Math.round(durationMs / 60000));

  // Heart Rate stats
  const hrs = points.map(p => p.heartRateBpm).filter(v => typeof v === 'number' && v > 0);
  if (hrs.length > 0) {
    session.avgHeartRate = Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length);
    session.minHeartRate = Math.min(...hrs);
    session.maxHeartRate = Math.max(...hrs);
  }

  // SpO2 stats
  const spo2s = points.map(p => p.spo2Percent).filter(v => typeof v === 'number' && v > 0);
  if (spo2s.length > 0) {
    session.avgSpo2 = Number((spo2s.reduce((a, b) => a + b, 0) / spo2s.length).toFixed(1));
    session.minSpo2 = Math.min(...spo2s);
  }

  // Temperature stats
  const temps = points.map(p => p.skinTempC).filter(v => typeof v === 'number' && v > 0);
  if (temps.length > 0) {
    session.avgSkinTemp = Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1));
  }

  // Respiration stats
  const resp = points.map(p => p.piezoRespirationBpm).filter(v => typeof v === 'number' && v > 0);
  if (resp.length > 0) {
    session.avgRespirationRate = Math.round(resp.reduce((a, b) => a + b, 0) / resp.length);
  }

  // Movement & Awakenings calculation based on accelerometer vector magnitude spike
  let awakeningSpikes = 0;
  let movementSum = 0;
  points.forEach(p => {
    const magnitude = Math.sqrt(p.accelX * p.accelX + p.accelY * p.accelY + p.accelZ * p.accelZ);
    movementSum += Math.abs(magnitude - 1.0);
    if (Math.abs(magnitude - 1.0) > 0.45) {
      awakeningSpikes++;
    }
  });

  session.movementIndex = Math.min(100, Math.round((movementSum / points.length) * 100));
  if (session.awakeningsCount === undefined) {
    session.awakeningsCount = awakeningSpikes;
  }

  // EEG Summary
  const avgEeg = points.reduce((acc, p) => acc + (p.eegMicrovolts || 0), 0) / points.length;
  session.eegSummary = `Headband signal average: ${avgEeg.toFixed(1)} µV across ${points.length} sampled points.`;
  session.piezoSummary = `Thoracic strain average: ${session.avgRespirationRate || 14} breaths/min.`;
}
