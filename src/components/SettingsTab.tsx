import React, { useState, useEffect } from 'react';
import { Setting, AcademicProgram, FeedbackLevelSettings, PLO, Course, Assignment, Student, FacultyComment, FeedbackRound } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { 
  Settings, 
  Check, 
  Save, 
  Info, 
  AlertTriangle, 
  RefreshCw, 
  RotateCcw, 
  MessageSquare, 
  CheckSquare, 
  Square, 
  Sliders, 
  GraduationCap,
  Download,
  Upload,
  Database,
  Copy,
  FileJson,
  Award,
  BookOpen,
  Map,
  FileSpreadsheet,
  Users,
  Clock,
  Trash2,
  HardDriveUpload,
  History,
  Archive,
  Plus,
  X,
  Eye
} from 'lucide-react';

import { INITIAL_COMMENTS } from '../data/initialData';

interface ProgramSnapshot {
  id: string;
  programId: string;
  programCode: string;
  programName: string;
  createdAt: string;
  label: string;
  counts: {
    plos: number;
    dimensions: number;
    courses: number;
    mappings: number;
    assessments: number;
    students: number;
    comments: number;
  };
  payload: any;
}

interface SettingsTabProps {
  programs: AcademicProgram[];
  activeProgram: AcademicProgram;
  settings: Setting;
  plos?: PLO[];
  courses?: Course[];
  mappings?: { [key: string]: string[] };
  assignments?: { [courseId: string]: Assignment[]; };
  students?: Student[];
  facultyComments?: FacultyComment[];
  allComments?: FacultyComment[];
  feedbackRounds?: FeedbackRound[];
  onSaveFeedbackRound?: (round: FeedbackRound) => Promise<void>;
  onNavigateToFeedbackBoard?: () => void;
  onSaveSettings: (settings: Setting) => Promise<void>;
  onSelectProgram?: (programId: string) => void;
  onResetToDefaults?: () => Promise<void>;
  onRestoreProgramBackup?: (backupData: any) => Promise<void>;
  isSeeding?: boolean;
  onUnsavedChangesChange?: (isDirty: boolean) => void;
  registerSaveHandler?: (handler: () => Promise<void>) => void;
}

