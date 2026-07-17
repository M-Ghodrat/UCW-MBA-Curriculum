import React, { useState } from 'react';
import { Course, PLO, Assignment, CourseAssignments } from '../types';
import { FileText, Plus, Trash2, Edit2, Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AssignmentsTabProps {
  courses: Course[];
  plos: PLO[];
  assignments: { [courseId: string]: Assignment[] }; // courseId -> Assignments
  onUpdateAssignments: (courseId: string, items: Assignment[]) => Promise<void>;
}

export default function AssignmentsTab({
  courses,
  plos,
  assignments,
  onUpdateAssignments
}: AssignmentsTabProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'BUSI601');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Editing state
  const [editedName, setEditedName] = useState('');
  const [editedWeight, setEditedWeight] = useState<number>(0);
  const [editedClos, setEditedClos] = useState<string[]>([]);
  const [editedPlos, setEditedPlos] = useState<string[]>([]);

  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState<number>(10);
  const [newClos, setNewClos] = useState<string[]>([]);
  const [newPlos, setNewPlos] = useState<string[]>([]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const courseItems = assignments[selectedCourseId] || [];

  const totalWeight = courseItems.reduce((acc, item) => acc + item.weight, 0);

  const handleStartEdit = (item: Assignment) => {
    setEditingId(item.id);
    setEditedName(item.name);
    setEditedWeight(item.weight);
    setEditedClos([...item.clos]);
    setEditedPlos([...item.plos]);
  };

  const handleSaveEdit = async (id: string) => {
    const updated = courseItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          name: editedName.trim(),
          weight: editedWeight,
          clos: editedClos,
          plos: editedPlos
        };
      }
      return item;
    });
    await onUpdateAssignments(selectedCourseId, updated);
    setEditingId(null);
  };

  const handleAddAssignment = async () => {
    if (!newName.trim()) return;
    const nextNum = courseItems.length > 0 ? Math.max(...courseItems.map(i => parseInt(i.id.replace(`${selectedCourseId}_A`, '')) || 0)) + 1 : 1;
    const newItem: Assignment = {
      id: `${selectedCourseId}_A${nextNum}`,
      name: newName.trim(),
      weight: newWeight,
      clos: newClos,
      plos: newPlos
    };
    await onUpdateAssignments(selectedCourseId, [...courseItems, newItem]);
    setNewName('');
    setNewWeight(10);
    setNewClos([]);
    setNewPlos([]);
    setIsAdding(false);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      const updated = courseItems.filter(item => item.id !== id);
      await onUpdateAssignments(selectedCourseId, updated);
    }
  };

  const toggleClo = (cloId: string, isEditingMode: boolean) => {
    const current = isEditingMode ? editedClos : newClos;
    const isPresent = current.includes(cloId);
    const updated = isPresent ? current.filter(id => id !== cloId) : [...current, cloId];
    
    if (isEditingMode) {
      setEditedClos(updated);
    } else {
      setNewClos(updated);
    }
  };

  const togglePlo = (ploId: string, isEditingMode: boolean) => {
    const current = isEditingMode ? editedPlos : newPlos;
    const isPresent = current.includes(ploId);
    const updated = isPresent ? current.filter(id => id !== ploId) : [...current, ploId];
    
    if (isEditingMode) {
      setEditedPlos(updated);
    } else {
      setNewPlos(updated);
    }
  };

  return (
    <div id="assignments-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Course Selector & Weight Check */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Select MBA Course</h4>
          <div className="space-y-1">
            {courses.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCourseId(c.id);
                  setEditingId(null);
                  setIsAdding(false);
                }}
                className={`w-full text-left p-3 rounded-xl text-xs font-bold flex justify-between items-center transition ${
                  selectedCourseId === c.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-transparent'
                }`}
              >
                <span>{c.code}</span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${selectedCourseId === c.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  Term {c.term}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Course Assessment Weight Diagnostic */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Weight Diagnostic</h4>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-mono font-extrabold text-slate-800">{totalWeight}%</span>
            <span className="text-xs font-semibold text-slate-400">Total Grading</span>
          </div>
          {totalWeight !== 100 ? (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-[11px] text-rose-700 flex items-start gap-2 leading-relaxed">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>Syllabus grading weight sum does not equal 100%. Please adjust assignments.</span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-[11px] text-emerald-700 flex items-start gap-2 leading-relaxed">
              <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
              <span>Syllabus grading balances perfectly to 100%. All looks great!</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Assignments Mapping Panel */}
      <div className="lg:col-span-9 space-y-6">
        {selectedCourse && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Syllabus Assessments</span>
                <h3 className="text-lg font-extrabold text-slate-800">{selectedCourse.code}: {selectedCourse.name}</h3>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-xs font-bold shadow-sm"
              >
                + Add Assignment
              </button>
            </div>

            {/* Add Assignment Panel */}
            {isAdding && (
              <div id="add-assignment-form" className="bg-blue-50/40 border border-blue-100 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-800">Add Assignment details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Case Study Evaluation"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Grading Weight (%)</label>
                    <input
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(parseInt(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Map CLOs and PLOs inside assignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500">Assess Course CLOs</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCourse.clos.map((clo, idx) => {
                        const active = newClos.includes(clo.id);
                        return (
                          <button
                            key={clo.id}
                            onClick={() => toggleClo(clo.id, false)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition ${
                              active ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-400'
                            }`}
                          >
                            CLO{idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500">Assess Program PLOs</label>
                    <div className="flex flex-wrap gap-1.5">
                      {plos.map(plo => {
                        const active = newPlos.includes(plo.id);
                        return (
                          <button
                            key={plo.id}
                            onClick={() => togglePlo(plo.id, false)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition ${
                              active ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-400'
                            }`}
                          >
                            {plo.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleAddAssignment}
                    disabled={!newName.trim()}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    Add Assignment
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Assignments List table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-400 uppercase">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5 w-24">Weight</th>
                    <th className="py-2.5">Mapped CLOs</th>
                    <th className="py-2.5">Mapped PLOs</th>
                    <th className="py-2.5 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {courseItems.map((item) => {
                    const isEditing = editingId === item.id;

                    return (
                      <tr key={item.id} className="text-xs hover:bg-slate-50/20">
                        <td className="py-4 font-semibold text-slate-700">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="w-full p-1.5 border border-slate-200 rounded"
                            />
                          ) : (
                            item.name
                          )}
                        </td>
                        <td className="py-4 font-mono font-bold text-slate-800">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedWeight}
                              onChange={(e) => setEditedWeight(parseInt(e.target.value) || 0)}
                              className="w-16 p-1.5 border border-slate-200 rounded"
                            />
                          ) : (
                            `${item.weight}%`
                          )}
                        </td>
                        <td className="py-4">
                          {isEditing ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {selectedCourse.clos.map((clo, idx) => {
                                const active = editedClos.includes(clo.id);
                                return (
                                  <button
                                    key={clo.id}
                                    onClick={() => toggleClo(clo.id, true)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                      active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}
                                  >
                                    CLO{idx + 1}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {item.clos.map(id => (
                                <span key={id} className="bg-blue-50 border border-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">
                                  {id}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4">
                          {isEditing ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {plos.map(plo => {
                                const active = editedPlos.includes(plo.id);
                                return (
                                  <button
                                    key={plo.id}
                                    onClick={() => togglePlo(plo.id, true)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                      active ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}
                                  >
                                    {plo.id}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {item.plos.map(id => (
                                <span key={id} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">
                                  {id}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1 bg-slate-100 text-slate-400 hover:bg-slate-250 rounded"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAssignment(item.id)}
                                  className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
