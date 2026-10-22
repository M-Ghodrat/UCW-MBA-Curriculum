import React, { useState, useEffect } from 'react';
import { auth, db, testConnection, handleFirestoreError, OperationType } from './firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';

// Types
import { PLO, Course, Setting, Assignment, Student, FacultyComment, AcademicProgram, FeedbackRound } from './types';

// Seed Initial Data
import {
  INITIAL_PROGRAMS,
  INITIAL_PLOS,
  INITIAL_COURSES,
  INITIAL_MAPPINGS,
  DEFAULT_SETTINGS,
  INITIAL_ASSIGNMENTS,
  INITIAL_STUDENTS,
  INITIAL_BCOM_PLOS,
  INITIAL_BCOM_COURSES,
  INITIAL_BCOM_MAPPINGS,
  INITIAL_BCOM_ASSIGNMENTS,
  INITIAL_BCOM_STUDENTS,
  DEFAULT_PROGRAM_SETTINGS,
  INITIAL_COMMENTS,
  INITIAL_FEEDBACK_ROUNDS
} from './data/initialData';

// Sub Components
import ProgramTab from './components/ProgramTab';
import FeedbackReviewsTab from './components/FeedbackReviewsTab';
import CourseOutlinesTab from './components/CourseOutlinesTab';
import CoursesTab from './components/CoursesTab';
import VisualMappingTab from './components/VisualMappingTab';
import CoverageTab from './components/CoverageTab';
import SettingsTab from './components/SettingsTab';
import AssignmentsTab from './components/AssignmentsTab';
import StudentProficiencyTab from './components/StudentProficiencyTab';
import CurriculumChatbot from './components/CurriculumChatbot';
import ProgramManagerModal from './components/ProgramManagerModal';
import ucwLogo from './assets/images/ucw_logo_1782386132664.jpg';

