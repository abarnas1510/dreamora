import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Save,
  X,
  Trash2,
  TrendingUp,
  Moon,
  Sun,
  Star,
  Activity,
  FileText,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getUserSleepSessions,
  addManualSleepEntry,
  updateSleepSessionDetails,
  deleteSleepSession,
  calculateSleepTrends,
  SleepSession,
  SleepTrendsSummary
} from '../lib/sleepDataStore';
import {
  formatTime24to12,
  formatTime12to24,
  calculateSleepDurationMinutes,
  formatDurationText
} from './HomeSleepTrackerCard';

interface SleepDiaryViewProps {
  userId?: string;
}

const MORNING_FEELINGS = [
  'Refreshed',
  'Somewhat Rested',
  'Tired',
  'Groggy',
  'Very Exhausted'
];

export const SleepDiaryView: React.FC<SleepDiaryViewProps> = ({
  userId = 'default_user'
}) => {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  // Trends state
  const [trendDays, setTrendDays] = useState<7 | 30>(7);
  const [trends, setTrends] = useState<SleepTrendsSummary | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add Entry Form State
  const [addDate, setAddDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [addBedtime24, setAddBedtime24] = useState('23:00');
  const [addWakeTime24, setAddWakeTime24] = useState('07:00');
  const [addLatency, setAddLatency] = useState('15');
  const [addAwakenings, setAddAwakenings] = useState('1');
  const [addQuality, setAddQuality] = useState(4);
  const [addFeeling, setAddFeeling] = useState('Refreshed');
  const [addNotes, setAddNotes] = useState('');

  // Edit Entry Form State
  const [editDate, setEditDate] = useState<string>('');
  const [editBedtime24, setEditBedtime24] = useState('23:00');
  const [editWakeTime24, setEditWakeTime24] = useState('07:00');
  const [editLatency, setEditLatency] = useState('15');
  const [editAwakenings, setEditAwakenings] = useState('1');
  const [editQuality, setEditQuality] = useState(4);
  const [editFeeling, setEditFeeling] = useState('Refreshed');
  const [editNotes, setEditNotes] = useState('');

  const reloadData = () => {
    const loaded = getUserSleepSessions(userId);
    setSessions(loaded);

    // Compute trends from real stored sessions
    const trendSummary = calculateSleepTrends(userId, trendDays);
    setTrends(trendSummary);

    // Select first session if active ID is not set or valid
    if (loaded.length > 0) {
      if (!selectedSessionId || !loaded.some(s => s.session_id === selectedSessionId)) {
        setSelectedSessionId(loaded[0].session_id);
      }
    } else {
      setSelectedSessionId(null);
    }
  };

  useEffect(() => {
    reloadData();
  }, [userId, trendDays]);

  const activeSession = sessions.find(s => s.session_id === selectedSessionId) || sessions[0] || null;

  // Recalculated live duration preview for Add Modal
  const calculatedAddDurationMins = calculateSleepDurationMinutes(addBedtime24, addWakeTime24);
  const calculatedAddDurationText = formatDurationText(calculatedAddDurationMins);

  // Recalculated live duration preview for Edit Modal
  const calculatedEditDurationMins = calculateSleepDurationMinutes(editBedtime24, editWakeTime24);
  const calculatedEditDurationText = formatDurationText(calculatedEditDurationMins);

  // OPEN ADD MODAL
  const handleOpenAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setAddDate(today);
    setAddBedtime24('23:00');
    setAddWakeTime24('07:00');
    setAddLatency('15');
    setAddAwakenings('1');
    setAddQuality(4);
    setAddFeeling('Refreshed');
    setAddNotes('');
    setShowAddModal(true);
  };

  // SAVE ADD ENTRY
  const handleSaveAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedBedtime = formatTime24to12(addBedtime24);
    const formattedWakeTime = formatTime24to12(addWakeTime24);

    addManualSleepEntry(userId, {
      date: addDate,
      bedtime: formattedBedtime,
      wakeTime: formattedWakeTime,
      durationMinutes: calculatedAddDurationMins,
      sleepLatency: parseInt(addLatency) || 0,
      awakeningsCount: parseInt(addAwakenings) || 0,
      sleepQualityRating: addQuality,
      morningFeeling: addFeeling,
      notes: addNotes
    });

    setShowAddModal(false);
    reloadData();
  };

  // OPEN EDIT MODAL
  const handleOpenEditModal = () => {
    if (!activeSession) return;
    setEditDate(activeSession.date || new Date(activeSession.startTime || Date.now()).toISOString().split('T')[0]);
    setEditBedtime24(formatTime12to24(activeSession.bedtime || '23:00'));
    setEditWakeTime24(formatTime12to24(activeSession.wakeTime || '07:00'));
    setEditLatency(String(activeSession.sleepLatency ?? 15));
    setEditAwakenings(String(activeSession.awakeningsCount ?? 0));
    setEditQuality(activeSession.sleepQualityRating || 4);
    setEditFeeling(activeSession.morningFeeling || 'Refreshed');
    setEditNotes(activeSession.notes || '');
    setShowEditModal(true);
  };

  // SAVE EDIT ENTRY
  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    const formattedBedtime = formatTime24to12(editBedtime24);
    const formattedWakeTime = formatTime24to12(editWakeTime24);

    updateSleepSessionDetails(userId, activeSession.session_id, {
      date: editDate,
      bedtime: formattedBedtime,
      wakeTime: formattedWakeTime,
      durationMinutes: calculatedEditDurationMins,
      sleepLatency: parseInt(editLatency) || 0,
      awakeningsCount: parseInt(editAwakenings) || 0,
      sleepQualityRating: editQuality,
      morningFeeling: editFeeling,
      notes: editNotes
    });

    setShowEditModal(false);
    reloadData();
  };

  // DELETE SESSION
  const handleDeleteSession = () => {
    if (!activeSession) return;
    deleteSleepSession(userId, activeSession.session_id);
    setShowDeleteConfirm(false);
    setShowEditModal(false);
    setSelectedSessionId(null);
    reloadData();
  };

  // EXPORT MONTHLY PDF REPORT FOR CLINICAL TEAM
  const handleExportMonthlyPdf = () => {
    const doc = new jsPDF();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthName = now.toLocaleString('default', { month: 'long' });

    // Filter sessions for current calendar month
    let monthlySessions = sessions.filter(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    // If no sessions in current month, export all recent sessions
    if (monthlySessions.length === 0) {
      monthlySessions = [...sessions].slice(0, 30);
    }

    // Header branding banner
    doc.setFillColor(88, 28, 135); // Deep purple
    doc.rect(0, 0, 210, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DREAMORA CBT-I CLINICAL SLEEP REPORT', 14, 17);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${monthName} ${currentYear}`, 196, 17, { align: 'right' });

    // Patient & Summary Info
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient & Export Summary', 14, 35);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient ID: ${userId}`, 14, 42);
    doc.text(`Report Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 14, 48);
    doc.text(`Sessions Logged: ${monthlySessions.length} total entries`, 14, 54);

    // Summary Metrics Banner
    let totalMins = 0;
    let totalQuality = 0;
    let totalLatency = 0;
    let totalAwakenings = 0;

    monthlySessions.forEach(s => {
      totalMins += s.durationMinutes || 0;
      totalQuality += s.sleepQualityRating || 0;
      totalLatency += s.sleepLatency || 0;
      totalAwakenings += s.awakeningsCount || 0;
    });

    const count = monthlySessions.length || 1;
    const avgMins = Math.round(totalMins / count);
    const avgQuality = (totalQuality / count).toFixed(1);
    const avgLatency = Math.round(totalLatency / count);
    const avgAwakenings = (totalAwakenings / count).toFixed(1);

    const avgHrs = Math.floor(avgMins / 60);
    const avgRemMins = avgMins % 60;

    doc.setFillColor(245, 243, 255);
    doc.roundedRect(14, 60, 182, 20, 3, 3, 'F');

    doc.setTextColor(88, 28, 135);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('MONTHLY CLINICAL METRICS:', 18, 68);

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Avg Duration: ${avgHrs}h ${avgRemMins}m  |  Avg Quality: ${avgQuality}/5  |  Avg Latency: ${avgLatency} mins  |  Avg Awakenings: ${avgAwakenings}/night`, 18, 75);

    // Data Table
    const tableData = monthlySessions.map(s => [
      s.date || '--',
      s.bedtime || '--',
      s.wakeTime || '--',
      `${Math.floor((s.durationMinutes || 0)/60)}h ${(s.durationMinutes || 0)%60}m`,
      `${s.sleepLatency ?? 0}m`,
      `${s.awakeningsCount ?? 0}`,
      `${s.sleepQualityRating || '--'}/5`,
      s.morningFeeling || '--',
      s.notes ? (s.notes.length > 28 ? s.notes.substring(0, 25) + '...' : s.notes) : '-'
    ]);

    autoTable(doc, {
      startY: 86,
      head: [['Date', 'Bedtime', 'Wake Time', 'Duration', 'Latency', 'Awakenings', 'Quality', 'Feeling', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [109, 40, 217],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [40, 40, 40]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 22 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'center', cellWidth: 16 },
        7: { halign: 'left', cellWidth: 25 },
        8: { halign: 'left' }
      },
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 250;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Generated by Dreamora CBT-I Sleep Companion for clinical evaluation and review.', 14, Math.min(finalY, 280));

    doc.save(`Dreamora_Sleep_Diary_${monthName}_${currentYear}.pdf`);
  };

  return (
    <div className="pb-24 space-y-6 animate-fade-in w-full max-w-full mx-auto">
      {/* HEADER BAR */}
      <div className="glass-card p-4 flex items-center justify-between border border-purple-500/20 gap-2">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 dark:glow-text">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Sleep Diary
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Historical record & review of your nightly sleep sessions
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportMonthlyPdf}
            id="btn-export-pdf"
            title="Download PDF report for clinical team"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            id="btn-add-sleep-entry"
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* TRENDS SECTION (ONLY FROM ACTUAL STORED DIARY RECORDS) */}
      <section className="glass-card p-5 space-y-3 border border-purple-200/80 dark:border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Sleep Trends
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setTrendDays(7)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                trendDays === 7
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7-Day
            </button>
            <button
              type="button"
              onClick={() => setTrendDays(30)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                trendDays === 30
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30-Day
            </button>
          </div>
        </div>

        {trends && trends.totalSessions > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 text-left">
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-500/20">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Duration
              </span>
              <span className="text-sm font-extrabold text-purple-900 dark:text-purple-200 mt-0.5 block">
                {trends.avgDurationFormatted}
              </span>
            </div>

            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-500/20">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Quality
              </span>
              <span className="text-sm font-extrabold text-purple-900 dark:text-purple-200 mt-0.5 block flex items-center gap-1">
                {trends.avgQuality} <span className="text-amber-500 text-xs">★</span>
              </span>
            </div>

            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-500/20">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Latency
              </span>
              <span className="text-sm font-extrabold text-purple-900 dark:text-purple-200 mt-0.5 block">
                {trends.avgLatencyMinutes} min
              </span>
            </div>

            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-500/20">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Avg Awakenings
              </span>
              <span className="text-sm font-extrabold text-purple-900 dark:text-purple-200 mt-0.5 block">
                {trends.avgAwakenings} / night
              </span>
            </div>

            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-500/20 col-span-2 sm:col-span-1">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Consistency
              </span>
              <span className="text-sm font-extrabold text-purple-900 dark:text-purple-200 mt-0.5 block">
                {trends.consistency}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic py-1">
            No stored sleep records in the past {trendDays} days to calculate trends.
          </p>
        )}
      </section>

      {/* SESSIONS HISTORY / LIST SECTION */}
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {/* SESSION SELECTOR CAROUSEL */}
          <section className="glass-card p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Sleep History ({sessions.length})
              </span>
              <span className="text-purple-600 dark:text-purple-300 text-[11px]">
                Select session to view details
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {sessions.map(s => {
                const isSelected = s.session_id === activeSession?.session_id;
                const dateStr = s.date || (s.startTime ? new Date(s.startTime).toLocaleDateString() : 'Sleep Record');
                const durationHrs = Math.floor((s.durationMinutes || 0) / 60);
                const durationMins = (s.durationMinutes || 0) % 60;

                return (
                  <button
                    key={s.session_id}
                    onClick={() => setSelectedSessionId(s.session_id)}
                    className={`p-3 rounded-2xl border text-left shrink-0 transition-all min-w-[130px] ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20 shadow-sm font-bold text-purple-900 dark:text-purple-100'
                        : 'border-purple-200/60 dark:border-purple-500/15 bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                      {dateStr}
                    </div>
                    <div className="text-xs font-extrabold mt-0.5 text-slate-900 dark:text-white">
                      {durationHrs}h {durationMins}m
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                      <span>{s.source === 'Manual Diary Entry' ? 'Manual' : 'Home'}</span>
                      <span>★ {s.sleepQualityRating || 4}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ACTIVE SESSION DETAILS DISPLAY */}
          {activeSession && (
            <section className="glass-card p-5 space-y-4 border border-purple-200 dark:border-purple-500/20 bg-purple-50/40 dark:bg-purple-950/10">
              <div className="flex items-center justify-between border-b border-purple-200/60 dark:border-purple-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Session Details ({activeSession.date || new Date(activeSession.startTime).toLocaleDateString()})
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  {activeSession.source || (activeSession.device_id === 'MANUAL_ENTRY' ? 'Manual Diary Entry' : 'Home Sleep Tracking')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sleep Duration
                  </span>
                  <span className="text-sm font-extrabold text-purple-900 dark:text-purple-200">
                    {Math.floor((activeSession.durationMinutes || 0) / 60)}h {(activeSession.durationMinutes || 0) % 60}m
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Bedtime & Wake Time
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeSession.bedtime || '--'} → {activeSession.wakeTime || '--'}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sleep Latency
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeSession.sleepLatency ?? 15} minutes
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Awakenings
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeSession.awakeningsCount ?? 0} time(s)
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Sleep Quality
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    {activeSession.sleepQualityRating || 4} / 5 ⭐
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Morning Feeling
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {activeSession.morningFeeling || 'Refreshed'}
                  </span>
                </div>
              </div>

              {activeSession.notes && (
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-200/60 dark:border-purple-500/20 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                    Notes
                  </span>
                  <p className="italic">"{activeSession.notes}"</p>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center gap-2 border-t border-purple-200/60 dark:border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  id="btn-delete-session"
                  className="px-3.5 py-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Session</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  id="btn-edit-session"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Time & Details</span>
                </button>
              </div>
            </section>
          )}
        </div>
      ) : (
        /* EXACT REQUIRED EMPTY STATE WHEN NO DIARY RECORDS EXIST */
        <section className="glass-card p-8 border border-dashed border-purple-300 dark:border-purple-500/30 text-center space-y-4 bg-purple-50/40 dark:bg-purple-950/20">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto text-2xl font-bold">
            📖
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No sleep records yet.
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Start Sleep Tracking from Home or add your first entry.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Entry</span>
            </button>
          </div>
        </section>
      )}

      {/* ADD ENTRY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Add Sleep Diary Entry
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={addDate}
                  onChange={e => setAddDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bedtime
                  </label>
                  <input
                    type="time"
                    value={addBedtime24}
                    onChange={e => setAddBedtime24(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Wake-up Time
                  </label>
                  <input
                    type="time"
                    value={addWakeTime24}
                    onChange={e => setAddWakeTime24(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              {/* Automatic Sleep Duration Calculation Preview */}
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-500/20 text-purple-900 dark:text-purple-200 font-bold flex justify-between items-center">
                <span>Calculated Sleep Duration:</span>
                <span className="text-sm font-extrabold">{calculatedAddDurationText}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sleep Latency (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={addLatency}
                    onChange={e => setAddLatency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Awakenings
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={addAwakenings}
                    onChange={e => setAddAwakenings(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sleep Quality (1-5 ⭐)
                  </label>
                  <select
                    value={addQuality}
                    onChange={e => setAddQuality(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  >
                    {[1, 2, 3, 4, 5].map(q => (
                      <option key={q} value={q}>
                        {q} Star{q > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Morning Feeling
                  </label>
                  <select
                    value={addFeeling}
                    onChange={e => setAddFeeling(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  >
                    {MORNING_FEELINGS.map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Optional Notes
                </label>
                <textarea
                  value={addNotes}
                  onChange={e => setAddNotes(e.target.value)}
                  placeholder="How did you sleep last night?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 dark:text-slate-400 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ENTRY MODAL */}
      {showEditModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Edit Sleep Session
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bedtime
                  </label>
                  <input
                    type="time"
                    value={editBedtime24}
                    onChange={e => setEditBedtime24(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Wake-up Time
                  </label>
                  <input
                    type="time"
                    value={editWakeTime24}
                    onChange={e => setEditWakeTime24(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>
              </div>

              {/* Automatic Duration Recalculation Preview */}
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-500/20 text-purple-900 dark:text-purple-200 font-bold flex justify-between items-center">
                <span>Recalculated Duration:</span>
                <span className="text-sm font-extrabold">{calculatedEditDurationText}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sleep Latency (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={editLatency}
                    onChange={e => setEditLatency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Awakenings
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={editAwakenings}
                    onChange={e => setEditAwakenings(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sleep Quality (1-5 ⭐)
                  </label>
                  <select
                    value={editQuality}
                    onChange={e => setEditQuality(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  >
                    {[1, 2, 3, 4, 5].map(q => (
                      <option key={q} value={q}>
                        {q} Star{q > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Morning Feeling
                  </label>
                  <select
                    value={editFeeling}
                    onChange={e => setEditFeeling(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                  >
                    {MORNING_FEELINGS.map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="px-3.5 py-2 bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/30 rounded-3xl max-w-xs w-full p-5 shadow-2xl space-y-3 text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Delete Sleep Session?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this sleep diary record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSession}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