export default function SettingsTab({
  programs,
  activeProgram,
  settings,
  plos = [],
  courses = [],
  mappings = {},
  assignments = {},
  students = [],
  facultyComments = [],
  allComments = [],
  feedbackRounds = [],
  onSaveFeedbackRound,
  onNavigateToFeedbackBoard,
  onSaveSettings,
  onSelectProgram,
  onResetToDefaults,
  onRestoreProgramBackup,
  isSeeding,
  onUnsavedChangesChange,
  registerSaveHandler
}: SettingsTabProps) {
  // Selected program within the settings tab
  const [selectedProgId, setSelectedProgId] = useState<string>(activeProgram.id);

  // Form state
  const [termVal, setTermVal] = useState<number>(settings.thresholdTerm || 3);
  const [progVal, setProgVal] = useState<number>(settings.thresholdProgram || 5);
  const [sandboxEnabled, setSandboxEnabled] = useState<boolean>(settings.facultySandboxEnabled === true);
  const [activeRoundId, setActiveRoundId] = useState<string>(settings.activeRoundId || '');
  const [activeRoundName, setActiveRoundName] = useState<string>(settings.activeRoundName || '');
  const [feedbackLevels, setFeedbackLevels] = useState<FeedbackLevelSettings>(
    settings.feedbackLevels || { plo: true, dimension: true, rubric: true }
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Comment Round Selection Modal & Archiving State
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [roundChoiceMode, setRoundChoiceMode] = useState<'existing' | 'new'>('new');
  const [selectedExistingRoundId, setSelectedExistingRoundId] = useState<string>('');
  const [newRoundNameInput, setNewRoundNameInput] = useState<string>('');
  const [roundModalError, setRoundModalError] = useState<string | null>(null);
  const [isSavingRoundModal, setIsSavingRoundModal] = useState(false);
  const [isArchivingRound, setIsArchivingRound] = useState(false);
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState<string | null>(null);
  
  // Backup / Snapshot States
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [dbSnapshots, setDbSnapshots] = useState<ProgramSnapshot[]>([]);

  // Update local form state when settings prop changes or selected program changes
  useEffect(() => {
    setSelectedProgId(activeProgram.id);
    if (settings.thresholdTerm !== undefined) setTermVal(settings.thresholdTerm);
    if (settings.thresholdProgram !== undefined) setProgVal(settings.thresholdProgram);
    setSandboxEnabled(settings.facultySandboxEnabled === true);
    setActiveRoundId(settings.activeRoundId || '');
    setActiveRoundName(settings.activeRoundName || '');
    setFeedbackLevels(prev => {
      const target = settings.feedbackLevels || { plo: true, dimension: true, rubric: true };
      if (
        prev.plo === target.plo &&
        prev.dimension === target.dimension &&
        prev.rubric === target.rubric
      ) {
        return prev;
      }
      return target;
    });
  }, [
    activeProgram.id,
    settings.id,
    settings.thresholdTerm,
    settings.thresholdProgram,
    settings.facultySandboxEnabled,
    settings.activeRoundId,
    settings.activeRoundName,
    settings.feedbackLevels?.plo,
    settings.feedbackLevels?.dimension,
    settings.feedbackLevels?.rubric
  ]);

  // Compute if local form state has unsaved changes (isDirty)
  const isDirty = (
    termVal !== (settings.thresholdTerm || 3) ||
    progVal !== (settings.thresholdProgram || 5) ||
    sandboxEnabled !== (settings.facultySandboxEnabled === true) ||
    activeRoundId !== (settings.activeRoundId || '') ||
    activeRoundName !== (settings.activeRoundName || '') ||
    feedbackLevels.plo !== (settings.feedbackLevels?.plo ?? true) ||
    feedbackLevels.dimension !== (settings.feedbackLevels?.dimension ?? true) ||
    feedbackLevels.rubric !== (settings.feedbackLevels?.rubric ?? true)
  );

  // Maintain ref to latest handleSave function
  const handleSaveRef = React.useRef<() => Promise<void>>(async () => {});

  const handleSave = async () => {
    setIsSaving(true);
    const settingDocId = `${selectedProgId}_general`;
    const updated: Setting = {
      id: settingDocId,
      programId: selectedProgId,
      thresholdTerm: termVal,
      thresholdProgram: progVal,
      facultySandboxEnabled: sandboxEnabled,
      activeRoundId: activeRoundId,
      activeRoundName: activeRoundName,
      feedbackLevels: feedbackLevels
    };

    try {
      await onSaveSettings(updated);
      setIsSaved(true);
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(false);
      }
      setTimeout(() => setIsSaved(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  // Register save handler with parent
  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler(async () => {
        await handleSaveRef.current();
      });
    }
  }, [registerSaveHandler]);

  // Track previous dirty state to avoid redundant parent component updates
  const prevDirtyRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (prevDirtyRef.current !== isDirty) {
      prevDirtyRef.current = isDirty;
      if (onUnsavedChangesChange) {
        onUnsavedChangesChange(isDirty);
      }
    }
  }, [isDirty, onUnsavedChangesChange]);

  // Subscribe to Firestore Database Snapshots for the active program
  useEffect(() => {
    const snapshotsRef = collection(db, 'backups');
    const q = query(snapshotsRef, where('programId', '==', selectedProgId));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const list: ProgramSnapshot[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ProgramSnapshot);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDbSnapshots(list);
    }, (error) => {
      console.warn('Firestore backups subscription notice:', error);
    });

    return () => unsub();
  }, [selectedProgId]);

  const handleProgramSwitch = (progId: string) => {
    setSelectedProgId(progId);
    if (onSelectProgram) {
      onSelectProgram(progId);
    }
  };

  const handleToggleLevel = (level: keyof FeedbackLevelSettings) => {
    setFeedbackLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const currentProg = programs.find(p => p.id === selectedProgId) || activeProgram;

  // All feedback rounds for current selected program
  const programRounds = React.useMemo(() => {
    const list = (feedbackRounds || []).filter(r => r.programId === currentProg.id);
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [feedbackRounds, currentProg.id]);

  // Open the modal to choose between continuing an existing round vs starting a brand new round
  const openRoundPromptModal = () => {
    setRoundModalError(null);
    if (programRounds.length > 0) {
      setRoundChoiceMode('existing');
      setSelectedExistingRoundId(activeRoundId && programRounds.some(r => r.id === activeRoundId) ? activeRoundId : programRounds[0].id);
    } else {
      setRoundChoiceMode('new');
      setSelectedExistingRoundId('');
    }
    setNewRoundNameInput('');
    setIsRoundModalOpen(true);
  };

  // Handler when the admin clicks the Sandbox Review Mode toggle switch
  const handleSandboxToggleClick = async () => {
    setArchiveSuccessMsg(null);
    if (!sandboxEnabled) {
      // Turning ON -> Prompt admin whether this round is a continuation of a previous round or a brand new round
      openRoundPromptModal();
    } else {
      // Turning OFF -> Deactivate sandbox review mode
      setSandboxEnabled(false);
      const settingDocId = `${selectedProgId}_general`;
      const updatedSetting: Setting = {
        id: settingDocId,
        programId: selectedProgId,
        thresholdTerm: termVal,
        thresholdProgram: progVal,
        facultySandboxEnabled: false,
        activeRoundId: activeRoundId,
        activeRoundName: activeRoundName,
        feedbackLevels: feedbackLevels
      };
      await onSaveSettings(updatedSetting);
    }
  };

  // Confirm round selection from modal and turn ON sandbox
  const handleConfirmRoundSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoundModalError(null);
    setIsSavingRoundModal(true);

    try {
      let chosenRound: FeedbackRound;

      if (roundChoiceMode === 'existing') {
        const found = programRounds.find(r => r.id === selectedExistingRoundId);
        if (!found) {
          setRoundModalError('Please select an existing comment round from the list.');
          setIsSavingRoundModal(false);
          return;
        }
        chosenRound = {
          ...found,
          status: 'active',
          plosSnapshot: Array.isArray(found.plosSnapshot) && found.plosSnapshot.length > 0
            ? found.plosSnapshot
            : JSON.parse(JSON.stringify(plos))
        };
      } else {
        const trimmedName = newRoundNameInput.trim();
        if (!trimmedName) {
          setRoundModalError('Please enter a name for the new comment round (e.g. "Fall 2026").');
          setIsSavingRoundModal(false);
          return;
        }
        const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const roundId = `${currentProg.id}_round_${slug}_${Date.now()}`;
        chosenRound = {
          id: roundId,
          programId: currentProg.id,
          name: trimmedName,
          status: 'active',
          createdAt: new Date().toISOString(),
          plosSnapshot: JSON.parse(JSON.stringify(plos))
        };
      }

      if (onSaveFeedbackRound) {
        await onSaveFeedbackRound(chosenRound);
      } else {
        await setDoc(doc(db, 'feedback_rounds', chosenRound.id), cleanUndefined(chosenRound));
      }

      setSandboxEnabled(true);
      setActiveRoundId(chosenRound.id);
      setActiveRoundName(chosenRound.name);

      const settingDocId = `${selectedProgId}_general`;
      const updatedSetting: Setting = {
        id: settingDocId,
        programId: selectedProgId,
        thresholdTerm: termVal,
        thresholdProgram: progVal,
        facultySandboxEnabled: true,
        activeRoundId: chosenRound.id,
        activeRoundName: chosenRound.name,
        feedbackLevels: feedbackLevels
      };
      await onSaveSettings(updatedSetting);
      setIsRoundModalOpen(false);
    } catch (err: any) {
      setRoundModalError(err.message || 'Failed to configure comment round.');
    } finally {
      setIsSavingRoundModal(false);
    }
  };

  // Archive the current comment round as a read-only version when the comment period is done
  const handleArchiveCurrentRound = async (targetRound?: FeedbackRound) => {
    const roundToArchive = targetRound || programRounds.find(r => r.id === activeRoundId) || (activeRoundId ? {
      id: activeRoundId,
      programId: currentProg.id,
      name: activeRoundName || 'Review Round',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      plosSnapshot: JSON.parse(JSON.stringify(plos))
    } : null);

    if (!roundToArchive) return;

    setIsArchivingRound(true);
    setArchiveSuccessMsg(null);
    try {
      const archivedRound: FeedbackRound = {
        ...roundToArchive,
        status: 'archived',
        archivedAt: new Date().toISOString(),
        plosSnapshot: Array.isArray(roundToArchive.plosSnapshot) && roundToArchive.plosSnapshot.length > 0
          ? roundToArchive.plosSnapshot
          : JSON.parse(JSON.stringify(plos))
      };

      if (onSaveFeedbackRound) {
        await onSaveFeedbackRound(archivedRound);
      } else {
        await setDoc(doc(db, 'feedback_rounds', archivedRound.id), cleanUndefined(archivedRound));
      }

      // Turn off sandbox toggle once the round is archived
      setSandboxEnabled(false);
      setActiveRoundId('');
      setActiveRoundName('');

      const settingDocId = `${selectedProgId}_general`;
      const updatedSetting: Setting = {
        id: settingDocId,
        programId: selectedProgId,
        thresholdTerm: termVal,
        thresholdProgram: progVal,
        facultySandboxEnabled: false,
        activeRoundId: '',
        activeRoundName: '',
        feedbackLevels: feedbackLevels
      };
      await onSaveSettings(updatedSetting);

      setArchiveSuccessMsg(
        `Comment round "${archivedRound.name}" has been archived as a read-only version with its frozen ${archivedRound.plosSnapshot.length} PLOs and comments! It is now available in the Faculty Feedback Reviews Board tab.`
      );
    } catch (err: any) {
      console.error('Failed to archive comment round:', err);
    } finally {
      setIsArchivingRound(false);
    }
  };

  const totalDimensionsCount = plos.reduce((acc, p) => acc + (p.dimensions?.length || 0), 0);
  const totalAssignmentsCount = Object.values(assignments).reduce((acc, list) => acc + (list?.length || 0), 0);
  const totalMappingsCount = Object.keys(mappings || {}).length;

  // Helper to remove undefined properties before saving to Firestore
  const cleanUndefined = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null) return null;
    if (obj instanceof Date) return obj.toISOString();
    if (typeof obj === 'object' && typeof obj.toDate === 'function') {
      return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(item => cleanUndefined(item));
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanUndefined(obj[key]);
        }
      }
      return cleaned;
    }
    return obj;
  };

  const [backupTitleError, setBackupTitleError] = useState<string | null>(null);

  // Derive comments dynamically for current selected program in SettingsTab
  const currentProgComments = React.useMemo(() => {
    // 1. Try filtering allComments for current program
    const fromAll = (allComments || []).filter(c => {
      if (!c) return false;
      const cProg = c.programId || (typeof c.id === 'string' && c.id.startsWith('bcom_') ? 'bcom' : 'mba');
      return cProg === currentProg.id;
    });
    if (fromAll.length > 0) {
      return fromAll;
    }
    // 2. Try filtering facultyComments (which includes active program comments)
    const fromFaculty = (facultyComments || []).filter(c => {
      if (!c) return false;
      const cProg = c.programId || (typeof c.id === 'string' && c.id.startsWith('bcom_') ? 'bcom' : 'mba');
      return cProg === currentProg.id;
    });
    if (fromFaculty.length > 0) {
      return fromFaculty;
    }
    // 3. Fallback to INITIAL_COMMENTS if program is MBA and no comments loaded yet
    if (currentProg.id === 'mba' && (!allComments || allComments.length === 0)) {
      return INITIAL_COMMENTS;
    }
    return [];
  }, [allComments, facultyComments, currentProg.id]);

  // Automatically sync existing backups in Firestore if their comment count is 0 while comments exist
  useEffect(() => {
    if (currentProgComments.length > 0 && dbSnapshots.length > 0) {
      dbSnapshots.forEach((snap) => {
        const snapCommentsCount = snap.counts?.comments ?? 0;
        const snapPayloadCommentsLen = Array.isArray(snap.payload?.comments) ? snap.payload.comments.length : 0;
        if (
          snap.programId === currentProg.id &&
          (snapCommentsCount === 0 || snapPayloadCommentsLen === 0 || (snap.id === 'mba_backup_initial' && snapCommentsCount !== currentProgComments.length))
        ) {
          const updatedSnap: ProgramSnapshot = {
            ...snap,
            counts: {
              ...snap.counts,
              comments: currentProgComments.length
            },
            payload: {
              ...(snap.payload || {}),
              comments: currentProgComments,
              feedbackRounds: programRounds
            }
          };
          setDoc(doc(db, 'backups', snap.id), cleanUndefined(updatedSnap)).catch((err) => {
            console.warn('Auto-sync backup comments notice:', err);
          });
        }
      });
    }
  }, [currentProgComments, dbSnapshots, currentProg.id, programRounds]);

  // Generate full program backup payload
  const createBackupPayload = (overrideComments?: FacultyComment[]) => {
    const commentsList = overrideComments || currentProgComments;
    return {
      backupMetadata: {
        system: 'UCW Multi-Program Curriculum Mapping System',
        version: '5.0',
        exportedAt: new Date().toISOString(),
        programId: currentProg.id,
        programCode: currentProg.code,
        programName: currentProg.name
      },
      program: currentProg,
      settings: {
        ...settings,
        thresholdTerm: termVal,
        thresholdProgram: progVal,
        facultySandboxEnabled: sandboxEnabled,
        activeRoundId: activeRoundId,
        activeRoundName: activeRoundName,
        feedbackLevels: feedbackLevels
      },
      plos,
      courses,
      mappings,
      assignments,
      students,
      comments: commentsList,
      feedbackRounds: programRounds
    };
  };

  // Save Backup directly into Firestore Database
  const handleSaveSnapshotToDatabase = async () => {
    setBackupTitleError(null);
    const trimmedLabel = newSnapshotLabel.trim();
    if (!trimmedLabel) {
      setBackupTitleError(`A title is required to save a database backup for ${currentProg.code}. Please enter a name.`);
      return;
    }

    setIsSavingSnapshot(true);
    try {
      let finalComments: FacultyComment[] = [...currentProgComments];
      try {
        const liveCommentsSnap = await getDocs(collection(db, 'comments'));
        const hasRealComments = liveCommentsSnap.size > 2;
        const liveMatched: FacultyComment[] = [];
        liveCommentsSnap.forEach((d) => {
          const docId = d.id;
          if (hasRealComments && (docId === 'mba_comment_1' || docId === 'mba_comment_2')) {
            return;
          }
          const data = d.data() as FacultyComment;
          const cId = data.id || docId;
          const cProg = data.programId || (typeof cId === 'string' && cId.startsWith('bcom_') ? 'bcom' : 'mba');
          if (cProg === currentProg.id) {
            liveMatched.push({
              ...data,
              id: cId,
              programId: cProg
            });
          }
        });
        if (liveMatched.length >= finalComments.length && liveMatched.length > 0) {
          finalComments = liveMatched;
        }
      } catch (fetchErr) {
        console.warn('Fallback to state comments during backup save:', fetchErr);
      }

      const snapshotDocId = `${currentProg.id}_backup_${Date.now()}`;
      const rawPayload = createBackupPayload(finalComments);
      const cleanPayload = cleanUndefined(rawPayload);

      const snapshotDoc: ProgramSnapshot = {
        id: snapshotDocId,
        programId: currentProg.id,
        programCode: currentProg.code,
        programName: currentProg.name,
        createdAt: new Date().toISOString(),
        label: trimmedLabel,
        counts: {
          plos: plos.length,
          dimensions: totalDimensionsCount,
          courses: courses.length,
          mappings: totalMappingsCount,
          assessments: totalAssignmentsCount,
          students: students.length,
          comments: finalComments.length
        },
        payload: cleanPayload
      };

      await setDoc(doc(db, 'backups', snapshotDocId), cleanUndefined(snapshotDoc));
      setNewSnapshotLabel('');
      setRestoreSuccess(true);
      setTimeout(() => setRestoreSuccess(false), 4000);
    } catch (e: any) {
      setBackupTitleError("Failed to save database backup: " + (e.message || String(e)));
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  // Restore backup from Firestore Database
  const handleRestoreDatabaseSnapshot = async (snapshot: ProgramSnapshot) => {
    if (confirm(`Are you sure you want to load and restore the database backup "${snapshot.label}" created on ${new Date(snapshot.createdAt).toLocaleString()}? This will overwrite the current active data for ${currentProg.name}.`)) {
      setIsRestoring(true);
      try {
        if (onRestoreProgramBackup) {
          await onRestoreProgramBackup(snapshot.payload);
          setRestoreSuccess(true);
          setTimeout(() => setRestoreSuccess(false), 4500);
        }
      } catch (e: any) {
        alert("Error loading backup: " + (e.message || String(e)));
      } finally {
        setIsRestoring(false);
      }
    }
  };

  // Delete backup document from Firestore
  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (confirm("Are you sure you want to delete this database backup?")) {
      try {
        await deleteDoc(doc(db, 'backups', snapshotId));
      } catch (e: any) {
        alert("Failed to delete backup: " + (e.message || String(e)));
      }
    }
  };

  const handleDownloadBackup = () => {
    const payload = createBackupPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `${currentProg.code.toLowerCase()}_complete_curriculum_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  const handleCopyBackup = () => {
    const payload = createBackupPayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2500);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (onRestoreProgramBackup) {
          setIsRestoring(true);
          await onRestoreProgramBackup(parsed);
          setRestoreSuccess(true);
          setTimeout(() => setRestoreSuccess(false), 4500);
        }
      } catch (err: any) {
        alert("Failed to parse backup JSON file: " + (err.message || String(err)));
      } finally {
        setIsRestoring(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-tab-root" className="max-w-4xl mx-auto space-y-6">
      {/* Unsaved Changes Banner */}
      {isDirty && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <span>You have unsaved changes in Settings for {currentProg.name}. Remember to save before navigating away.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-2xs transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings Now'}
          </button>
        </div>
      )}

      {/* Program Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            Configuring Program:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
          {programs.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProgramSwitch(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                selectedProgId === p.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {p.code} - {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Panel */}
      <div id="settings-panel-card" className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-8">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Curriculum Governance & Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure faculty sandbox review modes, feedback permissions, and complete program database backups for {currentProg.name}.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Faculty Sandbox Review Mode Section */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200/60 pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" />
                <h4 className="font-bold text-sm text-slate-800">
                  Faculty Sandbox Review Mode
                </h4>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  sandboxEnabled 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {sandboxEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
                {sandboxEnabled && activeRoundName && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Active Round: {activeRoundName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Allow faculty members to log in through the Faculty Sandbox portal to review this program&apos;s PLOs, cast upvotes, and submit constructive reviews linked to a specific comment round and PLO snapshot.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {sandboxEnabled && (
                <button
                  type="button"
                  onClick={openRoundPromptModal}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition cursor-pointer shadow-2xs"
                >
                  Switch / New Round
                </button>
              )}

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={handleSandboxToggleClick}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  sandboxEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={sandboxEnabled}
                title={sandboxEnabled ? 'Turn off Faculty Sandbox' : 'Turn on Faculty Sandbox and select comment round'}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    sandboxEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Comment Round & Version Archive Control Box */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Archive size={14} className="text-amber-600" />
                  Comment Rounds &amp; Version Archiving ({currentProg.code})
                </span>
                <p className="text-[11px] text-slate-500">
                  {sandboxEnabled && activeRoundName
                    ? `Currently collecting faculty feedback for round "${activeRoundName}". When the comment period is finished, click below to archive it as an immutable version.`
                    : `When you turn the Sandbox toggle ON, you can choose to continue an existing comment round or start a brand new round.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {sandboxEnabled && activeRoundId && (
                  <button
                    type="button"
                    onClick={() => handleArchiveCurrentRound()}
                    disabled={isArchivingRound}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Archive size={13} />
                    {isArchivingRound ? 'Archiving Version...' : `Archive "${activeRoundName}" as New Version`}
                  </button>
                )}

                {onNavigateToFeedbackBoard && (
                  <button
                    type="button"
                    onClick={onNavigateToFeedbackBoard}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Eye size={13} /> View Feedback Reviews Board
                  </button>
                )}
              </div>
            </div>

            {archiveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Check size={15} className="text-emerald-600 shrink-0" />
                  <span>{archiveSuccessMsg}</span>
                </div>
                {onNavigateToFeedbackBoard && (
                  <button
                    type="button"
                    onClick={onNavigateToFeedbackBoard}
                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
                  >
                    Open Board
                  </button>
                )}
              </div>
            )}

            {/* List of Comment Rounds for this Program */}
            {programRounds.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Recorded Comment Rounds for {currentProg.code} ({programRounds.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {programRounds.map((r) => {
                    const rCommentsCount = currentProgComments.filter(c => {
                      if (c.roundId) return c.roundId === r.id;
                      return r.id === 'mba_round_july_2026' && currentProg.id === 'mba';
                    }).length;
                    const rPlosCount = Array.isArray(r.plosSnapshot) ? r.plosSnapshot.length : 0;
                    const isCurrentActive = sandboxEnabled && activeRoundId === r.id;

                    return (
                      <div
                        key={r.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                          isCurrentActive
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{r.name}</span>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
                              r.status === 'archived'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                              {r.status === 'archived' ? 'ARCHIVED VERSION' : 'ACTIVE ROUND'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {rCommentsCount} Reviews • {rPlosCount} Frozen PLOs
                          </p>
                        </div>

                        {r.status === 'active' && !isCurrentActive && (
                          <button
                            type="button"
                            onClick={() => handleArchiveCurrentRound(r)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0"
                          >
                            Archive Version
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Granularity Levels */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Permitted Feedback Levels
                </label>
                <p className="text-[11px] text-slate-400">
                  Select which curriculum components faculty are allowed to leave feedback on (any combination):
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {[
                  feedbackLevels.plo && 'PLO',
                  feedbackLevels.dimension && 'Dimension',
                  feedbackLevels.rubric && 'Rubric'
                ].filter(Boolean).join(' + ') || 'None Selected'}
              </span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${!sandboxEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Option A: PLO Level */}
              <div 
                onClick={() => handleToggleLevel('plo')}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                  feedbackLevels.plo
                    ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-100'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <button type="button" className="text-blue-600 mt-0.5 shrink-0">
                  {feedbackLevels.plo ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-400" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">PLO Statement Level</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Feedback on overall outcome statements, action verbs, and Bloom&apos;s level.
                  </p>
                </div>
              </div>

              {/* Option B: Dimension Level */}
              <div 
                onClick={() => handleToggleLevel('dimension')}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                  feedbackLevels.dimension
                    ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-100'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <button type="button" className="text-blue-600 mt-0.5 shrink-0">
                  {feedbackLevels.dimension ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-400" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Dimension Level</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Feedback on individual competency dimensions and sub-elements.
                  </p>
                </div>
              </div>

              {/* Option C: Rubric Level */}
              <div 
                onClick={() => handleToggleLevel('rubric')}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                  feedbackLevels.rubric
                    ? 'bg-white border-blue-300 shadow-xs ring-1 ring-blue-100'
                    : 'bg-white/60 border-slate-200 hover:bg-white'
                }`}
              >
                <button type="button" className="text-blue-600 mt-0.5 shrink-0">
                  {feedbackLevels.rubric ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-400" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Rubric Criteria Level</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Feedback on specific criteria: Exceeds, Meets, and Does Not Meet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Coverage Threshold Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders size={16} className="text-blue-600" />
            <h4 className="font-bold text-sm text-slate-800">
              Coverage Matrix & Mapping Targets
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Term threshold slider */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center justify-between">
                <span>Term-Wise PLO Target</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-blue-200">
                  {termVal} CLOs
                </span>
              </label>
              <p className="text-xs text-slate-400 leading-normal">
                Minimum number of Course Learning Outcome (CLO) mappings required per term to mark a Program Learning Outcome (PLO) as fully covered (Green).
              </p>
              <input
                type="range"
                min={1}
                max={10}
                value={termVal}
                onChange={(e) => setTermVal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min (1)</span>
                <span>Max (10)</span>
              </div>
            </div>

            {/* Program threshold slider */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center justify-between">
                <span>Program-Level PLO Target</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-blue-200">
                  {progVal} CLOs
                </span>
              </label>
              <p className="text-xs text-slate-400 leading-normal">
                Minimum aggregate number of CLO-to-PLO mappings throughout the entire curriculum required to certify the PLO is sufficiently established in the whole program.
              </p>
              <input
                type="range"
                min={1}
                max={20}
                value={progVal}
                onChange={(e) => setProgVal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min (1)</span>
                <span>Max (20)</span>
              </div>
            </div>
          </div>

          {/* Explanation panel */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
            <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
              <strong className="text-slate-700 font-bold block">Status and Color Threshold Logic:</strong>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span><strong>Red (Uncovered / 0 mappings)</strong>: PLO has zero course learning outcomes pointing to it. Requires immediate syllabus additions.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span><strong>Blue (Partial / &lt; Target)</strong>: PLO is covered but has fewer CLOs than the specified threshold.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span><strong>Green (Sufficient / &ge; Target)</strong>: PLO receives strong representation. Well-anchored in the program.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PROGRAM DATABASE BACKUP & VERSION ARCHIVES */}
        <div id="program-backup-section" className="space-y-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <Database size={20} />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  Database Backups & Version Archives
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {currentProg.code} FIRESTORE BACKUPS
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save, restore, and load complete version backups of <strong>{currentProg.name}</strong> directly in Cloud Firestore or export local JSON files.
                </p>
              </div>
            </div>
          </div>

          {/* Live Backup Metrics Grid */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Program Inventory Captured in Backup ({currentProg.code}):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs font-semibold">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                  <Award size={12} className="text-blue-600" /> PLOs
                </span>
                <span className="text-lg font-bold text-slate-800 mt-1">
                  {plos.length} <span className="text-[10px] font-normal text-slate-400">({totalDimensionsCount} Dim)</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                  <BookOpen size={12} className="text-indigo-600" /> Courses
                </span>
                <span className="text-lg font-bold text-slate-800 mt-1">
                  {courses.length} <span className="text-[10px] font-normal text-slate-400">Outlines</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                  <Map size={12} className="text-cyan-600" /> Mappings
                </span>
                <span className="text-lg font-bold text-slate-800 mt-1">
                  {totalMappingsCount} <span className="text-[10px] font-normal text-slate-400">Links</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                  <FileSpreadsheet size={12} className="text-amber-600" /> Assessments
                </span>
                <span className="text-lg font-bold text-slate-800 mt-1">
                  {totalAssignmentsCount} <span className="text-[10px] font-normal text-slate-400">Tasks</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                  <Users size={12} className="text-emerald-600" /> Students
                </span>
                <span className="text-lg font-bold text-slate-800 mt-1">
                  {students.length} <span className="text-[10px] font-normal text-slate-400">Logs</span>
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-col justify-between shadow-xs">
                <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1">
                  <MessageSquare size={12} className="text-purple-600" /> Feedback
                </span>
                <span className="text-lg font-bold text-slate-800 mt-1">
                  {currentProgComments.length} <span className="text-[10px] font-normal text-slate-400">Reviews</span>
                </span>
              </div>
            </div>
          </div>

          {/* Option A: Direct Database Save & Restore Panel */}
          <div className="bg-white p-5 rounded-xl border border-blue-200/80 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                <HardDriveUpload size={14} className="text-blue-600" /> Option 1: Save & Load Firestore Database Backups
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {dbSnapshots.length} Backups Available
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder={`Backup Title (e.g. ${currentProg.code} Fall 2026 Curriculum Baseline)`}
                  value={newSnapshotLabel}
                  onChange={(e) => {
                    setNewSnapshotLabel(e.target.value);
                    if (backupTitleError) setBackupTitleError(null);
                  }}
                  className={`flex-1 p-2.5 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 ${
                    backupTitleError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSaveSnapshotToDatabase}
                  disabled={isSavingSnapshot}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSavingSnapshot ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} /> Saving Backup...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Backup to Database
                    </>
                  )}
                </button>
              </div>

              {backupTitleError && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 animate-fadeIn">
                  <AlertTriangle size={14} /> {backupTitleError}
                </p>
              )}
            </div>

            {/* List of saved Database Backups with Option to Load */}
            {dbSnapshots.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Available Database Backups for {currentProg.code} ({dbSnapshots.length}):
                </span>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {dbSnapshots.map((snap) => (
                    <div key={snap.id} className="p-3.5 bg-slate-50/90 border border-slate-200/90 hover:border-blue-300 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <History size={14} className="text-blue-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800">{snap.label}</span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {new Date(snap.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Backup contains: {snap.counts?.plos || 0} PLOs, {snap.counts?.courses || 0} Courses, {snap.counts?.mappings || 0} Mappings, {snap.counts?.assessments || 0} Assessments, {snap.counts?.comments || 0} Reviews
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRestoreDatabaseSnapshot(snap)}
                          disabled={isRestoring}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw size={13} /> Load & Restore Backup
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSnapshot(snap.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Backup"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Option B: Local JSON File Download & Restore */}
          <div className="pt-3 border-t border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
              >
                <Download size={14} /> Download JSON File Backup
              </button>

              <button
                type="button"
                onClick={handleCopyBackup}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
              >
                {copiedBackup ? (
                  <>
                    <Check size={14} className="text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Payload
                  </>
                )}
              </button>
            </div>

            {/* Restore / Import File Input */}
            {onRestoreProgramBackup && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-sm">
                  {isRestoring ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} /> Restoring...
                    </>
                  ) : (
                    <>
                      <Upload size={14} /> Restore from JSON File
                    </>
                  )}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFile}
                    className="hidden"
                    disabled={isRestoring}
                  />
                </label>
              </div>
            )}
          </div>

          {restoreSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>
                Program Backup successfully restored! All PLOs, courses, outlines, mappings, assessments, student logs, settings, and feedback comments for {currentProg.name} have been updated.
              </span>
            </div>
          )}

          {/* Explanation Banner */}
          <div className="bg-white/80 border border-slate-200/80 p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
            <FileJson size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Complete Version Control:</strong> Snapshots saved directly in Firestore database are stored securely and remain accessible across all administrator browsers and devices. You can save milestones before major curriculum updates and restore previous baselines at any time.
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
          <div className="flex items-center gap-1">
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                <Check size={14} /> Settings successfully saved for {currentProg.name}.
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-sm shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Save size={16} /> {isSaving ? 'Saving...' : `Save Settings for ${currentProg.code}`}
          </button>
        </div>
      </div>

      {/* Modal: Prompt Admin When Turning ON Faculty Sandbox Toggle */}
      {isRoundModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Configure Faculty Comment Round ({currentProg.code})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Classify incoming faculty feedback and link it to the current PLOs snapshot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRoundModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmRoundSelection} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Is this Faculty Sandbox session a <strong>continuation of a previous/recurring comment round</strong>, or a <strong>brand new comment round</strong> for <strong>{currentProg.name}</strong>?
              </p>

              <div className="space-y-3">
                {/* Option 1: Continuation of an existing round */}
                <div
                  onClick={() => {
                    if (programRounds.length > 0) {
                      setRoundChoiceMode('existing');
                      if (!selectedExistingRoundId && programRounds[0]) {
                        setSelectedExistingRoundId(programRounds[0].id);
                      }
                    }
                  }}
                  className={`p-4 rounded-xl border transition ${
                    programRounds.length === 0
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : roundChoiceMode === 'existing'
                      ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-200 cursor-pointer'
                      : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="roundChoiceMode"
                      checked={roundChoiceMode === 'existing'}
                      disabled={programRounds.length === 0}
                      onChange={() => setRoundChoiceMode('existing')}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Continuation of a Previous / Existing Comment Round
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {programRounds.length > 0
                            ? 'Re-open or continue collecting comments under an existing round.'
                            : `No previous comment rounds exist yet for ${currentProg.code}.`}
                        </span>
                      </div>

                      {roundChoiceMode === 'existing' && programRounds.length > 0 && (
                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">
                            Select Existing Round:
                          </label>
                          <select
                            value={selectedExistingRoundId}
                            onChange={(e) => setSelectedExistingRoundId(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {programRounds.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.status === 'archived' ? 'Archived' : 'Active'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Option 2: Brand new comment round */}
                <div
                  onClick={() => setRoundChoiceMode('new')}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    roundChoiceMode === 'new'
                      ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="roundChoiceMode"
                      checked={roundChoiceMode === 'new'}
                      onChange={() => setRoundChoiceMode('new')}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Start a Brand New Comment Round
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Create a new named round and link a snapshot of the current {plos.length} {currentProg.code} PLOs to it.
                        </span>
                      </div>

                      {roundChoiceMode === 'new' && (
                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1">
                            New Comment Round Name:
                          </label>
                          <input
                            type="text"
                            placeholder={`e.g. Fall 2026 or ${currentProg.code} October 2026 Review`}
                            value={newRoundNameInput}
                            onChange={(e) => setNewRoundNameInput(e.target.value)}
                            autoFocus
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {roundModalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{roundModalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoundModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRoundModal}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingRoundModal ? 'Activating...' : 'Confirm & Turn On Sandbox'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
