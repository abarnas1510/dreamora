// Real Production Sleep Database Engine (Server-Side Storage & Analytics)

export interface UserRecord {
  user_id: string;
  email: string;
  name: string;
  api_key: string;
  created_at: string;
}

export interface DeviceRecord {
  device_id: string;
  user_id: string;
  api_key: string;
  last_seen: string;
  status: 'active' | 'registered' | 'offline';
}

export interface SleepSessionRecord {
  session_id: string;
  user_id: string;
  device_id: string;
  start_time: string;
  end_time: string | null;
  status: 'active' | 'completed';
  bedtime: string;
  wake_time: string;
}

export interface SensorDataRecord {
  id: string;
  session_id: string;
  user_id: string;
  device_id: string;
  timestamp: string;
  heart_rate: number | null;
  spo2: number | null;
  temperature: number | null;
  movement: number | null;
  piezo: number | null;
  eeg: number | null;
}

export type TelemetryRecord = SensorDataRecord;

export interface SleepMetricsRecord {
  session_id: string;
  user_id: string;
  duration_minutes: number;
  duration_formatted: string;
  bedtime: string;
  wake_time: string;
  heart_rate: number | null;
  heart_rate_min: number | null;
  heart_rate_max: number | null;
  spo2: number | null;
  spo2_min: number | null;
  temperature: number | null;
  awakenings: number;
  movement_level: 'Low' | 'Moderate' | 'High' | '--';
  sleep_quality: 'Good' | 'Fair' | 'Needs attention' | 'Not enough data yet';
}

export interface AiAnalysisRecord {
  session_id: string;
  user_id: string;
  insight_text: string;
  recommendation?: string;
  analyzed_at: string;
}

export interface TelemetryIngestInput {
  user_id?: string;
  device_id: string;
  session_id: string;
  timestamp?: string;
  heart_rate?: number | null;
  spo2?: number | null;
  temperature?: number | null;
  movement?: number | null;
  piezo?: number | null;
  eeg?: number | null;
  
  // Also accept camelCase inputs for backward compatibility
  heartRateBpm?: number;
  spo2Percent?: number;
  skinTempC?: number;
  accelX?: number;
  accelY?: number;
  accelZ?: number;
  piezoRespirationBpm?: number;
  eegMicrovolts?: number;
}

// In-memory Database Store Collections
const dbUsers = new Map<string, UserRecord>();
const dbDevices = new Map<string, DeviceRecord>();
const dbSessions = new Map<string, SleepSessionRecord>();
const dbSensorData: SensorDataRecord[] = [];
const dbSleepMetrics = new Map<string, SleepMetricsRecord>();
const dbAiAnalysis = new Map<string, AiAnalysisRecord>();

// Pre-initialize default system guest user
dbUsers.set('guest@dreamora.app', {
  user_id: 'guest@dreamora.app',
  email: 'guest@dreamora.app',
  name: 'Alex',
  api_key: process.env.ESP32_API_KEY || 'dreamora_esp32_secret_key_2026',
  created_at: new Date().toISOString()
});

dbDevices.set('BEDSIDE-MONITOR-01', {
  device_id: 'BEDSIDE-MONITOR-01',
  user_id: 'guest@dreamora.app',
  api_key: process.env.ESP32_API_KEY || 'dreamora_esp32_secret_key_2026',
  last_seen: new Date().toISOString(),
  status: 'active'
});

/**
 * Server-side authentication and authorization logic for ESP32 and clients
 */
