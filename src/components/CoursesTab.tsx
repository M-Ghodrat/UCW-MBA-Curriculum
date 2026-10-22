import React, { useState } from 'react';
import { Course, PLO, CLO } from '../types';
import { Edit2, Plus, Trash2, Check, X, BookOpen, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

interface CoursesTabProps {
  courses: Course[];
  plos: PLO[];
  mappings: { [key: string]: string[] }; // courseId_cloId -> PLO IDs
  thresholdTerm: number;
  onUpdateCourse: (course: Course) => Promise<void>;
  onUpdateMappings: (mappings: { [key: string]: string[] }) => Promise<void>;
  termsCount?: number;
  termLabel?: string;
  programId?: string;
}

export default function CoursesTab({
  courses,
  plos,
  mappings,
  thresholdTerm,
  onUpdateCourse,
  onUpdateMappings,
  termsCount = 4,
  termLabel = 'Term',
  programId = 'mba'
}: CoursesTabProps) {
  const [activeTerm, setActiveTerm] = useState<number>(1);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Edited course details
  const [editedName, setEditedName] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [editedClos, setEditedClos] = useState<CLO[]>([]);
  const [editedMappings, setEditedMappings] = useState<{ [key: string]: string[] }>({});

  // Filtering courses by active term
  const termCourses = courses.filter(c => c.term === activeTerm);

  // Calculate term coverage for each PLO
  const calculatePloTermCoverage = (ploId: string): number => {
    let count = 0;
    const termCourseIds = termCourses.map(c => c.id);
    
    Object.entries(mappings).forEach(([key, ploIds]) => {
      const [courseId] = key.split('_');
      if (termCourseIds.includes(courseId) && Array.isArray(ploIds) && ploIds.includes(ploId)) {
        count++;
      }
    });
    return count;
  };

  const handleStartEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setEditedName(course.name);
    setEditedDesc(course.description);
    setEditedClos([...(course.clos || [])]);

    // Initialize local mappings copy for this course
    const localCopy: { [key: string]: string[] } = {};
    (course.clos || []).forEach(clo => {
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
    // Clear old mappings for this course's CLOs
    (originalCourse.clos || []).forEach(clo => {
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
      { id: newCloId, verb: 'Apply', text: '' }
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

  const termList = Array.from({ length: Math.max(1, termsCount) }, (_, i) => i + 1);

  return (
    <div id="courses-tab-root" className="space-y-8">
      {/* Term Selector Sub Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100 gap-1.5 max-w-full overflow-x-auto">
          {termList.map((term) => (
            <button
              key={term}
              onClick={() => setActiveTerm(term)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition duration-150 whitespace-nowrap cursor-pointer ${
                activeTerm === term
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {termLabel} {term}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-mono">Current {termLabel}:</span>
          <span className="text-xs md:text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 uppercase">
            {termLabel} {activeTerm}
          </span>
        </div>
      </div>

      {/* PLO coverage dashboard for current Term */}
      {plos.length > 0 && (
        <div id="term-plo-report-card" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              PLO Coverage Analysis for {termLabel} {activeTerm}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
              <span>Required Threshold:</span>
              <span className="font-bold text-slate-700 font-mono">{thresholdTerm} CLOs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {plos.map((plo) => {
              const count = calculatePloTermCoverage(plo.id);
              let badgeBg = 'bg-rose-50 border-rose-100 text-rose-700';
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
      )}

      {/* Course List for the active term */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            Courses in {termLabel} {activeTerm}
          </h3>
          <span className="text-xs font-mono font-medium text-slate-400">
            {termCourses.length} Courses Found
          </span>
        </div>

        {termCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30 text-blue-600" />
            <p className="text-sm font-semibold text-slate-600">No courses listed for {termLabel} {activeTerm} yet.</p>
            <p className="text-xs text-slate-400 mt-1">Courses and terms are added and managed from the Course Outlines tab.</p>
          </div>
        ) : (
          termCourses.map((course) => {
            const isEditing = editingCourseId === course.id;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition hover:shadow-md"
              >
                {/* Course Header Bar */}
                <div className="bg-slate-50/70 border-b border-slate-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                        {course.code}
                      </span>
                      <h4 className="font-bold text-slate-800 text-base">
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

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveCourse(course.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-xs font-semibold shadow-sm cursor-pointer"
                        >
                          <Check size={12} /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition text-xs font-semibold cursor-pointer"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(course)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition text-xs font-semibold cursor-pointer"
                        >
                          <Edit2 size={12} /> Edit Course
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course CLO-to-PLO Mapping Matrix */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: CLOs list */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h5 className="text-xs font-mono font-bold text-slate-400 uppercase">
                        Course Learning Outcomes (CLOs)
                      </h5>
                      {isEditing && (
                        <button
                          onClick={handleAddClo}
                          className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                        >
                          <Plus size={12} /> Add CLO
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {(isEditing ? editedClos : (course.clos || [])).length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">
                          No CLOs defined for this course yet.{isEditing ? ' Click "+ Add CLO" above to add one.' : ' Click "Edit Course" to add CLOs.'}
                        </p>
                      ) : (
                        (isEditing ? editedClos : (course.clos || [])).map((clo, index) => (
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
                                    className="text-rose-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition shrink-0 ml-auto cursor-pointer"
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
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right: Matrix Grid mapping */}
                  <div className="lg:col-span-6 space-y-4 border-l border-slate-100 lg:pl-8">
                    <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                      <h5 className="text-xs font-mono font-bold text-slate-400 uppercase">PLO Emphasis Matrix</h5>
                      <span className="text-[10px] text-slate-400 italic">Toggle checks to change mapping</span>
                    </div>

                    {plos.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No PLOs defined for this program yet. Add PLOs in the "Program Profile & PLOs" tab first.
                      </p>
                    ) : (isEditing ? editedClos : (course.clos || [])).length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        Add CLOs to map them to PLOs.
                      </p>
                    ) : (
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
                            {(isEditing ? editedClos : (course.clos || [])).map((clo, index) => {
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
                                            className="w-5 h-5 rounded-md flex items-center justify-center mx-auto transition cursor-pointer"
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
                    )}
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
