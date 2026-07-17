import React, { useState, useEffect } from 'react';
import { Course, PLO } from '../types';
import { generateSmartMappings } from '../lib/autoMapper';
import { INITIAL_MAPPINGS } from '../data/initialData';
import { Check, X, Wand2, RefreshCw, AlertTriangle, Save, HelpCircle, CheckSquare, Square } from 'lucide-react';

interface MappingFunctionTabProps {
  courses: Course[];
  plos: PLO[];
  savedMappings: { [key: string]: string[] }; // courseId_cloId -> PLO IDs
  onSaveMappings: (mappings: { [key: string]: string[] }) => Promise<void>;
}

export default function MappingFunctionTab({
  courses,
  plos,
  savedMappings,
  onSaveMappings
}: MappingFunctionTabProps) {
  // Local workshop state holding current working draft
  const [draftMappings, setDraftMappings] = useState<{ [key: string]: string[] }>({});
  const [isModified, setIsModified] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState<number | 'all'>('all');

  // Sync draft state with saved mappings when savedMappings change
  useEffect(() => {
    setDraftMappings(JSON.parse(JSON.stringify(savedMappings)));
    setIsModified(false);
  }, [savedMappings]);

  // Execute smart auto-mapping rules
  const handleRunAutoMapper = () => {
    const suggested = generateSmartMappings(courses, plos);
    setDraftMappings(suggested);
    setIsModified(true);
  };

  // Reset mappings to initial static seed
  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to restore the system default mappings? This will overwrite your active draft.')) {
      setDraftMappings(JSON.parse(JSON.stringify(INITIAL_MAPPINGS)));
      setIsModified(true);
    }
  };

  // Clear all mappings
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all mappings? Every CLO will have no program coverage.')) {
      const empty: { [key: string]: string[] } = {};
      courses.forEach(course => {
        course.clos.forEach(clo => {
          empty[`${course.id}_${clo.id}`] = [];
        });
      });
      setDraftMappings(empty);
      setIsModified(true);
    }
  };

  // Toggle single mapping
  const handleToggleMapping = (courseId: string, cloId: string, ploId: string) => {
    const key = `${courseId}_${cloId}`;
    const currentPloIds = draftMappings[key] || [];
    let updated: string[];

    if (currentPloIds.includes(ploId)) {
      updated = currentPloIds.filter(id => id !== ploId);
    } else {
      updated = [...currentPloIds, ploId];
    }

    setDraftMappings(prev => ({
      ...prev,
      [key]: updated
    }));
    setIsModified(true);
  };

  const handleSaveToDatabase = async () => {
    await onSaveMappings(draftMappings);
    setIsModified(false);
  };

  const handleCancelChanges = () => {
    setDraftMappings(JSON.parse(JSON.stringify(savedMappings)));
    setIsModified(false);
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTerm = filterTerm === 'all' || course.term === filterTerm;
    return matchesSearch && matchesTerm;
  });

  return (
    <div id="mapping-workshop-root" className="space-y-6">
      {/* Workshop Controls Header */}
      <div id="workshop-header" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Wand2 size={20} className="text-blue-600" />
            Curriculum Mapping Workshop
          </h3>
          <p className="text-xs text-slate-400">
            Generate initial maps using our smart keyword analyzer, refine them manually below, and save to commit changes database-wide.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunAutoMapper}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition"
          >
            <Wand2 size={16} /> Run Smart Auto-Mapper
          </button>
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition"
          >
            <RefreshCw size={14} /> Restore Defaults
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Unsaved Draft Alert Banner */}
      {isModified && (
        <div id="unsaved-draft-alert" className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Unsaved Mapping Draft Active</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                You have modified the mappings. Other tabs and calculations will continue to use the old saved database mappings until you save.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveToDatabase}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition shadow"
            >
              <Save size={12} /> Save to Database
            </button>
            <button
              onClick={handleCancelChanges}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold transition"
            >
              <X size={12} /> Cancel Draft
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by course code or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="p-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none"
        >
          <option value="all">All Terms (1-4)</option>
          <option value="1">Term 1</option>
          <option value="2">Term 2</option>
          <option value="3">Term 3</option>
          <option value="4">Term 4</option>
        </select>
      </div>

      {/* Interactive Workshop Grid List */}
      <div id="workshop-list" className="space-y-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{course.code}</span>
                <h4 className="text-xs font-bold text-slate-800">{course.name}</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Term {course.term}</span>
            </div>

            <div className="p-6 divide-y divide-slate-100">
              {course.clos.map((clo, idx) => {
                const key = `${course.id}_${clo.id}`;
                const mappedPloIds = draftMappings[key] || [];

                return (
                  <div key={clo.id} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left CLO Outline */}
                    <div className="lg:col-span-5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">CLO{idx + 1}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1 rounded">
                          {clo.verb}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {clo.text}
                      </p>
                    </div>

                    {/* Right PLO Checkbox node selector */}
                    <div className="lg:col-span-7 flex flex-wrap gap-2 items-center">
                      {plos.map(plo => {
                        const isChecked = mappedPloIds.includes(plo.id);

                        return (
                          <button
                            key={plo.id}
                            onClick={() => handleToggleMapping(course.id, clo.id, plo.id)}
                            title={`${plo.id} [${plo.shortNotation || plo.verb}]: ${plo.text}`}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                              isChecked
                                ? 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <span className="font-mono text-[10px]">{plo.id}</span>
                            <span className="text-[10px] font-semibold">{plo.shortNotation || plo.verb}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