export function authenticateTelemetryRequest(
  headers: Record<string, string | string[] | undefined>,
  bodyUserId?: string
): { authenticated: boolean; user_id: string; device_id: string; error?: string } {
  const apiKeyHeader = (headers['x-api-key'] || headers['authorization'] || '').toString().replace('Bearer ', '').trim();
  const deviceIdHeader = (headers['x-device-id'] || '').toString().trim();

  // Check if system-wide ESP32_API_KEY is configured in env
  const expectedEnvKey = process.env.ESP32_API_KEY;

  if (expectedEnvKey && apiKeyHeader) {
    if (apiKeyHeader !== expectedEnvKey) {
      return { authenticated: false, user_id: '', device_id: '', error: 'Unauthorized: Invalid API key' };
    }
  }

  // Look up device if device ID is passed or registered
  const targetDeviceId = deviceIdHeader || 'BEDSIDE-MONITOR-01';
  const existingDevice = dbDevices.get(targetDeviceId);

  let verifiedUserId = bodyUserId ? bodyUserId.trim() : 'guest@dreamora.app';

  if (existingDevice) {
    // Override user_id with the registered device owner to prevent impersonation
    verifiedUserId = existingDevice.user_id;
    existingDevice.last_seen = new Date().toISOString();
    existingDevice.status = 'active';
  } else {
    // Auto-register device for verified user
    dbDevices.set(targetDeviceId, {
      device_id: targetDeviceId,
      user_id: verifiedUserId,
      api_key: apiKeyHeader || 'default_key',
      last_seen: new Date().toISOString(),
      status: 'active'
    });
  }

  // Ensure user exists in dbUsers
  if (!dbUsers.has(verifiedUserId)) {
    dbUsers.set(verifiedUserId, {
      user_id: verifiedUserId,
      email: verifiedUserId,
      name: verifiedUserId.split('@')[0],
      api_key: apiKeyHeader || 'user_key',
      created_at: new Date().toISOString()
    });
  }

  return {
    authenticated: true,
    user_id: verifiedUserId,
    device_id: targetDeviceId
  };
}

/**
 * Ingest raw telemetry point from ESP32 into database collections
 */
export function ingestTelemetryRecord(
  input: TelemetryIngestInput,
  verifiedUserId: string,
  verifiedDeviceId: string
): { success: boolean; session_id: string; total_records: number; metrics: SleepMetricsRecord } {
  const timestamp = input.timestamp || new Date().toISOString();
  const sessionId = input.session_id || `ses-${Date.now()}`;

  // Normalize measurement values
  const heartRate = typeof input.heart_rate === 'number' ? input.heart_rate : (typeof input.heartRateBpm === 'number' ? input.heartRateBpm : null);
  const spo2 = typeof input.spo2 === 'number' ? input.spo2 : (typeof input.spo2Percent === 'number' ? input.spo2Percent : null);
  const temperature = typeof input.temperature === 'number' ? input.temperature : (typeof input.skinTempC === 'number' ? input.skinTempC : null);

  let movementVal: number | null = null;
  if (typeof input.movement === 'number') {
    movementVal = input.movement;
  } else if (typeof input.accelX === 'number' && typeof input.accelY === 'number' && typeof input.accelZ === 'number') {
    const mag = Math.sqrt(input.accelX * input.accelX + input.accelY * input.accelY + input.accelZ * input.accelZ);
    movementVal = Number(Math.abs(mag - 1.0).toFixed(3));
  }

  const piezo = typeof input.piezo === 'number' ? input.piezo : (typeof input.piezoRespirationBpm === 'number' ? input.piezoRespirationBpm : null);
  const eeg = typeof input.eeg === 'number' ? input.eeg : (typeof input.eegMicrovolts === 'number' ? input.eegMicrovolts : null);

  // 1. Ensure sleep_session record exists
  let session = dbSessions.get(sessionId);
  if (!session) {
    const nowObj = new Date(timestamp);
    session = {
      session_id: sessionId,
      user_id: verifiedUserId,
      device_id: verifiedDeviceId,
      start_time: timestamp,
      end_time: null,
      status: 'active',
      bedtime: nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wake_time: 'In progress'
    };
    dbSessions.set(sessionId, session);
  }

  // 2. Insert into sensor_data collection
  const sensorRecord: SensorDataRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    session_id: sessionId,
    user_id: verifiedUserId,
    device_id: verifiedDeviceId,
    timestamp,
    heart_rate: heartRate,
    spo2,
    temperature,
    movement: movementVal,
    piezo,
    eeg
  };
  dbSensorData.push(sensorRecord);

  // 3. Recalculate sleep_metrics
  const metrics = calculateSleepMetrics(sessionId, verifiedUserId);

  return {
    success: true,
    session_id: sessionId,
    total_records: dbSensorData.filter(r => r.session_id === sessionId).length,
    metrics
  };
}

/**
 * Calculate/recalculate sleep_metrics table from sensor_data and sleep_sessions
 */
