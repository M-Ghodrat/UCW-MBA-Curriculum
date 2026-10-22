import React, { useState } from 'react';
import { Course, CourseOutlineData, CLO } from '../types';
import { BookOpen, Save, Layers, ChevronRight, FileText, Trash2, Plus, AlertTriangle, ShieldAlert, X } from 'lucide-react';

interface CourseOutlinesTabProps {
  courses: Course[];
  onUpdateCourse: (course: Course) => Promise<void>;
  onDeleteCourse?: (courseId: string) => Promise<void>;
  onAddTerm?: () => Promise<void>;
  onDeleteTerm?: (termNumber?: number) => Promise<void>;
  termsCount?: number;
  termLabel?: string;
  programId?: string;
}

const DEFAULT_OUTLINE: CourseOutlineData = {
  department: '',
  credits: '',
  prerequisites: '',
  corequisites: '',
  nonCourseReqs: '',
  mainTopics: '',
  assessments: [
    { type: '', count: '', weight: '', total: '' },
    { type: '', count: '', weight: '', total: '' },
    { type: '', count: '', weight: '', total: '' }
  ],
  requiredMaterials: '',
  optionalMaterials: '',
  hours: {
    lecture: '',
    seminar: '',
    lab: '',
    totalHours: '',
    totalWeeks: '',
    field: '',
    otherSpecify: '',
    otherContact: ''
  },
  passingGrade: '',
  grading: '',
  graduationReqs: '',
  dimensionsOfKnowledge: {
    depthAndBreadth: '',
    knowledgeOfMethodologies: '',
    applicationOfKnowledge: '',
    communicationSkills: '',
    awarenessOfLimits: '',
    professionalCapacity: ''
  }
};

