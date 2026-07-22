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
  verb: string; // e.g., "Define"
  text: string;
  bloomLevel: string; // e.g., "Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"
  order: number;
  shortNotation?: string; // e.g., "Strategic Responses"
  dimensions?: PLODimension[];
  upvotes?: string[];
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
  code: string; // e.g., "BUSI 601"
  name: string;
  description: string;
  term: number; // Term/Tier 1-4
  clos: CLO[];
  outline?: CourseOutlineData;
}

export interface Mapping {
  id: string; // "active"
  mappings: {
    [key: string]: string[]; // key: "courseId_cloId", value: Array of PLO IDs (e.g. ["PLO1", "PLO2"])
  };
}

export interface Setting {
  id: string; // "general"
  thresholdTerm: number;
  thresholdProgram: number;
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
  ploId: string;
  targetType: 'description' | 'dimension' | 'metric';
  dimensionId?: string; // only if targetType is 'dimension' or 'metric'
  metricType?: 'exceeds' | 'meets' | 'doesNotMeet'; // only if targetType is 'metric'
  commentText: string;
  authorName: string;
  createdAt: string; // ISO string
  upvotes?: string[];
}