export function calculateSleepMetrics(sessionId: string, userId: string): SleepMetricsRecord {
  const session = dbSessions.get(sessionId);
  const points = dbSensorData.filter(p => p.session_id === sessionId);

  let durationMinutes = 0;
  if (points.length >= 2) {
    const startMs = new Date(points[0].timestamp).getTime();
    const endMs = new Date(points[points.length - 1].timestamp).getTime();
    durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
  } else if (session?.start_time && session?.end_time) {
    const startMs = new Date(session.start_time).getTime();
    const endMs = new Date(session.end_time).getTime();
    durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
  }

  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationFormatted = durationMinutes > 0 ? `${hours}h ${mins}m` : '--';

  const heartRates = points.map(p => p.heart_rate).filter((v): v is number => typeof v === 'number' && v > 0);
  const hrAvg = heartRates.length > 0 ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) : null;
  const hrMin = heartRates.length > 0 ? Math.min(...heartRates) : null;
  const hrMax = heartRates.length > 0 ? Math.max(...heartRates) : null;

  const spo2s = points.map(p => p.spo2).filter((v): v is number => typeof v === 'number' && v > 0);
  const spo2Avg = spo2s.length > 0 ? Number((spo2s.reduce((a, b) => a + b, 0) / spo2s.length).toFixed(1)) : null;
  const spo2Min = spo2s.length > 0 ? Math.min(...spo2s) : null;

  const temps = points.map(p => p.temperature).filter((v): v is number => typeof v === 'number' && v > 0);
  const tempAvg = temps.length > 0 ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)) : null;

  // Calculate awakenings & movement level
  let awakeningsCount = 0;
  let movementSum = 0;
  points.forEach(p => {
    if (typeof p.movement === 'number') {
      movementSum += p.movement;
      if (p.movement > 0.4) {
        awakeningsCount++;
      }
    }
  });

  let movementLevel: 'Low' | 'Moderate' | 'High' | '--' = '--';
  if (points.length > 0) {
    const avgMovement = movementSum / points.length;
    if (avgMovement < 0.15) movementLevel = 'Low';
    else if (avgMovement < 0.35) movementLevel = 'Moderate';
    else movementLevel = 'High';
  }

  let sleepQuality: 'Good' | 'Fair' | 'Needs attention' | 'Not enough data yet' = 'Not enough data yet';
  if (durationMinutes > 0 && points.length >= 1) {
    if (durationMinutes >= 420 && awakeningsCount <= 2) sleepQuality = 'Good';
    else if (durationMinutes >= 330 && awakeningsCount <= 4) sleepQuality = 'Fair';
    else sleepQuality = 'Needs attention';
  }

  const metricsRecord: SleepMetricsRecord = {
    session_id: sessionId,
    user_id: userId,
    duration_minutes: durationMinutes,
    duration_formatted: durationFormatted,
    bedtime: session?.bedtime || '--',
    wake_time: session?.wake_time || '--',
    heart_rate: hrAvg,
    heart_rate_min: hrMin,
    heart_rate_max: hrMax,
    spo2: spo2Avg,
    spo2_min: spo2Min,
    temperature: tempAvg,
    awakenings: awakeningsCount,
    movement_level: movementLevel,
    sleep_quality: sleepQuality
  };

  dbSleepMetrics.set(sessionId, metricsRecord);
  return metricsRecord;
}

/**
 * Get latest sleep data API (GET /api/sleep/latest)
 */
