import React, { useState, useEffect } from 'react';
import {
  Moon,
  Heart,
  Activity,
  Thermometer,
  Sparkles,
  BarChart3,
  ChevronRight,
  Play,
  Square,
  X,
  TrendingUp,
  ShieldCheck,
  BedDouble,
  Wifi,
  Radio
} from 'lucide-react';
import {
  getUserSleepSessions,
  saveUserSleepSessions,
  SleepSession
} from '../lib/sleepDataStore';

interface MonitorViewProps {
  userName?: string;
  userId?: string;
  language?: string;
}

export const MonitorView: React.FC<MonitorViewProps> = ({
  userName = 'Alex',
  userId = 'guest@dreamora.app'
}) => {
  // Live stream status and latest health metrics from /api/sleep/latest
  const [isStreaming, setIsStreaming] = useState(false);
  const [latestHealthData, setLatestHealthData] = useState<{
    has_data: boolean;
    is_monitoring_active: boolean;
    latest_session?: {
      session_id: string;
      status: string;
    };
    metrics?: {
      heart_rate: number | null;
      heart_rate_min: number | null;
      heart_rate_max: number | null;
      spo2: number | null;
      spo2_min: number | null;
      temperature: number | null;
      movement_level: string;
      ai_insight: string;
    };
  } | null>(null);

  // Trend data state from /api/sleep/trends
  const [trendData, setTrendData] = useState<{
    total_sessions: number;
    avg_heart_rate: number | null;
    min_heart_rate: number | null;
    max_heart_rate: number | null;
    avg_spo2: number | null;
    min_spo2: number | null;
    avg_temperature: number | null;
    avg_movement_level: string;
  } | null>(null);

  // Active session tracking
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Trend timeframe selector: 7 days or 30 days
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  // Modal state for View Full Health Analysis
  const [isFullAnalysisOpen, setIsFullAnalysisOpen] = useState(false);

  // AI Health Insight state
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    hasSufficientData: boolean;
    analysisText?: string;
    recommendation?: string;
    message?: string;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Fetch real sensor metrics & trends from backend APIs
  const fetchHealthData = () => {
    // 1. Fetch Latest Health Metrics
    fetch(`/api/sleep/latest?userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        setLatestHealthData(data);
        setIsStreaming(Boolean(data.is_monitoring_active));
        if (data.latest_session?.session_id && data.latest_session?.status === 'active') {
          setActiveSessionId(data.latest_session.session_id);
        } else if (!data.is_monitoring_active) {
          setActiveSessionId(null);
        }
      })
      .catch(err => console.error('Error fetching /api/sleep/latest:', err));

    // 2. Fetch Health Trends
    fetch(`/api/sleep/trends?userId=${encodeURIComponent(userId)}&days=${trendDays}`)
      .then(res => res.json())
      .then(data => {
        setTrendData(data);
      })
      .catch(err => console.error('Error fetching /api/sleep/trends:', err));
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 3000);
    return () => clearInterval(interval);
  }, [userId, trendDays]);

  // Fetch AI Health Analysis when health data is available
  useEffect(() => {
    const hasValidMetrics = latestHealthData?.has_data && (
      Boolean(latestHealthData.metrics?.heart_rate) ||
      Boolean(latestHealthData.metrics?.spo2) ||
      Boolean(latestHealthData.metrics?.temperature)
    );

    if (!hasValidMetrics) {
      setAiAnalysisResult({
        hasSufficientData: false,
        message: 'Your health insight will appear after real health data is collected.'
      });
      return;
    }

    setIsLoadingAi(true);
    fetch('/api/ai/sleep-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        currentSession: {
          session_id: activeSessionId || 'latest',
          avgHeartRate: latestHealthData?.metrics?.heart_rate,
          minHeartRate: latestHealthData?.metrics?.heart_rate_min,
          maxHeartRate: latestHealthData?.metrics?.heart_rate_max,
          avgSpo2: latestHealthData?.metrics?.spo2,
          minSpo2: latestHealthData?.metrics?.spo2_min,
          avgSkinTemp: latestHealthData?.metrics?.temperature,
          movement_level: latestHealthData?.metrics?.movement_level
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        setAiAnalysisResult(data);
      })
      .catch(err => {
        console.error('Failed to fetch health analysis:', err);
        setAiAnalysisResult({
          hasSufficientData: false,
          message: 'Your health insight will appear after real health data is collected.'
        });
      })
      .finally(() => setIsLoadingAi(false));
  }, [latestHealthData, userId]);

  // Start monitoring session
  const handleStartMonitoring = async () => {
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, deviceId: 'BEDSIDE-MONITOR-01' })
      });
      const data = await res.json();
      if (data.session) {
        setActiveSessionId(data.session.session_id);
        setIsStreaming(true);
        fetchHealthData();
      }
    } catch (e) {
      console.error('Failed to start session:', e);
    }
  };

  // End monitoring session
  const handleStopMonitoring = async () => {
    try {
      const res = await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId: activeSessionId || 'latest' })
      });
      const data = await res.json();
      if (data.session) {
        setIsStreaming(false);
        setActiveSessionId(null);
        fetchHealthData();
      }
    } catch (e) {
      console.error('Failed to end session:', e);
    }
  };

  // Real data state derived from APIs
  const hasData = Boolean(latestHealthData?.has_data);
  const metrics = latestHealthData?.metrics;

  // Real Health Measurements Formatting
  const heartRateCurrent = metrics?.heart_rate ? `${metrics.heart_rate} BPM` : '--';
  const heartRateMinMax = (metrics?.heart_rate_min && metrics?.heart_rate_max)
    ? `${metrics.heart_rate_min} - ${metrics.heart_rate_max} BPM`
    : '--';

  const spo2Current = metrics?.spo2 ? `${metrics.spo2}%` : '--';
  const spo2Min = metrics?.spo2_min ? `${metrics.spo2_min}%` : '--';

  const tempCurrent = metrics?.temperature ? `${metrics.temperature}°C` : '--';
  const movementLevel = metrics?.movement_level && metrics.movement_level !== '--' ? metrics.movement_level : '--';

  // Trends formatting
  const avgTrendHr = trendData?.avg_heart_rate ? `${trendData.avg_heart_rate} BPM` : '--';
  const minMaxTrendHr = (trendData?.min_heart_rate && trendData?.max_heart_rate)
    ? `${trendData.min_heart_rate} - ${trendData.max_heart_rate} BPM`
    : '--';

  const avgTrendSpo2 = trendData?.avg_spo2 ? `${trendData.avg_spo2}%` : '--';
  const minTrendSpo2 = trendData?.min_spo2 ? `${trendData.min_spo2}%` : '--';

  const avgTrendTemp = trendData?.avg_temperature ? `${trendData.avg_temperature}°C` : '--';
  const avgTrendMovement = trendData?.avg_movement_level && trendData.avg_movement_level !== '--' ? trendData.avg_movement_level : '--';

  return (
    <div className="pb-24 space-y-5 animate-fade-in w-full max-w-2xl mx-auto text-left">
      {/* SCREEN TITLE & SUBTITLE */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl font-bold text-[#241B3A] dark:text-white tracking-tight">
              Sleep Monitor
            </h1>
          </div>
          <p className="text-xs text-[#5B536B] dark:text-purple-200/80 mt-0.5">
            Real health measurements from your connected hardware
          </p>
        </div>
      </div>

      {/* 1. 🟢 MONITORING STATUS */}
      <section className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 bg-purple-50/80 dark:bg-purple-950/40 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🟢 Monitoring Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>⚪ Monitoring Inactive</span>
                </div>
              )}

              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-purple-500" />
                {isStreaming ? 'Connected' : 'Waiting for hardware'}
              </span>
            </div>
          </div>

          <div>
            {!isStreaming ? (
              <button
                onClick={handleStartMonitoring}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Monitoring</span>
              </button>
            ) : (
              <button
                onClick={handleStopMonitoring}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Monitoring</span>
              </button>
            )}
          </div>
        </div>

        {!hasData && (
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-purple-200/50 dark:border-purple-500/10">
            Waiting for real health data. Start monitoring or connect hardware to view health measurements.
          </p>
        )}
      </section>

      {/* HEALTH MEASUREMENTS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 2. ❤️ HEART RATE */}
        <div className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 bg-white/70 dark:bg-slate-900/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Heart Rate
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Real Sensor</span>
          </div>

          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {heartRateCurrent}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span>Avg: <strong className="text-slate-700 dark:text-slate-200">{heartRateCurrent}</strong></span>
              <span>Range: <strong className="text-slate-700 dark:text-slate-200">{heartRateMinMax}</strong></span>
            </div>
          </div>
        </div>

        {/* 3. 🫁 BLOOD OXYGEN */}
        <div className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 bg-white/70 dark:bg-slate-900/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Blood Oxygen
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">SpO₂</span>
          </div>

          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {spo2Current}
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              <span>Avg: <strong className="text-slate-700 dark:text-slate-200">{spo2Current}</strong></span>
              <span>Min: <strong className="text-slate-700 dark:text-slate-200">{spo2Min}</strong></span>
            </div>
          </div>
        </div>

        {/* 4. 🌡️ TEMPERATURE */}
        <div className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 bg-white/70 dark:bg-slate-900/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Thermometer className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Temperature
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Skin °C</span>
          </div>

          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {tempCurrent}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Skin temperature reading from hardware
            </div>
          </div>
        </div>

        {/* 5. 🛌 MOVEMENT / RESTLESSNESS */}
        <div className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 bg-white/70 dark:bg-slate-900/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <BedDouble className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Movement
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">Restlessness</span>
          </div>

          <div className="pt-1">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {movementLevel}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Restlessness level from motion sensors
            </div>
          </div>
        </div>
      </div>

      {/* 6. 📊 HEALTH TRENDS */}
      <section className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Health Trends
          </h3>

          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTrendDays(7)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                trendDays === 7
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setTrendDays(30)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                trendDays === 30
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              30 days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-purple-200/50 dark:border-purple-500/15 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-medium block">Avg Heart Rate</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {avgTrendHr}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-purple-200/50 dark:border-purple-500/15 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-medium block">Avg SpO₂</span>
            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
              {avgTrendSpo2}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-purple-200/50 dark:border-purple-500/15 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-medium block">Avg Temp</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {avgTrendTemp}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-purple-200/50 dark:border-purple-500/15 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-medium block">Movement</span>
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
              {avgTrendMovement}
            </span>
          </div>
        </div>

        {(!trendData || trendData.total_sessions === 0) && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 text-center">
            No monitoring data available yet.
          </p>
        )}
      </section>

      {/* 7. ✨ DREAMORA HEALTH INSIGHT */}
      <section className="glass-card p-4 border border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-50/80 via-indigo-50/40 to-slate-50/80 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900/60 space-y-2">
        <div className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>✨ Dreamora Health Insight</span>
        </div>

        {isLoadingAi ? (
          <p className="text-xs text-purple-700 dark:text-purple-300 animate-pulse">
            Analyzing real health measurements...
          </p>
        ) : aiAnalysisResult && aiAnalysisResult.hasSufficientData && aiAnalysisResult.analysisText ? (
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            "{aiAnalysisResult.analysisText}"
          </p>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Your health insight will appear after real health data is collected.
          </p>
        )}
      </section>

      {/* VIEW FULL HEALTH ANALYSIS BUTTON */}
      <div className="pt-1">
        <button
          onClick={() => setIsFullAnalysisOpen(true)}
          className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <span>View Full Health Analysis</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* DETAILED HEALTH ANALYSIS MODAL */}
      {isFullAnalysisOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Full Health Analysis
                </h3>
              </div>
              <button
                onClick={() => setIsFullAnalysisOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-purple-200/50 dark:border-purple-500/15 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                  Real Health Measurements
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                  <div>Heart rate: <strong>{heartRateCurrent}</strong></div>
                  <div>Heart rate range: <strong>{heartRateMinMax}</strong></div>
                  <div>Blood oxygen (SpO₂): <strong>{spo2Current}</strong></div>
                  <div>Min SpO₂: <strong>{spo2Min}</strong></div>
                  <div>Temperature: <strong>{tempCurrent}</strong></div>
                  <div>Movement level: <strong>{movementLevel}</strong></div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-purple-200/50 dark:border-purple-500/15 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                  Health Trends ({trendDays} Days)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200">
                  <div>Avg Heart rate: <strong>{avgTrendHr}</strong></div>
                  <div>Avg SpO₂: <strong>{avgTrendSpo2}</strong></div>
                  <div>Avg Temperature: <strong>{avgTrendTemp}</strong></div>
                  <div>Restlessness: <strong>{avgTrendMovement}</strong></div>
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/30 rounded-2xl border border-purple-200 dark:border-purple-500/20 space-y-1.5">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  AI Health Insight
                </h4>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {aiAnalysisResult?.analysisText || 'Your health insight will appear after real health data is collected.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsFullAnalysisOpen(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
