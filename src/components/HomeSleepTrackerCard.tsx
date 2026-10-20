import React, { useState, useEffect } from 'react';
import { Moon, Play, Square, Edit3, RotateCcw, Save, X, Clock, CheckCircle2 } from 'lucide-react';
import {
  getUserSleepSessions,
  saveUserSleepSessions,
  startSleepSession,
  endSleepSession,
  deleteSleepSession,
  updateSleepSessionTimes,
  updateActiveSessionStartTime,
  SleepSession
} from '../lib/sleepDataStore';

interface HomeSleepTrackerCardProps {
  userId?: string;
  onSessionChange?: () => void;
}

// Convert "23:18" (24-hour) to "11:18 PM"
export function formatTime24to12(time24: string): string {
  if (!time24) return 'Not recorded';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  const padM = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${padM} ${ampm}`;
}

// Convert "11:18 PM" to "23:18" (24-hour string for <input type="time">)
export function formatTime12to24(time12: string): string {
  if (!time12 || time12 === 'Not recorded') {
    const now = new Date();
    const padH = now.getHours() < 10 ? `0${now.getHours()}` : `${now.getHours()}`;
    const padM = now.getMinutes() < 10 ? `0${now.getMinutes()}` : `${now.getMinutes()}`;
    return `${padH}:${padM}`;
  }
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '22:00';
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const padH = h < 10 ? `0${h}` : `${h}`;
  const padM = m < 10 ? `0${m}` : `${m}`;
  return `${padH}:${padM}`;
}

// Calculate duration in minutes between bedtime24 and wakeTime24
// Handles crossing midnight correctly!
export function calculateSleepDurationMinutes(bedtime24: string, wakeTime24: string): number {
  const [bH, bM] = bedtime24.split(':').map(Number);
  const [wH, wM] = wakeTime24.split(':').map(Number);

  if (isNaN(bH) || isNaN(bM) || isNaN(wH) || isNaN(wM)) return 0;

  const bedTotalMins = bH * 60 + bM;
  const wakeTotalMins = wH * 60 + wM;

  let diff = wakeTotalMins - bedTotalMins;
  if (diff <= 0) {
    // Crosses midnight!
    diff += 24 * 60; // 1440 minutes
  }
  return diff;
}

// Format duration minutes into "7h 42m"
export function formatDurationText(durationMins: number): string {
  if (!durationMins || durationMins <= 0) return '0h 0m';
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  return `${hours}h ${mins}m`;
}

// Calculate current duration in minutes from start timestamp to now
export function calculateActiveDurationMinutes(startTimeISO?: string | null): number {
  if (!startTimeISO) return 0;
  const startMs = new Date(startTimeISO).getTime();
  if (isNaN(startMs)) return 0;
  const diffMs = Date.now() - startMs;
  return Math.max(0, Math.floor(diffMs / 60000));
}

export const HomeSleepTrackerCard: React.FC<HomeSleepTrackerCardProps> = ({
  userId = 'default_user',
  onSessionChange
}) => {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [activeSession, setActiveSession] = useState<SleepSession | null>(null);
  const [latestCompletedSession, setLatestCompletedSession] = useState<SleepSession | null>(null);

  // Edit mode toggle
  const [isEditingTime, setIsEditingTime] = useState(false);

  // Time picker input values (24h format for <input type="time">)
  const [editBedtime24, setEditBedtime24] = useState('23:00');
  const [editWakeTime24, setEditWakeTime24] = useState('07:00');
  const [editDurationPreview, setEditDurationPreview] = useState('8h 0m');

  // Confirmation dialog for undo/reset
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  // Force Start New Session mode when in State 3
  const [forceNewSessionState, setForceNewSessionState] = useState(false);

  // Reload sessions from local store / DB
  const refreshSessions = () => {
    const loaded = getUserSleepSessions(userId);
    setSessions(loaded);

    const active = loaded.find(s => s.status === 'active') || null;
    setActiveSession(active);

    const completed = loaded.filter(s => s.status === 'completed');
    setLatestCompletedSession(completed.length > 0 ? completed[0] : null);
  };

  useEffect(() => {
    refreshSessions();
  }, [userId]);

  // Recalculate duration preview when edit time inputs change
  useEffect(() => {
    const mins = calculateSleepDurationMinutes(editBedtime24, editWakeTime24);
    setEditDurationPreview(formatDurationText(mins));
  }, [editBedtime24, editWakeTime24]);

  // ACTION: Start Sleep
  const handleStartSleep = () => {
    const nowObj = new Date();
    const nowISO = nowObj.toISOString();

    const newS = startSleepSession(userId, 'HOME_TRACKING');
    newS.startTime = nowISO;
    newS.bedtime = nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Sync to server API
    fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, deviceId: 'HOME_TRACKING' })
    }).catch(err => console.error('Error starting session API:', err));

    setForceNewSessionState(false);
    refreshSessions();
    if (onSessionChange) onSessionChange();
  };

  // ACTION: End Sleep Tracking
  const handleEndSleep = () => {
    if (!activeSession) return;

    const endSession = endSleepSession(userId, activeSession.session_id);

    // Sync to server API
    fetch('/api/sessions/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId: activeSession.session_id })
    }).catch(err => console.error('Error ending session API:', err));

    setIsEditingTime(false);
    setForceNewSessionState(false);
    refreshSessions();
    if (onSessionChange) onSessionChange();
  };

  // ACTION: Undo Active Sleep
  const handleUndoActiveSession = () => {
    if (!activeSession) return;
    deleteSleepSession(userId, activeSession.session_id);
    setShowUndoConfirm(false);
    setIsEditingTime(false);
    refreshSessions();
    if (onSessionChange) onSessionChange();
  };

  // Open Edit Time Modal/Interface
  const handleOpenEditTime = () => {
    if (activeSession) {
      // Editing active session bedtime
      setEditBedtime24(formatTime12to24(activeSession.bedtime || ''));
      setEditWakeTime24(formatTime12to24(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })));
    } else if (latestCompletedSession) {
      // Editing completed session
      setEditBedtime24(formatTime12to24(latestCompletedSession.bedtime || ''));
      setEditWakeTime24(formatTime12to24(latestCompletedSession.wakeTime || ''));
    }
    setIsEditingTime(true);
  };

  // Save Edit Time
  const handleSaveEditTime = () => {
    const formattedBedtime = formatTime24to12(editBedtime24);
    const formattedWakeTime = formatTime24to12(editWakeTime24);
    const mins = calculateSleepDurationMinutes(editBedtime24, editWakeTime24);

    if (activeSession) {
      // Create new startTime based on today's date and edited bedtime
      const now = new Date();
      const [h, m] = editBedtime24.split(':').map(Number);
      const startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
      // If start time is in future relative to current time, assume it was yesterday night
      if (startObj.getTime() > now.getTime()) {
        startObj.setDate(startObj.getDate() - 1);
      }
      updateActiveSessionStartTime(userId, activeSession.session_id, startObj.toISOString(), formattedBedtime);
    } else if (latestCompletedSession) {
      updateSleepSessionTimes(
        userId,
        latestCompletedSession.session_id,
        formattedBedtime,
        formattedWakeTime,
        mins
      );
    }

    setIsEditingTime(false);
    refreshSessions();
    if (onSessionChange) onSessionChange();
  };

  // Determine Current State:
  // STATE 2: activeSession exists
  // STATE 3: latestCompletedSession exists AND forceNewSessionState === false
  // STATE 1: No active session AND (no completed session OR forceNewSessionState === true)
  const isState2 = activeSession !== null;
  const isState3 = !isState2 && latestCompletedSession !== null && !forceNewSessionState;
  const isState1 = !isState2 && !isState3;

  return (
    <section className="glass-card p-5 border border-purple-200 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl space-y-4 text-left shadow-sm">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            🌙 Sleep Tracking
          </h2>
        </div>
        {isState2 && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tracking Active</span>
          </span>
        )}
        {isState3 && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Completed</span>
          </span>
        )}
      </div>

      {/* ================================================== */}
      {/* STATE 1 — BEFORE SLEEP */}
      {/* ================================================== */}
      {isState1 && (
        <div className="space-y-4">
          <button
            onClick={handleStartSleep}
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Sleep</span>
          </button>

          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 border-t border-purple-200/60 dark:border-purple-500/15">
            <div>Bedtime: <strong className="text-slate-800 dark:text-slate-200">Not recorded</strong></div>
            <div>Wake-up: <strong className="text-slate-800 dark:text-slate-200">Not recorded</strong></div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STATE 2 — DURING SLEEP */}
      {/* ================================================== */}
      {isState2 && activeSession && (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-purple-200 dark:border-purple-500/20 text-center space-y-2">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Started at: <strong className="text-slate-800 dark:text-slate-200">{activeSession.bedtime || 'Just now'}</strong>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Sleep Tracking In Progress
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatDurationText(calculateActiveDurationMinutes(activeSession.startTime))}
              </div>
              <span className="text-[10px] text-slate-400 block">
                Duration calculated from start timestamp
              </span>
            </div>
          </div>

          <button
            onClick={handleEndSleep}
            className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>End Sleep Tracking</span>
          </button>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-200/60 dark:border-purple-500/15 text-slate-600 dark:text-slate-400">
            <div>
              <div>Bedtime: <strong className="text-slate-800 dark:text-slate-200">{activeSession.bedtime}</strong></div>
              <div>Wake-up: <strong className="text-slate-800 dark:text-slate-200">Not recorded</strong></div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenEditTime}
                className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-800 dark:text-purple-200 font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit time</span>
              </button>

              <button
                onClick={() => setShowUndoConfirm(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STATE 3 — SLEEP SESSION COMPLETED */}
      {/* ================================================== */}
      {isState3 && latestCompletedSession && (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-purple-200 dark:border-purple-500/20 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Sleep duration
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatDurationText(latestCompletedSession.durationMinutes || 0)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Bedtime</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  {latestCompletedSession.bedtime || 'Not recorded'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Wake-up</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  {latestCompletedSession.wakeTime || 'Not recorded'}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-200/60 dark:border-purple-500/15">
            <button
              onClick={handleOpenEditTime}
              className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-500/30 text-purple-800 dark:text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit time</span>
            </button>

            <button
              onClick={() => setForceNewSessionState(true)}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Track New Sleep</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* EDIT TIME INTERFACE / MODAL */}
      {/* ================================================== */}
      {isEditingTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Sleep Time
                </h3>
              </div>
              <button
                onClick={() => setIsEditingTime(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Bedtime
                </label>
                <input
                  type="time"
                  value={editBedtime24}
                  onChange={e => setEditBedtime24(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-purple-200 dark:border-purple-500/30 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {!activeSession && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Wake-up
                  </label>
                  <input
                    type="time"
                    value={editWakeTime24}
                    onChange={e => setEditWakeTime24(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-purple-200 dark:border-purple-500/30 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {!activeSession && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/20 text-xs flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Calculated Sleep Duration:</span>
                  <strong className="text-purple-700 dark:text-purple-300 font-extrabold text-sm">
                    {editDurationPreview}
                  </strong>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsEditingTime(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditTime}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* UNDO CONFIRMATION DIALOG */}
      {/* ================================================== */}
      {showUndoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-3xl max-w-xs w-full p-5 shadow-2xl space-y-3 text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Undo active sleep tracking?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This will cancel the currently running sleep tracking session. Historical completed sessions will not be affected.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUndoConfirm(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleUndoActiveSession}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Undo Session
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