export default function CourseOutlinesTab({ 
  courses, 
  onUpdateCourse,
  onDeleteCourse,
  onAddTerm,
  onDeleteTerm,
  termsCount = 4,
  termLabel = 'Term',
  programId = 'mba'
}: CourseOutlinesTabProps) {
  const [activeTerm, setActiveTerm] = useState<number>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [termToDelete, setTermToDelete] = useState<number | null>(null);

  // Add Course state
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseTerm, setNewCourseTerm] = useState<number>(1);
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('3.0');
  const [newCourseDept, setNewCourseDept] = useState('');
  const [newCourseClos, setNewCourseClos] = useState<{ verb: string; text: string }[]>([]);

  const termCourses = courses.filter(c => c.term === activeTerm);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const handleAddNewCourseClo = () => {
    setNewCourseClos(prev => [...prev, { verb: 'Apply', text: '' }]);
  };

  const handleUpdateNewCourseClo = (index: number, field: 'verb' | 'text', val: string) => {
    const updated = [...newCourseClos];
    updated[index] = { ...updated[index], [field]: val };
    setNewCourseClos(updated);
  };

  const handleRemoveNewCourseClo = (index: number) => {
    setNewCourseClos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateNewCourse = async () => {
    if (!newCourseCode.trim() || !newCourseName.trim()) return;

    const cleanId = `${programId === 'mba' ? '' : `${programId}_`}${newCourseCode.replace(/\s+/g, '').toUpperCase()}`;
    const targetTerm = Number(newCourseTerm) || activeTerm;

    const userDefinedClos: CLO[] = newCourseClos
      .filter(c => c.text.trim().length > 0)
      .map((c, i) => ({
        id: `CLO${i + 1}`,
        verb: c.verb.trim() || 'Apply',
        text: c.text.trim()
      }));

    const newCourse: Course = {
      id: cleanId,
      programId: programId,
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      description: newCourseDesc.trim() || 'No syllabus description provided yet.',
      term: targetTerm,
      clos: userDefinedClos,
      outline: {
        ...DEFAULT_OUTLINE,
        department: newCourseDept.trim() || (programId === 'bcom' ? 'Bachelor of Commerce' : 'Master of Business Administration'),
        credits: newCourseCredits.trim() || '3.0'
      }
    };

    setIsSaving(true);
    try {
      await onUpdateCourse(newCourse);
      setActiveTerm(targetTerm);
      setSelectedCourseId(newCourse.id);
      setIsAddingCourse(false);
      setNewCourseCode('');
      setNewCourseName('');
      setNewCourseDesc('');
      setNewCourseCredits('3.0');
      setNewCourseDept('');
      setNewCourseClos([]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateField = async (fieldPath: string, value: string) => {
    if (!selectedCourse) return;
    const currentOutline = selectedCourse.outline || DEFAULT_OUTLINE;
    
    let updatedOutline = { ...currentOutline };
    
    if (fieldPath.includes('.')) {
      const [obj, key] = fieldPath.split('.');
      if (obj === 'hours') {
        updatedOutline.hours = { ...updatedOutline.hours, [key]: value };
      } else if (obj === 'dimensionsOfKnowledge') {
        updatedOutline.dimensionsOfKnowledge = { ...updatedOutline.dimensionsOfKnowledge, [key]: value };
      }
    } else {
      updatedOutline = { ...updatedOutline, [fieldPath]: value };
    }

    const updatedCourse = { ...selectedCourse, outline: updatedOutline };
    setIsSaving(true);
    try {
      await onUpdateCourse(updatedCourse);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCourseProperty = async (field: keyof Course, value: string) => {
    if (!selectedCourse) return;
    const updatedCourse = { ...selectedCourse, [field]: value };
    setIsSaving(true);
    try {
      await onUpdateCourse(updatedCourse);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAssessment = async (index: number, field: keyof CourseOutlineData['assessments'][0], value: string) => {
    if (!selectedCourse) return;
    const currentOutline = selectedCourse.outline || DEFAULT_OUTLINE;
    const newAssessments = [...currentOutline.assessments];
    newAssessments[index] = { ...newAssessments[index], [field]: value };
    
    const updatedOutline = { ...currentOutline, assessments: newAssessments };
    const updatedCourse = { ...selectedCourse, outline: updatedOutline };
    setIsSaving(true);
    try {
      await onUpdateCourse(updatedCourse);
    } finally {
      setIsSaving(false);
    }
  };

  const addAssessmentRow = async () => {
    if (!selectedCourse) return;
    const currentOutline = selectedCourse.outline || DEFAULT_OUTLINE;
    const newAssessments = [...currentOutline.assessments, { type: '', count: '', weight: '', total: '' }];
    
    const updatedOutline = { ...currentOutline, assessments: newAssessments };
    const updatedCourse = { ...selectedCourse, outline: updatedOutline };
    setIsSaving(true);
    try {
      await onUpdateCourse(updatedCourse);
    } finally {
      setIsSaving(false);
    }
  };

  const removeAssessmentRow = async (index: number) => {
    if (!selectedCourse) return;
    const currentOutline = selectedCourse.outline || DEFAULT_OUTLINE;
    const newAssessments = [...currentOutline.assessments];
    newAssessments.splice(index, 1);
    
    const updatedOutline = { ...currentOutline, assessments: newAssessments };
    const updatedCourse = { ...selectedCourse, outline: updatedOutline };
    setIsSaving(true);
    try {
      await onUpdateCourse(updatedCourse);
    } finally {
      setIsSaving(false);
    }
  };

  const addCloRow = async () => {
    if (!selectedCourse) return;
    const newClos = [...selectedCourse.clos, { id: `CLO${Date.now()}`, verb: '', text: '' }];
    const updatedCourse = { ...selectedCourse, clos: newClos };
    setIsSaving(true);
    try {
      await onUpdateCourse(updatedCourse);
    } finally {
      setIsSaving(false);
    }
  };

  const removeCloRow = async (index: number) => {
    if (!selectedCourse) return;
    const newClos = [...selectedCourse.clos];
    newClos.splice(index, 1);
    const updatedCourse = { ...selectedCourse, clos: newClos };
    setIsSaving(true);
    try {
      await onUpdateCourse(updatedCourse);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} /> Course Outlines
            </h2>
            <p className="text-xs text-slate-500 mt-1">Select a course to edit its official outline document.</p>
          </div>
          <button
            onClick={() => {
              setNewCourseTerm(activeTerm);
              setIsAddingCourse(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} /> Add Course
          </button>
        </div>

        {/* Term Tabs */}
        <div className="border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar">
            {Array.from({ length: termsCount }, (_, i) => i + 1).map((term) => (
              <button
                key={term}
                onClick={() => { setActiveTerm(term); setSelectedCourseId(null); }}
                className={`py-4 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTerm === term
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                {termLabel} {term}
              </button>
            ))}

            {onAddTerm && (
              <button
                onClick={onAddTerm}
                className="py-1.5 px-3 my-2 text-xs font-bold text-blue-600 bg-blue-50/70 hover:bg-blue-100 rounded-lg border border-dashed border-blue-300 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 self-center"
                title={`Add new ${termLabel}`}
              >
                <Plus size={12} /> Add {termLabel} {termsCount + 1}
              </button>
            )}

            {onDeleteTerm && termsCount > 1 && (
              <button
                onClick={() => setTermToDelete(activeTerm)}
                className="py-1.5 px-2.5 my-2 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 self-center"
                title={`Delete ${termLabel} ${activeTerm}`}
              >
                <Trash2 size={12} /> Delete {termLabel} {activeTerm}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px]">
          {/* Course List Sidebar */}
          <div className="md:col-span-1 border-r border-slate-200 bg-slate-50/30 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courses</h3>
                <button
                  onClick={() => {
                    setNewCourseTerm(activeTerm);
                    setIsAddingCourse(true);
                  }}
                  className="p-1 hover:bg-blue-50 text-blue-600 rounded-md transition cursor-pointer"
                  title="Add Course"
                >
                  <Plus size={15} />
                </button>
              </div>
              <div className="space-y-1">
                {termCourses.map(course => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCourseId === course.id
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{course.code}</span>
                    <ChevronRight size={14} className={selectedCourseId === course.id ? 'text-blue-500' : 'text-slate-300'} />
                  </button>
                ))}
                {termCourses.length === 0 && (
                  <div className="text-center py-6 px-2">
                    <p className="text-xs text-slate-400 italic mb-3">No courses in this {termLabel.toLowerCase()}.</p>
                    <button
                      onClick={() => {
                        setNewCourseTerm(activeTerm);
                        setIsAddingCourse(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold border border-blue-200 transition cursor-pointer"
                    >
                      <Plus size={13} /> Add Course
                    </button>
                  </div>
                )}
              </div>
            </div>
            {termCourses.length > 0 && (
              <div className="pt-4 border-t border-slate-200/60 mt-4">
                <button
                  onClick={() => {
                    setNewCourseTerm(activeTerm);
                    setIsAddingCourse(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition cursor-pointer"
                >
                  <Plus size={13} className="text-blue-600" /> Add Course
                </button>
              </div>
            )}
          </div>

          {/* Course Outline Editor */}
          <div className="md:col-span-3 p-8 bg-white">
            {!selectedCourse ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <BookOpen size={48} className="text-slate-200 mb-4" />
                <p className="text-sm font-medium mb-3">
                  {termCourses.length > 0
                    ? 'Select a course from the sidebar to view or edit its outline.'
                    : `No courses in ${termLabel} ${activeTerm} yet.`}
                </p>
                <button
                  onClick={() => {
                    setNewCourseTerm(activeTerm);
                    setIsAddingCourse(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Plus size={15} /> Add Course to {termLabel} {activeTerm}
                </button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto border border-slate-300 rounded-lg shadow-sm">
                <div className="bg-slate-50 border-b border-slate-300 p-4 flex justify-between items-center">
                  <div className="text-xl font-bold text-slate-800 uppercase tracking-widest">Course Outline</div>
                  {onDeleteCourse && (
                    <button
                      onClick={() => setCourseToDelete(selectedCourse)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
                      title="Delete this course"
                    >
                      <Trash2 size={13} /> Delete Course
                    </button>
                  )}
                </div>

                <div className="text-sm text-slate-800">
                  {/* Basic Info Table */}
                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-4 bg-slate-100 font-bold p-2 border-r border-slate-300">Department or Program:</div>
                    <div className="col-span-8 p-0">
                      <input 
                        type="text" 
                        value={selectedCourse.outline?.department || ''} 
                        onChange={(e) => handleUpdateField('department', e.target.value)}
                        className="w-full h-full p-2 outline-none focus:bg-blue-50"
                        placeholder="#"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-4 bg-slate-100 font-bold p-2 border-r border-slate-300">Prefix & Code:</div>
                    <div className="col-span-3 p-0 border-r border-slate-300">
                      <input 
                        type="text" 
                        value={selectedCourse.code} 
                        onChange={(e) => handleUpdateCourseProperty('code', e.target.value)}
                        className="w-full h-full p-2 outline-none focus:bg-blue-50 font-mono text-slate-600 bg-transparent"
                        placeholder="#"
                      />
                    </div>
                    <div className="col-span-2 bg-slate-100 font-bold p-2 border-r border-slate-300">Credits:</div>
                    <div className="col-span-3 p-0">
                      <input 
                        type="text" 
                        value={selectedCourse.outline?.credits || ''} 
                        onChange={(e) => handleUpdateField('credits', e.target.value)}
                        className="w-full h-full p-2 outline-none focus:bg-blue-50"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-4 bg-slate-100 font-bold p-2 border-r border-slate-300">Title:</div>
                    <div className="col-span-8 p-0">
                      <input 
                        type="text" 
                        value={selectedCourse.name} 
                        onChange={(e) => handleUpdateCourseProperty('name', e.target.value)}
                        className="w-full h-full p-2 outline-none focus:bg-blue-50 text-slate-600 font-medium bg-transparent"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  {/* Course Description */}
                  <div className="border-b border-slate-300">
                    <div className="bg-slate-100 font-bold p-2 border-b border-slate-300">Course Description:</div>
                    <div className="p-0">
                      <textarea 
                        value={selectedCourse.description} 
                        onChange={(e) => handleUpdateCourseProperty('description', e.target.value)}
                        className="w-full p-2 text-slate-600 bg-transparent outline-none resize-y min-h-[80px] focus:bg-blue-50"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  {/* Requisites */}
                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-4 bg-slate-100 font-bold p-2 border-r border-slate-300">Prerequisites:</div>
                    <div className="col-span-8 p-0">
                      <input 
                        type="text" 
                        value={selectedCourse.outline?.prerequisites || ''} 
                        onChange={(e) => handleUpdateField('prerequisites', e.target.value)}
                        className="w-full h-full p-2 outline-none focus:bg-blue-50"
                        placeholder="#"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-4 bg-slate-100 font-bold p-2 border-r border-slate-300">Co-requisites:</div>
                    <div className="col-span-8 p-0">
                      <input 
                        type="text" 
                        value={selectedCourse.outline?.corequisites || ''} 
                        onChange={(e) => handleUpdateField('corequisites', e.target.value)}
                        className="w-full h-full p-2 outline-none focus:bg-blue-50"
                        placeholder="#"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-4 bg-slate-100 font-bold p-2 border-r border-slate-300">Non-Course Pre-requisite/<br/>Co-requisite:</div>
                    <div className="col-span-8 p-0">
                      <textarea 
                        value={selectedCourse.outline?.nonCourseReqs || ''} 
                        onChange={(e) => handleUpdateField('nonCourseReqs', e.target.value)}
                        className="w-full h-full p-2 outline-none focus:bg-blue-50 resize-y min-h-[50px]"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  {/* SLOs */}
                  <div className="border-b border-slate-300">
                    <div className="bg-slate-100 font-bold p-2 border-b border-slate-300 flex justify-between items-center">
                      <span>Student Learning Outcomes (max. 6):</span>
                      {selectedCourse.clos.length < 6 && (
                        <button onClick={addCloRow} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition">
                          <Plus size={14} /> Add Outcome
                        </button>
                      )}
                    </div>
                    <div className="p-0">
                      <div className="flex flex-col">
                        {selectedCourse.clos.slice(0, 6).map((clo, i) => (
                          <div key={clo.id} className="flex border-b border-slate-200 last:border-0 relative">
                            <div className="w-8 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50 border-r border-slate-200">
                              {i + 1}.
                            </div>
                            <input 
                              type="text" 
                              value={`${clo.verb} ${clo.text}`.trim()} 
                              onChange={(e) => {
                                const val = e.target.value;
                                const splitIndex = val.indexOf(' ');
                                const verb = splitIndex > -1 ? val.substring(0, splitIndex) : val;
                                const text = splitIndex > -1 ? val.substring(splitIndex + 1) : '';
                                
                                const newClos = [...selectedCourse.clos];
                                newClos[i] = { ...newClos[i], verb, text };
                                handleUpdateCourseProperty('clos', newClos as any);
                              }}
                              className="flex-1 p-2 outline-none focus:bg-blue-50 text-slate-600 bg-transparent"
                              placeholder="Enter learning outcome..."
                            />
                            <button 
                              onClick={() => removeCloRow(i)}
                              className="p-2 text-slate-400 hover:text-red-500 transition border-l border-slate-200 flex items-center justify-center w-10 shrink-0 bg-slate-50"
                              title="Delete CLO"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                        {selectedCourse.clos.length === 0 && (
                          <div className="p-3 italic text-slate-400">No CLOs defined. Click "Add Outcome" to create one.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Topics */}
                  <div className="border-b border-slate-300">
                    <div className="bg-slate-100 font-bold p-2 border-b border-slate-300">Main Topics:</div>
                    <div className="p-0">
                      <textarea 
                        value={selectedCourse.outline?.mainTopics || ''} 
                        onChange={(e) => handleUpdateField('mainTopics', e.target.value)}
                        className="w-full p-2 outline-none focus:bg-blue-50 resize-y min-h-[100px]"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  {/* Assessments Table */}
                  <div className="border-b border-slate-300">
                    <div className="bg-slate-100 font-bold p-2 border-b border-slate-300">Student Performance Assessments and Weighting:</div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border-b border-slate-300 border-r p-2 text-left w-[35%]">Assessment type</th>
                          <th className="border-b border-slate-300 border-r p-2 text-left w-[20%]">Count</th>
                          <th className="border-b border-slate-300 border-r p-2 text-left w-[25%]">Weight per assessment (%)</th>
                          <th className="border-b border-slate-300 p-2 text-left w-[20%]">Total %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedCourse.outline?.assessments || DEFAULT_OUTLINE.assessments).map((ass, i) => (
                          <tr key={i} className="border-b border-slate-200">
                            <td className="border-r border-slate-300 p-0">
                              <div className="flex items-center">
                                <input type="text" value={ass.type} onChange={e => handleUpdateAssessment(i, 'type', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50 bg-transparent" placeholder="#" />
                                <button 
                                  onClick={() => removeAssessmentRow(i)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0 border-l border-slate-200 bg-slate-50"
                                  title="Delete row"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                            <td className="border-r border-slate-300 p-0">
                              <input type="text" value={ass.count} onChange={e => handleUpdateAssessment(i, 'count', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50" placeholder="#" />
                            </td>
                            <td className="border-r border-slate-300 p-0">
                              <input type="text" value={ass.weight} onChange={e => handleUpdateAssessment(i, 'weight', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50" placeholder="#" />
                            </td>
                            <td className="p-0">
                              <input type="text" value={ass.total} onChange={e => handleUpdateAssessment(i, 'total', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50" placeholder="#" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-1 bg-slate-50 border-t border-slate-300 text-center">
                      <button onClick={addAssessmentRow} className="text-xs text-blue-600 font-bold hover:underline">+ Add row</button>
                    </div>
                  </div>

                  {/* Required Books */}
                  <div className="border-b border-slate-300">
                    <div className="bg-slate-100 font-bold p-2 border-b border-slate-300">Required Books or Materials:</div>
                    <div className="p-0">
                      <textarea 
                        value={selectedCourse.outline?.requiredMaterials || ''} 
                        onChange={(e) => handleUpdateField('requiredMaterials', e.target.value)}
                        className="w-full p-2 outline-none focus:bg-blue-50 resize-y min-h-[60px]"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  <div className="border-b border-slate-300">
                    <div className="bg-slate-100 font-bold p-2 border-b border-slate-300">Additional Optional Resources:</div>
                    <div className="p-0">
                      <textarea 
                        value={selectedCourse.outline?.optionalMaterials || ''} 
                        onChange={(e) => handleUpdateField('optionalMaterials', e.target.value)}
                        className="w-full p-2 outline-none focus:bg-blue-50 resize-y min-h-[60px]"
                        placeholder="#"
                      />
                    </div>
                  </div>

                  {/* Instructional Hours */}
                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-3 bg-slate-100 font-bold p-2 border-r border-slate-300">Instructional Hours:</div>
                    <div className="col-span-3 p-0 border-r border-slate-300 flex items-center px-2">
                      <span className="text-slate-500 whitespace-nowrap">In class:</span>
                      <input type="text" value={selectedCourse.outline?.hours?.lecture || ''} onChange={(e) => handleUpdateField('hours.lecture', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50 ml-1" placeholder="#" />
                    </div>
                    <div className="col-span-3 p-0 border-r border-slate-300 flex items-center px-2">
                      <span className="text-slate-500 whitespace-nowrap">Seminar:</span>
                      <input type="text" value={selectedCourse.outline?.hours?.seminar || ''} onChange={(e) => handleUpdateField('hours.seminar', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50 ml-1" placeholder="#" />
                    </div>
                    <div className="col-span-3 p-0 flex items-center px-2">
                      <span className="text-slate-500 whitespace-nowrap">Lab:</span>
                      <input type="text" value={selectedCourse.outline?.hours?.lab || ''} onChange={(e) => handleUpdateField('hours.lab', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50 ml-1" placeholder="#" />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-3 bg-slate-100 font-bold p-2 border-r border-slate-300 text-xs flex flex-col justify-center">
                      <div className="flex items-center">Total Hours: <input type="text" value={selectedCourse.outline?.hours?.totalHours || ''} onChange={(e) => handleUpdateField('hours.totalHours', e.target.value)} className="w-12 p-1 ml-1 outline-none bg-transparent font-normal border-b border-dashed border-slate-400 focus:bg-blue-50" placeholder="#" /></div>
                      <div className="flex items-center mt-1">Total Weeks: <input type="text" value={selectedCourse.outline?.hours?.totalWeeks || ''} onChange={(e) => handleUpdateField('hours.totalWeeks', e.target.value)} className="w-12 p-1 ml-1 outline-none bg-transparent font-normal border-b border-dashed border-slate-400 focus:bg-blue-50" placeholder="#" /></div>
                    </div>
                    <div className="col-span-3 p-0 border-r border-slate-300 flex items-center px-2">
                      <span className="text-slate-500 whitespace-nowrap text-xs">Field Exp:</span>
                      <input type="text" value={selectedCourse.outline?.hours?.field || ''} onChange={(e) => handleUpdateField('hours.field', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50 ml-1" placeholder="#" />
                    </div>
                    <div className="col-span-3 p-0 border-r border-slate-300 flex items-center px-2">
                      <span className="text-slate-500 whitespace-nowrap text-xs">Other:</span>
                      <input type="text" value={selectedCourse.outline?.hours?.otherSpecify || ''} onChange={(e) => handleUpdateField('hours.otherSpecify', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50 ml-1" placeholder="#" />
                    </div>
                    <div className="col-span-3 p-0 flex items-center px-2">
                      <span className="text-slate-500 whitespace-nowrap text-xs">Other Contact:</span>
                      <input type="text" value={selectedCourse.outline?.hours?.otherContact || ''} onChange={(e) => handleUpdateField('hours.otherContact', e.target.value)} className="w-full p-2 outline-none focus:bg-blue-50 ml-1" placeholder="#" />
                    </div>
                  </div>

                  {/* Grading */}
                  <div className="grid grid-cols-12 border-b border-slate-300 mt-6 border-t">
                    <div className="col-span-3 bg-slate-100 font-bold p-2 border-r border-slate-300 flex items-center">*Passing Grade:</div>
                    <div className="col-span-6 p-0 border-r border-slate-300">
                      <input type="text" value={selectedCourse.outline?.passingGrade || ''} onChange={(e) => handleUpdateField('passingGrade', e.target.value)} className="w-full h-full p-2 outline-none focus:bg-blue-50" placeholder="[select which applicable]" />
                    </div>
                    <div className="col-span-2 bg-slate-100 font-bold p-2 border-r border-slate-300 flex items-center justify-center">*Grading:</div>
                    <div className="col-span-1 p-0">
                      <input type="text" value={selectedCourse.outline?.grading || ''} onChange={(e) => handleUpdateField('grading', e.target.value)} className="w-full h-full p-2 outline-none focus:bg-blue-50 text-center" placeholder="#" />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 border-b border-slate-300">
                    <div className="col-span-3 bg-slate-100 font-bold p-2 border-r border-slate-300 flex items-center">*Graduation<br/>Requirements:</div>
                    <div className="col-span-9 p-0">
                      <textarea value={selectedCourse.outline?.graduationReqs || ''} onChange={(e) => handleUpdateField('graduationReqs', e.target.value)} className="w-full h-full p-2 outline-none focus:bg-blue-50 min-h-[50px] resize-y" placeholder="[select which applicable]" />
                    </div>
                  </div>
                  <div className="p-1 text-[10px] text-slate-500 italic border-b border-slate-300 bg-slate-50">* Consult Academic Calendar for details</div>

                  {/* Dimensions of Knowledge Table */}
                  <div className="mt-6 border border-slate-300">
                    <div className="bg-slate-200 font-bold p-2 border-b border-slate-300 text-center">Dimensions of Knowledge:</div>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-xs">
                          <th className="border-b border-slate-300 border-r p-2 w-1/6 font-bold text-center">Depth & Breadth<br/>of Knowledge</th>
                          <th className="border-b border-slate-300 border-r p-2 w-1/6 font-bold text-center">Knowledge of<br/>Methodologies</th>
                          <th className="border-b border-slate-300 border-r p-2 w-1/6 font-bold text-center">Application of<br/>Knowledge</th>
                          <th className="border-b border-slate-300 border-r p-2 w-1/6 font-bold text-center">Communication<br/>Skills</th>
                          <th className="border-b border-slate-300 border-r p-2 w-1/6 font-bold text-center">Awareness of<br/>Limits</th>
                          <th className="border-b border-slate-300 p-2 w-1/6 font-bold text-center">Professional<br/>Capacity</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-center font-mono">
                          <td className="border-r border-slate-300 border-b p-0"><input type="text" value={selectedCourse.outline?.dimensionsOfKnowledge?.depthAndBreadth || ''} onChange={(e) => handleUpdateField('dimensionsOfKnowledge.depthAndBreadth', e.target.value)} className="w-full p-2 text-center outline-none focus:bg-blue-50" placeholder="#" /></td>
                          <td className="border-r border-slate-300 border-b p-0"><input type="text" value={selectedCourse.outline?.dimensionsOfKnowledge?.knowledgeOfMethodologies || ''} onChange={(e) => handleUpdateField('dimensionsOfKnowledge.knowledgeOfMethodologies', e.target.value)} className="w-full p-2 text-center outline-none focus:bg-blue-50" placeholder="#" /></td>
                          <td className="border-r border-slate-300 border-b p-0"><input type="text" value={selectedCourse.outline?.dimensionsOfKnowledge?.applicationOfKnowledge || ''} onChange={(e) => handleUpdateField('dimensionsOfKnowledge.applicationOfKnowledge', e.target.value)} className="w-full p-2 text-center outline-none focus:bg-blue-50" placeholder="#" /></td>
                          <td className="border-r border-slate-300 border-b p-0"><input type="text" value={selectedCourse.outline?.dimensionsOfKnowledge?.communicationSkills || ''} onChange={(e) => handleUpdateField('dimensionsOfKnowledge.communicationSkills', e.target.value)} className="w-full p-2 text-center outline-none focus:bg-blue-50" placeholder="#" /></td>
                          <td className="border-r border-slate-300 border-b p-0"><input type="text" value={selectedCourse.outline?.dimensionsOfKnowledge?.awarenessOfLimits || ''} onChange={(e) => handleUpdateField('dimensionsOfKnowledge.awarenessOfLimits', e.target.value)} className="w-full p-2 text-center outline-none focus:bg-blue-50" placeholder="#" /></td>
                          <td className="p-0 border-b border-slate-300"><input type="text" value={selectedCourse.outline?.dimensionsOfKnowledge?.professionalCapacity || ''} onChange={(e) => handleUpdateField('dimensionsOfKnowledge.professionalCapacity', e.target.value)} className="w-full p-2 text-center outline-none focus:bg-blue-50" placeholder="#" /></td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="bg-slate-50 p-2 text-xs text-slate-600 flex gap-4 items-center">
                      <span className="font-bold">Legend:</span>
                      <span><strong className="font-mono bg-slate-200 px-1 rounded">i</strong> = introduced</span>
                      <span><strong className="font-mono bg-slate-200 px-1 rounded">r</strong> = reinforced</span>
                      <span><strong className="font-mono bg-slate-200 px-1 rounded">m</strong> = mastered</span>
                      <span><strong className="font-mono bg-slate-200 px-1 rounded">**</strong> = Strong Emphasis</span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Deletion Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Delete Course</h3>
                <p className="text-xs text-slate-400">Permanently remove this course from curriculum</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Are you sure you want to delete <strong className="text-slate-800">{courseToDelete.code}: {courseToDelete.name}</strong>?
              This will remove its outline, CLOs, and all associated mappings.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (onDeleteCourse) {
                    await onDeleteCourse(courseToDelete.id);
                    setSelectedCourseId(null);
                  }
                  setCourseToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Term Deletion Confirmation Modal */}
      {termToDelete !== null && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${courses.filter(c => c.term === termToDelete).length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-rose-50 text-rose-600'}`}>
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Delete {termLabel} {termToDelete}</h3>
                <p className="text-xs text-slate-400">Program structure management</p>
              </div>
            </div>

            {courses.filter(c => c.term === termToDelete).length > 0 ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700 text-sm">
                    <ShieldAlert size={16} /> Cannot Delete {termLabel} {termToDelete}
                  </div>
                  <p>
                    There are currently <strong>{courses.filter(c => c.term === termToDelete).length} course(s)</strong> assigned to {termLabel} {termToDelete} ({courses.filter(c => c.term === termToDelete).map(c => c.code).join(', ')}).
                  </p>
                  <p className="font-semibold text-rose-950 bg-white/70 p-2 rounded-lg border border-rose-200">
                    Warning: Only when all courses in that {termLabel.toLowerCase()} are removed, the {termLabel.toLowerCase()} can be deleted too.
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Please delete or reassign all courses from {termLabel} {termToDelete} before attempting to delete this {termLabel.toLowerCase()}.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                Are you sure you want to delete {termLabel} {termToDelete}? This {termLabel.toLowerCase()} has no courses. The program structure will be reduced from {termsCount} to {termsCount - 1} {termLabel.toLowerCase()}s.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTermToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {courses.filter(c => c.term === termToDelete).length > 0 ? 'Close' : 'Cancel'}
              </button>
              {courses.filter(c => c.term === termToDelete).length === 0 && (
                <button
                  onClick={async () => {
                    if (onDeleteTerm) {
                      await onDeleteTerm(termToDelete);
                      if (activeTerm === termToDelete) {
                        setActiveTerm(Math.max(1, termToDelete - 1));
                      }
                    }
                    setTermToDelete(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  Confirm Delete {termLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddingCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Add New Course</h3>
                  <p className="text-xs text-slate-400">Create a course outline with syllabus details</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingCourse(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Course Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="e.g. COMM 201"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {termLabel} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCourseTerm}
                    onChange={(e) => setNewCourseTerm(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    {Array.from({ length: termsCount }, (_, i) => i + 1).map((t) => (
                      <option key={t} value={t}>
                        {termLabel} {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Course Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="e.g. Business Communication & Writing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Credits
                  </label>
                  <input
                    type="text"
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(e.target.value)}
                    placeholder="3.0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Department / Program
                  </label>
                  <input
                    type="text"
                    value={newCourseDept}
                    onChange={(e) => setNewCourseDept(e.target.value)}
                    placeholder="e.g. School of Business"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Overview
                </label>
                <textarea
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  rows={3}
                  placeholder="Enter a brief course overview or syllabus description..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Course Learning Outcomes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Course Learning Outcomes (CLOs)
                    </label>
                    <p className="text-[11px] text-slate-400">Add learning outcomes for this course manually (optional)</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewCourseClo}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
                  >
                    <Plus size={12} /> Add Outcome
                  </button>
                </div>

                {newCourseClos.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                    No CLOs added yet. Click &quot;Add Outcome&quot; above to add specific learning outcomes, or add them later.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {newCourseClos.map((clo, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="font-mono text-xs font-bold text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded border border-blue-200 shrink-0">
                          CLO{idx + 1}
                        </span>
                        <select
                          value={clo.verb}
                          onChange={(e) => handleUpdateNewCourseClo(idx, 'verb', e.target.value)}
                          className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shrink-0 font-medium text-slate-700"
                        >
                          <option value="Remember">Remember</option>
                          <option value="Understand">Understand</option>
                          <option value="Apply">Apply</option>
                          <option value="Analyze">Analyze</option>
                          <option value="Evaluate">Evaluate</option>
                          <option value="Create">Create</option>
                        </select>
                        <input
                          type="text"
                          value={clo.text}
                          onChange={(e) => handleUpdateNewCourseClo(idx, 'text', e.target.value)}
                          placeholder="Outcome statement..."
                          className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewCourseClo(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer shrink-0"
                          title="Remove outcome"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddingCourse(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewCourse}
                disabled={!newCourseCode.trim() || !newCourseName.trim() || isSaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Plus size={14} /> Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
