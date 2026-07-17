import React, { useState } from 'react';
import { Course, PLO } from '../types';
import { Layers, AlertTriangle, CheckCircle, HelpCircle, FileText, BarChart } from 'lucide-react';

interface CoverageTabProps {
  courses: Course[];
  plos: PLO[];
  mappings: { [key: string]: string[] }; // courseId_cloId -> PLO IDs
  thresholdTerm: number;
}

export default function CoverageTab({
  courses,
  plos,
  mappings,
  thresholdTerm
}: CoverageTabProps) {
  const [selectedPloId, setSelectedPloId] = useState<string>('PLO1');

  const selectedPlo = plos.find(p => p.id === selectedPloId);

  // Get CLOs covering selected PLO in a course
  const getCoveringClos = (course: Course): { id: string; verb: string; text: string; displayId: string }[] => {
    return course.clos.map((clo, idx) => ({ ...clo, displayId: `CLO${idx + 1}` })).filter(clo => {
      const key = `${course.id}_${clo.id}`;
      return (mappings[key] || []).includes(selectedPloId);
    });
  };

  // Group course analysis by Term
  const termSummary = [1, 2, 3, 4].map(termNum => {
    const termCourses = courses.filter(c => c.term === termNum);
    let mappingCount = 0;
    
    const analysis = termCourses.map(course => {
      const coveringClos = getCoveringClos(course);
      mappingCount += coveringClos.length;
      return {
        course,
        coveringClos,
        isCovered: coveringClos.length > 0
      };
    });

    return {
      termNum,
      analysis,
      totalCLOMappings: mappingCount
    };
  });

  return (
    <div id="coverage-tab-root" className="space-y-6">
      {/* PLO Selection and Overview Card */}
      <div id="coverage-controls" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 md:max-w-xl">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <BarChart size={20} className="text-blue-600" />
            Curriculum PLO Coverage Analysis Grid
          </h3>
          <p className="text-xs text-slate-400">
            Select a PLO to view a comprehensive term-by-term curriculum coverage table. Identify where specific Course Learning Outcomes (CLOs) emphasize the core program objectives.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Select PLO:</label>
          <select
            value={selectedPloId}
            onChange={(e) => setSelectedPloId(e.target.value)}
            className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
          >
            {plos.map(plo => (
              <option key={plo.id} value={plo.id}>
                [{plo.id}] {plo.text.substring(0, 60)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected PLO details and Overall Summary */}
      {selectedPlo && (
        <div id="coverage-summary-banner" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 uppercase font-mono">
                {selectedPlo.id}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bloom's: {selectedPlo.bloomLevel}</span>
            </div>
            <h4 className="text-base font-bold text-slate-800 leading-snug">
              <span className="text-blue-600 font-extrabold text-lg mr-1">{selectedPlo.verb}</span>
              {selectedPlo.text.substring(selectedPlo.verb.length + 1)}
            </h4>
          </div>

          <div className="border-l border-slate-100 pl-6 space-y-2 flex flex-col justify-center">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Program Total Coverage</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-800 font-mono">
                {Object.values(mappings).filter(ploIds => ploIds.includes(selectedPloId)).length}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase">CLO Mappings</span>
            </div>
          </div>
        </div>
      )}

      {/* Term-wise Detailed Coverage Tables */}
      <div id="term-coverage-tables" className="space-y-8">
        {termSummary.map(({ termNum, analysis, totalCLOMappings }) => {
          let termTitle = '';
          if (termNum === 1) termTitle = 'Term 1: Analytical Foundations';
          else if (termNum === 2) termTitle = 'Term 2: Management Principles';
          else if (termNum === 3) termTitle = 'Term 3: Strategic Applications';
          else if (termNum === 4) termTitle = 'Term 4: Integration & Capstone';

          // Determine status color based on threshold
          let statusBg = 'bg-rose-50 text-rose-700 border-rose-100';
          let statusLabel = 'Deficient Coverage';
          if (totalCLOMappings >= thresholdTerm) {
            statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
            statusLabel = 'Sufficient Coverage';
          } else if (totalCLOMappings > 0) {
            statusBg = 'bg-blue-50 text-blue-700 border-blue-100';
            statusLabel = 'Partial Coverage';
          }

          return (
            <div key={termNum} id={`term-coverage-section-${termNum}`} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Term Summary Header */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{termTitle}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Aggregate Course Outlines</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBg}`}>
                    {statusLabel} ({totalCLOMappings} CLOs)
                  </span>
                </div>
              </div>

              {/* Table list */}
              <div className="divide-y divide-slate-100">
                {analysis.map(({ course, coveringClos, isCovered }) => (
                  <div key={course.id} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 hover:bg-slate-50/10 transition">
                    {/* Course Identity */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                          {course.code}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isCovered ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-800">{course.name}</h5>
                    </div>

                    {/* Coverage Status Badge */}
                    <div className="md:col-span-2">
                      {isCovered ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle size={10} />
                          Active ({coveringClos.length})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          <AlertTriangle size={10} />
                          Uncovered
                        </span>
                      )}
                    </div>

                    {/* Covering CLOs list */}
                    <div className="md:col-span-7">
                      {isCovered ? (
                        <div className="space-y-2">
                          {coveringClos.map(clo => (
                            <div key={clo.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-blue-600 text-[10px]">{clo.displayId}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                  {clo.verb}
                                </span>
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed">
                                {clo.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No course learning outcomes map to {selectedPloId} in this course.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
