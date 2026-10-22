import React, { useState, useMemo, useEffect } from 'react';
import { PLO, FacultyComment, FeedbackRound, AcademicProgram, Setting } from '../types';
import {
  MessageCircle,
  MessageSquare,
  Award,
  Layers,
  Filter,
  User,
  Clock,
  ThumbsUp,
  Lock,
  Archive,
  ChevronDown,
  ChevronUp,
  Activity,
  Search,
  CheckCircle2,
  AlertCircle,
  Settings,
  Calendar,
  Eye,
  BookOpen,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface FeedbackReviewsTabProps {
  currentProgram: AcademicProgram;
  feedbackRounds: FeedbackRound[];
  comments: FacultyComment[];
  currentPlos: PLO[];
  settings: Setting;
  onNavigateToSettings?: () => void;
  onDeleteComment?: (commentId: string) => Promise<void>;
  userRole?: string | null;
}

export default function FeedbackReviewsTab({
  currentProgram,
  feedbackRounds,
  comments,
  currentPlos,
  settings,
  onNavigateToSettings,
  onDeleteComment,
  userRole
}: FeedbackReviewsTabProps) {
  const [commentToDelete, setCommentToDelete] = useState<FacultyComment | null>(null);
  // Filter archived rounds for the current program
  const archivedRounds = useMemo(() => {
    const progRounds = feedbackRounds.filter(
      r => r.programId === currentProgram.id && r.status === 'archived'
    );
    return progRounds.sort((a, b) => {
      const dateA = new Date(a.archivedAt || a.createdAt).getTime();
      const dateB = new Date(b.archivedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [feedbackRounds, currentProgram.id]);

  // Also check if there is an active unarchived round right now
  const activeRound = useMemo(() => {
    if (!settings.facultySandboxEnabled || !settings.activeRoundId) return null;
    return feedbackRounds.find(
      r => r.id === settings.activeRoundId && r.programId === currentProgram.id
    ) || {
      id: settings.activeRoundId,
      programId: currentProgram.id,
      name: settings.activeRoundName || 'Active Review Round',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      plosSnapshot: currentPlos
    };
  }, [feedbackRounds, settings, currentProgram.id, currentPlos]);

  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [expandedPloIds, setExpandedPloIds] = useState<{ [id: string]: boolean }>({});
  const [expandedCommentTargets, setExpandedCommentTargets] = useState<{ [key: string]: boolean }>({});
  const [showOnlyPlosWithComments, setShowOnlyPlosWithComments] = useState<boolean>(false);

  // Board Filters
  const [commentFilterPlo, setCommentFilterPlo] = useState<string>('all');
  const [commentFilterType, setCommentFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auto-select the latest archived round when program or archivedRounds change
  useEffect(() => {
    if (archivedRounds.length > 0) {
      if (!selectedRoundId || !archivedRounds.some(r => r.id === selectedRoundId)) {
        setSelectedRoundId(archivedRounds[0].id);
      }
    } else {
      setSelectedRoundId('');
    }
    setCommentFilterPlo('all');
    setCommentFilterType('all');
    setSearchQuery('');
  }, [archivedRounds, currentProgram.id]);

  const selectedRound = useMemo(() => {
    return archivedRounds.find(r => r.id === selectedRoundId) || null;
  }, [archivedRounds, selectedRoundId]);

  // Frozen PLOs from the selected round's snapshot
  const versionPlos = useMemo(() => {
    if (!selectedRound) return [];
    const list = Array.isArray(selectedRound.plosSnapshot) && selectedRound.plosSnapshot.length > 0
      ? selectedRound.plosSnapshot
      : currentPlos;
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [selectedRound, currentPlos]);

  // Comments belonging to the selected archived round
  const versionComments = useMemo(() => {
    if (!selectedRound) return [];
    return comments.filter(c => {
      const cProg = c.programId || (c.id?.startsWith('bcom_') ? 'bcom' : 'mba');
      if (cProg !== currentProgram.id) return false;
      if (c.roundId) {
        return c.roundId === selectedRound.id;
      }
      // Fallback for legacy MBA comments that belong to July 2026
      if (selectedRound.id === 'mba_round_july_2026' && cProg === 'mba') {
        return true;
      }
      return false;
    });
  }, [comments, selectedRound, currentProgram.id]);

  // Active round live comment count (if a round is currently open)
  const activeRoundCommentsCount = useMemo(() => {
    if (!activeRound) return 0;
    return comments.filter(c => {
      const cProg = c.programId || (c.id?.startsWith('bcom_') ? 'bcom' : 'mba');
      return cProg === currentProgram.id && c.roundId === activeRound.id;
    }).length;
  }, [comments, activeRound, currentProgram.id]);

  // Expand all PLOs by default when a version is selected so the admin can immediately see dimensions & attached comments
  useEffect(() => {
    if (versionPlos.length > 0) {
      const initialExpanded: { [id: string]: boolean } = {};
      versionPlos.forEach(p => {
        initialExpanded[p.id] = true;
      });
      setExpandedPloIds(initialExpanded);
    }
  }, [selectedRound?.id, versionPlos.length]);

  const togglePloExpanded = (id: string) => {
    setExpandedPloIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExpandAllPlos = (expand: boolean) => {
    const next: { [id: string]: boolean } = {};
    versionPlos.forEach(p => {
      next[p.id] = expand;
    });
    setExpandedPloIds(next);
  };

  const getCommentsForTarget = (
    ploId: string,
    targetType: 'description' | 'dimension' | 'metric',
    dimensionId?: string,
    metricType?: 'exceeds' | 'meets' | 'doesNotMeet'
  ) => {
    return versionComments.filter(
      c =>
        c.ploId === ploId &&
        c.targetType === targetType &&
        (targetType === 'description' || c.dimensionId === dimensionId) &&
        (targetType !== 'metric' || c.metricType === metricType)
    );
  };

  const getTotalCommentsForPlo = (ploId: string) => {
    return versionComments.filter(c => c.ploId === ploId).length;
  };

  const renderInlineArchivedComments = (
    ploId: string,
    targetType: 'description' | 'dimension' | 'metric',
    dimensionId?: string,
    metricType?: 'exceeds' | 'meets' | 'doesNotMeet',
    contextLabel: string = ''
  ) => {
    const targetComments = getCommentsForTarget(ploId, targetType, dimensionId, metricType);
    if (targetComments.length === 0) return null;

    const targetKey = `${ploId}_${targetType}_${dimensionId || 'root'}_${metricType || 'none'}`;
    // Default expanded if not explicitly collapsed
    const isExpanded = expandedCommentTargets[targetKey] !== false;

    return (
      <div className="mt-2 pt-2 border-t border-amber-200/60 space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedCommentTargets(prev => ({
                ...prev,
                [targetKey]: !isExpanded
              }));
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300 hover:bg-amber-200/80 transition cursor-pointer shadow-2xs"
          >
            <MessageSquare size={11} className="text-amber-700 fill-amber-200" />
            <span>
              {targetComments.length} Archived {targetComments.length === 1 ? 'Comment' : 'Comments'} on {contextLabel}
            </span>
            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          <span className="text-[9px] font-mono text-slate-400 uppercase flex items-center gap-1">
            <Lock size={9} /> Read-Only
          </span>
        </div>

        {isExpanded && (
          <div className="space-y-2 pl-2 border-l-2 border-amber-400">
            {targetComments.map((c) => (
              <div
                key={c.id}
                className="p-2.5 bg-white/95 rounded-xl border border-amber-200/80 shadow-2xs space-y-1 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <User size={10} className="text-amber-600" />
                    <span className="font-bold text-slate-800">{c.authorName}</span>
                    <span className="text-slate-300 font-mono">•</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-mono font-bold text-[9px]">
                      <ThumbsUp size={9} />
                      {(c.upvotes || []).length}
                    </span>
                    {onDeleteComment && userRole === 'admin' && (
                      <button
                        type="button"
                        onClick={() => setCommentToDelete(c)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-sans italic">
                  &ldquo;{c.commentText}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredBoardComments = useMemo(() => {
    return versionComments
      .filter(c => commentFilterPlo === 'all' || c.ploId === commentFilterPlo)
      .filter(c => commentFilterType === 'all' || c.targetType === commentFilterType)
      .filter(c => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.commentText?.toLowerCase().includes(q) ||
          c.authorName?.toLowerCase().includes(q) ||
          c.ploId?.toLowerCase().includes(q) ||
          (c.dimensionId && c.dimensionId.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [versionComments, commentFilterPlo, commentFilterType, searchQuery]);

  const totalDimensionsInSnapshot = useMemo(() => {
    return versionPlos.reduce((acc, p) => acc + (p.dimensions?.length || 0), 0);
  }, [versionPlos]);

  const displayedPlos = useMemo(() => {
    if (!showOnlyPlosWithComments) return versionPlos;
    return versionPlos.filter(p => getTotalCommentsForPlo(p.id) > 0);
  }, [versionPlos, showOnlyPlosWithComments, versionComments]);

  return (
    <div id="feedback-reviews-tab-root" className="space-y-8">
      {/* Top Header & Archived Version Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200/60 shrink-0">
              <Archive size={24} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  {currentProgram.code} Versioned Archives
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  <Lock size={11} className="text-slate-500" /> Read-Only Historical Snapshots
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-1.5">
                Faculty Feedback Reviews Board
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Select an archived comment round version to inspect its consolidated faculty feedback alongside the exact snapshot of Program Learning Outcomes (PLOs), dimensions, and rubrics that faculty commented on during that round.
              </p>
            </div>
          </div>

          {/* Version Selector Dropdown */}
          {archivedRounds.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shrink-0">
              <div className="space-y-0.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Select Archived Version:
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600 shrink-0" />
                  <select
                    value={selectedRoundId}
                    onChange={(e) => setSelectedRoundId(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] cursor-pointer"
                  >
                    {archivedRounds.map((round) => {
                      const rCommentsCount = comments.filter(c => {
                        const cProg = c.programId || (c.id?.startsWith('bcom_') ? 'bcom' : 'mba');
                        if (cProg !== currentProgram.id) return false;
                        if (c.roundId) return c.roundId === round.id;
                        return round.id === 'mba_round_july_2026' && cProg === 'mba';
                      }).length;
                      return (
                        <option key={round.id} value={round.id}>
                          {round.name} ({rCommentsCount} Reviews)
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Unarchived Round Notice Banner (if sandbox review period is currently open) */}
        {activeRound && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-blue-950">
                    Active Comment Round in Progress: &ldquo;{activeRound.name}&rdquo;
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    OPEN ({activeRoundCommentsCount} Comments Collected)
                  </span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  This comment round is currently active in the Faculty Sandbox. Once the comment period is finished, go to <strong>Settings</strong> and click <strong>&ldquo;Archive Comment Round as New Version&rdquo;</strong> to lock and publish it here.
                </p>
              </div>
            </div>
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              >
                <Settings size={14} /> Manage / Archive in Settings
              </button>
            )}
          </div>
        )}

        {/* Empty State if no archived versions exist yet for this program */}
        {archivedRounds.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
              <Archive size={24} />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-bold text-slate-800 text-base">
                No Archived Feedback Versions for {currentProgram.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Archived feedback versions become available here once a Faculty Sandbox comment round is completed and archived by the administrator in <strong>Settings</strong>.
              </p>
            </div>
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Settings size={14} /> Go to Settings to Configure Comment Rounds
              </button>
            )}
          </div>
        ) : selectedRound && (
          <>
            {/* Selected Version Quick Pill Bar & Metadata Summary */}
            <div className="space-y-4">
              {archivedRounds.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mr-1">
                    Versions:
                  </span>
                  {archivedRounds.map((round) => (
                    <button
                      key={round.id}
                      type="button"
                      onClick={() => setSelectedRoundId(round.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                        round.id === selectedRound.id
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Archive size={12} />
                      <span>{round.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Version Audit Banner */}
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-start gap-3">
                  <Lock size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Archived Version: {selectedRound.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                        ARCHIVED &amp; IMMUTABLE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      The PLOs, dimensions, rubrics, and {versionComments.length} faculty comments shown below are permanently linked to the <strong>{selectedRound.name}</strong> review round. Subsequent edits to active program PLOs will not alter this historical record.
                    </p>
                  </div>
                </div>

                {/* Version Metrics */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <div className="px-3 py-2 bg-white rounded-xl border border-amber-200/80 text-center">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Frozen PLOs</span>
                    <span className="text-sm font-bold text-slate-800">{versionPlos.length}</span>
                  </div>
                  <div className="px-3 py-2 bg-white rounded-xl border border-amber-200/80 text-center">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Dimensions</span>
                    <span className="text-sm font-bold text-slate-800">{totalDimensionsInSnapshot}</span>
                  </div>
                  <div className="px-3 py-2 bg-white rounded-xl border border-amber-200/80 text-center">
                    <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block">Total Feedbacks</span>
                    <span className="text-sm font-bold text-amber-700">{versionComments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* When an archived version is selected, show:
          1) The Frozen PLOs of that version with attached comments inline
          2) The Consolidated Feedbacks Review Table for that version */}
      {selectedRound && (
        <>
          {/* SECTION 1: FROZEN PLOS OF THIS VERSION WITH ATTACHED COMMENTS */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Award size={20} className="text-blue-600" />
                  <span>PLOs &amp; Rubrics Snapshot for &ldquo;{selectedRound.name}&rdquo;</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Viewing the exact {versionPlos.length} Program Learning Outcomes and {totalDimensionsInSnapshot} dimensions linked to this comment round, with faculty feedback attached directly to each outcome, dimension, and rubric metric.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnlyPlosWithComments(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    showOnlyPlosWithComments
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {showOnlyPlosWithComments ? 'Showing Only PLOs with Comments' : 'Filter: PLOs with Comments'}
                </button>
                <button
                  type="button"
                  onClick={() => handleExpandAllPlos(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Expand All Rubrics
                </button>
                <button
                  type="button"
                  onClick={() => handleExpandAllPlos(false)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPlos.map((plo) => {
                const ploCommentCount = getTotalCommentsForPlo(plo.id);
                let bloomColor = 'bg-slate-100 text-slate-700';
                if (plo.bloomLevel === 'Remember') bloomColor = 'bg-blue-50 text-blue-700 border-blue-100';
                else if (plo.bloomLevel === 'Understand') bloomColor = 'bg-cyan-50 text-cyan-700 border-cyan-100';
                else if (plo.bloomLevel === 'Apply') bloomColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                else if (plo.bloomLevel === 'Analyze') bloomColor = 'bg-amber-50 text-amber-700 border-amber-100';
                else if (plo.bloomLevel === 'Evaluate') bloomColor = 'bg-orange-50 text-orange-700 border-orange-100';
                else if (plo.bloomLevel === 'Create') bloomColor = 'bg-purple-50 text-purple-700 border-purple-100';

                return (
                  <div
                    key={plo.id}
                    id={`archived-plo-card-${plo.id}`}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Card Top Bar */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-700 uppercase bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                            {plo.id}
                          </span>
                          {ploCommentCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <MessageSquare size={10} />
                              {ploCommentCount}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${bloomColor}`}>
                          {plo.bloomLevel}
                        </span>
                      </div>

                      {plo.shortNotation && (
                        <div className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 max-w-max border border-slate-200">
                          {plo.shortNotation}
                        </div>
                      )}

                      {/* PLO Verb & Outcome Statement */}
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-800">{plo.verb}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{plo.text}</p>
                        {renderInlineArchivedComments(plo.id, 'description', undefined, undefined, `${plo.id} Statement`)}
                      </div>

                      {/* Expand / Collapse Dimensions Button */}
                      {plo.dimensions && plo.dimensions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => togglePloExpanded(plo.id)}
                          className="mt-2 w-full flex items-center justify-between text-xs px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                            <Layers size={12} className="text-blue-600" />
                            {expandedPloIds[plo.id]
                              ? `Hide Dimensions & Rubrics (${plo.dimensions.length})`
                              : `View Dimensions & Rubrics (${plo.dimensions.length})`}
                          </span>
                          {expandedPloIds[plo.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      )}

                      {/* Dimensions & Rubrics with Attached Comments */}
                      {expandedPloIds[plo.id] && plo.dimensions && plo.dimensions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-left">
                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Activity size={10} /> Frozen Assessment Dimensions ({plo.dimensions.length})
                          </h5>
                          <div className="space-y-3">
                            {plo.dimensions.map((dim) => (
                              <div
                                key={dim.id}
                                className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2"
                              >
                                <div className="flex justify-between items-start gap-1.5">
                                  <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200/80 px-1.5 py-0.5 rounded">
                                    {dim.id}
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 flex-1 leading-tight">
                                    {dim.name}
                                  </span>
                                </div>

                                {/* Dimension-level comments */}
                                {renderInlineArchivedComments(
                                  plo.id,
                                  'dimension',
                                  dim.id,
                                  undefined,
                                  `Dim ${dim.id}`
                                )}

                                {/* Rubric levels */}
                                <div className="grid grid-cols-1 gap-2 text-[11px] leading-relaxed pt-1">
                                  <div className="p-2 rounded-lg border border-emerald-200/80 bg-emerald-50/50 text-emerald-900">
                                    <span className="font-bold text-emerald-950 block mb-0.5">Exceeds Standard</span>
                                    <p className="text-[10px] leading-relaxed">{dim.rubric.exceeds || 'N.A'}</p>
                                    {renderInlineArchivedComments(
                                      plo.id,
                                      'metric',
                                      dim.id,
                                      'exceeds',
                                      `Dim ${dim.id} Exceeds`
                                    )}
                                  </div>

                                  <div className="p-2 rounded-lg border border-blue-200/80 bg-blue-50/50 text-slate-800">
                                    <span className="font-bold text-blue-950 block mb-0.5">Meets Standard</span>
                                    <p className="text-[10px] leading-relaxed">{dim.rubric.meets || 'N.A'}</p>
                                    {renderInlineArchivedComments(
                                      plo.id,
                                      'metric',
                                      dim.id,
                                      'meets',
                                      `Dim ${dim.id} Meets`
                                    )}
                                  </div>

                                  <div className="p-2 rounded-lg border border-rose-200/80 bg-rose-50/50 text-rose-900">
                                    <span className="font-bold text-rose-950 block mb-0.5">Does Not Meet Standard</span>
                                    <p className="text-[10px] leading-relaxed">{dim.rubric.doesNotMeet || 'N.A'}</p>
                                    {renderInlineArchivedComments(
                                      plo.id,
                                      'metric',
                                      dim.id,
                                      'doesNotMeet',
                                      `Dim ${dim.id} Does Not Meet`
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: CONSOLIDATED FEEDBACK REVIEWS BOARD FOR THIS VERSION */}
          <div id="faculty-feedback-board" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200/60">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span>Consolidated Feedbacks — Version: {selectedRound.name}</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                      {filteredBoardComments.length} of {versionComments.length} Reviews
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Archived faculty feedback log linked to the {selectedRound.name} PLO snapshot (Read-only).
                  </p>
                </div>
              </div>

              {(commentFilterPlo !== 'all' || commentFilterType !== 'all' || searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setCommentFilterPlo('all');
                    setCommentFilterType('all');
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {versionComments.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-slate-400 text-xs font-medium">
                  No faculty feedback comments were recorded in the &ldquo;{selectedRound.name}&rdquo; round.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Filter size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Filters:</span>
                    </div>

                    {/* Filter by PLO */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">PLO:</span>
                      <select
                        value={commentFilterPlo}
                        onChange={(e) => setCommentFilterPlo(e.target.value)}
                        className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-sans focus:outline-none"
                      >
                        <option value="all">All PLOs</option>
                        {Array.from(new Set(versionComments.map(c => c.ploId))).sort().map(ploId => (
                          <option key={ploId} value={ploId}>{ploId}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter by Target Type */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">Target Type:</span>
                      <select
                        value={commentFilterType}
                        onChange={(e) => setCommentFilterType(e.target.value)}
                        className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg font-sans focus:outline-none"
                      >
                        <option value="all">All Types</option>
                        <option value="description">PLO Statement</option>
                        <option value="dimension">Dimensions</option>
                        <option value="metric">Rubric Metrics</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[220px]">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search comments or author..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Comments List */}
                <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
                  {filteredBoardComments.map((comment) => {
                    const matchedPlo = versionPlos.find(p => p.id === comment.ploId);
                    const matchedDim = matchedPlo?.dimensions?.find(d => d.id === comment.dimensionId);

                    let targetLabel = '';
                    if (comment.targetType === 'description') {
                      targetLabel = `Outcome Statement (${matchedPlo?.shortNotation || comment.ploId})`;
                    } else if (comment.targetType === 'dimension') {
                      targetLabel = `Dimension ${comment.dimensionId || ''}${matchedDim ? `: ${matchedDim.name}` : ''}`;
                    } else if (comment.targetType === 'metric') {
                      targetLabel = `Rubric Metric: ${comment.metricType?.toUpperCase() || ''} — Dim ${comment.dimensionId || ''}${matchedDim ? ` (${matchedDim.name})` : ''}`;
                    }

                    return (
                      <div
                        key={comment.id}
                        className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50/70 px-2 rounded-xl transition"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                              {comment.ploId}
                            </span>
                            <span className="font-semibold text-slate-400 font-mono text-[10px]">|</span>
                            <span className="font-semibold text-slate-600 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                              {targetLabel}
                            </span>
                            <span className="text-slate-300 font-mono">|</span>
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <User size={11} className="text-slate-400" />
                              {comment.authorName}
                            </span>
                            <span className="text-slate-300 font-mono">•</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock size={11} />
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                            <span className="text-slate-300 font-mono">•</span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-lg flex items-center gap-1 font-mono">
                              <ThumbsUp size={10} />
                              <span>{(comment.upvotes || []).length} liked</span>
                            </span>
                          </div>

                          <p className="text-slate-700 text-xs leading-relaxed pl-3 border-l-2 border-amber-400 font-sans italic">
                            &ldquo;{comment.commentText}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onDeleteComment && userRole === 'admin' && (
                            <button
                              type="button"
                              onClick={() => setCommentToDelete(comment)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete faculty review"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedPloIds(prev => ({ ...prev, [comment.ploId]: true }));
                              const el = document.getElementById(`archived-plo-card-${comment.ploId}`);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.classList.add('ring-2', 'ring-amber-500');
                                setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 2200);
                              }
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                            title="View on frozen PLO card"
                          >
                            <Eye size={11} /> View on PLO
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Comment Warning Acceptance Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleIn space-y-4 p-6">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Delete Faculty Comment?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You are about to permanently delete this faculty feedback comment.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1.5 text-xs text-rose-950">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-rose-700">
                <span>AUTHOR: {commentToDelete.authorName}</span>
                <span>{new Date(commentToDelete.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="font-sans italic text-slate-800 line-clamp-3 leading-relaxed">
                &ldquo;{commentToDelete.commentText}&rdquo;
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>This action will permanently delete the comment from Cloud Firestore and cannot be undone.</span>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (onDeleteComment && commentToDelete) {
                    await onDeleteComment(commentToDelete.id);
                    setCommentToDelete(null);
                  }
                }}
                className="px-4.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={13} /> Yes, Delete Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
