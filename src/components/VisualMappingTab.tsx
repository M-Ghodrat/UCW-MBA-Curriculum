import React, { useState } from 'react';
import { Course, PLO } from '../types';
import { Layers } from 'lucide-react';

interface VisualMappingTabProps {
  courses: Course[];
  plos: PLO[];
  mappings: { [key: string]: string[] }; // courseId_cloId -> PLO IDs
  termsCount?: number;
  termLabel?: string;
}

export default function VisualMappingTab({
  courses,
  plos,
  mappings,
  termsCount = 4,
  termLabel = 'Term'
}: VisualMappingTabProps) {
  const [selectedPloId, setSelectedPloId] = useState<string>('PLO1');
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  const activePloId = plos.some(p => p.id === selectedPloId) 
    ? selectedPloId 
    : (plos[0]?.id || '');

  // Check if a course is mapped to the selected PLO
  const isCourseMappedToSelectedPlo = (courseId: string): boolean => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return false;
    
    return course.clos.some(clo => {
      const key = `${courseId}_${clo.id}`;
      const mappedPlos = mappings[key] || [];
      return mappedPlos.includes(activePloId);
    });
  };

  const selectedPlo = plos.find(p => p.id === activePloId);

  const termList = Array.from({ length: termsCount }, (_, i) => i + 1);

  return (
    <div id="visual-mapping-root" className="space-y-6">
      {/* Visual Map Header Controls */}
      <div id="visual-controls-bar" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 md:max-w-xl">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Layers size={20} className="text-blue-600" />
            Curriculum Visual Pathway Tree
          </h3>
          <p className="text-xs text-slate-400">
            Select a PLO to trace its coverage throughout the academic timeline. Hover on courses to view their CLO details and mapped Course Learning Outcomes.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Trace PLO:</label>
          <select
            value={activePloId}
            onChange={(e) => setSelectedPloId(e.target.value)}
            className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 max-w-[280px] md:max-w-[400px]"
          >
            {plos.map(plo => (
              <option key={plo.id} value={plo.id}>
                [{plo.id}] {plo.shortNotation ? plo.shortNotation : `${plo.text.substring(0, 60)}...`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected PLO details banner */}
      {selectedPlo && (
        <div id="selected-plo-banner" className="bg-blue-50/40 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
          <div className="bg-blue-100/80 text-blue-800 text-xs font-bold font-mono px-2.5 py-1 rounded-md">
            {selectedPlo.id}
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">{selectedPlo.bloomLevel} Level</span>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="text-slate-800 font-bold">{selectedPlo.verb}</strong> {selectedPlo.text.substring(selectedPlo.verb.length + 1)}
            </p>
          </div>
        </div>
      )}

      {/* Decision tree visualization stage */}
      <div className="max-w-7xl mx-auto w-full">
        <div id="visual-tree-canvas" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Connection pathways - rendered beautifully via flex & custom cards */}
          {termList.map((termNum) => {
            const termCourses = courses.filter(c => c.term === termNum);
            const termTitle = `${termLabel} ${termNum}`;

            return (
              <div
                key={termNum}
                id={`term-column-${termNum}`}
                className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col"
              >
                {/* Term Column Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">{termTitle}</h4>
                    <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">{termCourses.length} Course{termCourses.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Course Nodes within Column */}
                <div className="space-y-3.5 flex-1 flex flex-col justify-around">
                  {termCourses.map((course, index) => {
                    const isHovered = hoveredCourseId === course.id;

                    const coveredClos = course.clos.map((clo, idx) => ({ ...clo, displayId: `CLO${idx + 1}` })).filter(clo => {
                      const key = `${course.id}_${clo.id}`;
                      return mappings[key]?.includes(activePloId);
                    });

                    const coveredCount = coveredClos.length;
                    const isHighlighted = coveredCount > 0;

                    // Dynamic spectrum color styling based on count of covered CLOs under selected PLO
                    let cardBgStyle = 'bg-white text-slate-700 border-slate-150 hover:border-slate-300';
                    let codeStyle = 'text-slate-400';
                    let tagStyle = 'bg-blue-50 text-blue-700 border-blue-100';
                    let pingColor = 'bg-blue-600';

                    if (coveredCount === 1) {
                      cardBgStyle = 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100/70 hover:border-blue-300 shadow-sm';
                      codeStyle = 'text-blue-600/80';
                      tagStyle = 'bg-blue-100 text-blue-800 border-blue-200/50';
                      pingColor = 'bg-blue-400';
                    } else if (coveredCount === 2) {
                      cardBgStyle = 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600 shadow-sm';
                      codeStyle = 'text-blue-100';
                      tagStyle = 'bg-blue-600/50 text-white border-blue-400/30';
                      pingColor = 'bg-blue-200';
                    } else if (coveredCount === 3) {
                      cardBgStyle = 'bg-blue-700 text-white border-blue-800 hover:bg-blue-850 shadow-md';
                      codeStyle = 'text-blue-200';
                      tagStyle = 'bg-blue-800/50 text-white border-blue-600/30';
                      pingColor = 'bg-blue-100';
                    } else if (coveredCount >= 4) {
                      cardBgStyle = 'bg-blue-900 text-white border-blue-950 hover:bg-slate-950 shadow-md';
                      codeStyle = 'text-blue-200';
                      tagStyle = 'bg-slate-800/60 text-white border-slate-700/30';
                      pingColor = 'bg-amber-400';
                    }

                    // Hover tooltip vertical and horizontal positioning rules to avoid screen overflow
                    const isTerm4 = termNum === 4;
                    const isLastTwo = index >= termCourses.length - 2;

                    let tooltipPositionClasses = "absolute z-50 bg-slate-900 text-slate-100 rounded-xl p-3.5 shadow-xl border border-slate-800 w-68 space-y-2.5 pointer-events-none animate-fadeIn ";
                    
                    if (isTerm4) {
                      tooltipPositionClasses += "left-1/2 md:left-auto md:right-full transform -translate-x-1/2 md:translate-x-0 md:mr-4 ";
                    } else {
                      tooltipPositionClasses += "left-1/2 md:left-full transform -translate-x-1/2 md:translate-x-0 md:ml-4 ";
                    }

                    if (isLastTwo) {
                      tooltipPositionClasses += "bottom-full md:bottom-0 md:top-auto mb-2 md:mb-0 ";
                    } else {
                      tooltipPositionClasses += "top-full md:-top-4 mt-2 md:mt-0 ";
                    }

                    return (
                      <div
                        key={course.id}
                        id={`node-${course.id}`}
                        onMouseEnter={() => setHoveredCourseId(course.id)}
                        onMouseLeave={() => setHoveredCourseId(null)}
                        className={`relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${cardBgStyle}`}
                      >
                        {/* Highlights Indicators */}
                        {isHighlighted && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHighlighted && coveredCount === 1 ? 'bg-blue-300' : 'bg-white'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border-2 ${isHighlighted && coveredCount === 1 ? 'border-blue-200' : 'border-white'} ${pingColor}`}></span>
                          </span>
                        )}

                        <div className="space-y-1">
                          <span className={`text-[9px] font-mono font-bold uppercase ${codeStyle}`}>
                            {course.code}
                          </span>
                          <h5 className="text-[11.5px] font-bold tracking-tight leading-snug line-clamp-2">
                            {course.name}
                          </h5>

                          {/* Tag covered CLOs under the PLO */}
                          {coveredClos.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {coveredClos.map(clo => (
                                <span
                                  key={clo.id}
                                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${tagStyle}`}
                                >
                                  {clo.displayId}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Detail Hoverboard Popover */}
                        {isHovered && (
                          <div className={tooltipPositionClasses}>
                            <div className="border-b border-slate-800 pb-1.5">
                              <span className="text-[9px] font-mono font-bold text-blue-400">{course.code}</span>
                              <h6 className="text-[11px] font-bold leading-tight text-white">{course.name}</h6>
                            </div>
                            <p className="text-[9px] text-slate-300 leading-normal">
                              {course.description.substring(0, 110)}...
                            </p>
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">Course Outcomes (CLOs)</span>
                                {coveredClos.length > 0 && (
                                  <span className="text-[8px] bg-blue-500/20 text-blue-300 font-mono font-bold px-1 rounded">
                                    {coveredClos.length} Mapped
                                  </span>
                                )}
                              </div>
                              {course.clos.map((clo, idx) => {
                                const key = `${course.id}_${clo.id}`;
                                const isCloMapped = mappings[key]?.includes(activePloId);

                                return (
                                  <div key={clo.id} className="flex gap-1 items-start text-[8.5px]">
                                    <span className={`font-mono font-bold shrink-0 ${isCloMapped ? 'text-blue-400' : 'text-slate-500'}`}>CLO{idx + 1}:</span>
                                    <p className={`leading-tight ${isCloMapped ? 'text-white font-semibold' : 'text-slate-400'}`}>
                                      <strong className="font-bold">{clo.verb}</strong> {clo.text.substring(clo.verb.length + 1)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
