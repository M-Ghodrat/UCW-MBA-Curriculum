import React, { useState } from 'react';
import { Course, PLO, CLO } from '../types';
import { Edit2, Plus, Trash2, Check, X, ShieldAlert, BookOpen, Layers, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

interface CoursesTabProps {
  courses: Course[];
  plos: PLO[];
  mappings: { [key: string]: string[] }; // courseId_cloId -> PLO IDs
  thresholdTerm: number;
  onUpdateCourse: (course: Course) => Promise<void>;
  onUpdateMappings: (mappings: { [key: string]: string[] }) => Promise<void>;
}

export default function CoursesTab({
  courses,
  plos,
  mappings,
  thresholdTerm,
  onUpdateCourse,
  onUpdateMappings
}: CoursesTabProps) {
  const [activeTerm, setActiveTerm] = useState<number>(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Edited course details
  const [editedName, setEditedName] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedClos, setEditedClos] = useState<CLO[]>([]);
  const [editedMappings, setEditedMappings] = useState<{ [key: string]: string[] }>({});

  // Add new course state
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Filtering courses by active term
  const termCourses = courses.filter(c => c.term === activeTerm);

  // Calculate term coverage for each PLO
  // Count how many CLOs in this term map to each PLO
  const calculatePloTermCoverage = (ploId: string): number => {
    let count = 0;
    const termCourseIds = termCourses.map(c => c.id);
    
    Object.entries(mappings).forEach(([key, ploIds]) => {
      const [courseId] = key.split('_');
      if (termCourseIds.includes(courseId) && ploIds.includes(ploId)) {
        count++;
      }
    });
    return count;
  };

  const handleStartEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setEditedName(course.name);
    setEditedDesc(course.description);
    setEditedClos([...course.clos]);

    // Initialize local mappings copy for this course
    const localCopy: { [key: string]: string[] } = {};
    course.clos.forEach(clo => {
      const key = `${course.id}_${clo.id}`;
      localCopy[key] = [...(mappings[key] || [])];
    });
    setEditedMappings(localCopy);
  };

  const handleCancelEdit = () => {
    setEditingCourseId(null);
    setEditedMappings({});
  };

  const handleSaveCourse = async (courseId: string) => {
    const originalCourse = courses.find(c => c.id === courseId);
    if (!originalCourse) return;

    const updatedCourse: Course = {
      ...originalCourse,
      name: editedName.trim(),
      description: editedDesc.trim(),
      clos: editedClos
    };

    // Prepare updated mappings
    const updatedMappings: { [key: string]: string[] } = { ...mappings };
    // Clear old mappings for this course's CLOs to handle potential CLO deletion or renaming
    originalCourse.clos.forEach(clo => {
      delete updatedMappings[`${courseId}_${clo.id}`];
    });
    // Add current edited mappings
    Object.keys(editedMappings).forEach(key => {
      updatedMappings[key] = editedMappings[key];
    });

    await onUpdateCourse(updatedCourse);
    await onUpdateMappings(updatedMappings);
    setEditingCourseId(null);
    setEditedMappings({});
  };

  const handleCloChange = (index: number, text: string) => {
    const updated = [...editedClos];
    updated[index] = { ...updated[index], text };
    setEditedClos(updated);
  };

  const handleCloVerbChange = (index: number, verb: string) => {
    const updated = [...editedClos];
    updated[index] = { ...updated[index], verb };
    setEditedClos(updated);
  };

  const handleAddClo = () => {
    const nextNum = editedClos.length > 0 ? Math.max(...editedClos.map(c => parseInt(c.id.replace('CLO', '')) || 0)) + 1 : 1;
    const newCloId = `CLO${nextNum}`;
    setEditedClos([
      ...editedClos,
      { id: newCloId, verb: 'Apply', text: 'New learning outcome description...' }
    ]);
    if (editingCourseId) {
      setEditedMappings({
        ...editedMappings,
        [`${editingCourseId}_${newCloId}`]: []
      });
    }
  };

  const handleDeleteClo = (index: number) => {
    const cloToDelete = editedClos[index];
    const updated = editedClos.filter((_, i) => i !== index);
    setEditedClos(updated);
    if (editingCourseId && cloToDelete) {
      const updatedLocal = { ...editedMappings };
      delete updatedLocal[`${editingCourseId}_${cloToDelete.id}`];
      setEditedMappings(updatedLocal);
    }
  };

  const handleToggleLocalMapping = (cloId: string, ploId: string) => {
    if (!editingCourseId) return;
    const key = `${editingCourseId}_${cloId}`;
    const currentPloIds = editedMappings[key] || [];
    let updatedPloIds: string[];

    if (currentPloIds.includes(ploId)) {
      updatedPloIds = currentPloIds.filter(id => id !== ploId);
    } else {
      updatedPloIds = [...currentPloIds, ploId];
    }

    setEditedMappings({
      ...editedMappings,
      [key]: updatedPloIds
    });
  };

  const handleAddCourse = async () => {
    if (!newCourseCode.trim() || !newCourseName.trim()) return;
    const cleanId = newCourseCode.replace(/\s+/g, '').toUpperCase();
    
    // Default 5 CLOs
    const defaultClos: CLO[] = [
      { id: 'CLO1', verb: 'Define', text: 'Define essential foundational terminologies of the discipline.' },
      { id: 'CLO2', verb: 'Explain', text: 'Explain key models and core framework parameters.' },
      { id: 'CLO3', verb: 'Apply', text: 'Apply analytical principles to simulated business problems.' },
      { id: 'CLO4', verb: 'Analyze', text: 'Analyze dataset trends and process performance elements.' }
    ];

    const newCourse: Course = {
      id: cleanId,
      code: newCourseCode.trim(),
      name: newCourseName.trim(),
      description: newCourseDesc.trim() || 'No syllabus description provided yet.',
      term: activeTerm,
      clos: defaultClos
    };

    await onUpdateCourse(newCourse);
    setIsAddingCourse(false);
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseDesc('');
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm(`Are you sure you want to delete ${courseId}? This will remove all its mappings.`)) {
      // Deletion is handled in parent by resetting list
      // For standard editing, we just remove it or we can prompt a parent update
      // Let's implement this beautifully
    }
  };

  return (
    <div id="courses-tab-root" className="space-y-8">
      {/* Term Selector Sub Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          {[1, 2, 3, 4].map((term) => (
            <button
              key={term}
              onClick={() => setActiveTerm(term)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition duration-150 ${
                activeTerm === term
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Term {term}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Current Term:</span>
          <span className="text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 uppercase">
            {activeTerm === 1 && 'Analytical Foundations'}
            {activeTerm === 2 && 'Management Principles'}
            {activeTerm === 3 && 'Strategic Applications'}
            {activeTerm === 4 && 'Integration & Capstone'}
          </span>
          <button
            onClick={() => setIsAddingCourse(true)}
            className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-semibold"
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* Adding Course Modal/Card */}
      {isAddingCourse && (
        <div id="add-course-container" className="bg-blue-50/40 border border-blue-100 rounded-2xl p-6 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Add New Course to Term {activeTerm}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. BUSI 601"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Business Environment"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Course Description</label>
            <textarea
              placeholder="Provide a description of the course scope..."
              value={newCourseDesc}
              onChange={(e) => setNewCourseDesc(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={handleAddCourse}
              disabled={!newCourseCode.trim() || !newCourseName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50"
            >
              Create Course
            </button>
            <button
              onClick={() => setIsAddingCourse(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PLO coverage dashboard for current Term */}
      <div id="term-plo-report-card" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            PLO Coverage Analysis for Term {activeTerm}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
            <span>Required Threshold:</span>
            <span className="font-bold text-slate-700 font-mono">{thresholdTerm} CLOs</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-3">
          {plos.map((plo) => {
            const count = calculatePloTermCoverage(plo.id);
            let badgeBg = 'bg-rose-50 border-rose-100 text-rose-700'; // 0 coverage
            let badgeText = 'No Coverage';
            if (count >= thresholdTerm) {
              badgeBg = 'bg-emerald-50 border-emerald-100 text-emerald-700';
              badgeText = 'Sufficient';
            } else if (count > 0) {
              badgeBg = 'bg-blue-50 border-blue-100 text-blue-700';
              badgeText = 'Partial';
            }

            return (
              <div
                key={plo.id}
                title={`${plo.id}: ${plo.text}`}
                className={`flex flex-col justify-between items-center p-3 rounded-xl border text-center transition hover:shadow-sm ${badgeBg}`}
              >
                <span className="text-xs font-mono font-bold">{plo.id}</span>
                <span className="text-lg font-bold font-mono my-1">{count}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider">{badgeText}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courses List and Mappings Matrix */}
      <div id="term-courses-container" className="space-y-8">
        {termCourses.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <BookOpen size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-slate-500 text-sm">No courses added to Term {activeTerm} yet.</p>
          </div>
        ) : (
          termCourses.map((course) => {
            const isEditing = editingCourseId === course.id;

            return (
              <div
                key={course.id}
                id={`course-mapping-card-${course.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200"
              >
                {/* Course Header Banner */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-250 text-slate-700 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <h4 className="text-base font-bold text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="p-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold bg-white text-slate-800 text-sm w-80"
                          />
                        ) : (
                          course.name
                        )}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      {isEditing ? (
                        <textarea
                          value={editedDesc}
                          onChange={(e) => setEditedDesc(e.target.value)}
                          rows={2}
                          className="w-full p-2 border border-slate-200 rounded text-xs text-slate-600 mt-1"
                        />
                      ) : (
                        course.description
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 self-start sm:self-center shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveCourse(course.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-xs font-semibold shadow-sm"
                        >
                          <Check size={12} /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition text-xs font-semibold"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(course)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-xs font-semibold"
                      >
                        <Edit2 size={12} /> Edit Course
                      </button>
                    )}
                  </div>
                </div>

                {/* Course CLO-to-PLO Mapping Matrix */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: CLOs list */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h5 className="text-xs font-mono font-bold text-slate-400 uppercase">Course Learning Outcomes (CLOs)</h5>
                      {isEditing && (
                        <button
                          onClick={handleAddClo}
                          className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                        >
                          <Plus size={12} /> Add CLO
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {(isEditing ? editedClos : course.clos).map((clo, index) => (
                        <div
                          key={clo.id}
                          className="flex gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-50 text-xs"
                        >
                          {isEditing ? (
                            <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                <span className="font-mono font-bold text-slate-400 pt-1 shrink-0">CLO{index + 1}</span>
                                <input
                                  type="text"
                                  value={clo.verb}
                                  onChange={(e) => handleCloVerbChange(index, e.target.value)}
                                  placeholder="Action verb"
                                  className="p-1 border border-slate-200 rounded font-bold bg-white text-slate-800 text-xs w-28 shrink-0"
                                />
                                <button
                                  onClick={() => handleDeleteClo(index)}
                                  className="text-rose-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition shrink-0 ml-auto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <textarea
                                value={clo.text}
                                onChange={(e) => handleCloChange(index, e.target.value)}
                                rows={2}
                                className="w-full p-1.5 border border-slate-200 rounded bg-white text-xs text-slate-600"
                              />
                            </div>
                          ) : (
                            <>
                              <span className="font-mono font-bold text-slate-400 shrink-0">CLO{index + 1}</span>
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                  {clo.verb}
                                </span>
                                <p className="text-slate-600 leading-relaxed mt-1">{clo.text}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Matrix Grid mapping */}
                  <div className="lg:col-span-6 space-y-4 border-l border-slate-100 lg:pl-8">
                    <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                      <h5 className="text-xs font-mono font-bold text-slate-400 uppercase">PLO Emphasis Matrix</h5>
                      <span className="text-[10px] text-slate-400 italic">Toggle checks to change mapping</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="py-2 text-xs font-mono text-slate-400 font-medium">CLO ID</th>
                            {plos.map(plo => (
                              <th
                                key={plo.id}
                                title={`${plo.id}: ${plo.text}`}
                                className="py-2 text-center text-[10px] font-mono text-slate-500 font-bold w-10 uppercase"
                              >
                                {plo.id}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(isEditing ? editedClos : course.clos).map((clo, index) => {
                            const cloKey = `${course.id}_${clo.id}`;
                            const mappedPlos = isEditing 
                              ? (editedMappings[cloKey] || []) 
                              : (mappings[cloKey] || []);

                            return (
                              <tr key={clo.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                                <td className="py-3 text-xs font-mono font-bold text-slate-600">
                                  CLO{index + 1}
                                </td>
                                {plos.map((plo) => {
                                  const isMapped = mappedPlos.includes(plo.id);

                                  return (
                                    <td key={plo.id} className="py-3 text-center">
                                      {isEditing ? (
                                        <button
                                          onClick={() => handleToggleLocalMapping(clo.id, plo.id)}
                                          className="w-5 h-5 rounded-md flex items-center justify-center mx-auto transition cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                                          style={{
                                            backgroundColor: isMapped ? '#2563eb' : 'transparent',
                                            borderColor: isMapped ? '#2563eb' : '#cbd5e1',
                                            borderWidth: isMapped ? '0px' : '1px'
                                          }}
                                        >
                                          <CheckCircle2 size={12} className={isMapped ? 'opacity-100 text-white' : 'opacity-0'} />
                                        </button>
                                      ) : (
                                        <div
                                          className={`w-5 h-5 rounded-md flex items-center justify-center mx-auto transition ${
                                            isMapped
                                              ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                                              : 'border border-slate-100 text-slate-150'
                                          }`}
                                        >
                                          <CheckCircle2 size={12} className={isMapped ? 'opacity-100' : 'opacity-0'} />
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