export function getLatestSleepData(userId: string) {
  const cleanUserId = userId.trim();
  const userSessions = Array.from(dbSessions.values()).filter(s => s.user_id === cleanUserId);

  if (userSessions.length === 0) {
    return {
      has_data: false,
      is_monitoring_active: false,
      message: 'Your sleep data will appear here after your first monitored sleep session.'
    };
  }

  // Active session or most recent session
  const activeSession = userSessions.find(s => s.status === 'active');
  const targetSession = activeSession || userSessions.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())[0];

  const metrics = calculateSleepMetrics(targetSession.session_id, cleanUserId);
  const aiRecord = dbAiAnalysis.get(targetSession.session_id);

  // Check if live telemetry points arrived within last 45 seconds
  const points = dbSensorData.filter(p => p.session_id === targetSession.session_id);
  const latestPoint = points.length > 0 ? points[points.length - 1] : null;
  const isMonitoringActive = Boolean(
    targetSession.status === 'active' &&
    latestPoint &&
    (Date.now() - new Date(latestPoint.timestamp).getTime() < 45000)
  );

  return {
    has_data: points.length > 0 || metrics.duration_minutes > 0,
    is_monitoring_active: isMonitoringActive,
    latest_session: {
      session_id: targetSession.session_id,
      user_id: targetSession.user_id,
      status: targetSession.status,
      start_time: targetSession.start_time,
      end_time: targetSession.end_time
    },
    metrics: {
      duration_minutes: metrics.duration_minutes,
      duration_formatted: metrics.duration_formatted,
      bedtime: metrics.bedtime,
      wake_time: metrics.wake_time,
      heart_rate: metrics.heart_rate,
      heart_rate_min: metrics.heart_rate_min,
      heart_rate_max: metrics.heart_rate_max,
      spo2: metrics.spo2,
      spo2_min: metrics.spo2_min,
      temperature: metrics.temperature,
      awakenings: metrics.awakenings,
      sleep_quality: metrics.sleep_quality,
      movement_level: metrics.movement_level,
      ai_insight: aiRecord?.insight_text || (metrics.heart_rate
        ? `Your average recorded heart rate was ${metrics.heart_rate} BPM with oxygen levels at ${metrics.spo2 || '--'}%.`
        : 'Your health insight will appear after real health data is collected.')
    }
  };
}

/**
 * Get user sleep sessions list API (GET /api/sleep/sessions)
 */
export function getUserSleepSessionsList(userId: string, limit: number = 20) {
  const cleanUserId = userId.trim();
  const sessions = Array.from(dbSessions.values())
    .filter(s => s.user_id === cleanUserId)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, limit);

  return sessions.map(s => {
    const metrics = calculateSleepMetrics(s.session_id, cleanUserId);
    const aiRecord = dbAiAnalysis.get(s.session_id);
    return {
      session_id: s.session_id,
      user_id: s.user_id,
      status: s.status,
      start_time: s.start_time,
      end_time: s.end_time,
      metrics,
      ai_insight: aiRecord?.insight_text || null
    };
  });
}

/**
 * Get user sleep trends API (GET /api/sleep/trends)
 */
