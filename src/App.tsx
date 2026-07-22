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
import { PLO, Course, Setting, Assignment, Student, FacultyComment } from './types';

// Seed Initial Data
import {
  INITIAL_PLOS,
  INITIAL_COURSES,
  INITIAL_MAPPINGS,
  DEFAULT_SETTINGS,
  INITIAL_ASSIGNMENTS,
  INITIAL_STUDENTS
} from './data/initialData';

// Sub Components
import ProgramTab from './components/ProgramTab';
import CourseOutlinesTab from './components/CourseOutlinesTab';
import CoursesTab from './components/CoursesTab';
import VisualMappingTab from './components/VisualMappingTab';
import CoverageTab from './components/CoverageTab';
import SettingsTab from './components/SettingsTab';
import AssignmentsTab from './components/AssignmentsTab';
import StudentProficiencyTab from './components/StudentProficiencyTab';
import CurriculumChatbot from './components/CurriculumChatbot';
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
  Lock
} from 'lucide-react';

const cleanUndefined = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null) return null;
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
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(() => {
    return localStorage.getItem('is_sandbox_mode') === 'true';
  });

  // Keep tab focused on Program and sync status
  useEffect(() => {
    if (userRole === 'faculty_guest') {
      setIsSandboxMode(true);
      localStorage.setItem('is_sandbox_mode', 'true');
      localStorage.setItem('user_role', 'faculty_guest');
      setActiveTab('program');
    } else {
      localStorage.setItem('is_sandbox_mode', isSandboxMode ? 'true' : 'false');
      if (isSandboxMode) {
        setActiveTab('program');
      }
    }
  }, [isSandboxMode, userRole]);

  // Core App states synced from Firestore
  const [programInfo, setProgramInfo] = useState({
    name: 'Master of Business Administration (MBA)',
    description: 'The ACBSP and NCMA-accredited Master of Business Administration (MBA) program from University Canada West (UCW) will prepare you for leadership on the global stage. You will learn how to take challenging situations in stride, apply pragmatic solutions to problems and ultimately drive the success of an organization.',
    objectives: 'The program develops graduates who can formulate sustainable business strategy, build and direct diverse business teams, conduct analytics-driven business evaluation, and integrate digital technology solutions seamlessly into daily corporate operations.'
  });
  const [plos, setPlos] = useState<PLO[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [mappings, setMappings] = useState<{ [key: string]: string[] }>({});
  const [settings, setSettings] = useState<Setting>(DEFAULT_SETTINGS);
  const [assignments, setAssignments] = useState<{ [courseId: string]: Assignment[] }>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [comments, setComments] = useState<FacultyComment[]>([]);

  // Unique voter identifier state that regenerates on each new tab/session or sandbox entry
  const [voterId, setVoterId] = useState<string>(() => {
    let id = sessionStorage.getItem('voter_id');
    if (!id) {
      id = `voter_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('voter_id', id);
    }
    return id;
  });

  // Upvote a PLO
  const handleUpvotePlo = async (ploId: string) => {
    const updatedPlos = plos.map(plo => {
      if (plo.id === ploId) {
        const upvotes = plo.upvotes || [];
        const hasVoted = upvotes.includes(voterId);
        const newUpvotes = hasVoted 
          ? upvotes.filter(id => id !== voterId) 
          : [...upvotes, voterId];
        return { ...plo, upvotes: newUpvotes };
      }
      return plo;
    });

    try {
      const targetPlo = updatedPlos.find(p => p.id === ploId);
      if (targetPlo) {
        await setDoc(doc(db, 'plos', ploId), targetPlo);
      }
      setPlos(updatedPlos);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'plos');
    }
  };

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
      await setDoc(doc(db, 'comments', commentId), updatedComment);
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'comments');
    }
  };

  // Save a new FacultyComment to Firestore
  const handleAddComment = async (comment: Omit<FacultyComment, 'id' | 'createdAt'>) => {
    const id = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newComment: FacultyComment = {
      ...comment,
      id,
      createdAt: new Date().toISOString()
    };
    
    // Firestore does not allow undefined properties
    const cleanComment: any = { ...newComment };
    if (cleanComment.dimensionId === undefined) delete cleanComment.dimensionId;
    if (cleanComment.metricType === undefined) delete cleanComment.metricType;

    try {
      await setDoc(doc(db, 'comments', id), cleanComment);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'comments');
    }
  };

  // Delete a FacultyComment from Firestore
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'comments');
    }
  };

  // Initialize and check connection
  useEffect(() => {
    testConnection();
    
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

  // Temporary PLO Migration
  useEffect(() => {
    const migratePlos = async () => {
      if (!currentUser) return;
      const migrateFlag = localStorage.getItem('plos_migrated_v4');
      if (migrateFlag) return;
      
      try {
        console.log('Migrating PLOs to match the new definitions...');
        // Clean up old ones just in case
        for (let i = 1; i <= 10; i++) {
          await deleteDoc(doc(db, 'plos', `PLO${i}`));
        }
        for (const plo of INITIAL_PLOS) {
          await setDoc(doc(db, 'plos', plo.id), plo);
        }
        localStorage.setItem('plos_migrated_v4', 'true');
        console.log('PLOs migrated successfully.');
      } catch (err) {
        console.error('Failed to migrate PLOs:', err);
      }
    };
    
    if (currentUser) {
      // give time for auth to settle and db connection to establish
      setTimeout(migratePlos, 2000);
    }
  }, [currentUser]);

  // Real-time Database Subscriptions with Resilient Local Fallbacks
  useEffect(() => {
    setIsLoading(true);

    // 1. Program Info
    const unsubProgram = onSnapshot(doc(db, 'program', 'info'), (docSnap) => {
      if (docSnap.exists()) {
        setProgramInfo(docSnap.data() as any);
      } else {
        setProgramInfo({
          name: 'Master of Business Administration (MBA)',
          description: 'The ACBSP and NCMA-accredited Master of Business Administration (MBA) program from University Canada West (UCW) will prepare you for leadership on the global stage. You will learn how to take challenging situations in stride, apply pragmatic solutions to problems and ultimately drive the success of an organization.',
          objectives: 'The program develops graduates who can formulate sustainable business strategy, build and direct diverse business teams, conduct analytics-driven business evaluation, and integrate digital technology solutions seamlessly into daily corporate operations.'
        });
      }
    }, (error) => {
      console.warn('Firestore program subscription warning (falling back to memory defaults):', error);
    });

    // 2. Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as Setting);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    }, (error) => {
      console.warn('Firestore settings subscription warning (falling back to memory defaults):', error);
      setSettings(DEFAULT_SETTINGS);
    });

    // 3. Mappings
    const unsubMappings = onSnapshot(doc(db, 'mappings', 'active'), (docSnap) => {
      if (docSnap.exists()) {
        setMappings((docSnap.data() as any).mappings || {});
      } else {
        setMappings(INITIAL_MAPPINGS);
      }
    }, (error) => {
      console.warn('Firestore mappings subscription warning (falling back to memory defaults):', error);
      setMappings(INITIAL_MAPPINGS);
    });

    // 4. PLOs
    const unsubPlos = onSnapshot(collection(db, 'plos'), (querySnap) => {
      const plosList: PLO[] = [];
      querySnap.forEach((doc) => {
        plosList.push(doc.data() as PLO);
      });
      
      if (plosList.length > 0) {
        setPlos(plosList);
        setIsDbEmptyInFirestore(false);
      } else {
        setPlos(INITIAL_PLOS);
        setIsDbEmptyInFirestore(true);
      }
    }, (error) => {
      console.warn('Firestore PLOs subscription warning (falling back to memory defaults):', error);
      setPlos(INITIAL_PLOS);
    });

    // 5. Courses
    const unsubCourses = onSnapshot(collection(db, 'courses'), (querySnap) => {
      const coursesList: Course[] = [];
      querySnap.forEach((doc) => {
        coursesList.push(doc.data() as Course);
      });
      if (coursesList.length > 0) {
        setCourses(coursesList);
      } else {
        setCourses(INITIAL_COURSES);
      }
    }, (error) => {
      console.warn('Firestore courses subscription warning (falling back to memory defaults):', error);
      setCourses(INITIAL_COURSES);
    });

    // 6. Assignments
    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (querySnap) => {
      const assigMap: { [courseId: string]: Assignment[] } = {};
      querySnap.forEach((doc) => {
        assigMap[doc.id] = (doc.data() as any).items || [];
      });
      if (Object.keys(assigMap).length > 0) {
        setAssignments(assigMap);
      } else {
        setAssignments(INITIAL_ASSIGNMENTS);
      }
    }, (error) => {
      console.warn('Firestore assignments subscription warning (falling back to memory defaults):', error);
      setAssignments(INITIAL_ASSIGNMENTS);
    });

    // 7. Students (only subscribe if logged in, otherwise use Initial local data)
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
          setStudents(INITIAL_STUDENTS);
        }
      }, (error) => {
        // Log error but fallback to local data to keep view functional
        console.warn('Students subscription error (expected if non-admin):', error);
        setStudents(INITIAL_STUDENTS);
      });
    } else {
      setStudents(INITIAL_STUDENTS);
    }

    // 8. Comments (faculty feedback comments, always read globally)
    const unsubComments = onSnapshot(collection(db, 'comments'), (querySnap) => {
      const commentsList: FacultyComment[] = [];
      querySnap.forEach((doc) => {
        commentsList.push(doc.data() as FacultyComment);
      });
      setComments(commentsList);
    }, (error) => {
      console.warn('Firestore comments subscription warning:', error);
    });

    setIsLoading(false);

    return () => {
      unsubProgram();
      unsubSettings();
      unsubMappings();
      unsubPlos();
      unsubCourses();
      unsubAssignments();
      unsubStudents();
      unsubComments();
    };
  }, [currentUser]);

  // Seeding trigger
  const triggerDbSeed = async () => {
    setIsSeeding(true);
    console.log('Starting Firestore database seeding operations for UCW MBA curriculum...');
    try {
      // We must check if user is signed in to write. If not, sign in anonymously to complete the seeding!
      let authUser = auth.currentUser;
      if (!authUser) {
        console.log('Signing in anonymously to establish seeding credentials...');
        try {
          authUser = (await signInAnonymously(auth)).user;
        } catch (authErr: any) {
          console.warn('Silent notice: Anonymous sign-in was restricted or blocked.', authErr);
          throw authErr;
        }
      }

      // 1. Seed/Overwrite Program Info
      await setDoc(doc(db, 'program', 'info'), {
        name: 'Master of Business Administration (MBA)',
        description: 'The ACBSP and NCMA-accredited Master of Business Administration program at University Canada West (UCW) prepares you for leadership on the global stage. You will develop critical thinking, digital literacy, and strategic decision-making skills to tackle complex business challenges.',
        objectives: '1. Analyze complex business problems to make strategic, data-driven decisions.\n2. Leverage digital tools and business analytics for operational innovation.\n3. Exhibit global perspective, ethical leadership, and corporate social responsibility.'
      });

      // 2. Overwrite Mappings
      await setDoc(doc(db, 'mappings', 'active'), { id: 'active', mappings: INITIAL_MAPPINGS });

      // 3. Clear old PLO and Course documents to prevent stale IDs (e.g. PLO7, PLO8, PLO9)
      const oldPloIds = ['PLO1', 'PLO2', 'PLO3', 'PLO4', 'PLO5', 'PLO6', 'PLO7', 'PLO8', 'PLO9'];
      for (const id of oldPloIds) {
        try {
          await deleteDoc(doc(db, 'plos', id));
        } catch (e) {
          // ignore
        }
      }

      const oldCourseIds = [
        'BUSI601', 'ORGB601', 'ACCT601', 'MRKT621', 'FNCE623', 
        'OPMT620', 'HRMT624', 'ANLY630', 'PROJ640', 'MGMT640', 
        'WORK601', 'LEAD601', 'OPMT621', 'OPMT625', 'BUSI650', 'CAPS602'
      ];
      for (const id of oldCourseIds) {
        try {
          await deleteDoc(doc(db, 'courses', id));
          await deleteDoc(doc(db, 'assignments', id));
        } catch (e) {
          // ignore
        }
      }

      // 4. Seed PLOs
      for (const plo of INITIAL_PLOS) {
        await setDoc(doc(db, 'plos', plo.id), plo);
      }

      // 5. Seed Courses
      for (const course of INITIAL_COURSES) {
        await setDoc(doc(db, 'courses', course.id), course);
      }

      // 6. Seed Assignments
      for (const [courseId, items] of Object.entries(INITIAL_ASSIGNMENTS)) {
        await setDoc(doc(db, 'assignments', courseId), { courseId, items });
      }

      // 7. Seed Students
      for (const student of INITIAL_STUDENTS) {
        await setDoc(doc(db, 'students', student.id), student);
      }

      console.log('Firestore seed completed successfully.');
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
    const path = 'program/info';
    try {
      await setDoc(doc(db, 'program', 'info'), info);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdatePlos = async (updatedPlos: PLO[]) => {
    try {
      // Find deleted PLOs and remove them from collection
      const existingIds = plos.map(p => p.id);
      const updatedIds = updatedPlos.map(p => p.id);
      const deletedIds = existingIds.filter(id => !updatedIds.includes(id));

      for (const id of deletedIds) {
        await deleteDoc(doc(db, 'plos', id));
      }

      for (const plo of updatedPlos) {
        const cleaned = cleanUndefined(plo);
        await setDoc(doc(db, 'plos', plo.id), cleaned);
      }
      setPlos(updatedPlos);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'plos');
    }
  };

  const handleUpdateCourse = async (updatedCourse: Course) => {
    const path = `courses/${updatedCourse.id}`;
    try {
      await setDoc(doc(db, 'courses', updatedCourse.id), updatedCourse);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleUpdateMappings = async (updatedMappings: { [key: string]: string[] }) => {
    const path = 'mappings/active';
    try {
      await setDoc(doc(db, 'mappings', 'active'), { id: 'active', mappings: updatedMappings });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleSaveSettings = async (updatedSettings: Setting) => {
    const path = 'settings/general';
    try {
      await setDoc(doc(db, 'settings', 'general'), updatedSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
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
                <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase">MBA Curriculum Map</span>
                <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">University Canada West</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The ACBSP and NCMA-accredited Master of Business Administration (MBA) Curriculum Mapping & Continuous Assessment Workspace.
              </p>
            </div>
            
            <div className="pt-8 border-t border-slate-700/60 text-[10px] text-slate-400 font-mono">
              CURRICULUM GATEWAY v4.2
            </div>
          </div>

          {/* Access Options Panel */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center space-y-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-slate-800">Select Access Workspace</h3>
              <p className="text-xs text-slate-400 mt-1">Please select your role to proceed to the UCW MBA curriculum platform.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {/* Option 1: Faculty Guest Reviewer */}
              <div id="faculty-guest-card" className="border border-slate-200 hover:border-amber-400 rounded-2xl p-5 bg-slate-50/40 hover:bg-amber-50/10 transition-all duration-150 group">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-100 transition">
                    <BookOpen size={20} />
                  </div>
                  <div className="space-y-1 flex-1 text-left">
                    <h4 className="font-bold text-sm text-slate-800">Faculty Reviewer (Guest Session)</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Review the 9 Program Learning Outcomes (PLOs), evaluation rubrics & metrics, and submit feedback comments. No password required.
                    </p>
                    <button
                      onClick={() => {
                        setUserRole('faculty_guest');
                        localStorage.setItem('user_role', 'faculty_guest');
                        setIsSandboxMode(true);
                        // Generate a fresh unique voter ID so likes can accumulate across guest sandbox entries
                        const freshId = `voter_${Math.random().toString(36).substring(2, 11)}`;
                        sessionStorage.setItem('voter_id', freshId);
                        setVoterId(freshId);
                      }}
                      className="mt-3 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition duration-150 flex items-center gap-1.5"
                    >
                      Enter Faculty Review Mode
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 2: Curriculum Administrator */}
              <div id="admin-login-card" className="border border-slate-200 hover:border-blue-400 rounded-2xl p-5 bg-slate-50/40 hover:bg-blue-50/10 transition-all duration-150 group">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-2 flex-1 text-left">
                    <h4 className="font-bold text-sm text-slate-800">Curriculum Administrator</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Configure program structures, course outlays, align mapping levels, edit syllabus assessments, and view student analytics.
                    </p>
                    
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setPasscodeError('');
                        if (adminPasscode.trim().toLowerCase() === 'ucw-admin' || adminPasscode.trim().toLowerCase() === 'admin') {
                          try {
                            await signInAnonymously(auth);
                            setUserRole('admin');
                            localStorage.setItem('user_role', 'admin');
                            setIsSandboxMode(false);
                            // Generate a fresh unique voter ID so likes can accumulate across admin sandbox entries
                            const freshId = `voter_${Math.random().toString(36).substring(2, 11)}`;
                            sessionStorage.setItem('voter_id', freshId);
                            setVoterId(freshId);
                          } catch (authErr: any) {
                            console.error('Passcode login auto anonymous auth failed:', authErr);
                            // Fallback so the app doesn't block them entirely if anonymous auth is disabled
                            setUserRole('admin');
                            localStorage.setItem('user_role', 'admin');
                            setIsSandboxMode(false);
                            const freshId = `voter_${Math.random().toString(36).substring(2, 11)}`;
                            sessionStorage.setItem('voter_id', freshId);
                            setVoterId(freshId);
                          }
                        } else {
                          setPasscodeError('Invalid administrator passcode. Please try again.');
                        }
                      }}
                      className="space-y-2 pt-2"
                    >
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter Admin Passcode"
                          value={adminPasscode}
                          onChange={(e) => setAdminPasscode(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0"
                        >
                          Submit
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

          {/* Navigation Links */}
          <div className="p-4 flex flex-col gap-1">
            <span className="text-[9px] font-mono font-bold text-slate-300/60 uppercase tracking-wider mb-2 block px-3">Curriculum Views</span>
            
            <button
              onClick={() => setActiveTab('program')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all duration-150 border-l-4 ${
                activeTab === 'program' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
            >
              <Award size={15} /> Program Profile & PLOs
            </button>

            <button
              disabled={isSandboxMode}
              onClick={() => !isSandboxMode && setActiveTab('course-outlines')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                activeTab === 'course-outlines' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : isSandboxMode 
                    ? 'text-slate-400/50 cursor-not-allowed border-transparent' 
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
              title={isSandboxMode ? "Locked in Faculty Sandbox Mode" : undefined}
            >
              <span className="flex items-center gap-3">
                <FileText size={15} /> Course Outlines
              </span>
              {isSandboxMode && <Lock size={12} className="text-slate-500/60" />}
            </button>

            <button
              disabled={isSandboxMode}
              onClick={() => !isSandboxMode && setActiveTab('courses')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                activeTab === 'courses' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : isSandboxMode 
                    ? 'text-slate-400/50 cursor-not-allowed border-transparent' 
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
              title={isSandboxMode ? "Locked in Faculty Sandbox Mode" : undefined}
            >
              <span className="flex items-center gap-3">
                <BookOpen size={15} /> CLO-PLO mapping
              </span>
              {isSandboxMode && <Lock size={12} className="text-slate-500/60" />}
            </button>

            <span className="text-[9px] font-mono font-bold text-slate-300/60 uppercase tracking-wider mt-5 mb-2 block px-3">Mapping Tools</span>

            <button
              disabled={isSandboxMode}
              onClick={() => !isSandboxMode && setActiveTab('visual-mapping')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                activeTab === 'visual-mapping' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : isSandboxMode 
                    ? 'text-slate-400/50 cursor-not-allowed border-transparent' 
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
              title={isSandboxMode ? "Locked in Faculty Sandbox Mode" : undefined}
            >
              <span className="flex items-center gap-3">
                <Map size={15} /> Curriculum Pathway Tree
              </span>
              {isSandboxMode && <Lock size={12} className="text-slate-500/60" />}
            </button>

            <button
              disabled={isSandboxMode}
              onClick={() => !isSandboxMode && setActiveTab('coverage')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                activeTab === 'coverage' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : isSandboxMode 
                    ? 'text-slate-400/50 cursor-not-allowed border-transparent' 
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
              title={isSandboxMode ? "Locked in Faculty Sandbox Mode" : undefined}
            >
              <span className="flex items-center gap-3">
                <Table size={15} /> PLO Coverage Matrix
              </span>
              {isSandboxMode && <Lock size={12} className="text-slate-500/60" />}
            </button>

            <button
              disabled={isSandboxMode}
              onClick={() => !isSandboxMode && setActiveTab('assignments')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                activeTab === 'assignments' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : isSandboxMode 
                    ? 'text-slate-400/50 cursor-not-allowed border-transparent' 
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
              title={isSandboxMode ? "Locked in Faculty Sandbox Mode" : undefined}
            >
              <span className="flex items-center gap-3">
                <FileSpreadsheet size={15} /> Syllabus Assessments
              </span>
              {isSandboxMode && <Lock size={12} className="text-slate-500/60" />}
            </button>

            <button
              disabled={isSandboxMode}
              onClick={() => !isSandboxMode && setActiveTab('students')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                activeTab === 'students' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : isSandboxMode 
                    ? 'text-slate-400/50 cursor-not-allowed border-transparent' 
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
              title={isSandboxMode ? "Locked in Faculty Sandbox Mode" : undefined}
            >
              <span className="flex items-center gap-3">
                <Users size={15} /> Student Proficiency Log
              </span>
              {isSandboxMode && <Lock size={12} className="text-slate-500/60" />}
            </button>

            <span className="text-[9px] font-mono font-bold text-slate-300/60 uppercase tracking-wider mt-5 mb-2 block px-3">Configuration</span>

            <button
              disabled={isSandboxMode}
              onClick={() => !isSandboxMode && setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all duration-150 border-l-4 ${
                activeTab === 'settings' 
                  ? 'bg-white/15 text-white border-blue-400 shadow-sm shadow-black/10' 
                  : isSandboxMode 
                    ? 'text-slate-400/50 cursor-not-allowed border-transparent' 
                    : 'text-slate-300/80 hover:bg-white/5 hover:text-white border-transparent'
              }`}
              title={isSandboxMode ? "Locked in Faculty Sandbox Mode" : undefined}
            >
              <span className="flex items-center gap-3">
                <SettingsIcon size={15} /> Threshold Settings
              </span>
              {isSandboxMode && <Lock size={12} className="text-slate-500/60" />}
            </button>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">MBA Curriculum</span>
            <span className="text-xs text-slate-300 font-mono">/</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {activeTab === 'program' && 'Program Profile & PLOs'}
              {activeTab === 'course-outlines' && 'Course Outlines'}
              {activeTab === 'courses' && 'CLO-PLO mapping'}
              {activeTab === 'visual-mapping' && 'Pathway Tree'}
              {activeTab === 'coverage' && 'Coverage Matrix'}
              {activeTab === 'assignments' && 'Syllabus Assessments'}
              {activeTab === 'students' && 'Student Proficiency Log'}
              {activeTab === 'settings' && 'Threshold Settings'}
            </span>
          </div>

          {/* Mode Switcher */}
          {userRole === 'faculty_guest' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm">
              <Lock size={13} className="text-white" />
              <span>Faculty Sandbox Reviewer</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                onClick={() => setIsSandboxMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  !isSandboxMode
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShieldCheck size={13} className={!isSandboxMode ? 'text-blue-600' : 'text-slate-400'} />
                Normal Admin Mode
              </button>
              <button
                onClick={() => setIsSandboxMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  isSandboxMode
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Lock size={13} className={isSandboxMode ? 'text-white' : 'text-slate-400'} />
                Faculty Sandbox Mode
              </button>
            </div>
          )}

          {/* Auth Widgets */}
          <div className="flex items-center gap-4">
            {userRole === 'faculty_guest' ? (
              <button
                onClick={handleExitGuestSession}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition border border-slate-200 shadow-sm"
              >
                <LogOut size={12} /> Exit Review Session
              </button>
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                  <ShieldCheck size={12} />
                  <span className="font-bold uppercase tracking-wider text-[9px]">Authorized</span>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {currentUser.email ? currentUser.email[0].toUpperCase() : 'A'}
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 text-slate-400 hover:text-slate-600 transition rounded-lg hover:bg-slate-100"
                    title="Sign Out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSandboxSignIn}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-200 transition"
                >
                  Sandbox Mode
                </button>
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <LogIn size={11} /> Sign In
                </button>
              </div>
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

        {/* Faculty Sandbox Mode active banner */}
        {isSandboxMode && (
          <div className="bg-amber-50 border-b border-amber-200 py-3.5 px-8 flex justify-between items-center text-xs text-amber-900 shrink-0 shadow-inner animate-fadeIn">
            <div className="flex items-center gap-3">
              <Lock size={15} className="text-amber-500 shrink-0 animate-pulse" />
              <div>
                <span className="font-bold text-amber-950">Faculty Sandbox Mode is Active. </span>
                <span className="text-slate-650">
                  {userRole === 'faculty_guest'
                    ? "You are logged in as a Faculty guest reviewer. All editing & administration tabs are locked so you can evaluate the 9 PLOs and rubrics. Click on \"View Rubrics\" on any outcome to inspect the levels and submit comments."
                    : "This mode freezes all editing, mapping, and secondary views so you can review the 9 PLOs and Assessment Rubrics safely. Click on \"View Rubrics\" below to inspect the evaluation levels!"
                  }
                </span>
              </div>
            </div>
            {userRole !== 'faculty_guest' && (
              <button
                onClick={() => setIsSandboxMode(false)}
                className="text-xs font-bold bg-white text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition shadow-sm font-sans shrink-0 ml-4 cursor-pointer"
              >
                Disable Sandbox (Exit to Admin)
              </button>
            )}
          </div>
        )}

        {/* Main Sandbox alert if not signed in */}
        {!currentUser && !isSandboxMode && (
          <div className="bg-blue-50 border-b border-blue-100 py-2.5 px-8 flex justify-between items-center text-xs text-blue-800 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-blue-500 shrink-0" />
              <span>You are currently in **View-Only Mode**. To edit courses, outcomes, or mappings, please click **Sandbox Mode** above.</span>
            </div>
            <button
              onClick={handleSandboxSignIn}
              className="font-bold underline text-blue-950 hover:text-blue-900 shrink-0 ml-4"
            >
              Authorize Edit
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
                  To populate your Firestore database with the complete UCW MBA curriculum mappings: 
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
                    plos={plos}
                    onUpdateProgramInfo={handleUpdateProgramInfo}
                    onUpdatePlos={handleUpdatePlos}
                    isSandboxMode={isSandboxMode}
                    comments={comments}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onUpvotePlo={handleUpvotePlo}
                    onUpvoteComment={handleUpvoteComment}
                    userRole={userRole}
                    voterId={voterId}
                  />
                )}

                {activeTab === 'course-outlines' && (
                  <CourseOutlinesTab
                    courses={courses}
                    onUpdateCourse={handleUpdateCourse}
                  />
                )}

                {activeTab === 'courses' && (
                  <CoursesTab
                    courses={courses}
                    plos={plos}
                    mappings={mappings}
                    thresholdTerm={settings.thresholdTerm}
                    onUpdateCourse={handleUpdateCourse}
                    onUpdateMappings={handleUpdateMappings}
                  />
                )}

                {activeTab === 'visual-mapping' && (
                  <VisualMappingTab
                    courses={courses}
                    plos={plos}
                    mappings={mappings}
                  />
                )}

                {activeTab === 'coverage' && (
                  <CoverageTab
                    courses={courses}
                    plos={plos}
                    mappings={mappings}
                    thresholdTerm={settings.thresholdTerm}
                  />
                )}

                {activeTab === 'assignments' && (
                  <AssignmentsTab
                    courses={courses}
                    plos={plos}
                    assignments={assignments}
                    onUpdateAssignments={handleUpdateAssignments}
                  />
                )}

                {activeTab === 'students' && (
                  <StudentProficiencyTab
                    students={students}
                    courses={courses}
                    plos={plos}
                    assignments={assignments}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTab
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                    onResetToDefaults={triggerDbSeed}
                    isSeeding={isSeeding}
                  />
                )}
              </div>
            )}
          </div>
        </main>

        {/* Sticky Status Footer bar */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-8 text-center text-[10px] font-bold text-slate-400 font-mono tracking-wider shrink-0 uppercase">
          UCW MBA CURRICULUM DESIGN WORKSPACE // POWERED BY GOOGLE CLOUD FIRESTORE
        </footer>

        {/* Floating Curriculum Specialist Chatbot */}
        {!isSandboxMode && (
          <CurriculumChatbot 
            courses={courses} 
            plos={plos} 
            mappings={mappings} 
          />
        )}
      </div>
    </div>
  );
}
