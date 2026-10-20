import React, { useState, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, FileCode, CheckCircle2, AlertCircle, Sparkles, Calendar, Camera, Upload, Check } from 'lucide-react';
import { ClinicalTreatmentPlan, ClinicalPlanWeek, ClinicalPlanTask } from '../types';

interface ClinicalPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (plan: ClinicalTreatmentPlan) => void;
  activePlan?: ClinicalTreatmentPlan | null;
  modeOverride?: 'view' | 'edit' | 'select';
}

export const ClinicalPlanModal: React.FC<ClinicalPlanModalProps> = ({
  isOpen,
  onClose,
  onSavePlan,
  activePlan,
  modeOverride
}) => {
  const [method, setMethod] = useState<'select' | 'pdf' | 'image' | 'text' | 'review' | 'view'>('select');
  
  // Input states
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedOcrText, setExtractedOcrText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Extracted clinical plan state
  const [extractedPlan, setExtractedPlan] = useState<ClinicalTreatmentPlan>({
    id: 'plan-' + Date.now(),
    userId: 'user-1',
    clinicianName: 'Dr. Sarah Jenkins, MD',
    clinicName: 'Sleep Medicine Center',
    startDate: new Date().toISOString().split('T')[0],
    wakeUpTarget: '07:00 AM',
    sleepWindowStart: '11:30 PM',
    sleepWindowEnd: '07:00 AM',
    assignedExercises: ['Progressive Muscle Relaxation'],
    status: 'pending_review',
    sourceType: 'document',
    confidenceStatus: 'high',
    weeks: [
      {
        weekNumber: 1,
        title: 'WEEK 1',
        tasks: [
          { id: 'w1-1', title: 'Sleep Education', category: 'sleep_education', instruction: 'Read core sleep pressure guidance.', linkedFeature: 'education', completed: false },
          { id: 'w1-2', title: 'Sleep Diary', category: 'sleep_diary', instruction: 'Log bedtime and wake time daily in Sleep Diary.', linkedFeature: 'diary', completed: false }
        ]
      },
      {
        weekNumber: 2,
        title: 'WEEK 2',
        tasks: [
          { id: 'w2-1', title: 'Stimulus Control', category: 'stimulus_control', instruction: 'Get out of bed if unable to fall asleep within 20 minutes.', linkedFeature: 'diary', completed: false },
          { id: 'w2-2', title: 'Progressive Muscle Relaxation', category: 'pmr', instruction: 'Practice PMR exercise before bed.', linkedFeature: 'pmr', completed: false }
        ]
      },
      {
        weekNumber: 3,
        title: 'WEEK 3',
        tasks: [
          { id: 'w3-1', title: 'Drop Your Thoughts', category: 'cognitive_restructuring', instruction: 'Log and reframe anxious sleep thoughts.', linkedFeature: 'thoughts', completed: false }
        ]
      }
    ]
  });

  useEffect(() => {
    if (activePlan && isOpen) {
      setExtractedPlan(activePlan);
      if (modeOverride === 'view' || activePlan.status === 'active') {
        setMethod('view');
      } else {
        setMethod('select');
      }
    } else if (isOpen && !activePlan) {
      setMethod('select');
      setSelectedFile(null);
      setFileBase64('');
      setImagePreview('');
      setPastedText('');
      setExtractedOcrText('');
      setExtractionError(null);
    }
  }, [activePlan, isOpen, modeOverride]);

  if (!isOpen) return null;

  // Handle file reading
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractionError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFileBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractionError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFileBase64(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Extraction for any of the 3 methods
  const handleRunExtraction = async (sourceType: 'pdf' | 'image' | 'text') => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const response = await fetch('/api/clinical/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          planText: sourceType === 'text' ? pastedText : undefined,
          fileData: (sourceType === 'pdf' || sourceType === 'image') ? fileBase64 : undefined,
          mimeType: selectedFile?.type || (sourceType === 'pdf' ? 'application/pdf' : 'image/jpeg')
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          if (data.extractedText) {
            setExtractedOcrText(data.extractedText);
          }

          // Build clinical plan with extracted weeks & tasks
          const weeksList: ClinicalPlanWeek[] = (data.weeks && data.weeks.length > 0)
            ? data.weeks
            : [
                {
                  weekNumber: 1,
                  title: 'WEEK 1',
                  tasks: [
                    { id: 'w1-1', title: 'Sleep Education', category: 'sleep_education', instruction: 'Read core sleep pressure guidance.', linkedFeature: 'education', completed: false },
                    { id: 'w1-2', title: 'Sleep Diary', category: 'sleep_diary', instruction: 'Log daily sleep metrics in Sleep Diary.', linkedFeature: 'diary', completed: false }
                  ]
                },
                {
                  weekNumber: 2,
                  title: 'WEEK 2',
                  tasks: [
                    { id: 'w2-1', title: 'Stimulus Control', category: 'stimulus_control', instruction: 'Get out of bed if awake for 20 minutes.', linkedFeature: 'diary', completed: false },
                    { id: 'w2-2', title: 'Progressive Muscle Relaxation', category: 'pmr', instruction: 'Practice relaxation exercises before sleep.', linkedFeature: 'pmr', completed: false }
                  ]
                }
              ];

          setExtractedPlan({
            id: 'plan-' + Date.now(),
            userId: 'user-1',
            clinicianName: data.clinicianName || 'Dr. Sarah Jenkins, MD',
            clinicName: data.clinicName || 'Sleep Medicine Center',
            startDate: new Date().toISOString().split('T')[0],
            wakeUpTarget: data.wakeUpTarget || '07:00 AM',
            sleepWindowStart: data.sleepWindowStart || '11:30 PM',
            sleepWindowEnd: data.sleepWindowEnd || '07:00 AM',
            assignedExercises: ['Progressive Muscle Relaxation'],
            status: 'pending_review',
            sourceType,
            weeks: weeksList
          });

          setMethod('review');
        }
      } else {
        setExtractionError('Could not process document. Please check the file/text and try again.');
      }
    } catch (err) {
      console.error('Extraction request failed:', err);
      setExtractionError('Extraction failed due to network error. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Confirm and activate plan
  const handleConfirmAndActivate = () => {
    const finalPlan: ClinicalTreatmentPlan = {
      ...extractedPlan,
      status: 'active',
      activationDate: new Date().toISOString(),
      currentWeekNumber: 1
    };

    onSavePlan(finalPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 transition-all my-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {method === 'view' ? 'Clinical Treatment Plan' : 'Connect Clinical Treatment Plan'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {method === 'view' ? 'Active CBT-I clinical plan' : 'Import your clinician treatment instructions'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SELECT INPUT METHOD (ONLY 3 OPTIONS) */}
        {method === 'select' && (
          <div className="py-4 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Choose how you want to connect your official CBT-I clinician plan:
            </p>

            {/* Option 1: PDF */}
            <button
              onClick={() => { setSelectedFile(null); setFileBase64(''); setMethod('pdf'); }}
              className="w-full p-4 rounded-2xl border border-purple-200 dark:border-purple-500/20 hover:border-purple-500 dark:hover:border-purple-400 bg-purple-50/50 dark:bg-purple-950/20 flex items-center gap-3.5 text-left transition-all group"
            >
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-300">
                  📄 Upload PDF
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select a PDF file from your device
                </p>
              </div>
            </button>

            {/* Option 2: Photo / Screenshot */}
            <button
              onClick={() => { setSelectedFile(null); setFileBase64(''); setImagePreview(''); setMethod('image'); }}
              className="w-full p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-500 dark:hover:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center gap-3.5 text-left transition-all group"
            >
              <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                  📷 Upload Photo / Screenshot
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scan printout or upload screenshot with OCR
                </p>
              </div>
            </button>

            {/* Option 3: Paste Plan Text */}
            <button
              onClick={() => { setPastedText(''); setMethod('text'); }}
              className="w-full p-4 rounded-2xl border border-teal-200 dark:border-teal-500/20 hover:border-teal-500 dark:hover:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20 flex items-center gap-3.5 text-left transition-all group"
            >
              <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-300">
                  📝 Paste Plan Text
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Paste clinical summary or doctor instructions text
                </p>
              </div>
            </button>
          </div>
        )}

        {/* METHOD 1: UPLOAD PDF */}
        {method === 'pdf' && (
          <div className="py-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>📄 Upload PDF Treatment Plan</span>
            </h3>

            <div className="border-2 border-dashed border-purple-300 dark:border-purple-500/40 rounded-2xl p-6 text-center space-y-2 bg-purple-50/30 dark:bg-purple-950/10">
              <Upload className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : 'Select PDF document from your device'}
                </p>
                {selectedFile && (
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                  </p>
                )}
              </div>
              <label className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
              </label>
            </div>

            {extractionError && (
              <p className="text-xs text-rose-600 font-medium">{extractionError}</p>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMethod('select')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back
              </button>
              <button
                onClick={() => handleRunExtraction('pdf')}
                disabled={!selectedFile || isExtracting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isExtracting ? 'Extracting with AI...' : 'Extract Clinical Plan'}
              </button>
            </div>
          </div>
        )}

        {/* METHOD 2: UPLOAD PHOTO / SCREENSHOT */}
        {method === 'image' && (
          <div className="py-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>📷 Upload Photo / Screenshot</span>
            </h3>

            <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-500/40 rounded-2xl p-5 text-center space-y-3 bg-indigo-50/30 dark:bg-indigo-950/10">
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Clinical Plan"
                    className="max-h-40 mx-auto rounded-xl border border-indigo-200 dark:border-indigo-800 object-contain shadow-xs"
                  />
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold">
                    {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <Camera className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400" />
              )}

              <label className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95">
                {imagePreview ? 'Change Image' : 'Select or Take Photo'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {extractionError && (
              <p className="text-xs text-rose-600 font-medium">{extractionError}</p>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMethod('select')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back
              </button>
              <button
                onClick={() => handleRunExtraction('image')}
                disabled={!selectedFile || isExtracting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isExtracting ? 'Running OCR & AI Extraction...' : 'Run OCR & Extract'}
              </button>
            </div>
          </div>
        )}

        {/* METHOD 3: PASTE PLAN TEXT */}
        {method === 'text' && (
          <div className="py-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              📝 Paste Clinical Plan Text
            </h3>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your clinical treatment summary here... e.g.:

Clinician: Dr. Sarah Jenkins
Clinic: Sleep Medicine Center
Target Wake-up: 07:00 AM
Sleep Window: 11:30 PM to 07:00 AM

WEEK 1:
- Sleep Education: Read core sleep pressure principles.
- Sleep Diary: Log wake and bedtimes daily.

WEEK 2:
- Stimulus Control: Leave bed if awake >20 mins.
- Progressive Muscle Relaxation: Practice PMR before sleep."
              rows={8}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-mono"
            />

            {extractionError && (
              <p className="text-xs text-rose-600 font-medium">{extractionError}</p>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMethod('select')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Back
              </button>
              <button
                onClick={() => handleRunExtraction('text')}
                disabled={!pastedText.trim() || isExtracting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isExtracting ? 'Extracting with AI...' : 'Extract Plan Text'}
              </button>
            </div>
          </div>
        )}

        {/* 2. CLINICAL PLAN REVIEW SCREEN (STRICTLY REQUIRED DISPLAY FORMAT) */}
        {method === 'review' && (
          <div className="py-3 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
            {/* Review Title */}
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
              <h3 className="text-xs font-bold text-purple-900 dark:text-purple-200 tracking-wider uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                CLINICAL PLAN REVIEW
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Review extracted parameters before activation. Clinician instructions are extracted without alteration.
              </p>
            </div>

            {/* OCR Extracted Text Preview (if OCR or Text was run) */}
            {extractedOcrText && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Extracted Document / OCR Text:</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-3">
                  "{extractedOcrText}"
                </p>
              </div>
            )}

            {/* Extracted Details Box */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Clinician:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{extractedPlan.clinicianName}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Clinic:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{extractedPlan.clinicName}</span>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Target Wake-up:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">{extractedPlan.wakeUpTarget}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Sleep Window:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">{extractedPlan.sleepWindowStart} – {extractedPlan.sleepWindowEnd}</span>
              </div>
            </div>

            {/* WEEKLY TASKS LIST FORMATTED AS REQUIRED */}
            <div className="space-y-3">
              {(extractedPlan.weeks && extractedPlan.weeks.length > 0) ? (
                extractedPlan.weeks.map((wk) => (
                  <div key={wk.weekNumber} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block uppercase tracking-wider">
                      {wk.title || `WEEK ${wk.weekNumber}`}
                    </span>
                    <div className="space-y-1.5 pl-1">
                      {wk.tasks.map((t) => (
                        <div key={t.id} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                          <span className="text-slate-400 font-mono mt-0.5">☐</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{t.title}: </span>
                            <span className="text-slate-600 dark:text-slate-300">{t.instruction}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  No explicit tasks extracted.
                </div>
              )}
            </div>

            {/* CONFIRM BUTTON */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMethod('select')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Re-select Method
              </button>
              <button
                onClick={handleConfirmAndActivate}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                Confirm & Activate Plan
              </button>
            </div>
          </div>
        )}

        {/* 3. VIEW ACTIVE PLAN SCREEN (WHEN ACTIVE) */}
        {method === 'view' && (
          <div className="py-3 text-left space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Plan Active & Synced</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Activated: {extractedPlan.activationDate ? new Date(extractedPlan.activationDate).toLocaleDateString() : 'Active'}</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                Active CBT-I
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Clinician</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{extractedPlan.clinicianName}</span>
              </div>
              {extractedPlan.clinicName && (
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 font-medium">Clinic</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{extractedPlan.clinicName}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500 font-medium">Target Wake-up</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">{extractedPlan.wakeUpTarget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Sleep Window</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">{extractedPlan.sleepWindowStart} – {extractedPlan.sleepWindowEnd}</span>
              </div>
            </div>

            {/* Weeks preview */}
            {extractedPlan.weeks && extractedPlan.weeks.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Weekly Schedule ({extractedPlan.weeks.length} Weeks)
                </h4>
                {extractedPlan.weeks.map((wk) => (
                  <div key={wk.weekNumber} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-purple-200/60 dark:border-purple-500/15 space-y-1">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block uppercase">
                      {wk.title || `WEEK ${wk.weekNumber}`}
                    </span>
                    <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pl-1">
                      {wk.tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-1.5">
                          <span className="text-purple-600 font-bold">•</span>
                          <span><strong className="text-slate-900 dark:text-slate-100">{task.title}:</strong> {task.instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMethod('select')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-purple-900 dark:text-purple-200 text-xs font-bold rounded-xl"
              >
                Connect Different Plan
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