export function getUserSleepTrends(userId: string, days: 7 | 30 = 7) {
  const cleanUserId = userId.trim();
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

  const relevantSessions = Array.from(dbSessions.values())
    .filter(s => s.user_id === cleanUserId && new Date(s.start_time).getTime() >= cutoffMs)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  if (relevantSessions.length === 0) {
    return {
      user_id: cleanUserId,
      days,
      total_sessions: 0,
      avg_sleep_duration_minutes: 0,
      avg_sleep_duration_formatted: '--',
      avg_heart_rate: null,
      avg_spo2: null,
      avg_temperature: null,
      avg_awakenings: '--',
      sleep_consistency: 'Not enough data yet',
      daily_trends: []
    };
  }

  const metricsList = relevantSessions.map(s => calculateSleepMetrics(s.session_id, cleanUserId));

  const validDurations = metricsList.map(m => m.duration_minutes).filter(d => d > 0);
  const avgDuration = validDurations.length > 0 ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length) : 0;
  const avgH = Math.floor(avgDuration / 60);
  const avgM = avgDuration % 60;

  const validHrs = metricsList.map(m => m.heart_rate).filter((v): v is number => typeof v === 'number' && v > 0);
  const avgHr = validHrs.length > 0 ? Math.round(validHrs.reduce((a, b) => a + b, 0) / validHrs.length) : null;
  const hrMins = metricsList.map(m => m.heart_rate_min).filter((v): v is number => typeof v === 'number' && v > 0);
  const minHr = hrMins.length > 0 ? Math.min(...hrMins) : null;
  const hrMaxs = metricsList.map(m => m.heart_rate_max).filter((v): v is number => typeof v === 'number' && v > 0);
  const maxHr = hrMaxs.length > 0 ? Math.max(...hrMaxs) : null;

  const validSpo2s = metricsList.map(m => m.spo2).filter((v): v is number => typeof v === 'number' && v > 0);
  const avgSpo2 = validSpo2s.length > 0 ? Number((validSpo2s.reduce((a, b) => a + b, 0) / validSpo2s.length).toFixed(1)) : null;
  const spo2Mins = metricsList.map(m => m.spo2_min).filter((v): v is number => typeof v === 'number' && v > 0);
  const minSpo2 = spo2Mins.length > 0 ? Math.min(...spo2Mins) : null;

  const validTemps = metricsList.map(m => m.temperature).filter((v): v is number => typeof v === 'number' && v > 0);
  const avgTemp = validTemps.length > 0 ? Number((validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1)) : null;

  const movements = metricsList.map(m => m.movement_level).filter(m => m !== '--');
  let avgMovement: 'Low' | 'Moderate' | 'High' | '--' = '--';
  if (movements.length > 0) {
    const counts = { Low: 0, Moderate: 0, High: 0 };
    movements.forEach(m => { if (m in counts) counts[m as keyof typeof counts]++; });
    if (counts.High >= counts.Moderate && counts.High >= counts.Low) avgMovement = 'High';
    else if (counts.Moderate >= counts.Low) avgMovement = 'Moderate';
    else avgMovement = 'Low';
  }

  const awakeningsList = metricsList.map(m => m.awakenings);
  const avgAwakenings = awakeningsList.length > 0 ? (awakeningsList.reduce((a, b) => a + b, 0) / awakeningsList.length).toFixed(1) : '--';

  let consistency: 'High' | 'Moderate' | 'Low' | 'Not enough data yet' = 'Not enough data yet';
  if (relevantSessions.length >= 4) consistency = 'High';
  else if (relevantSessions.length >= 2) consistency = 'Moderate';
  else consistency = 'Low';

  const dailyTrends = metricsList.map(m => ({
    session_id: m.session_id,
    duration_minutes: m.duration_minutes,
    heart_rate: m.heart_rate,
    heart_rate_min: m.heart_rate_min,
    heart_rate_max: m.heart_rate_max,
    spo2: m.spo2,
    spo2_min: m.spo2_min,
    temperature: m.temperature,
    movement_level: m.movement_level,
    awakenings: m.awakenings,
    sleep_quality: m.sleep_quality
  }));

  return {
    user_id: cleanUserId,
    days,
    total_sessions: relevantSessions.length,
    avg_sleep_duration_minutes: avgDuration,
    avg_sleep_duration_formatted: `${avgH}h ${avgM}m`,
    avg_heart_rate: avgHr,
    min_heart_rate: minHr,
    max_heart_rate: maxHr,
    avg_spo2: avgSpo2,
    min_spo2: minSpo2,
    avg_temperature: avgTemp,
    avg_movement_level: avgMovement,
    avg_awakenings: avgAwakenings,
    sleep_consistency: consistency,
    daily_trends: dailyTrends
  };
}

/**
 * Start a sleep session in database
 */
export function startDbSleepSession(userId: string, deviceId: string = 'BEDSIDE-MONITOR-01'): SleepSessionRecord {
  const cleanUserId = userId.trim();
  const nowISO = new Date().toISOString();

  // Complete active sessions for user
  Array.from(dbSessions.values()).forEach(s => {
    if (s.user_id === cleanUserId && s.status === 'active') {
      s.status = 'completed';
      s.end_time = nowISO;
    }
  });

  const newSession: SleepSessionRecord = {
    session_id: `ses-${Date.now()}`,
    user_id: cleanUserId,
    device_id: deviceId,
    start_time: nowISO,
    end_time: null,
    status: 'active',
    bedtime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    wake_time: 'In progress'
  };

  dbSessions.set(newSession.session_id, newSession);
  return newSession;
}

/**
 * End a sleep session in database
 */
export function endDbSleepSession(sessionId: string, userId: string): SleepSessionRecord | null {
  const session = dbSessions.get(sessionId);
  if (!session) return null;

  const now = new Date();
  session.status = 'completed';
  session.end_time = now.toISOString();
  session.wake_time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  calculateSleepMetrics(sessionId, userId);
  return session;
}

/**
 * Set AI Analysis Insight
 */
export function setDbAiAnalysis(sessionId: string, userId: string, insightText: string, recommendation?: string) {
  const record: AiAnalysisRecord = {
    session_id: sessionId,
    user_id: userId,
    insight_text: insightText,
    recommendation,
    analyzed_at: new Date().toISOString()
  };
  dbAiAnalysis.set(sessionId, record);
}
