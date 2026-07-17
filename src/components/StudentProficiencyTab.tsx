import React, { useState } from 'react';
import { Student, Course, PLO, Assignment } from '../types';
import { User, Mail, Award, CheckCircle, TrendingUp, HelpCircle, BarChart2 } from 'lucide-react';

interface StudentProficiencyTabProps {
  students: Student[];
  courses: Course[];
  plos: PLO[];
  assignments: { [courseId: string]: Assignment[] }; // courseId -> Assignments
}

export default function StudentProficiencyTab({
  students,
  courses,
  plos,
  assignments
}: StudentProficiencyTabProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'student_1');

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Dynamic PLO mastery calculation
  // Find all assignments that assess a PLO, look up student's scores, and take the average!
  const calculatePloProficiency = (ploId: string): { score: number; count: number } => {
    if (!selectedStudent) return { score: 0, count: 0 };

    let totalScore = 0;
    let assessedCount = 0;

    Object.entries(assignments).forEach(([courseId, items]) => {
      items.forEach(assignment => {
        if (assignment.plos.includes(ploId)) {
          // Check if student has a grade recorded for this assignment
          const grade = selectedStudent.grades[courseId]?.[assignment.id];
          if (grade !== undefined) {
            totalScore += grade;
            assessedCount++;
          }
        }
      });
    });

    return {
      score: assessedCount > 0 ? Math.round(totalScore / assessedCount) : 0,
      count: assessedCount
    };
  };

  // Dynamic CLO mastery calculation
  const calculateCourseCloProficiencies = (course: Course): { cloId: string; score: number; count: number }[] => {
    if (!selectedStudent) return [];

    const courseItems = assignments[course.id] || [];

    return course.clos.map(clo => {
      let totalScore = 0;
      let assessedCount = 0;

      courseItems.forEach(assignment => {
        if (assignment.clos.includes(clo.id)) {
          const grade = selectedStudent.grades[course.id]?.[assignment.id];
          if (grade !== undefined) {
            totalScore += grade;
            assessedCount++;
          }
        }
      });

      return {
        cloId: clo.id,
        score: assessedCount > 0 ? Math.round(totalScore / assessedCount) : 0,
        count: assessedCount
      };
    });
  };

  const getPerformanceBadge = (score: number, count: number) => {
    if (count === 0) return { label: 'Not Assessed', color: 'bg-slate-100 text-slate-500 border-slate-200', barColor: 'bg-slate-200' };
    if (score >= 85) return { label: 'Advanced Master', color: 'bg-emerald-50 text-emerald-700 border-emerald-150', barColor: 'bg-emerald-500' };
    if (score >= 70) return { label: 'Proficient Practitioner', color: 'bg-blue-50 text-blue-700 border-blue-150', barColor: 'bg-blue-500' };
    return { label: 'Developing Learner', color: 'bg-rose-50 text-rose-700 border-rose-150', barColor: 'bg-rose-500' };
  };

  return (
    <div id="student-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Sidebar: Student roster */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">MBA Student Roster</h4>
          <div className="space-y-3">
            {students.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition ${
                  selectedStudentId === s.id
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white hover:bg-slate-50 border-slate-150'
                }`}
              >
                <img
                  src={s.avatar}
                  alt={s.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-white"
                />
                <div>
                  <h5 className="text-xs font-bold leading-tight">{s.name}</h5>
                  <span className={`text-[10px] font-medium block ${selectedStudentId === s.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {s.email.split('@')[0]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Competency Dashboard */}
      <div className="lg:col-span-9 space-y-6">
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Profile Header card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow"
              />
              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <h3 className="text-xl font-extrabold text-slate-800">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                  <Mail size={12} /> {selectedStudent.email}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase font-mono">
                    UCW Graduate Tier
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase font-mono">
                    GPA: 3.82 / 4.33
                  </span>
                </div>
              </div>
            </div>

            {/* Program Learning Outcome (PLO) Proficiency bars */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award size={18} className="text-blue-600" />
                  Dynamic PLO Competency Matrix
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Calculated by averaging scores of all assignments assessing each program learning outcome.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plos.map(plo => {
                  const { score, count } = calculatePloProficiency(plo.id);
                  const perf = getPerformanceBadge(score, count);

                  return (
                    <div key={plo.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                            {plo.id}
                          </span>
                          <h5 className="text-xs font-bold text-slate-700 leading-snug line-clamp-2">
                            {plo.verb} - {plo.text.substring(plo.verb.length + 1)}
                          </h5>
                        </div>

                        {count > 0 ? (
                          <span className="text-sm font-mono font-extrabold text-slate-800 shrink-0">{score}%</span>
                        ) : (
                          <span className="text-xs font-mono text-slate-400 shrink-0">—</span>
                        )}
                      </div>

                      {/* Bar indicator */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${perf.barColor}`}
                            style={{ width: `${count > 0 ? score : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className={`font-semibold px-2 py-0.5 rounded-full border text-[9px] ${perf.color}`}>
                            {perf.label}
                          </span>
                          <span className="text-slate-400 font-medium">Assessed on {count} tasks</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Course-level CLO assessment logs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 size={18} className="text-blue-600" />
                  Term-Wise CLO Performance Log
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Syllabus outcome mastery calculated from student assessment grades.</p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {courses
                  .filter(c => selectedStudent.grades[c.id] !== undefined)
                  .map(course => {
                    const cloScores = calculateCourseCloProficiencies(course);

                    return (
                      <div key={course.id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {course.code}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{course.name}</span>
                        </div>

                        <div className="divide-y divide-slate-50 space-y-2">
                          {cloScores.map(({ cloId, score, count }) => {
                            const clo = course.clos.find(cl => cl.id === cloId);
                            const perf = getPerformanceBadge(score, count);

                            return (
                              <div key={cloId} className="pt-2 flex justify-between items-center text-xs gap-4">
                                <div className="space-y-0.5 flex-1">
                                  <span className="font-mono text-[10px] font-bold text-blue-600">{cloId}:</span>
                                  <p className="text-slate-600 text-[11px] leading-relaxed">
                                    <strong>{clo?.verb}</strong> {clo?.text.substring(clo.verb.length + 1)}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono font-extrabold text-slate-700 text-xs block">
                                    {count > 0 ? `${score}%` : '—'}
                                  </span>
                                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded border uppercase font-bold block mt-1 ${perf.color}`}>
                                    {perf.label.split(' ')[0]}
                                  </span>
                                </div>
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
        )}
      </div>
    </div>
  );
}