// Icons
import {
  Award,
  BookOpen,
  Map,
  Table,
  Wand2,
  Settings as SettingsIcon,
  FileSpreadsheet,
  Users,
  LogIn,
  LogOut,
  Sparkles,
  Database,
  User as UserIcon,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Lock,
  ChevronDown,
  GraduationCap,
  Layers,
  Plus,
  MessageSquare,
  Archive
} from 'lucide-react';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('program');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDbEmptyInFirestore, setIsDbEmptyInFirestore] = useState(false);

  // Access control role state: admin, faculty_guest, or null
  const [userRole, setUserRole] = useState<'admin' | 'faculty_guest' | null>(() => {
    return (localStorage.getItem('user_role') as 'admin' | 'faculty_guest' | null) || null;
  });
  const [adminPasscode, setAdminPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Faculty Sandbox Mode State
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);

  // Keep tab focused and sync status
  useEffect(() => {
    localStorage.setItem('is_sandbox_mode', 'false');
  }, []);

  // Academic Programs Management
  const [programs, setPrograms] = useState<AcademicProgram[]>(INITIAL_PROGRAMS);
  const [selectedProgramId, setSelectedProgramId] = useState<string>(() => {
    return localStorage.getItem('selected_program_id') || 'mba';
  });
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);

  // Unsaved Settings Warning State
  const [hasUnsavedSettings, setHasUnsavedSettings] = useState(false);
  const saveSettingsRef = React.useRef<(() => Promise<void>) | null>(null);
  const [pendingNavModal, setPendingNavModal] = useState<{
    type: 'tab' | 'program';
    targetId: string;
  } | null>(null);

  // Current active program object
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0] || INITIAL_PROGRAMS[0];

  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    localStorage.setItem('selected_program_id', programId);
  };

  const handleUnsavedSettingsChange = React.useCallback((isDirty: boolean) => {
    setHasUnsavedSettings(isDirty);
  }, []);

  const handleRegisterSaveHandler = React.useCallback((handler: () => Promise<void>) => {
    saveSettingsRef.current = handler;
  }, []);

  const handleTabSwitchRequest = (targetTab: string) => {
    if (isSandboxMode || userRole === 'faculty_guest') {
      setActiveTab('program');
      return;
    }
    if (activeTab === 'settings' && hasUnsavedSettings && targetTab !== 'settings') {
      setPendingNavModal({ type: 'tab', targetId: targetTab });
    } else {
      setActiveTab(targetTab);
    }
  };

  const handleProgramSwitchRequest = (targetProgramId: string) => {
    if (isSandboxMode || userRole === 'faculty_guest') return;
    if (activeTab === 'settings' && hasUnsavedSettings && targetProgramId !== selectedProgramId) {
      setPendingNavModal({ type: 'program', targetId: targetProgramId });
    } else {
      handleSelectProgram(targetProgramId);
    }
  };

  // Core App states synced from Firestore
  const [programInfo, setProgramInfo] = useState({
    name: 'Master of Business Administration (MBA)',
    description: 'The ACBSP-accredited Master of Business Administration (MBA) program from University Canada West (UCW) will prepare you for leadership on the global stage. You will learn how to take challenging situations in stride, apply pragmatic solutions to problems and ultimately drive the success of an organization.',
    objectives: 'The program develops graduates who can formulate sustainable business strategy, build and direct diverse business teams, conduct analytics-driven business evaluation, and integrate digital technology solutions seamlessly into daily corporate operations.'
  });
  const [plos, setPlos] = useState<PLO[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mappings, setMappings] = useState<{ [key: string]: string[] }>({});
  const [settings, setSettings] = useState<Setting>(DEFAULT_SETTINGS);
  const [allSettings, setAllSettings] = useState<{ [key: string]: Setting }>({});
  const [assignments, setAssignments] = useState<{ [courseId: string]: Assignment[] }>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [comments, setComments] = useState<FacultyComment[]>([]);
  const [feedbackRounds, setFeedbackRounds] = useState<FeedbackRound[]>(INITIAL_FEEDBACK_ROUNDS);

  // Synchronize programInfo with currentProgram whenever selected program changes
  useEffect(() => {
    if (currentProgram) {
      setProgramInfo({
        name: currentProgram.name,
        description: currentProgram.description,
        objectives: currentProgram.objectives
      });
    }
  }, [currentProgram]);

  // Derived collections for current active program (guaranteed unique by ID)
  const activePlos = React.useMemo(() => {
    const list = plos.filter(p => (p.programId || 'mba') === currentProgram.id);
    const rawList = list.length > 0 
      ? list 
      : (currentProgram.id === 'bcom' ? INITIAL_BCOM_PLOS : (currentProgram.id === 'mba' ? INITIAL_PLOS : []));
    
    const seen = new Set<string>();
    const unique: PLO[] = [];
    for (const p of rawList) {
      if (p.id && !seen.has(p.id)) {
        seen.add(p.id);
        unique.push(p);
      }
    }
    return unique;
  }, [plos, currentProgram.id]);

  const activeCourses = React.useMemo(() => {
    const list = courses.filter(c => (c.programId || 'mba') === currentProgram.id);
    const rawList = list.length > 0 
      ? list 
      : (currentProgram.id === 'bcom' ? INITIAL_BCOM_COURSES : (currentProgram.id === 'mba' ? INITIAL_COURSES : []));
    
    const seen = new Set<string>();
    const unique: Course[] = [];
    for (const c of rawList) {
      if (c.id && !seen.has(c.id)) {
        seen.add(c.id);
        unique.push(c);
      }
    }
    return unique;
  }, [courses, currentProgram.id]);

  const activeMappings = React.useMemo(() => {
    return mappings[currentProgram.id] || mappings['mba'] || INITIAL_MAPPINGS;
  }, [mappings, currentProgram.id]);

  const activeSettings = React.useMemo(() => {
    const docKey = `${currentProgram.id}_general`;
    if (allSettings[docKey]) {
      return allSettings[docKey];
    }
    if (currentProgram.id === 'mba') {
      if (allSettings['mba_general']) return allSettings['mba_general'];
      if (allSettings['general']) return allSettings['general'];
      if (settings.id) return settings;
    }
    return DEFAULT_PROGRAM_SETTINGS[currentProgram.id] || DEFAULT_SETTINGS;
  }, [allSettings, settings, currentProgram.id]);

  const activeAssignments = React.useMemo(() => {
    if (Object.keys(assignments).length > 0) {
      const courseIds = new Set(activeCourses.map(c => c.id));
      const filtered: { [courseId: string]: Assignment[] } = {};
      Object.entries(assignments).forEach(([cId, items]) => {
        if (courseIds.has(cId)) {
          filtered[cId] = items as Assignment[];
        }
      });
      if (Object.keys(filtered).length > 0) return filtered;
    }
    if (currentProgram.id === 'bcom') return INITIAL_BCOM_ASSIGNMENTS;
    return INITIAL_ASSIGNMENTS;
  }, [assignments, activeCourses, currentProgram.id]);

  const activeStudents = React.useMemo(() => {
    const list = students.filter(s => (s.programId || 'mba') === currentProgram.id);
    const rawList = list.length > 0 
      ? list 
      : (currentProgram.id === 'bcom' ? INITIAL_BCOM_STUDENTS : INITIAL_STUDENTS);
    
    const seen = new Set<string>();
    const unique: Student[] = [];
    for (const s of rawList) {
      if (s.id && !seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    }
    return unique;
  }, [students, currentProgram.id]);

  const activeComments = React.useMemo(() => {
    const list = comments.filter(c => {
      if (!c) return false;
      const cProg = c.programId || (typeof c.id === 'string' && c.id.startsWith('bcom_') ? 'bcom' : 'mba');
      return cProg === currentProgram.id;
    });
    if (list.length > 0) return list;
    if (currentProgram.id === 'mba' && comments.length === 0) return INITIAL_COMMENTS;
    return [];
  }, [comments, currentProgram.id]);

  // Lock sandbox users strictly to 'program' tab
  useEffect(() => {
    if (isSandboxMode || userRole === 'faculty_guest') {
      if (activeTab !== 'program') {
        setActiveTab('program');
      }
    }
  }, [isSandboxMode, userRole, activeTab]);

  // Unique voter identifier state that regenerates on each new tab/session or sandbox entry
  const [voterId, setVoterId] = useState<string>(() => {
    let id = sessionStorage.getItem('voter_id');
    if (!id) {
      id = `voter_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('voter_id', id);
    }
    return id;
  });



  // Upvote a comment
  const handleUpvoteComment = async (commentId: string) => {
    const targetComment = comments.find(c => c.id === commentId);
    if (!targetComment) return;

    const upvotes = targetComment.upvotes || [];
    const hasVoted = upvotes.includes(voterId);
    const newUpvotes = hasVoted
      ? upvotes.filter(id => id !== voterId)
      : [...upvotes, voterId];

    const updatedComment = { ...targetComment, upvotes: newUpvotes };

    try {
      await setDoc(doc(db, 'comments', commentId), cleanUndefined(updatedComment));
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'comments');
    }
  };

  // Save a new FacultyComment to Firestore (tagged with the active comment round)
  const handleAddComment = async (comment: Omit<FacultyComment, 'id' | 'createdAt'>) => {
    const progId = comment.programId || currentProgram.id;
    const id = `${progId}_comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roundId = comment.roundId || activeSettings.activeRoundId || (progId === 'mba' ? 'mba_round_july_2026' : '');
    const roundName = comment.roundName || activeSettings.activeRoundName || (progId === 'mba' ? 'July 2026' : '');

    const newComment: FacultyComment = {
      ...comment,
      id,
      programId: progId,
      roundId,
      roundName,
      createdAt: new Date().toISOString()
    };
    
    const cleanComment = cleanUndefined(newComment);

    try {
      await setDoc(doc(db, 'comments', id), cleanComment);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'comments');
    }
  };

  // Save or update a FeedbackRound in Firestore
  const handleSaveFeedbackRound = async (round: FeedbackRound) => {
    try {
      await setDoc(doc(db, 'feedback_rounds', round.id), cleanUndefined(round));
      setFeedbackRounds(prev => {
        const others = prev.filter(r => r.id !== round.id);
        return [...others, round];
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `feedback_rounds/${round.id}`);
    }
  };

  // Delete a FacultyComment from Firestore
  const handleDeleteComment = async (commentId: string) => {
    if (userRole !== 'admin') {
      console.warn('Delete comment blocked: Only administrators can delete comments.');
      return;
    }
    try {
      setComments(prev => prev.filter(c => c.id !== commentId));
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'comments');
    }
  };

  // Initialize, check connection, and sync DB integrity across all collections
  useEffect(() => {
    testConnection();

    const syncDbIntegrity = async () => {
      try {
        console.log('Verifying and migrating Firestore database structure...');

        // 1. Clean up legacy singular `program` collection document (`program/info`)
        try {
          const oldProgramSnap = await getDoc(doc(db, 'program', 'info'));
          if (oldProgramSnap.exists()) {
            await deleteDoc(doc(db, 'program', 'info'));
            console.log('Successfully deleted legacy program/info document.');
          }
        } catch (e) {
          // non-fatal
        }

        // 2. Ensure `programs` collection contains `mba` and `bcom`
        for (const prog of INITIAL_PROGRAMS) {
          const progSnap = await getDoc(doc(db, 'programs', prog.id));
          if (!progSnap.exists()) {
            await setDoc(doc(db, 'programs', prog.id), cleanUndefined(prog));
          } else if (prog.id === 'mba') {
            const pData = progSnap.data();
            const updates: Record<string, any> = {};
            if (pData.termLabel === 'Tier') updates.termLabel = 'Term';
            if (!pData.accreditation || String(pData.accreditation).includes('NCMA')) {
              updates.accreditation = 'ACBSP Accredited';
            }
            if (pData.description && String(pData.description).includes('NCMA')) {
              updates.description = prog.description;
            }
            if (Object.keys(updates).length > 0) {
              await setDoc(doc(db, 'programs', 'mba'), updates, { merge: true });
            }
          } else if (prog.id === 'bcom') {
            const pData = progSnap.data();
            if (!pData.description || pData.description.includes('Master of Business Administration') || pData.description.includes('MBA')) {
              await setDoc(doc(db, 'programs', 'bcom'), cleanUndefined(prog), { merge: true });
            }
          }
        }

        // 3. Migrate `settings` collection: convert `general` to `mba_general`, ensure `bcom_general`
        try {
          const mbaGenSnap = await getDoc(doc(db, 'settings', 'mba_general'));
          const oldGenSnap = await getDoc(doc(db, 'settings', 'general'));
          if (!mbaGenSnap.exists()) {
            const dataToUse = oldGenSnap.exists() 
              ? { ...oldGenSnap.data(), id: 'mba_general', programId: 'mba' }
              : { ...DEFAULT_SETTINGS, id: 'mba_general', programId: 'mba' };
            await setDoc(doc(db, 'settings', 'mba_general'), cleanUndefined(dataToUse));
          }
          if (oldGenSnap.exists()) {
            await deleteDoc(doc(db, 'settings', 'general'));
            console.log('Deleted legacy settings/general document after migrating to settings/mba_general.');
          }
          const bcomGenSnap = await getDoc(doc(db, 'settings', 'bcom_general'));
          if (!bcomGenSnap.exists()) {
            await setDoc(doc(db, 'settings', 'bcom_general'), cleanUndefined({
              ...DEFAULT_PROGRAM_SETTINGS['bcom'],
              id: 'bcom_general',
              programId: 'bcom'
            }));
          }
        } catch (e) {
          console.warn('Settings migration notice:', e);
        }

        // 4. Mappings Collection: ensure `mba` & `bcom` exist, and REMOVE legacy `active` document
        try {
          const activeMapSnap = await getDoc(doc(db, 'mappings', 'active'));
          if (activeMapSnap.exists()) {
            await deleteDoc(doc(db, 'mappings', 'active'));
            console.log('Deleted legacy mappings/active document.');
          }

          const bcomMappingSnap = await getDoc(doc(db, 'mappings', 'bcom'));
          if (!bcomMappingSnap.exists()) {
            await setDoc(doc(db, 'mappings', 'bcom'), cleanUndefined({ id: 'bcom', mappings: INITIAL_BCOM_MAPPINGS, programId: 'bcom' }));
          }
          const mbaMappingSnap = await getDoc(doc(db, 'mappings', 'mba'));
          if (!mbaMappingSnap.exists()) {
            await setDoc(doc(db, 'mappings', 'mba'), cleanUndefined({ id: 'mba', mappings: INITIAL_MAPPINGS, programId: 'mba' }));
          }
        } catch (e) {
          console.warn('Mappings migration notice:', e);
        }

        // 5. PLOs Collection: remove un-namespaced duplicates (e.g., PLO1..PLO9) and seed clean mba_PLO1..9 & bcom_PLO1..6
        try {
          const allPlosSnap = await getDocs(collection(db, 'plos'));
          allPlosSnap.forEach(async (docSnap) => {
            const docId = docSnap.id;
            // Delete any un-namespaced PLO document (e.g. PLO1, PLO2... PLO9) or invalid lowercase versions
            if (!docId.startsWith('mba_') && !docId.startsWith('bcom_')) {
              await deleteDoc(doc(db, 'plos', docId));
              console.log(`Deleted legacy un-namespaced document plos/${docId}`);
            }
          });

          // Seed MBA PLOs (mba_PLO1..mba_PLO9)
          const existingPlosMap = new Map<string, any>();
          allPlosSnap.forEach((d) => existingPlosMap.set(d.id, d.data()));

          const syncedMbaPlos: PLO[] = [];
          for (const plo of INITIAL_PLOS) {
            const docId = `mba_${plo.id}`;
            const mergedPlo: PLO = {
              ...plo,
              id: plo.id,
              programId: 'mba'
            };
            await setDoc(doc(db, 'plos', docId), cleanUndefined(mergedPlo));
            syncedMbaPlos.push(mergedPlo);
          }

          // Seed BCom PLOs (bcom_PLO1..bcom_PLO6) if missing
          for (const plo of INITIAL_BCOM_PLOS) {
            const docId = `bcom_${plo.id}`;
            if (!existingPlosMap.has(docId)) {
              await setDoc(doc(db, 'plos', docId), cleanUndefined({ ...plo, id: plo.id, programId: 'bcom' }));
            }
          }

          // Seed/update the "July 2026" FeedbackRound in `feedback_rounds` linked to the uploaded 9 MBA PLOs
          const julyRoundSnap = await getDoc(doc(db, 'feedback_rounds', 'mba_round_july_2026'));
          const julyRoundDoc: FeedbackRound = {
            id: 'mba_round_july_2026',
            programId: 'mba',
            name: 'July 2026',
            status: julyRoundSnap.exists() ? (julyRoundSnap.data().status || 'archived') : 'archived',
            createdAt: julyRoundSnap.exists() ? (julyRoundSnap.data().createdAt || '2026-07-22T00:00:00.000Z') : '2026-07-22T00:00:00.000Z',
            archivedAt: julyRoundSnap.exists() ? (julyRoundSnap.data().archivedAt || '2026-07-23T00:00:00.000Z') : '2026-07-23T00:00:00.000Z',
            plosSnapshot: syncedMbaPlos
          };
          await setDoc(doc(db, 'feedback_rounds', 'mba_round_july_2026'), cleanUndefined(julyRoundDoc));
        } catch (e) {
          console.warn('PLOs & feedback_rounds migration notice:', e);
        }

        // 6. Comments Collection: namespace all comment doc IDs with program prefix (mba_ or bcom_) and link existing MBA comments to "July 2026"
        const mbaDbComments: FacultyComment[] = [];
        const bcomDbComments: FacultyComment[] = [];
        try {
          const commentsSnap = await getDocs(collection(db, 'comments'));
          if (commentsSnap.empty) {
            for (const comment of INITIAL_COMMENTS) {
              const docId = comment.id.startsWith('mba_') ? comment.id : `mba_${comment.id}`;
              const seeded: FacultyComment = {
                ...comment,
                id: docId,
                programId: 'mba',
                roundId: comment.roundId || 'mba_round_july_2026',
                roundName: comment.roundName || 'July 2026'
              };
              await setDoc(doc(db, 'comments', docId), cleanUndefined(seeded));
              mbaDbComments.push(seeded);
            }
          } else {
            const hasRealComments = commentsSnap.size > 2;
            for (const docSnap of commentsSnap.docs) {
              const docId = docSnap.id;
              if (hasRealComments && (docId === 'mba_comment_1' || docId === 'mba_comment_2')) {
                await deleteDoc(doc(db, 'comments', docId));
                continue;
              }
              const data = docSnap.data() as FacultyComment;
              const progId = (data.programId === 'bcom' || docId.startsWith('bcom_')) ? 'bcom' : 'mba';
              const defaultRoundId = progId === 'mba' ? (data.roundId || 'mba_round_july_2026') : (data.roundId || '');
              const defaultRoundName = progId === 'mba' ? (data.roundName || 'July 2026') : (data.roundName || '');

              if (!docId.startsWith('mba_') && !docId.startsWith('bcom_')) {
                const newDocId = `${progId}_${docId}`;
                const migrated: FacultyComment = {
                  ...data,
                  id: newDocId,
                  programId: progId,
                  roundId: defaultRoundId,
                  roundName: defaultRoundName
                };
                await setDoc(doc(db, 'comments', newDocId), cleanUndefined(migrated));
                await deleteDoc(doc(db, 'comments', docId));
                if (progId === 'bcom') {
                  bcomDbComments.push(migrated);
                } else {
                  mbaDbComments.push(migrated);
                }
              } else {
                const normalized: FacultyComment = {
                  ...data,
                  id: data.id || docId,
                  programId: progId,
                  roundId: defaultRoundId,
                  roundName: defaultRoundName
                };
                if (
                  data.programId !== progId ||
                  data.id !== docId ||
                  data.roundId !== defaultRoundId ||
                  data.roundName !== defaultRoundName
                ) {
                  await setDoc(doc(db, 'comments', docId), cleanUndefined(normalized));
                }
                if (progId === 'bcom') {
                  bcomDbComments.push(normalized);
                } else {
                  mbaDbComments.push(normalized);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Comments migration notice:', e);
        }

        // 7. Migrate `courses` collection
        try {
          const bcomCourseSnap = await getDoc(doc(db, 'courses', 'bcom_ACCT101'));
          if (!bcomCourseSnap.exists()) {
            for (const course of INITIAL_BCOM_COURSES) {
              const docId = `bcom_${course.id}`;
              await setDoc(doc(db, 'courses', docId), cleanUndefined({ ...course, id: course.id, programId: 'bcom' }));
            }
          }
          const mbaCourseSnap = await getDoc(doc(db, 'courses', 'mba_BUSI601'));
          if (!mbaCourseSnap.exists()) {
            for (const course of INITIAL_COURSES) {
              const docId = `mba_${course.id}`;
              await setDoc(doc(db, 'courses', docId), cleanUndefined({ ...course, id: course.id, programId: 'mba' }));
            }
          }
          // Clean up legacy un-namespaced course documents if present
          for (const course of INITIAL_COURSES) {
            const legacyCourseSnap = await getDoc(doc(db, 'courses', course.id));
            if (legacyCourseSnap.exists()) {
              await deleteDoc(doc(db, 'courses', course.id));
            }
          }
        } catch (e) {
          console.warn('Courses migration notice:', e);
        }

        // 8. Migrate `assignments` collection
        try {
          const bcomAssigSnap = await getDoc(doc(db, 'assignments', 'bcom_ACCT101'));
          if (!bcomAssigSnap.exists()) {
            for (const [cId, items] of Object.entries(INITIAL_BCOM_ASSIGNMENTS)) {
              await setDoc(doc(db, 'assignments', `bcom_${cId}`), cleanUndefined({ courseId: cId, items, programId: 'bcom' }));
            }
          }
          const mbaAssigSnap = await getDoc(doc(db, 'assignments', 'mba_BUSI601'));
          if (!mbaAssigSnap.exists()) {
            for (const [cId, items] of Object.entries(INITIAL_ASSIGNMENTS)) {
              await setDoc(doc(db, 'assignments', `mba_${cId}`), cleanUndefined({ courseId: cId, items, programId: 'mba' }));
            }
          }
          for (const cId of Object.keys(INITIAL_ASSIGNMENTS)) {
            const legacyAssigSnap = await getDoc(doc(db, 'assignments', cId));
            if (legacyAssigSnap.exists()) {
              await deleteDoc(doc(db, 'assignments', cId));
            }
          }
        } catch (e) {
          console.warn('Assignments migration notice:', e);
        }

        // 9. Migrate `students` collection
        try {
          const bcomStudentSnap = await getDoc(doc(db, 'students', 'bcom_1'));
          if (!bcomStudentSnap.exists()) {
            for (const student of INITIAL_BCOM_STUDENTS) {
              await setDoc(doc(db, 'students', `bcom_${student.id}`), cleanUndefined({ ...student, id: student.id, programId: 'bcom' }));
            }
          }
          const mbaStudentSnap = await getDoc(doc(db, 'students', 'mba_1'));
          if (!mbaStudentSnap.exists()) {
            for (const student of INITIAL_STUDENTS) {
              await setDoc(doc(db, 'students', `mba_${student.id}`), cleanUndefined({ ...student, id: student.id, programId: 'mba' }));
            }
          }
          for (const student of INITIAL_STUDENTS) {
            const legacyStudSnap = await getDoc(doc(db, 'students', student.id));
            if (legacyStudSnap.exists()) {
              await deleteDoc(doc(db, 'students', student.id));
            }
          }
        } catch (e) {
          console.warn('Students migration notice:', e);
        }

        // 10. `backups` Collection: create/update baseline database backups and repair any MBA backups that have 0 comments
        try {
          const backupsSnap = await getDocs(collection(db, 'backups'));
          const existingBackupsMap = new Map<string, any>();
          backupsSnap.forEach((bDoc) => {
            existingBackupsMap.set(bDoc.id, bDoc.data());
          });

          const existingMbaInitial = existingBackupsMap.get('mba_backup_initial');
          const mbaDimensionsTotal = INITIAL_PLOS.reduce((acc, p) => acc + (p.dimensions?.length || 0), 0);
          if (
            !existingMbaInitial ||
            (existingMbaInitial.counts?.comments ?? -1) !== mbaDbComments.length ||
            (existingMbaInitial.counts?.dimensions ?? -1) !== mbaDimensionsTotal ||
            !Array.isArray(existingMbaInitial.payload?.comments) ||
            existingMbaInitial.payload.comments.length !== mbaDbComments.length
          ) {
            const mbaBackupDoc = {
              id: 'mba_backup_initial',
              programId: 'mba',
              programCode: 'MBA',
              programName: 'Master of Business Administration (MBA)',
              createdAt: existingMbaInitial?.createdAt || new Date().toISOString(),
              label: existingMbaInitial?.label || 'Baseline System Backup (MBA)',
              counts: {
                plos: INITIAL_PLOS.length,
                dimensions: mbaDimensionsTotal,
                courses: INITIAL_COURSES.length,
                mappings: Object.keys(INITIAL_MAPPINGS).length,
                assessments: Object.values(INITIAL_ASSIGNMENTS).reduce((acc, l) => acc + (l?.length || 0), 0),
                students: INITIAL_STUDENTS.length,
                comments: mbaDbComments.length
              },
              payload: {
                ...(existingMbaInitial?.payload || {}),
                program: INITIAL_PROGRAMS[0],
                settings: DEFAULT_SETTINGS,
                plos: INITIAL_PLOS,
                courses: INITIAL_COURSES,
                mappings: INITIAL_MAPPINGS,
                assignments: INITIAL_ASSIGNMENTS,
                students: INITIAL_STUDENTS,
                comments: mbaDbComments,
                feedbackRounds: INITIAL_FEEDBACK_ROUNDS
              }
            };
            await setDoc(doc(db, 'backups', 'mba_backup_initial'), cleanUndefined(mbaBackupDoc));
            console.log(`Synced backups/mba_backup_initial with ${INITIAL_PLOS.length} PLOs (${mbaDimensionsTotal} dims) and ${mbaDbComments.length} MBA comments.`);
          }

          const existingBcomInitial = existingBackupsMap.get('bcom_backup_initial');
          if (
            !existingBcomInitial ||
            (existingBcomInitial.counts?.comments ?? -1) !== bcomDbComments.length
          ) {
            const bcomBackupDoc = {
              id: 'bcom_backup_initial',
              programId: 'bcom',
              programCode: 'BCom',
              programName: 'Bachelor of Commerce (BCom)',
              createdAt: existingBcomInitial?.createdAt || new Date().toISOString(),
              label: existingBcomInitial?.label || 'Baseline System Backup (BCom)',
              counts: {
                plos: INITIAL_BCOM_PLOS.length,
                dimensions: INITIAL_BCOM_PLOS.reduce((acc, p) => acc + (p.dimensions?.length || 0), 0),
                courses: INITIAL_BCOM_COURSES.length,
                mappings: Object.keys(INITIAL_BCOM_MAPPINGS).length,
                assessments: Object.values(INITIAL_BCOM_ASSIGNMENTS).reduce((acc, l) => acc + (l?.length || 0), 0),
                students: INITIAL_BCOM_STUDENTS.length,
                comments: bcomDbComments.length
              },
              payload: {
                ...(existingBcomInitial?.payload || {}),
                program: INITIAL_PROGRAMS[1],
                settings: DEFAULT_PROGRAM_SETTINGS['bcom'],
                plos: INITIAL_BCOM_PLOS,
                courses: INITIAL_BCOM_COURSES,
                mappings: INITIAL_BCOM_MAPPINGS,
                assignments: INITIAL_BCOM_ASSIGNMENTS,
                students: INITIAL_BCOM_STUDENTS,
                comments: bcomDbComments
              }
            };
            await setDoc(doc(db, 'backups', 'bcom_backup_initial'), cleanUndefined(bcomBackupDoc));
          }

          // Repair any other existing MBA backup in `backups` collection that had 0 comments recorded
          for (const [bDocId, bData] of existingBackupsMap.entries()) {
            if (bDocId === 'mba_backup_initial' || bDocId === 'bcom_backup_initial') continue;
            const isMba = bData.programId === 'mba' || bDocId.startsWith('mba_');
            if (isMba && mbaDbComments.length > 0) {
              const recordedComments = bData.counts?.comments ?? 0;
              const payloadCommentsLen = Array.isArray(bData.payload?.comments) ? bData.payload.comments.length : 0;
              if (recordedComments === 0 || payloadCommentsLen === 0) {
                const updatedBackup = {
                  ...bData,
                  id: bDocId,
                  programId: 'mba',
                  counts: {
                    ...(bData.counts || {}),
                    comments: mbaDbComments.length
                  },
                  payload: {
                    ...(bData.payload || {}),
                    comments: mbaDbComments
                  }
                };
                await setDoc(doc(db, 'backups', bDocId), cleanUndefined(updatedBackup));
                console.log(`Repaired MBA backup ${bDocId} with ${mbaDbComments.length} comments.`);
              }
            }
          }
        } catch (e) {
          console.warn('Backups collection creation/update notice:', e);
        }

        console.log('Firestore database structure migration & synchronization complete.');
      } catch (err) {
        console.warn('Silent DB integrity sync notice:', err);
      }
    };

    syncDbIntegrity();
    
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const isAnonymous = user.isAnonymous;
        const storedRole = localStorage.getItem('user_role');
        
        if (!isAnonymous) {
          // Google provider auth -> promote to admin
          setUserRole('admin');
          localStorage.setItem('user_role', 'admin');
        } else if (storedRole === 'admin') {
          setUserRole('admin');
        } else if (storedRole === 'faculty_guest') {
          setUserRole('faculty_guest');
        }
      } else {
        const storedRole = localStorage.getItem('user_role');
        if (storedRole === 'admin') {
          signInAnonymously(auth).catch(e => console.warn('Silent auto-auth fallback failed:', e));
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);



  // Real-time Database Subscriptions with Resilient Local Fallbacks
  useEffect(() => {
    setIsLoading(true);

    // 0. Academic Programs (programs collection)
    const unsubPrograms = onSnapshot(collection(db, 'programs'), (querySnap) => {
      const progList: AcademicProgram[] = [];
      querySnap.forEach((doc) => {
        progList.push({ id: doc.id, ...doc.data() } as AcademicProgram);
      });
      if (progList.length > 0) {
        const merged = [...progList];
        INITIAL_PROGRAMS.forEach(initP => {
          if (!merged.some(p => p.id === initP.id)) {
            merged.push(initP);
          }
        });
        setPrograms(merged);
      } else {
        setPrograms(INITIAL_PROGRAMS);
      }
    }, (error) => {
      console.warn('Firestore programs subscription warning (falling back to memory defaults):', error);
      setPrograms(INITIAL_PROGRAMS);
    });

    // 1. Settings (Subscribe to all program settings: mba_general, bcom_general, etc.)
    const unsubSettings = onSnapshot(collection(db, 'settings'), (querySnap) => {
      const mapObj: { [key: string]: Setting } = {};
      querySnap.forEach((docSnap) => {
        mapObj[docSnap.id] = docSnap.data() as Setting;
      });
      setAllSettings(mapObj);
      if (mapObj['mba_general']) {
        setSettings(mapObj['mba_general']);
      } else if (mapObj['general']) {
        setSettings(mapObj['general']);
      }
    }, (error) => {
      console.warn('Firestore settings subscription warning:', error);
    });

    // 2. Mappings (Subscribe to all mapping documents: mba, bcom, etc.)
    const unsubMappings = onSnapshot(collection(db, 'mappings'), (querySnap) => {
      const mapObj: { [key: string]: any } = {};
      querySnap.forEach((doc) => {
        mapObj[doc.id] = (doc.data() as any).mappings || {};
      });
      if (Object.keys(mapObj).length > 0) {
        setMappings(mapObj);
      } else {
        setMappings({ 
          active: INITIAL_MAPPINGS, 
          mba: INITIAL_MAPPINGS, 
          bcom: INITIAL_BCOM_MAPPINGS 
        });
      }
    }, (error) => {
      console.warn('Firestore mappings subscription warning (falling back to memory defaults):', error);
      setMappings({ 
        active: INITIAL_MAPPINGS, 
        mba: INITIAL_MAPPINGS, 
        bcom: INITIAL_BCOM_MAPPINGS 
      });
    });

    // 3. PLOs (Subscribe to plos collection across all programs)
    const unsubPlos = onSnapshot(collection(db, 'plos'), (querySnap) => {
      const plosList: PLO[] = [];
      querySnap.forEach((doc) => {
        plosList.push(doc.data() as PLO);
      });
      
      if (plosList.length > 0) {
        setPlos(plosList);
        setIsDbEmptyInFirestore(false);
      } else {
        setPlos([...INITIAL_PLOS, ...INITIAL_BCOM_PLOS]);
        setIsDbEmptyInFirestore(true);
      }
    }, (error) => {
      console.warn('Firestore PLOs subscription warning (falling back to memory defaults):', error);
      setPlos([...INITIAL_PLOS, ...INITIAL_BCOM_PLOS]);
    });

    // 4. Courses
    const unsubCourses = onSnapshot(collection(db, 'courses'), (querySnap) => {
      const coursesList: Course[] = [];
      querySnap.forEach((doc) => {
        coursesList.push(doc.data() as Course);
      });
      if (coursesList.length > 0) {
        setCourses(coursesList);
      } else {
        setCourses([...INITIAL_COURSES, ...INITIAL_BCOM_COURSES]);
      }
    }, (error) => {
      console.warn('Firestore courses subscription warning (falling back to memory defaults):', error);
      setCourses([...INITIAL_COURSES, ...INITIAL_BCOM_COURSES]);
    });

    // 5. Assignments
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (querySnap) => {
      const assigMap: { [courseId: string]: Assignment[] } = {};
      querySnap.forEach((doc) => {
        assigMap[doc.id] = (doc.data() as any).items || [];
      });
      if (Object.keys(assigMap).length > 0) {
        setAssignments(assigMap);
      } else {
        setAssignments({ ...INITIAL_ASSIGNMENTS, ...INITIAL_BCOM_ASSIGNMENTS });
      }
    }, (error) => {
      console.warn('Firestore assignments subscription warning (falling back to memory defaults):', error);
      setAssignments({ ...INITIAL_ASSIGNMENTS, ...INITIAL_BCOM_ASSIGNMENTS });
    });

    // 6. Students
    let unsubStudents = () => {};
    if (currentUser) {
      unsubStudents = onSnapshot(collection(db, 'students'), (querySnap) => {
        const studentList: Student[] = [];
        querySnap.forEach((doc) => {
          studentList.push(doc.data() as Student);
        });
        if (studentList.length > 0) {
          setStudents(studentList);
        } else {
          setStudents([...INITIAL_STUDENTS, ...INITIAL_BCOM_STUDENTS]);
        }
      }, (error) => {
        console.warn('Students subscription error (expected if non-admin):', error);
        setStudents([...INITIAL_STUDENTS, ...INITIAL_BCOM_STUDENTS]);
      });
    } else {
      setStudents([...INITIAL_STUDENTS, ...INITIAL_BCOM_STUDENTS]);
    }

    // 7. Comments
    const unsubComments = onSnapshot(collection(db, 'comments'), (querySnap) => {
      const commentsList: FacultyComment[] = [];
      const hasRealComments = querySnap.size > 2;
      querySnap.forEach((docSnap) => {
        const docId = docSnap.id;
        if (hasRealComments && (docId === 'mba_comment_1' || docId === 'mba_comment_2')) {
          return;
        }
        const data = docSnap.data() as FacultyComment;
        const cId = data.id || docId;
        const cProgId = data.programId || (typeof cId === 'string' && cId.startsWith('bcom_') ? 'bcom' : 'mba');
        commentsList.push({
          ...data,
          id: cId,
          programId: cProgId
        });
      });
      setComments(commentsList);

      // Automatically sync MBA comments into any MBA backup in `backups` collection that currently has 0 comments
      const mbaList = commentsList.filter(c => c.programId === 'mba');
      if (mbaList.length > 0) {
        getDocs(collection(db, 'backups')).then((bSnap) => {
          bSnap.forEach((bDoc) => {
            const bData = bDoc.data();
            const isMba = bData.programId === 'mba' || bDoc.id.startsWith('mba_');
            const currentCount = bData.counts?.comments ?? 0;
            const currentPayloadLen = Array.isArray(bData.payload?.comments) ? bData.payload.comments.length : 0;
            if (isMba && (currentCount === 0 || currentPayloadLen === 0 || (bDoc.id === 'mba_backup_initial' && currentCount !== mbaList.length))) {
              const updatedBackup = {
                ...bData,
                id: bDoc.id,
                programId: 'mba',
                counts: {
                  ...(bData.counts || {}),
                  comments: mbaList.length
                },
                payload: {
                  ...(bData.payload || {}),
                  comments: mbaList
                }
              };
              setDoc(doc(db, 'backups', bDoc.id), cleanUndefined(updatedBackup)).catch(() => {});
            }
          });
        }).catch(() => {});
      }
    }, (error) => {
      console.warn('Firestore comments subscription warning:', error);
    });

    // 8. Feedback Rounds (Comment Rounds & Frozen PLO Snapshots)
    const unsubFeedbackRounds = onSnapshot(collection(db, 'feedback_rounds'), (querySnap) => {
      const roundsList: FeedbackRound[] = [];
      querySnap.forEach((docSnap) => {
        roundsList.push({ id: docSnap.id, ...(docSnap.data() as FeedbackRound) });
      });
      if (roundsList.length > 0) {
        const merged = [...roundsList];
        INITIAL_FEEDBACK_ROUNDS.forEach(initR => {
          if (!merged.some(r => r.id === initR.id)) {
            merged.push(initR);
          }
        });
        setFeedbackRounds(merged);
      } else {
        setFeedbackRounds(INITIAL_FEEDBACK_ROUNDS);
      }
    }, (error) => {
      console.warn('Firestore feedback_rounds subscription warning:', error);
      setFeedbackRounds(INITIAL_FEEDBACK_ROUNDS);
    });

    setIsLoading(false);

    return () => {
      unsubPrograms();
      unsubSettings();
      unsubMappings();
      unsubPlos();
      unsubCourses();
      unsubAssignments();
      unsubStudents();
      unsubComments();
      unsubFeedbackRounds();
    };
  }, [currentUser]);

  // Seeding trigger for all academic programs (MBA and BCom)
  const triggerDbSeed = async () => {
    setIsSeeding(true);
    console.log('Starting Firestore database seeding for ALL UCW Academic Programs (MBA + BCom)...');
    try {
      let authUser = auth.currentUser;
      if (!authUser) {
        try {
          authUser = (await signInAnonymously(auth)).user;
        } catch (authErr: any) {
          console.warn('Silent notice: Anonymous sign-in was restricted or blocked.', authErr);
          throw authErr;
        }
      }

      // 1. Seed Programs (MBA and BCom) in `programs` collection
      for (const prog of INITIAL_PROGRAMS) {
        await setDoc(doc(db, 'programs', prog.id), cleanUndefined(prog));
      }

      // Clean up legacy singular `program/info` document if present
      try {
        await deleteDoc(doc(db, 'program', 'info'));
      } catch (e) {
        // ignore
      }

      // 2. Seed Settings (`mba_general` and `bcom_general`) in `settings` collection
      await setDoc(doc(db, 'settings', 'mba_general'), cleanUndefined({
        ...DEFAULT_SETTINGS,
        id: 'mba_general',
        programId: 'mba'
      }));
      await setDoc(doc(db, 'settings', 'bcom_general'), cleanUndefined({
        ...DEFAULT_PROGRAM_SETTINGS['bcom'],
        id: 'bcom_general',
        programId: 'bcom'
      }));

      // 3. Seed Mappings (`mba`, `bcom`, and `active`) in `mappings` collection
      await setDoc(doc(db, 'mappings', 'mba'), cleanUndefined({ id: 'mba', mappings: INITIAL_MAPPINGS, programId: 'mba' }));
      await setDoc(doc(db, 'mappings', 'active'), cleanUndefined({ id: 'active', mappings: INITIAL_MAPPINGS, programId: 'mba' }));
      await setDoc(doc(db, 'mappings', 'bcom'), cleanUndefined({ id: 'bcom', mappings: INITIAL_BCOM_MAPPINGS, programId: 'bcom' }));

      // 4. Seed MBA PLOs
      for (const plo of INITIAL_PLOS) {
        const docId = plo.id.startsWith('mba_') ? plo.id : `mba_${plo.id}`;
        await setDoc(doc(db, 'plos', docId), cleanUndefined({ ...plo, id: docId, programId: 'mba' }));
      }

      // 5. Seed BCom PLOs (ALL 6 BCom PLOs with complete dimensions and rubrics)
      for (const plo of INITIAL_BCOM_PLOS) {
        const docId = plo.id.startsWith('bcom_') ? plo.id : `bcom_${plo.id}`;
        await setDoc(doc(db, 'plos', docId), cleanUndefined({ ...plo, id: docId, programId: 'bcom' }));
      }

      // 6. Seed Courses (MBA & BCom)
      for (const course of INITIAL_COURSES) {
        const docId = course.id.startsWith('mba_') ? course.id : `mba_${course.id}`;
        await setDoc(doc(db, 'courses', docId), cleanUndefined({ ...course, id: docId, programId: 'mba' }));
      }
      for (const course of INITIAL_BCOM_COURSES) {
        const docId = course.id.startsWith('bcom_') ? course.id : `bcom_${course.id}`;
        await setDoc(doc(db, 'courses', docId), cleanUndefined({ ...course, id: docId, programId: 'bcom' }));
      }

      // 7. Seed Assignments (MBA & BCom)
      for (const [cId, items] of Object.entries(INITIAL_ASSIGNMENTS)) {
        await setDoc(doc(db, 'assignments', `mba_${cId}`), cleanUndefined({ courseId: cId, items, programId: 'mba' }));
      }
      for (const [cId, items] of Object.entries(INITIAL_BCOM_ASSIGNMENTS)) {
        await setDoc(doc(db, 'assignments', `bcom_${cId}`), cleanUndefined({ courseId: cId, items, programId: 'bcom' }));
      }

      // 8. Seed Students (MBA & BCom)
      for (const student of INITIAL_STUDENTS) {
        await setDoc(doc(db, 'students', `mba_${student.id}`), cleanUndefined({ ...student, id: `mba_${student.id}`, programId: 'mba' }));
      }
      for (const student of INITIAL_BCOM_STUDENTS) {
        await setDoc(doc(db, 'students', `bcom_${student.id}`), cleanUndefined({ ...student, id: `bcom_${student.id}`, programId: 'bcom' }));
      }

      // 9. Seed Comments (MBA)
      for (const comment of INITIAL_COMMENTS) {
        const docId = comment.id.startsWith('mba_') ? comment.id : `mba_${comment.id}`;
        await setDoc(doc(db, 'comments', docId), cleanUndefined({ ...comment, id: docId, programId: 'mba' }));
      }

      console.log('Firestore multi-program database seed completed successfully for MBA and BCom.');
    } catch (e: any) {
      if (e?.code === 'auth/admin-restricted-operation' || e?.message?.includes('admin-restricted-operation')) {
        console.warn('Seeding skipped gracefully: Anonymous authentication is restricted in this Firebase project. The application remains fully operational with initial local data defaults.');
      } else {
        console.warn('Seeding skipped or encountered a non-fatal issue:', e);
      }
    } finally {
      setIsSeeding(false);
    }
  };

  // Program Management Handlers
  const handleCreateProgram = async (
    newProgram: AcademicProgram,
    templateChoice: 'blank' | 'bcom_template' | 'mba_template'
  ) => {
    try {
      await setDoc(doc(db, 'programs', newProgram.id), newProgram);
      setPrograms(prev => [...prev.filter(p => p.id !== newProgram.id), newProgram]);

      if (templateChoice === 'bcom_template') {
        const bcomPlos = INITIAL_BCOM_PLOS.map(p => ({ 
          ...p, 
          id: `${newProgram.id}_${p.id}`, 
          programId: newProgram.id 
        }));
        for (const p of bcomPlos) {
          await setDoc(doc(db, 'plos', p.id), p);
        }
        setPlos(prev => [...prev, ...bcomPlos]);

        const bcomCourses = INITIAL_BCOM_COURSES.map(c => ({ 
          ...c, 
          id: `${newProgram.id}_${c.id}`, 
          programId: newProgram.id 
        }));
        for (const c of bcomCourses) {
          await setDoc(doc(db, 'courses', c.id), c);
        }
        setCourses(prev => [...prev, ...bcomCourses]);

        await setDoc(doc(db, 'mappings', newProgram.id), { 
          id: newProgram.id, 
          mappings: INITIAL_BCOM_MAPPINGS,
          programId: newProgram.id 
        });
        setMappings(prev => ({ ...prev, [newProgram.id]: INITIAL_BCOM_MAPPINGS }));
      } else if (templateChoice === 'mba_template') {
        const clonedPlos = INITIAL_PLOS.map(p => ({ 
          ...p, 
          id: `${newProgram.id}_${p.id}`, 
          programId: newProgram.id 
        }));
        for (const p of clonedPlos) {
          await setDoc(doc(db, 'plos', p.id), p);
        }
        setPlos(prev => [...prev, ...clonedPlos]);

        const clonedCourses = INITIAL_COURSES.map(c => ({ 
          ...c, 
          id: `${newProgram.id}_${c.id}`, 
          programId: newProgram.id 
        }));
        for (const c of clonedCourses) {
          await setDoc(doc(db, 'courses', c.id), c);
        }
        setCourses(prev => [...prev, ...clonedCourses]);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `programs/${newProgram.id}`);
    }
  };

  const handleUpdateProgram = async (updatedProgram: AcademicProgram) => {
    try {
      await setDoc(doc(db, 'programs', updatedProgram.id), updatedProgram);
      if (updatedProgram.id === 'mba') {
        await setDoc(doc(db, 'program', 'info'), {
          name: updatedProgram.name,
          description: updatedProgram.description,
          objectives: updatedProgram.objectives
        });
      }
      setPrograms(prev => prev.map(p => p.id === updatedProgram.id ? updatedProgram : p));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `programs/${updatedProgram.id}`);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (programId === 'mba') return;
    try {
      await deleteDoc(doc(db, 'programs', programId));
      setPrograms(prev => prev.filter(p => p.id !== programId));
      if (selectedProgramId === programId) {
        setSelectedProgramId('mba');
        localStorage.setItem('selected_program_id', 'mba');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `programs/${programId}`);
    }
  };

  // Auth Operations
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.warn('signInWithPopup blocked or failed. Attempting anonymous sandbox auth fallback...');
      await signInAnonymously(auth);
    }
  };

  const handleSandboxSignIn = async () => {
    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      console.error('Anonymous auth failed:', e);
      if (e.code === 'auth/admin-restricted-operation' || e.message?.includes('admin-restricted-operation')) {
        setAuthError(
          "Anonymous Authentication is disabled in your Firebase Console. To enable Sandbox Mode: (1) Go to your Firebase Console, (2) Navigate to Build -> Authentication -> Sign-in method, (3) Enable the 'Anonymous' provider. Alternatively, please use standard 'Sign In' via Google."
        );
      } else {
        setAuthError(e.message || String(e));
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUserRole(null);
    localStorage.removeItem('user_role');
    localStorage.removeItem('is_sandbox_mode');
    setIsSandboxMode(false);
    sessionStorage.removeItem('voter_id');
  };

  const handleExitGuestSession = () => {
    setUserRole(null);
    localStorage.removeItem('user_role');
    localStorage.removeItem('is_sandbox_mode');
    setIsSandboxMode(false);
    sessionStorage.removeItem('voter_id');
  };

  // Firestore update wrappers with standardized custom error handlers
  const handleUpdateProgramInfo = async (info: { description: string; objectives: string; name: string }) => {
    const updated = {
      ...currentProgram,
      ...info
    };
    try {
      await setDoc(doc(db, 'programs', currentProgram.id), updated);
      if (currentProgram.id === 'mba') {
        await setDoc(doc(db, 'program', 'info'), info);
      }
      setPrograms(prev => prev.map(p => p.id === currentProgram.id ? updated : p));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `programs/${currentProgram.id}`);
    }
  };

  const handleUpdatePlos = async (updatedPlos: PLO[]) => {
    try {
      const progId = currentProgram.id;
      const existingProgramPlos = plos.filter(p => (p.programId || 'mba') === progId);
      const existingIds = existingProgramPlos.map(p => p.id);
      const updatedIds = updatedPlos.map(p => p.id);
      const deletedIds = existingIds.filter(id => !updatedIds.includes(id));

      for (const id of deletedIds) {
        const docId = id.startsWith(`${progId}_`) ? id : `${progId}_${id}`;
        await deleteDoc(doc(db, 'plos', docId));
      }

      for (const plo of updatedPlos) {
        const docId = plo.id.startsWith(`${progId}_`) ? plo.id : `${progId}_${plo.id}`;
        const withProg = { ...plo, programId: progId };
        const cleaned = cleanUndefined(withProg);
        await setDoc(doc(db, 'plos', docId), cleaned);
      }
      setPlos(prev => {
        const others = prev.filter(p => (p.programId || 'mba') !== progId);
        return [...others, ...updatedPlos.map(p => ({ ...p, programId: progId }))];
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'plos');
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    const progId = updatedCourse.programId || currentProgram.id;
    const courseWithProg = {
      ...updatedCourse,
      programId: progId
    };
    const docId = courseWithProg.id.startsWith(`${progId}_`) ? courseWithProg.id : `${progId}_${courseWithProg.id}`;
    const path = `courses/${docId}`;
    try {
      await setDoc(doc(db, 'courses', docId), cleanUndefined(courseWithProg));
      setCourses(prev => {
        const idx = prev.findIndex(c => c.id === courseWithProg.id && (c.programId || 'mba') === progId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = courseWithProg;
          return next;
        }
        return [...prev, courseWithProg];
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdateMappings = async (updatedMappings: { [key: string]: string[] }) => {
    const progId = currentProgram.id;
    const mappingDocId = progId;
    const path = `mappings/${mappingDocId}`;
    try {
      await setDoc(doc(db, 'mappings', mappingDocId), cleanUndefined({ 
        id: mappingDocId, 
        mappings: updatedMappings, 
        programId: progId 
      }));
      if (progId === 'mba') {
        await setDoc(doc(db, 'mappings', 'active'), cleanUndefined({
          id: 'active',
          mappings: updatedMappings,
          programId: 'mba'
        }));
      }
      setMappings(prev => ({
        ...prev,
        [progId]: updatedMappings,
        [mappingDocId]: updatedMappings,
        ...(progId === 'mba' ? { active: updatedMappings } : {})
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleSaveSettings = async (updatedSettings: Setting) => {
    const progId = updatedSettings.programId || currentProgram.id;
    const settingDocId = `${progId}_general`;
    const path = `settings/${settingDocId}`;
    try {
      await setDoc(doc(db, 'settings', settingDocId), cleanUndefined({
        ...updatedSettings,
        id: settingDocId,
        programId: progId
      }));
      // Keep legacy general synced if MBA for backward compatibility
      if (progId === 'mba') {
        await setDoc(doc(db, 'settings', 'general'), cleanUndefined({
          ...updatedSettings,
          id: 'general',
          programId: 'mba'
        }));
      }
      setSettings(updatedSettings);
      setAllSettings(prev => ({
        ...prev,
        [settingDocId]: updatedSettings,
        ...(progId === 'mba' ? { general: updatedSettings } : {})
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleRestoreProgramBackup = async (backupData: any) => {
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Invalid backup file payload structure.');
    }

    const progId = backupData.program?.id || currentProgram.id;

    // 1. Restore Program Details
    if (backupData.program) {
      await handleUpdateProgram(backupData.program);
    }

    // 2. Restore Program Settings
    if (backupData.settings) {
      await handleSaveSettings(backupData.settings);
    }

    // 3. Restore PLOs
    if (Array.isArray(backupData.plos)) {
      for (const plo of backupData.plos) {
        if (plo.id) {
          const docId = plo.id.startsWith(`${progId}_`) ? plo.id : `${progId}_${plo.id}`;
          await setDoc(doc(db, 'plos', docId), cleanUndefined({ ...plo, programId: progId }));
        }
      }
      setPlos(prev => [
        ...prev.filter(p => (p.programId || 'mba') !== progId),
        ...backupData.plos.map((p: any) => ({ ...p, programId: progId }))
      ]);
    }

    // 4. Restore Courses
    if (Array.isArray(backupData.courses)) {
      for (const course of backupData.courses) {
        if (course.id) {
          const docId = course.id.startsWith(`${progId}_`) ? course.id : `${progId}_${course.id}`;
          await setDoc(doc(db, 'courses', docId), cleanUndefined({ ...course, programId: progId }));
        }
      }
      setCourses(prev => [
        ...prev.filter(c => (c.programId || 'mba') !== progId),
        ...backupData.courses.map((c: any) => ({ ...c, programId: progId }))
      ]);
    }

    // 5. Restore Mappings
    if (backupData.mappings) {
      const mappingDocKey = progId;
      await setDoc(doc(db, 'mappings', mappingDocKey), cleanUndefined({
        id: mappingDocKey,
        mappings: backupData.mappings,
        programId: progId
      }));
      if (progId === 'mba') {
        await setDoc(doc(db, 'mappings', 'active'), cleanUndefined({
          id: 'active',
          mappings: backupData.mappings,
          programId: 'mba'
        }));
      }
      setMappings(prev => ({ ...prev, [mappingDocKey]: backupData.mappings }));
    }

    // 6. Restore Assignments
    if (backupData.assignments && typeof backupData.assignments === 'object') {
      for (const [courseId, items] of Object.entries(backupData.assignments)) {
        const docId = courseId.startsWith(`${progId}_`) ? courseId : `${progId}_${courseId}`;
        await setDoc(doc(db, 'assignments', docId), cleanUndefined({ courseId, items, programId: progId }));
      }
    }

    // 7. Restore Students
    if (Array.isArray(backupData.students)) {
      for (const student of backupData.students) {
        if (student.id) {
          const docId = student.id.startsWith(`${progId}_`) ? student.id : `${progId}_${student.id}`;
          await setDoc(doc(db, 'students', docId), cleanUndefined({ ...student, programId: progId }));
        }
      }
      setStudents(prev => [
        ...prev.filter(s => (s.programId || 'mba') !== progId),
        ...backupData.students.map((s: any) => ({ ...s, programId: progId }))
      ]);
    }

    // 8. Restore Comments
    if (Array.isArray(backupData.comments)) {
      for (const comment of backupData.comments) {
        if (comment.id) {
          await setDoc(doc(db, 'comments', comment.id), cleanUndefined({ ...comment, programId: progId }));
        }
      }
      setComments(prev => [
        ...prev.filter(cm => cm.programId ? cm.programId !== progId : progId === 'mba'),
        ...backupData.comments.map((cm: any) => ({ ...cm, programId: progId }))
      ]);
    }

    // 9. Restore Feedback Rounds (Comment Rounds & Frozen PLO Snapshots)
    if (Array.isArray(backupData.feedbackRounds)) {
      for (const round of backupData.feedbackRounds) {
        if (round.id) {
          await setDoc(doc(db, 'feedback_rounds', round.id), cleanUndefined({ ...round, programId: progId }));
        }
      }
      setFeedbackRounds(prev => [
        ...prev.filter(r => r.programId !== progId),
        ...backupData.feedbackRounds.map((r: any) => ({ ...r, programId: progId }))
      ]);
    }
  };

  const handleUpdateAssignments = async (courseId: string, items: Assignment[]) => {
    const path = `assignments/${courseId}`;
    try {
      await setDoc(doc(db, 'assignments', courseId), { courseId, items });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      setCourses(prev => prev.filter(c => c.id !== courseId));

      // Clean up mapping entries for this course
      const mappingKey = currentProgram.id === 'mba' ? 'active' : currentProgram.id;
      const currentMap = { ...(mappings[mappingKey] || {}) };
      let mapChanged = false;
      Object.keys(currentMap).forEach(key => {
        if (key.startsWith(`${courseId}_`)) {
          delete currentMap[key];
          mapChanged = true;
        }
      });
      if (mapChanged) {
        await handleUpdateMappings(currentMap);
      }

      // Clean up syllabus assessments
      try {
        await deleteDoc(doc(db, 'assignments', courseId));
      } catch (e) {
        // non-fatal
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
    }
  };

  const handleAddTerm = async () => {
    const newCount = (currentProgram.termsCount || 4) + 1;
    const updated: AcademicProgram = {
      ...currentProgram,
      termsCount: newCount
    };
    await handleUpdateProgram(updated);
  };

  const handleDeleteTerm = async (termToDelete?: number) => {
    const currentCount = currentProgram.termsCount || 4;
    if (currentCount <= 1) return;
    const targetTerm = termToDelete || currentCount;

    // Guard: Only when all courses in that term are removed can the term be deleted
    const coursesInTerm = courses.filter(c => (c.programId || 'mba') === currentProgram.id && c.term === targetTerm);
    if (coursesInTerm.length > 0) {
      console.warn(`Cannot delete ${currentProgram.termLabel || 'Term'} ${targetTerm}: ${coursesInTerm.length} course(s) remain in this term.`);
      return;
    }

    // Shift any courses in terms higher than the deleted term down by 1 to maintain contiguous numbering
    const higherCourses = courses.filter(c => (c.programId || 'mba') === currentProgram.id && c.term > targetTerm);
    for (const c of higherCourses) {
      const shifted = { ...c, term: c.term - 1 };
      await handleUpdateCourse(shifted);
    }

    const updated: AcademicProgram = {
      ...currentProgram,
      termsCount: currentCount - 1
    };
    await handleUpdateProgram(updated);
  };

  if (!userRole) {
    return (
      <div id="curriculum-gateway" className="min-h-screen w-full bg-slate-100 flex flex-col justify-center items-center p-6 font-sans"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.46) 0.1%, rgba(233, 226, 226, 0.28) 90.1%)'
        }}
      >
        <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col md:flex-row animate-fadeIn">
          {/* Brand/Hero Panel */}
          <div className="md:w-5/12 bg-[#334659] text-white p-8 flex flex-col justify-between relative"
            style={{ 
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', 
              backgroundSize: '20px 20px' 
            }}
          >
            <div className="space-y-6">
              <div className="w-24 h-24 bg-white p-2.5 rounded-2xl shadow-md flex items-center justify-center border border-slate-200/50">
                <img
                  src={ucwLogo}
                  alt="UCW Logo"
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase">Academic Programs Curriculum Map</span>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">University Canada West</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The accredited Master of Business Administration (MBA), Bachelor of Commerce (BCom), and Multi-Program Curriculum Mapping & Continuous Assessment Workspace.
              </p>
            </div>
            
            <div className="pt-8 border-t border-slate-700/60 text-[10px] text-slate-400 font-mono">
              CURRICULUM GATEWAY v5.0 // MULTI-PROGRAM
            </div>
          </div>

          {/* Access Options Panel */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center space-y-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-800">UCW Curriculum Gateway</h3>
              <p className="text-xs text-slate-400 mt-1">Select your role to access program mappings, continuous assessment, or faculty reviews.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option 1: Faculty Review Sandbox Portals (1 box per program) */}
              <div id="faculty-sandbox-section" className="border border-slate-200 rounded-2xl p-5 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Faculty Review Sandbox Portals</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Per-Program Independent Faculty Sandbox Review Access</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {programs.map((p) => {
                    const progSetting = allSettings[`${p.id}_general`] || (p.id === 'mba' ? allSettings['general'] : undefined) || DEFAULT_PROGRAM_SETTINGS[p.id] || DEFAULT_SETTINGS;
                    const isSandboxActive = progSetting.facultySandboxEnabled === true;

                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border transition flex flex-col sm:flex-row justify-between sm:items-center gap-2.5 ${
                          isSandboxActive
                            ? 'bg-white border-amber-200/80 shadow-xs hover:border-amber-400'
                            : 'bg-slate-100/70 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {p.code}
                            </span>
                            <span className="font-bold text-xs text-slate-800">{p.name}</span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isSandboxActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {isSandboxActive ? 'OPEN REVIEW' : 'REVIEW CLOSED'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {isSandboxActive
                              ? `Inspect ${p.code} PLOs, cast upvotes, and submit reviews.`
                              : `Faculty sandbox reviews for ${p.code} are deactivated by administrator.`}
                          </p>
                        </div>

                        <div>
                          {isSandboxActive ? (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await signInAnonymously(auth);
                                } catch (authErr) {
                                  console.warn('Sandbox auth notice:', authErr);
                                }
                                setUserRole('faculty_guest');
                                localStorage.setItem('user_role', 'faculty_guest');
                                handleSelectProgram(p.id);
                                setIsSandboxMode(true);
                                const freshId = `voter_${Math.random().toString(36).substring(2, 11)}`;
                                sessionStorage.setItem('voter_id', freshId);
                                setVoterId(freshId);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer shrink-0"
                            >
                              <MessageSquare size={12} />
                              Enter {p.code} Sandbox
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-400 font-bold text-[11px] rounded-xl border border-slate-300/60 shrink-0">
                              <Lock size={12} /> {p.code} Closed
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Option 2: Curriculum Administrator */}
              <div id="admin-login-card" className="border border-slate-200 hover:border-blue-400 rounded-2xl p-5 bg-slate-50/40 hover:bg-blue-50/10 transition-all duration-150 group">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-2 flex-1 text-left">
                    <h4 className="font-bold text-sm text-slate-800">Administrator Sign-In</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Manage programs, course outlays, CLO-PLO mappings, syllabus assessments, faculty review toggles, and student logs.
                    </p>
                    
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setPasscodeError('');
                        if (adminPasscode.trim() === 'Admin-UCW' || adminPasscode.trim().toLowerCase() === 'admin-ucw') {
                          try {
                            await signInAnonymously(auth);
                          } catch (authErr: any) {
                            console.error('Passcode login auto anonymous auth failed:', authErr);
                          }
                          setUserRole('admin');
                          localStorage.setItem('user_role', 'admin');
                          setIsSandboxMode(false);
                          const freshId = `voter_${Math.random().toString(36).substring(2, 11)}`;
                          sessionStorage.setItem('voter_id', freshId);
                          setVoterId(freshId);
                        } else {
                          setPasscodeError('Invalid administrator passcode.');
                        }
                      }}
                      className="space-y-2 pt-2"
                    >
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter administrator passcode"
                          value={adminPasscode}
                          onChange={(e) => setAdminPasscode(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0 cursor-pointer"
                        >
                          Sign In
                        </button>
                      </div>
                      
                      {passcodeError && (
                        <p className="text-[10px] text-rose-600 font-bold">{passcodeError}</p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-100 text-slate-800 flex overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <nav 
        className="w-64 bg-[#334659] text-slate-100 flex flex-col shrink-0 border-r border-slate-700 justify-between relative"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Branding */}
          <div className="p-5 border-b border-slate-700/60 flex items-center justify-center">
            <div className="w-24 h-24 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center border border-slate-200/60">
              <img
                src={ucwLogo}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Program Switcher Card */}
          {isSandboxMode || userRole === 'faculty_guest' ? (
            <div className="mx-3 mt-3.5 p-3 bg-amber-500/10 rounded-xl border border-amber-400/20 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={11} className="text-amber-400" />
                  <span>Faculty Sandbox Mode</span>
                </span>
              </div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-amber-500 text-slate-900 rounded font-bold text-[10px]">
                  {currentProgram.code}
                </span>
                <span className="truncate text-slate-200">{currentProgram.name}</span>
              </div>
            </div>
          ) : (
            <div className="mx-3 mt-3.5 p-3 bg-white/10 rounded-xl border border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={11} className="text-blue-400" />
                  <span>Active Program</span>
                </span>
                <button
                  onClick={() => setIsProgramModalOpen(true)}
                  className="text-[9px] text-blue-300 hover:text-white underline font-mono cursor-pointer transition"
                  title="Manage all programs"
                >
                  All Programs ({programs.length})
                </button>
              </div>
              
              {/* Quick program switcher pill buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {programs.slice(0, 4).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProgramSwitchRequest(p.id)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-center truncate transition cursor-pointer ${
                      p.id === selectedProgramId
                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300/40'
                        : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white'
                    }`}
                    title={`${p.code}: ${p.name}`}
                  >
                    {p.code}
                  </button>
                ))}
                {programs.length > 4 && (
                  <button
                    onClick={() => setIsProgramModalOpen(true)}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium text-slate-300 bg-white/5 hover:bg-white/10 text-center cursor-pointer col-span-2"
                  >
                    +{programs.length - 4} more programs...
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold text-slate-300/60 uppercase tracking-wider mb-2 block px-3">
              {isSandboxMode || userRole === 'faculty_guest' ? 'Faculty Review View' : 'Curriculum Views'}
            </span>
            
            <button
              onClick={() => handleTabSwitchRequest('program')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all duration-150 border-l-4 ${
                activeTab === 'program' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
            >
              <Award size={15} /> Program Profile & PLOs
            </button>

            {!isSandboxMode && userRole !== 'faculty_guest' && (
              <>
                <button
                  onClick={() => handleTabSwitchRequest('feedback-reviews')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'feedback-reviews' 
                      ? 'bg-white/15 text-white border-amber-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Archive size={15} /> Faculty Feedback Board
                  </span>
                </button>

                <button
                  onClick={() => handleTabSwitchRequest('course-outlines')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'course-outlines' 
                      ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <FileText size={15} /> Course Outlines
                  </span>
                </button>

                <button
                  onClick={() => handleTabSwitchRequest('courses')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'courses' 
                      ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <BookOpen size={15} /> CLO-PLO mapping
                  </span>
                </button>

                <span className="text-[9px] font-mono font-bold text-slate-300/60 uppercase tracking-wider mt-5 mb-2 block px-3">Mapping Tools</span>

                <button
                  onClick={() => handleTabSwitchRequest('visual-mapping')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'visual-mapping' 
                      ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Map size={15} /> Curriculum Pathway Tree
                  </span>
                </button>

                <button
                  onClick={() => handleTabSwitchRequest('coverage')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'coverage' 
                      ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Table size={15} /> PLO Coverage Matrix
                  </span>
                </button>

                <button
                  onClick={() => handleTabSwitchRequest('assignments')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'assignments' 
                      ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <FileSpreadsheet size={15} /> Syllabus Assessments
                  </span>
                </button>

                <button
                  onClick={() => handleTabSwitchRequest('students')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'students' 
                      ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Users size={15} /> Student Proficiency Log
                  </span>
                </button>

                <span className="text-[9px] font-mono font-bold text-slate-300/60 uppercase tracking-wider mt-5 mb-2 block px-3">Configuration</span>

                <button
                  onClick={() => handleTabSwitchRequest('settings')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                    activeTab === 'settings' 
                      ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                      : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <SettingsIcon size={15} /> Settings
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Database Status inside Sidebar Footer */}
        <div className="p-4 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/10 shadow-inner">
            <span className="flex items-center gap-1">
              <Database size={11} className="text-blue-400 animate-pulse" />
              <span>Database:</span>
            </span>
            <span className="font-mono text-white font-bold">{isSeeding ? 'Seeding...' : 'Online'}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Interactive Program Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProgramModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition group shadow-xs cursor-pointer"
                title="Switch or manage academic programs"
              >
                <GraduationCap size={15} className="text-blue-600" />
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
                  {currentProgram.code}
                </span>
                <span className="max-w-[180px] md:max-w-[260px] truncate">{currentProgram.name}</span>
                <ChevronDown size={13} className="text-slate-400 group-hover:text-slate-600 transition" />
              </button>

              <button
                onClick={() => setIsProgramModalOpen(true)}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200/60 rounded-xl transition cursor-pointer"
                title="Add or manage academic programs"
              >
                <Plus size={12} /> Add Program
              </button>
            </div>

            <span className="text-xs text-slate-300 font-mono">/</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {activeTab === 'program' && 'Program Profile & PLOs'}
              {activeTab === 'feedback-reviews' && 'Faculty Feedback Reviews Board'}
              {activeTab === 'course-outlines' && 'Course Outlines'}
              {activeTab === 'courses' && 'CLO-PLO mapping'}
              {activeTab === 'visual-mapping' && 'Pathway Tree'}
              {activeTab === 'coverage' && 'Coverage Matrix'}
              {activeTab === 'assignments' && 'Syllabus Assessments'}
              {activeTab === 'students' && 'Student Proficiency Log'}
              {activeTab === 'settings' && 'Settings'}
            </span>
          </div>

          {/* Header Role Badges & Actions */}
          <div className="flex items-center gap-2.5">
            {userRole === 'admin' ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsSandboxMode(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    isSandboxMode 
                      ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-200' 
                      : 'bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-slate-200'
                  }`}
                  title={isSandboxMode ? 'Exit faculty preview mode' : 'Preview Faculty Sandbox Review'}
                >
                  <MessageSquare size={13} className={isSandboxMode ? 'text-amber-600' : 'text-slate-400'} />
                  <span>{isSandboxMode ? 'Exit Faculty Preview' : 'Faculty Sandbox Preview'}</span>
                </button>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-100 rounded-xl text-xs font-bold shadow-xs">
                  <ShieldCheck size={13} className="text-blue-600" />
                  <span>Admin Workstation</span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition border border-rose-150 shadow-xs cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={12} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold shadow-xs">
                  <MessageSquare size={13} className="text-amber-600" />
                  <span>Faculty Review Sandbox</span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition border border-slate-200 shadow-xs cursor-pointer"
                  title="Exit Sandbox"
                >
                  <LogOut size={12} /> Exit Sandbox
                </button>
              </>
            )}
          </div>
        </header>

        {/* Auth error notice */}
        {authError && (
          <div className="bg-red-50 border-b border-red-100 py-3.5 px-8 flex justify-between items-start text-xs text-red-850 shrink-0">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Sandbox Mode Blocked: </span>
                <span>{authError}</span>
              </div>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="font-mono text-[10px] font-bold text-red-500 hover:text-red-700 uppercase shrink-0 ml-4 px-2 py-0.5 border border-red-200 hover:border-red-300 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty database alert with dynamic seed button */}
        {isDbEmptyInFirestore && (
          <div className="bg-amber-50 border-b border-amber-200 py-4 px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-amber-900 shrink-0 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-3">
              <Database size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-amber-950 text-sm block mb-1">
                  Firestore Collections are Empty
                </span>
                <span className="text-slate-600 leading-relaxed block max-w-4xl">
                  Your Cloud Firestore connection is active, but no collections or records exist under your project. 
                  The initial seeding skipped because **Anonymous Authentication is disabled** in your Firebase Console (<code>auth/admin-restricted-operation</code>).
                  To populate your Firestore database with the complete UCW MBA & BCom curriculum mappings: 
                  <strong> (1) Sign In with Google</strong> (or enable Anonymous Auth), then <strong>(2) click "Seed Database Collections"</strong> below.
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end mt-2 md:mt-0">
              {currentUser ? (
                <button
                  onClick={triggerDbSeed}
                  disabled={isSeeding}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  {isSeeding ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                      Seeding Collections...
                    </>
                  ) : (
                    <>
                      <Database size={13} />
                      Seed Database Collections
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  <LogIn size={13} />
                  Sign In with Google to Seed
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Stage content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto w-full animate-fadeIn">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="text-slate-400 text-xs font-medium">Synchronizing curriculum maps with Cloud Firestore...</p>
              </div>
            ) : (
              <div>
                {activeTab === 'program' && (
                  <ProgramTab
                    programInfo={programInfo}
                    plos={activePlos}
                    onUpdateProgramInfo={handleUpdateProgramInfo}
                    onUpdatePlos={handleUpdatePlos}
                    currentProgram={currentProgram}
                    onUpdateProgram={handleUpdateProgram}
                    isSandboxMode={isSandboxMode}
                    facultySandboxEnabled={activeSettings.facultySandboxEnabled === true}
                    activeRoundId={activeSettings.activeRoundId || ''}
                    activeRoundName={activeSettings.activeRoundName || ''}
                    feedbackLevels={activeSettings.feedbackLevels || { plo: true, dimension: true, rubric: true }}
                    comments={activeComments}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onUpvoteComment={handleUpvoteComment}
                    userRole={userRole}
                    voterId={voterId}
                  />
                )}

                {activeTab === 'feedback-reviews' && (
                  <FeedbackReviewsTab
                    currentProgram={currentProgram}
                    feedbackRounds={feedbackRounds}
                    comments={activeComments}
                    currentPlos={activePlos}
                    settings={activeSettings}
                    onNavigateToSettings={() => handleTabSwitchRequest('settings')}
                    onDeleteComment={handleDeleteComment}
                    userRole={userRole}
                  />
                )}

                {activeTab === 'course-outlines' && (
                  <CourseOutlinesTab
                    courses={activeCourses}
                    onUpdateCourse={handleUpdateCourse}
                    onDeleteCourse={handleDeleteCourse}
                    onAddTerm={handleAddTerm}
                    onDeleteTerm={handleDeleteTerm}
                    termsCount={currentProgram.termsCount || 4}
                    termLabel={currentProgram.termLabel || 'Term'}
                    programId={currentProgram.id}
                  />
                )}

                {activeTab === 'courses' && (
                  <CoursesTab
                    courses={activeCourses}
                    plos={activePlos}
                    mappings={activeMappings}
                    thresholdTerm={activeSettings.thresholdTerm}
                    onUpdateCourse={handleUpdateCourse}
                    onUpdateMappings={handleUpdateMappings}
                    termsCount={currentProgram.termsCount || 4}
                    termLabel={currentProgram.termLabel || 'Term'}
                    programId={currentProgram.id}
                  />
                )}

                {activeTab === 'visual-mapping' && (
                  <VisualMappingTab
                    courses={activeCourses}
                    plos={activePlos}
                    mappings={activeMappings}
                    termsCount={currentProgram.termsCount || 4}
                    termLabel={currentProgram.termLabel || 'Term'}
                  />
                )}

                {activeTab === 'coverage' && (
                  <CoverageTab
                    courses={activeCourses}
                    plos={activePlos}
                    mappings={activeMappings}
                    thresholdTerm={activeSettings.thresholdTerm}
                    termsCount={currentProgram.termsCount || 4}
                    termLabel={currentProgram.termLabel || 'Term'}
                  />
                )}

                {activeTab === 'assignments' && (
                  <AssignmentsTab
                    courses={activeCourses}
                    plos={activePlos}
                    assignments={activeAssignments}
                    onUpdateAssignments={handleUpdateAssignments}
                  />
                )}

                {activeTab === 'students' && (
                  <StudentProficiencyTab
                    students={activeStudents}
                    courses={activeCourses}
                    plos={activePlos}
                    assignments={activeAssignments}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTab
                    programs={programs}
                    activeProgram={currentProgram}
                    settings={activeSettings}
                    plos={activePlos}
                    courses={activeCourses}
                    mappings={activeMappings}
                    assignments={activeAssignments}
                    students={activeStudents}
                    facultyComments={activeComments}
                    allComments={comments}
                    feedbackRounds={feedbackRounds}
                    onSaveFeedbackRound={handleSaveFeedbackRound}
                    onNavigateToFeedbackBoard={() => handleTabSwitchRequest('feedback-reviews')}
                    onSaveSettings={handleSaveSettings}
                    onSelectProgram={handleProgramSwitchRequest}
                    onResetToDefaults={triggerDbSeed}
                    onRestoreProgramBackup={handleRestoreProgramBackup}
                    isSeeding={isSeeding}
                    onUnsavedChangesChange={handleUnsavedSettingsChange}
                    registerSaveHandler={handleRegisterSaveHandler}
                  />
                )}
              </div>
            )}
          </div>
        </main>

        {/* Sticky Status Footer bar */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-8 text-center text-[10px] font-bold text-slate-400 font-mono tracking-wider shrink-0 uppercase">
          UCW {currentProgram.code} CURRICULUM DESIGN WORKSPACE // POWERED BY GOOGLE CLOUD FIRESTORE
        </footer>

        {/* Floating Curriculum Specialist Chatbot */}
        {!isSandboxMode && (
          <CurriculumChatbot 
            courses={activeCourses} 
            plos={activePlos} 
            mappings={activeMappings} 
            programName={currentProgram.name}
            programCode={currentProgram.code}
          />
        )}

        {/* Program Manager Modal */}
        <ProgramManagerModal
          isOpen={isProgramModalOpen}
          onClose={() => setIsProgramModalOpen(false)}
          programs={programs}
          selectedProgramId={selectedProgramId}
          onSelectProgram={handleProgramSwitchRequest}
          onCreateProgram={handleCreateProgram}
          onUpdateProgram={handleUpdateProgram}
          onDeleteProgram={handleDeleteProgram}
        />

        {/* Unsaved Settings Warning Navigation Modal */}
        {pendingNavModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
              <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Unsaved Settings Warning</h3>
                  <p className="text-xs text-slate-500">
                    You have unsaved changes in Program Settings.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Do you want to save your setting changes for <strong>{currentProgram.name}</strong> before leaving to {pendingNavModal.type === 'tab' ? 'another section' : 'another program'}? Unsaved changes will be lost if you proceed without saving.
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingNavModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = pendingNavModal;
                    setHasUnsavedSettings(false);
                    setPendingNavModal(null);
                    if (target.type === 'tab') {
                      setActiveTab(target.targetId);
                    } else {
                      handleSelectProgram(target.targetId);
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Discard Changes
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const target = pendingNavModal;
                    if (saveSettingsRef.current) {
                      await saveSettingsRef.current();
                    }
                    setHasUnsavedSettings(false);
                    setPendingNavModal(null);
                    if (target.type === 'tab') {
                      setActiveTab(target.targetId);
                    } else {
                      handleSelectProgram(target.targetId);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
