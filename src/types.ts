export interface AcademicProgram {
  id: string; // e.g., "mba", "bcom"
  code: string; // e.g., "MBA", "BCom"
  name: string; // e.g., "Master of Business Administration (MBA)"
  degreeLevel: 'Graduate' | 'Undergraduate' | 'Certificate';
  accreditation?: string;
  description: string;
  objectives: string;
  termsCount: number; // e.g., 4 for MBA, 8 for BCom
  termLabel: string; // e.g., "Term" or "Semester" or "Quarter"
  createdAt?: string;
}

export interface PLODimension {
  id: string; // e.g., "1.1", "1.2"
  name: string;
  rubric: {
    exceeds: string;
    meets: string;
    doesNotMeet: string;
  };
}

export interface PLO {
  id: string; // e.g., "PLO1"
  programId?: string; // e.g., "mba", "bcom"
  verb: string; // e.g., "Define"
  text: string;
  bloomLevel: string; // e.g., "Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"
  order: number;
  shortNotation?: string; // e.g., "Strategic Responses"
  dimensions?: PLODimension[];
  highlightedVerbs?: string[];
}

export interface CLO {
  id: string; // e.g., "CLO1"
  verb: string; // e.g., "Identify"
  text: string;
}

export interface CourseOutlineData {
  department: string;
  credits: string;
  prerequisites: string;
  corequisites: string;
  nonCourseReqs: string;
  mainTopics: string;
  assessments: { type: string; count: string; weight: string; total: string; }[];
  requiredMaterials: string;
  optionalMaterials: string;
  hours: {
    lecture: string;
    seminar: string;
    lab: string;
    totalHours: string;
    totalWeeks: string;
    field: string;
    otherSpecify: string;
    otherContact: string;
  };
  passingGrade: string;
  grading: string;
  graduationReqs: string;
  dimensionsOfKnowledge: {
    depthAndBreadth: string;
    knowledgeOfMethodologies: string;
    applicationOfKnowledge: string;
    communicationSkills: string;
    awarenessOfLimits: string;
    professionalCapacity: string;
  };
}

export interface Course {
  id: string; // e.g., "BUSI601"
  programId?: string; // e.g., "mba", "bcom"
  code: string; // e.g., "BUSI 601"
  name: string;
  description: string;
  term: number; // Term 1-12
  clos: CLO[];
  outline?: CourseOutlineData;
}

export interface Mapping {
  id: string; // "active" or "bcom_active"
  programId?: string;
  mappings: {
    [key: string]: string[]; // key: "courseId_cloId", value: Array of PLO IDs (e.g. ["PLO1", "PLO2"])
  };
}

export interface FeedbackLevelSettings {
  plo: boolean;       // PLO statement & verb level
  dimension: boolean; // Dimension level
  rubric: boolean;    // Rubric criteria (Exceeds/Meets/DoesNotMeet) level
}

export interface Setting {
  id: string; // "mba_general" or "bcom_general"
  programId?: string;
  thresholdTerm: number;
  thresholdProgram: number;
  facultySandboxEnabled?: boolean;
  feedbackLevels?: FeedbackLevelSettings;
  activeRoundId?: string;
  activeRoundName?: string;
}

export interface Assignment {
  id: string;
  name: string;
  weight: number; // e.g., 20 for 20%
  clos: string[]; // CLO IDs covered
  plos: string[]; // PLO IDs covered
}

export interface CourseAssignments {
  courseId: string;
  items: Assignment[];
}

export interface Student {
  id: string;
  programId?: string;
  name: string;
  email: string;
  avatar: string;
  grades: {
    [courseId: string]: {
      [assignmentId: string]: number; // score in % (0 - 100)
    };
  };
}

export interface FacultyComment {
  id: string;
  programId?: string;
  roundId?: string; // e.g., "mba_round_july_2026"
  roundName?: string; // e.g., "July 2026"
  ploId: string;
  targetType: 'description' | 'dimension' | 'metric';
  dimensionId?: string; // only if targetType is 'dimension' or 'metric'
  metricType?: 'exceeds' | 'meets' | 'doesNotMeet'; // only if targetType is 'metric'
  commentText: string;
  authorName: string;
  createdAt: string; // ISO string
  upvotes?: string[];
}

export interface FeedbackRound {
  id: string; // e.g., "mba_round_july_2026"
  programId: string; // e.g., "mba", "bcom"
  name: string; // e.g., "July 2026"
  status: 'active' | 'archived';
  createdAt: string;
  archivedAt?: string;
  plosSnapshot: PLO[]; // Frozen snapshot of PLOs associated with this comment round
}


