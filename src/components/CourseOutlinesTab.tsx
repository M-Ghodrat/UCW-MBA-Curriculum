import React, { useState } from 'react';
import { Course, CourseOutlineData } from '../types';
import { BookOpen, Save, Layers, ChevronRight, FileText, Trash2, Plus } from 'lucide-react';

interface CourseOutlinesTabProps {
  courses: Course[];
  onUpdateCourse: (course: Course) => Promise<void>;
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

export default function CourseOutlinesTab({ courses, onUpdateCourse }: CourseOutlinesTabProps) {
  const [activeTerm, setActiveTerm] = useState<number>(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const termCourses = courses.filter(c => c.term === activeTerm);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

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
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} /> Course Outlines
            </h2>
            <p className="text-xs text-slate-500 mt-1">Select a course to edit its official outline document.</p>
          </div>
        </div>

        {/* Term Tabs */}
        <div className="border-b border-slate-200 bg-white px-6">
          <div className="flex gap-6 overflow-x-auto hide-scrollbar">
            {[1, 2, 3, 4].map((term) => (
              <button
                key={term}
                onClick={() => { setActiveTerm(term); setSelectedCourseId(null); }}
                className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTerm === term
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                }`}
              >
                Term {term}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px]">
          {/* Course List Sidebar */}
          <div className="md:col-span-1 border-r border-slate-200 bg-slate-50/30 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Courses</h3>
            <div className="space-y-1">
              {termCourses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
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
                <div className="text-xs text-slate-400 px-2 italic">No courses in this term.</div>
              )}
            </div>
          </div>

          {/* Course Outline Editor */}
          <div className="md:col-span-3 p-8 bg-white">
            {!selectedCourse ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <BookOpen size={48} className="text-slate-200 mb-4" />
                <p className="text-sm font-medium">Select a course from the list to view or edit its outline.</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto border border-slate-300 rounded-lg shadow-sm">
                <div className="bg-slate-50 border-b border-slate-300 p-4 flex justify-center items-center">
                  <div className="text-xl font-bold text-slate-800 uppercase tracking-widest">Course Outline</div>
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
    </div>
  );
}
