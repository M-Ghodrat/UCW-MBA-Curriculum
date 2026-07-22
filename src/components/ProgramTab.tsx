import React, { useState } from 'react';
import { PLO, FacultyComment } from '../types';
import { 
  BookOpen, 
  HelpCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Award, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Activity,
  MessageSquare,
  MessageCircle,
  User,
  Calendar,
  Clock,
  Inbox,
  Filter,
  ThumbsUp
} from 'lucide-react';

const DEFAULT_BLOOM_VERBS: Record<string, string[]> = {
  'Remember': ['Recall', 'Identify', 'Define', 'List', 'Retrieve'],
  'Understand': ['Explain', 'Describe', 'Discuss', 'Classify', 'Interpret'],
  'Apply': ['Apply', 'Implement', 'Solve', 'Use', 'Demonstrate'],
  'Analyze': ['Analyze', 'Compare', 'Contrast', 'Differentiate', 'Examine'],
  'Evaluate': ['Evaluate', 'Assess', 'Appraise', 'Judge', 'Critique'],
  'Create': ['Create', 'Construct', 'Design', 'Develop', 'Formulate']
};

export const getDefaultBloomVerbs = (level: string): string[] => {
  return DEFAULT_BLOOM_VERBS[level] || DEFAULT_BLOOM_VERBS['Remember'];
};

const pyramidLevels = [
  {
    level: 'Create',
    desc: 'Put elements together to form a coherent or functional whole; reorganize elements into a new pattern or structure.',
    verbs: 'Create, Construct, Design, Develop, Formulate, Assemble, Plan, Devise, Compose',
    example: 'Formulate a comprehensive market expansion strategy for a high-tech firm.',
    widthClass: 'w-1/3 min-w-[140px] md:min-w-[180px]',
    activeColorClass: 'bg-purple-50 text-purple-900 border-purple-200 ring-purple-400',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    level: 'Evaluate',
    desc: 'Make judgments based on criteria and standards through checking and critiquing.',
    verbs: 'Evaluate, Assess, Appraise, Judge, Critique, Conclude, Argue, Defend, Rate',
    example: 'Evaluate the financial feasibility and risk profile of a leveraged buyout proposal.',
    widthClass: 'w-[45%] min-w-[180px] md:min-w-[240px]',
    activeColorClass: 'bg-orange-50 text-orange-900 border-orange-200 ring-orange-400',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    level: 'Analyze',
    desc: 'Break material into constituent parts and determine how parts relate to one another and to an overall structure or purpose.',
    verbs: 'Analyze, Compare, Contrast, Differentiate, Examine, Distinguish, Question, Test',
    example: 'Analyze a firm\'s cost structure and value chain to identify sources of competitive advantage.',
    widthClass: 'w-[58%] min-w-[220px] md:min-w-[300px]',
    activeColorClass: 'bg-amber-50 text-amber-900 border-amber-200 ring-amber-400',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    level: 'Apply',
    desc: 'Carry out or use a procedure in a given situation (execution or implementation).',
    verbs: 'Apply, Implement, Solve, Use, Demonstrate, Employ, Illustrate, Practice, Operate',
    example: 'Apply regression analysis models to forecast quarterly sales and customer retention rates.',
    widthClass: 'w-[70%] min-w-[260px] md:min-w-[360px]',
    activeColorClass: 'bg-indigo-50 text-indigo-900 border-indigo-200 ring-indigo-400',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    level: 'Understand',
    desc: 'Construct meaning from oral, written, and graphic messages through interpreting, exemplifying, classifying, summarizing, inferring, comparing, and explaining.',
    verbs: 'Explain, Describe, Discuss, Classify, Interpret, Summarize, Locate, Report, Recognize',
    example: 'Explain the core macroeconomic factors driving current global market volatility.',
    widthClass: 'w-[82%] min-w-[300px] md:min-w-[420px]',
    activeColorClass: 'bg-cyan-50 text-cyan-900 border-cyan-200 ring-cyan-400',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200'
  },
  {
    level: 'Remember',
    desc: 'Retrieve relevant knowledge from long-term memory (recognizing and recalling).',
    verbs: 'Define, Identify, List, Recall, Retrieve, State, Name, Memorize, Repeat',
    example: 'List the key compliance requirements under current international financial reporting standards (IFRS).',
    widthClass: 'w-full min-w-[340px] md:min-w-[480px]',
    activeColorClass: 'bg-blue-50 text-blue-900 border-blue-200 ring-blue-400',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  }
];

interface ProgramTabProps {
  programInfo: { description: string; objectives: string; name: string };
  plos: PLO[];
  onUpdateProgramInfo: (info: { description: string; objectives: string; name: string }) => Promise<void>;
  onUpdatePlos: (plos: PLO[]) => Promise<void>;
  isSandboxMode?: boolean;
  comments?: FacultyComment[];
  onAddComment?: (comment: Omit<FacultyComment, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onUpvotePlo?: (ploId: string) => Promise<void>;
  onUpvoteComment?: (commentId: string) => Promise<void>;
  userRole?: string | null;
  voterId?: string;
}

export default function ProgramTab({
  programInfo,
  plos,
  onUpdateProgramInfo,
  onUpdatePlos,
  isSandboxMode = false,
  comments = [],
  onAddComment,
  onDeleteComment,
  onUpvotePlo,
  onUpvoteComment,
  userRole,
  voterId = ''
}: ProgramTabProps) {
  // Editing state for program info
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedName, setEditedName] = useState(programInfo.name);
  const [editedDesc, setEditedDesc] = useState(programInfo.description);
  const [editedObjectives, setEditedObjectives] = useState(programInfo.objectives);

  // PLO states
  const [editingPloId, setEditingPloId] = useState<string | null>(null);
  const [editedPloVerb, setEditedPloVerb] = useState('');
  const [editedPloText, setEditedPloText] = useState('');
  const [editedPloLevel, setEditedPloLevel] = useState('Remember');
  const [editedPloShortNotation, setEditedPloShortNotation] = useState('');
  const [editedPloDimensions, setEditedPloDimensions] = useState<{ id: string; name: string; rubric: { exceeds: string; meets: string; doesNotMeet: string } }[]>([]);
  const [editedPloHighlightedVerbs, setEditedPloHighlightedVerbs] = useState('');
  
  // Save status states
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingPlo, setIsSavingPlo] = useState<boolean>(false);

  // Adding new PLO state
  const [isAddingPlo, setIsAddingPlo] = useState(false);
  const [newPloVerb, setNewPloVerb] = useState('');
  const [newPloText, setNewPloText] = useState('');
  const [newPloLevel, setNewPloLevel] = useState('Remember');
  const [newPloShortNotation, setNewPloShortNotation] = useState('');
  const [newPloDimensions, setNewPloDimensions] = useState<{ id: string; name: string; rubric: { exceeds: string; meets: string; doesNotMeet: string } }[]>([]);
  const [newPloHighlightedVerbs, setNewPloHighlightedVerbs] = useState('');

  // Expanded PLO card states (dimensions / rubrics drawer)
  const [expandedPloIds, setExpandedPloIds] = useState<{ [id: string]: boolean }>({});

  // Faculty Commenting States
  interface CommentTarget {
    ploId: string;
    targetType: 'description' | 'dimension' | 'metric';
    dimensionId?: string;
    metricType?: 'exceeds' | 'meets' | 'doesNotMeet';
    label: string;
  }
  const [activeCommentTarget, setActiveCommentTarget] = useState<CommentTarget | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Admin Comments Filter States
  const [commentFilterPlo, setCommentFilterPlo] = useState('all');
  const [commentFilterType, setCommentFilterType] = useState('all');
  
  // State for deleting comment confirmation warning modal
  const [commentToDelete, setCommentToDelete] = useState<FacultyComment | null>(null);

  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
  const [selectedPyramidLevel, setSelectedPyramidLevel] = useState<string>('Create');

  // Helper to toggle PLO expansion
  const togglePloExpanded = (id: string) => {
    setExpandedPloIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentTarget) return;
    if (!authorName.trim() || !commentText.trim()) return;

    setIsSavingComment(true);

    if (onAddComment) {
      try {
        await onAddComment({
          ploId: activeCommentTarget.ploId,
          targetType: activeCommentTarget.targetType,
          dimensionId: activeCommentTarget.dimensionId,
          metricType: activeCommentTarget.metricType,
          commentText: commentText.trim(),
          authorName: authorName.trim()
        });
        setCommentSuccess(true);
        setCommentText('');
        // Keep the active comment target open so multiple reviews can be submitted seamlessly
        setTimeout(() => {
          setCommentSuccess(false);
        }, 3000);
      } catch (err) {
        console.error('Failed to save comment:', err);
      } finally {
        setIsSavingComment(false);
      }
    }
  };

  // Helper to count verbs (very basic check)
  const getVerbCountWarning = (text: string, verb: string): string | null => {
    if (!text || !verb) return null;
    const lowerText = text.toLowerCase();
    const commonVerbs = [
      'define', 'identify', 'list', 'recall', 'state', 'describe', 'explain', 'discuss', 
      'apply', 'solve', 'model', 'manage', 'analyze', 'examine', 'compare', 'deconstruct', 
      'evaluate', 'appraise', 'critique', 'create', 'design', 'formulate', 'synthesize', 'prepare'
    ];
    // Find verbs present in text other than the main action verb
    const words = lowerText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
    const foundVerbs = commonVerbs.filter(v => v !== verb.toLowerCase() && words.includes(v));
    
    if (foundVerbs.length > 0) {
      return `Potential secondary action verbs detected: "${foundVerbs.join(', ')}". PLOs should ideally contain only 1 action verb.`;
    }
    if (text.length > 180) {
      return 'The PLO is a bit long. Keep it short and focused for better mapping readability.';
    }
    return null;
  };

  const getCommentsForTarget = (
    ploId: string,
    targetType: 'description' | 'dimension' | 'metric',
    dimensionId?: string,
    metricType?: 'exceeds' | 'meets' | 'doesNotMeet'
  ) => {
    return comments.filter(c => 
      c.ploId === ploId &&
      c.targetType === targetType &&
      (targetType === 'description' || c.dimensionId === dimensionId) &&
      (targetType !== 'metric' || c.metricType === metricType)
    );
  };

  const renderCommentTriggerAndPanel = (
    ploId: string,
    targetType: 'description' | 'dimension' | 'metric',
    dimensionId?: string,
    metricType?: 'exceeds' | 'meets' | 'doesNotMeet',
    label: string = ''
  ) => {
    const targetComments = getCommentsForTarget(ploId, targetType, dimensionId, metricType);
    const hasComments = targetComments.length > 0;
    
    // Check if this specific target is active for input/comment section
    const isSectionActive = activeCommentTarget && 
      activeCommentTarget.ploId === ploId &&
      activeCommentTarget.targetType === targetType &&
      (targetType === 'description' || activeCommentTarget.dimensionId === dimensionId) &&
      (targetType !== 'metric' || activeCommentTarget.metricType === metricType);

    return (
      <div className="mt-1 flex flex-col gap-1.5 text-left">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isSectionActive) {
                setActiveCommentTarget(null);
              } else {
                setActiveCommentTarget({
                  ploId,
                  targetType,
                  dimensionId,
                  metricType,
                  label
                });
                setCommentText('');
              }
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition duration-150 ${
              isSectionActive 
                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                : hasComments
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200'
            }`}
          >
            <MessageSquare size={10} className={hasComments ? 'text-blue-600' : 'text-slate-400'} />
            {hasComments ? `${targetComments.length} Feedback${targetComments.length > 1 ? 's' : ''}` : 'Comment'}
          </button>
        </div>

        {/* Inline Comment panel */}
        {isSectionActive && (
          <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-inner space-y-2.5 animate-fadeIn">
            {/* Existing Comments */}
            {hasComments && (
              <div className="space-y-2 border-b border-slate-100 pb-2.5 max-h-40 overflow-y-auto">
                <span className="text-[9px] font-bold uppercase text-slate-400 font-mono block">Existing Reviews:</span>
                {targetComments.map((c) => {
                  const voterId = localStorage.getItem('voter_id') || '';
                  const upvotes = c.upvotes || [];
                  const hasUpvoted = upvotes.includes(voterId);
                  const isDeletingThis = commentToDelete?.id === c.id;

                  return (
                    <div key={c.id} className={`text-[11px] border p-2 rounded-lg space-y-1 text-left transition duration-150 ${
                      isDeletingThis ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-100'
                    }`}>
                      {isDeletingThis ? (
                        <div className="space-y-2 animate-fadeIn py-1">
                          <div className="flex items-center gap-1 text-rose-800 font-bold text-[10px]">
                            <AlertTriangle size={11} />
                            <span>Confirm deletion?</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-snug">
                            This will permanently remove {c.authorName}'s feedback.
                          </p>
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => setCommentToDelete(null)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[9px] font-bold rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (onDeleteComment) {
                                  try {
                                    await onDeleteComment(c.id);
                                  } catch (e) {
                                    console.error("Failed to delete comment:", e);
                                  }
                                }
                                setCommentToDelete(null);
                              }}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold rounded flex items-center gap-1"
                            >
                              <Trash2 size={9} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center text-[9px] text-slate-500">
                            <span className="font-bold text-slate-700 flex items-center gap-1">
                              <User size={9} className="text-slate-400" />
                              {c.authorName}
                            </span>
                            <span className="font-mono text-[8px] text-slate-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-normal pl-2 border-l-2 border-slate-200">{c.commentText}</p>
                          
                          <div className="flex justify-between items-center pt-1">
                            <div>
                              {!isSandboxMode && onDeleteComment && (
                                <button
                                  type="button"
                                  onClick={() => setCommentToDelete(c)}
                                  className="text-slate-400 hover:text-rose-650 hover:bg-rose-50 p-1 rounded transition-colors"
                                  title="Delete Feedback"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onUpvoteComment && onUpvoteComment(c.id)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                                hasUpvoted
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              <ThumbsUp size={8} />
                              <span>{upvotes.length}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Comment Form */}
            <form onSubmit={handleSubmitComment} className="space-y-2 text-left">
              <span className="text-[9px] font-bold uppercase text-amber-700 font-mono block">Add Your Feedback:</span>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Enter Your Name (Mandatory)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <textarea
                    required
                    rows={2}
                    placeholder={`Provide feedback on this...`}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-sans placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveCommentTarget(null)}
                  className="px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingComment || !authorName.trim() || !commentText.trim()}
                  className="px-2.5 py-1 bg-amber-500 text-white hover:bg-amber-600 text-[10px] font-bold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-1"
                >
                  {isSavingComment ? 'Saving...' : 'Submit'}
                </button>
              </div>
              
              {commentSuccess && (
                <p className="text-[10px] text-emerald-600 font-bold text-center mt-1 animate-fadeIn">✓ Saved successfully!</p>
              )}
            </form>
          </div>
        )}
      </div>
    );
  };

  const handleSaveInfo = async () => {
    setSaveError(null);
    setIsSavingPlo(true);
    try {
      await onUpdateProgramInfo({
        name: editedName,
        description: editedDesc,
        objectives: editedObjectives
      });
      setIsEditingInfo(false);
    } catch (e: any) {
      console.error("Failed to save program info:", e);
      setSaveError(e.message || String(e));
    } finally {
      setIsSavingPlo(false);
    }
  };

  const handleStartEditPlo = (plo: PLO) => {
    setEditingPloId(plo.id);
    setEditedPloVerb(plo.verb);
    setEditedPloText(plo.text);
    setEditedPloLevel(plo.bloomLevel);
    setEditedPloShortNotation(plo.shortNotation || '');
    setEditedPloDimensions(plo.dimensions || []);
    const currentVerbs = plo.highlightedVerbs || getDefaultBloomVerbs(plo.bloomLevel);
    setEditedPloHighlightedVerbs(currentVerbs.join(', '));
  };

  const handleSavePloEdit = async (id: string) => {
    setSaveError(null);
    setIsSavingPlo(true);
    try {
      const updated = plos.map(p => {
        if (p.id === id) {
          return {
            ...p,
            verb: editedPloVerb.trim(),
            text: editedPloText.trim(),
            bloomLevel: editedPloLevel,
            shortNotation: editedPloShortNotation.trim(),
            dimensions: editedPloDimensions,
            highlightedVerbs: editedPloHighlightedVerbs.split(',').map(v => v.trim()).filter(Boolean)
          };
        }
        return p;
      });
      await onUpdatePlos(updated);
      setEditingPloId(null);
    } catch (e: any) {
      console.error("Failed to save PLO:", e);
      setSaveError(e.message || String(e));
    } finally {
      setIsSavingPlo(false);
    }
  };

  const handleAddPlo = async () => {
    if (!newPloVerb.trim() || !newPloText.trim()) return;
    setSaveError(null);
    setIsSavingPlo(true);
    try {
      const nextNum = plos.length > 0 ? Math.max(...plos.map(p => parseInt(p.id.replace('PLO', '')) || 0)) + 1 : 1;
      const verbsToSave = newPloHighlightedVerbs.trim()
        ? newPloHighlightedVerbs.split(',').map(v => v.trim()).filter(Boolean)
        : getDefaultBloomVerbs(newPloLevel);

      const newPlo: PLO = {
        id: `PLO${nextNum}`,
        verb: newPloVerb.trim(),
        text: newPloText.trim(),
        bloomLevel: newPloLevel,
        order: nextNum,
        shortNotation: newPloShortNotation.trim(),
        dimensions: newPloDimensions,
        highlightedVerbs: verbsToSave
      };
      await onUpdatePlos([...plos, newPlo]);
      setNewPloVerb('');
      setNewPloText('');
      setNewPloLevel('Remember');
      setNewPloShortNotation('');
      setNewPloDimensions([]);
      setNewPloHighlightedVerbs('');
      setIsAddingPlo(false);
    } catch (e: any) {
      console.error("Failed to add PLO:", e);
      setSaveError(e.message || String(e));
    } finally {
      setIsSavingPlo(false);
    }
  };

  const handleDeletePlo = async (id: string) => {
    if (confirm(`Are you sure you want to delete ${id}? This will impact any mappings using this PLO.`)) {
      setSaveError(null);
      setIsSavingPlo(true);
      try {
        const updated = plos.filter(p => p.id !== id);
        await onUpdatePlos(updated);
      } catch (e: any) {
        console.error("Failed to delete PLO:", e);
        setSaveError(e.message || String(e));
      } finally {
        setIsSavingPlo(false);
      }
    }
  };

  return (
    <div id="program-tab-root" className="space-y-8">
      {/* Program Header Profile card */}
      <div id="program-profile-card" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Award size={24} />
            </div>
            <div>
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-blue-600">University Canada West (UCW)</span>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="border-b border-blue-500 focus:outline-none focus:border-blue-600 font-bold bg-transparent text-slate-800"
                  />
                ) : (
                  programInfo.name || "Master of Business Administration (MBA)"
                )}
              </h2>
            </div>
          </div>
          
          {isEditingInfo ? (
            <div className="flex gap-2">
              <button
                onClick={handleSaveInfo}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
              >
                <Check size={16} /> Save
              </button>
              <button
                onClick={() => {
                  setEditedName(programInfo.name);
                  setEditedDesc(programInfo.description);
                  setEditedObjectives(programInfo.objectives);
                  setIsEditingInfo(false);
                }}
                className="flex items-center gap-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition font-medium text-sm"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          ) : !isSandboxMode && (
            <button
              onClick={() => setIsEditingInfo(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-mono font-semibold tracking-wider text-slate-400 uppercase">Program Description</h3>
            {isEditingInfo ? (
              <textarea
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                rows={6}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-600"
              />
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {programInfo.description || "The ACBSP and NCMA-accredited Master of Business Administration (MBA) program from University Canada West (UCW) will prepare you for leadership on the global stage. You will learn how to take challenging situations in stride, apply pragmatic solutions to problems and ultimate drive the success of an organization."}
              </p>
            )}
          </div>
          <div className="space-y-4 border-l border-slate-100 pl-8">
            <h3 className="text-sm font-mono font-semibold tracking-wider text-slate-400 uppercase">Program Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-700">2 Years (Full-Time)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Accreditation</span>
                <span className="font-semibold text-slate-700">ACBSP, NCMA</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total PLOs</span>
                <span className="font-semibold text-blue-600 font-mono">{plos.length} Outcomes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-mono font-semibold tracking-wider text-slate-400 uppercase mb-3">Core Learning Objectives & Careers</h3>
          {isEditingInfo ? (
            <textarea
              value={editedObjectives}
              onChange={(e) => setEditedObjectives(e.target.value)}
              rows={4}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-600"
            />
          ) : (
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {programInfo.objectives || "The program develops graduates who can formulate sustainable business strategy, build and direct diverse business teams, conduct analytics-driven business evaluation, and integrate digital technology solutions seamlessly into daily corporate operations."}
            </p>
          )}
        </div>
      </div>

      {/* Admin Faculty Feedback Board */}
      {!isSandboxMode && (
        <div id="faculty-feedback-board" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  Faculty Feedback Reviews Board
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {comments.length} Total
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Consolidated feedback collected from faculties during PLO Sandbox Review sessions.</p>
              </div>
            </div>

            {/* Quick Actions / Reset */}
            {comments.length > 0 && (
              <button
                onClick={() => {
                  setCommentFilterPlo('all');
                  setCommentFilterType('all');
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Content */}
          {comments.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-slate-400 text-xs font-medium">No faculty feedback comments have been recorded in the database yet.</p>
              <p className="text-[11px] text-slate-400 leading-normal max-w-sm mx-auto">
                Switch to <span className="font-semibold text-slate-700">Faculty Sandbox Mode</span> from the top bar to simulate faculty review comments on descriptions, dimensions, and rubric levels.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {/* Filters Header */}
              <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Filter size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Filters:</span>
                </div>

                {/* Filter by PLO */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">PLO:</span>
                  <select
                    value={commentFilterPlo}
                    onChange={(e) => setCommentFilterPlo(e.target.value)}
                    className="p-1 text-xs bg-white border border-slate-200 rounded-md font-sans focus:outline-none"
                  >
                    <option value="all">All PLOs</option>
                    {Array.from(new Set(comments.map(c => c.ploId))).sort().map(ploId => (
                      <option key={ploId} value={ploId}>{ploId}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Type */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Target Type:</span>
                  <select
                    value={commentFilterType}
                    onChange={(e) => setCommentFilterType(e.target.value)}
                    className="p-1 text-xs bg-white border border-slate-200 rounded-md font-sans focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="description">PLO Description</option>
                    <option value="dimension">Dimensions</option>
                    <option value="metric">Rubric Metrics</option>
                  </select>
                </div>
              </div>

              {/* Comments list */}
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {comments
                  .filter(c => commentFilterPlo === 'all' || c.ploId === commentFilterPlo)
                  .filter(c => commentFilterType === 'all' || c.targetType === commentFilterType)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((comment) => {
                    let targetLabel = '';
                    if (comment.targetType === 'description') {
                      targetLabel = 'Outcome Description';
                    } else if (comment.targetType === 'dimension') {
                      targetLabel = `Dimension ${comment.dimensionId || ''}`;
                    } else if (comment.targetType === 'metric') {
                      targetLabel = `Metric: ${comment.metricType?.toUpperCase() || ''} for Dim ${comment.dimensionId || ''}`;
                    }

                    const isDeletingThis = commentToDelete?.id === comment.id;

                    return (
                      <div key={comment.id} className={`py-3.5 flex justify-between items-center gap-4 animate-fadeIn transition-all duration-150 ${
                        isDeletingThis ? 'bg-rose-50/40 -mx-3 px-3 rounded-xl border border-rose-100' : ''
                      }`}>
                        {isDeletingThis ? (
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left font-sans py-1">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                                <AlertTriangle size={13} />
                                <span>Confirm deletion of feedback?</span>
                              </div>
                              <p className="text-[11px] text-slate-500 max-w-md leading-normal">
                                Are you sure you want to permanently delete {comment.authorName}'s review: "{comment.commentText}"?
                              </p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <button
                                type="button"
                                onClick={() => setCommentToDelete(null)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[11px] font-bold rounded-lg transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (onDeleteComment) {
                                    try {
                                      await onDeleteComment(comment.id);
                                    } catch (e) {
                                      console.error("Failed to delete comment:", e);
                                    }
                                  }
                                  setCommentToDelete(null);
                                }}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition flex items-center gap-1"
                              >
                                <Trash2 size={11} />
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                                  {comment.ploId}
                                </span>
                                <span className="font-semibold text-slate-400 font-mono text-[10px]">|</span>
                                <span className="font-semibold text-slate-500 font-mono text-[10px] uppercase bg-slate-100 px-1.5 py-0.5 rounded">
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

                              <p className="text-slate-600 text-xs leading-relaxed pl-3 border-l-2 border-amber-400 font-sans italic">
                                "{comment.commentText}"
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => onUpvoteComment && onUpvoteComment(comment.id)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-bold border transition ${
                                  (comment.upvotes || []).includes(voterId || localStorage.getItem('voter_id') || '')
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                                title="Upvote comment"
                              >
                                <ThumbsUp size={11} />
                                <span>{(comment.upvotes || []).length}</span>
                              </button>

                              {onDeleteComment && (
                                <button
                                  onClick={() => setCommentToDelete(comment)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete Feedback"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Program Learning Outcomes (PLOs) Section */}
      <div id="plos-management-section" className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Program Learning Outcomes (PLOs)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Define competencies required for graduation, mapping progressive Bloom's levels from early to advanced courses.</p>
          </div>
          {!isSandboxMode && (
            <button
              onClick={() => setIsAddingPlo(true)}
              className="flex items-center gap-1 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-medium text-sm shadow-sm"
            >
              <Plus size={16} /> Add PLO
            </button>
          )}
        </div>

        {isSavingPlo && (
          <div className="bg-blue-50 text-blue-800 text-xs font-semibold px-4 py-2.5 rounded-xl border border-blue-100 animate-pulse">
            Saving changes to database... Please wait.
          </div>
        )}

        {saveError && (
          <div className="bg-rose-50 text-rose-800 text-xs p-4 rounded-xl border border-rose-100 space-y-1 relative">
            <button 
              onClick={() => setSaveError(null)}
              className="absolute top-2.5 right-2.5 text-rose-400 hover:text-rose-600 font-bold"
            >
              ✕
            </button>
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <AlertTriangle size={15} /> Failed to save changes
            </div>
            <p className="text-xs text-rose-600 leading-normal">
              {saveError.includes('permission') || saveError.includes('Permission') 
                ? "Permission Denied: Please sign out and sign back in as Curriculum Administrator with the correct passcode to save changes." 
                : saveError}
            </p>
          </div>
        )}

        {/* Adding New PLO Form Card */}
        {isAddingPlo && (
          <div id="add-plo-card" className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4">
            <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" /> Define New PLO
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bloom's Taxonomy Level</label>
                <select
                  value={newPloLevel}
                  onChange={(e) => {
                    const lvl = e.target.value;
                    setNewPloLevel(lvl);
                    setNewPloHighlightedVerbs(getDefaultBloomVerbs(lvl).join(', '));
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                >
                  {bloomLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Primary Action Verb</label>
                <input
                  type="text"
                  placeholder="e.g. Analyze"
                  value={newPloVerb}
                  onChange={(e) => setNewPloVerb(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Short Notation</label>
                <input
                  type="text"
                  placeholder="e.g. Strategic Responses"
                  value={newPloShortNotation}
                  onChange={(e) => setNewPloShortNotation(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Outcome Text</label>
                <input
                  type="text"
                  placeholder="Outcome description starting with verb..."
                  value={newPloText}
                  onChange={(e) => setNewPloText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Dimensions editor inside Add Form */}
            <div className="space-y-3 pt-2 border-t border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Assessment Dimensions ({newPloDimensions.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = plos.length > 0 ? Math.max(...plos.map(p => parseInt(p.id.replace('PLO', '')) || 0)) + 1 : 1;
                    const nextIdx = newPloDimensions.length + 1;
                    setNewPloDimensions(prev => [
                      ...prev,
                      {
                        id: `${nextNum}.${nextIdx}`,
                        name: '',
                        rubric: { exceeds: '', meets: '', doesNotMeet: '' }
                      }
                    ]);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-xl transition duration-150"
                >
                  + Add Dimension
                </button>
              </div>

              {newPloDimensions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                  {newPloDimensions.map((dim, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setNewPloDimensions(prev => prev.filter((_, dIdx) => dIdx !== idx));
                        }}
                        className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 p-1 bg-slate-50 rounded-full hover:bg-rose-50 transition"
                        title="Delete Dimension"
                      >
                        <Trash2 size={14} />
                      </button>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {dim.id}
                        </span>
                        <input
                          type="text"
                          placeholder="Dimension Name (e.g. Written Communication)"
                          value={dim.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, name: val } : d));
                          }}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">Exceeds Rubric Criteria</span>
                          <input
                            type="text"
                            placeholder="e.g. Clear, persuasive, well-structured business writing..."
                            value={dim.rubric.exceeds}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, rubric: { ...d.rubric, exceeds: val } } : d));
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-emerald-800"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 block mb-0.5">Meets Rubric Criteria</span>
                          <input
                            type="text"
                            placeholder="e.g. Clear and organized business writing..."
                            value={dim.rubric.meets}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, rubric: { ...d.rubric, meets: val } } : d));
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-rose-700 block mb-0.5">Does Not Meet Rubric Criteria</span>
                          <input
                            type="text"
                            placeholder="e.g. Unclear, poorly organized writing..."
                            value={dim.rubric.doesNotMeet}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, rubric: { ...d.rubric, doesNotMeet: val } } : d));
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-rose-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isSandboxMode && getVerbCountWarning(newPloText, newPloVerb) && (
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100/50 p-2 rounded-lg font-sans">
                <AlertTriangle size={14} />
                <span>{getVerbCountWarning(newPloText, newPloVerb)}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleAddPlo}
                disabled={!newPloVerb.trim() || !newPloText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50"
              >
                Create PLO
              </button>
              <button
                onClick={() => setIsAddingPlo(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* PLOs List Grid */}
        <div id="plos-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plos.sort((a,b) => a.order - b.order).map((plo) => {
            const isEditing = editingPloId === plo.id;
            const warning = getVerbCountWarning(isEditing ? editedPloText : plo.text, isEditing ? editedPloVerb : plo.verb);

            // Give color badge based on bloom's taxonomy
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
                id={`plo-card-${plo.id}`}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-200 hover:shadow-md transition duration-200"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-md">{plo.id}</span>
                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <select
                          value={editedPloLevel}
                          onChange={(e) => {
                            const lvl = e.target.value;
                            setEditedPloLevel(lvl);
                            setEditedPloHighlightedVerbs(getDefaultBloomVerbs(lvl).join(', '));
                          }}
                          className="text-xs px-2 py-1 border border-slate-200 rounded-md bg-white focus:outline-none"
                        >
                          {bloomLevels.map(lvl => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                      ) : (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${bloomColor}`}>
                            {plo.bloomLevel}
                          </span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Verb</label>
                          <input
                            type="text"
                            value={editedPloVerb}
                            onChange={(e) => setEditedPloVerb(e.target.value)}
                            placeholder="Verb"
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Short Notation</label>
                          <input
                            type="text"
                            value={editedPloShortNotation}
                            onChange={(e) => setEditedPloShortNotation(e.target.value)}
                            placeholder="Short Notation"
                            className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Outcome Description</label>
                        <textarea
                          value={editedPloText}
                          onChange={(e) => setEditedPloText(e.target.value)}
                          rows={3}
                          placeholder="Outcome Description"
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-600"
                        />
                      </div>

                      {/* Dimensions editor inside card editing */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-700">Dimensions ({editedPloDimensions.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const baseNum = plo.id.replace('PLO', '');
                              const nextIdx = editedPloDimensions.length + 1;
                              setEditedPloDimensions(prev => [
                                ...prev,
                                {
                                  id: `${baseNum}.${nextIdx}`,
                                  name: '',
                                  rubric: { exceeds: '', meets: '', doesNotMeet: '' }
                                }
                              ]);
                            }}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                          >
                            + Add Dimension
                          </button>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {editedPloDimensions.map((dim, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 relative">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditedPloDimensions(prev => prev.filter((_, dIdx) => dIdx !== idx));
                                }}
                                className="absolute top-1 right-1 text-rose-500 hover:text-rose-700 p-1"
                                title="Delete Dimension"
                              >
                                <Trash2 size={12} />
                              </button>
                              
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.5 rounded">
                                  {dim.id || `${plo.id.replace('PLO', '')}.${idx + 1}`}
                                </span>
                                <input
                                  type="text"
                                  placeholder="Dimension Name"
                                  value={dim.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditedPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, name: val } : d));
                                  }}
                                  className="flex-1 p-1 bg-white border border-slate-200 rounded text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <input
                                  type="text"
                                  placeholder="Exceeds Criteria"
                                  value={dim.rubric.exceeds}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditedPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, rubric: { ...d.rubric, exceeds: val } } : d));
                                  }}
                                  className="w-full p-1 bg-white border border-slate-200 rounded text-[10px] text-emerald-800"
                                />
                                <input
                                  type="text"
                                  placeholder="Meets Criteria"
                                  value={dim.rubric.meets}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditedPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, rubric: { ...d.rubric, meets: val } } : d));
                                  }}
                                  className="w-full p-1 bg-white border border-slate-200 rounded text-[10px] text-slate-700"
                                />
                                <input
                                  type="text"
                                  placeholder="Does Not Meet Criteria"
                                  value={dim.rubric.doesNotMeet}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditedPloDimensions(prev => prev.map((d, dIdx) => dIdx === idx ? { ...d, rubric: { ...d.rubric, doesNotMeet: val } } : d));
                                  }}
                                  className="w-full p-1 bg-white border border-slate-200 rounded text-[10px] text-rose-800"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {plo.shortNotation && (
                          <div className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 max-w-max border border-slate-200">
                            {plo.shortNotation}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-800">
                          {plo.verb}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {plo.text}
                        </p>
                        {renderCommentTriggerAndPanel(
                          plo.id,
                          'description',
                          undefined,
                          undefined,
                          `PLO ${plo.id.replace('PLO', '')} Description ("${plo.verb}...")`
                        )}
                      </div>

                      {plo.dimensions && plo.dimensions.length > 0 && (
                        <button
                          onClick={() => togglePloExpanded(plo.id)}
                          className="mt-2 w-full flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition duration-150"
                        >
                          <span className="flex items-center gap-1 font-medium text-[11px]">
                            <Layers size={12} className="text-slate-500" />
                            {expandedPloIds[plo.id] ? 'Hide Details' : `View Rubrics (${plo.dimensions.length})`}
                          </span>
                          {expandedPloIds[plo.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}

                      {expandedPloIds[plo.id] && plo.dimensions && plo.dimensions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-left">
                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Activity size={10} /> Assessment Dimensions
                          </h5>
                          <div className="space-y-3">
                            {plo.dimensions.map((dim) => (
                              <div key={dim.id} className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
                                <div className="flex justify-between items-start gap-1.5">
                                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1 py-0.2 rounded">
                                    {dim.id}
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-700 flex-1 leading-tight">
                                    {dim.name}
                                  </span>
                                </div>
                                {renderCommentTriggerAndPanel(
                                  plo.id,
                                  'dimension',
                                  dim.id,
                                  undefined,
                                  `Dimension ${dim.id} ("${dim.name}")`
                                )}
                                
                                <div className="grid grid-cols-1 gap-1.5 text-[10px] leading-relaxed">
                                  <div className="p-1.5 rounded-lg border border-emerald-100 bg-emerald-50/40 text-emerald-800 flex flex-col justify-between">
                                    <div>
                                      <span className="font-bold text-emerald-900 block mb-0.5">Exceeds</span>
                                      {dim.rubric.exceeds || 'N.A'}
                                    </div>
                                    {renderCommentTriggerAndPanel(
                                      plo.id,
                                      'metric',
                                      dim.id,
                                      'exceeds',
                                      `Dimension ${dim.id} - Exceeds Criteria`
                                    )}
                                  </div>
                                  <div className="p-1.5 rounded-lg border border-blue-100 bg-blue-50/40 text-slate-700 flex flex-col justify-between">
                                    <div>
                                      <span className="font-bold text-blue-900 block mb-0.5">Meets</span>
                                      {dim.rubric.meets || 'N.A'}
                                    </div>
                                    {renderCommentTriggerAndPanel(
                                      plo.id,
                                      'metric',
                                      dim.id,
                                      'meets',
                                      `Dimension ${dim.id} - Meets Criteria`
                                    )}
                                  </div>
                                  <div className="p-1.5 rounded-lg border border-rose-100 bg-rose-50/40 text-rose-800 flex flex-col justify-between">
                                    <div>
                                      <span className="font-bold text-rose-900 block mb-0.5 font-sans">Does Not Meet</span>
                                      {dim.rubric.doesNotMeet || 'N.A'}
                                    </div>
                                    {renderCommentTriggerAndPanel(
                                      plo.id,
                                      'metric',
                                      dim.id,
                                      'doesNotMeet',
                                      `Dimension ${dim.id} - Does Not Meet Criteria`
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!isSandboxMode && warning && (
                    <div className="flex items-start gap-1.5 text-[11px] text-blue-700 bg-blue-50/80 p-2 rounded-lg border border-blue-100 font-sans">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                      <span>{warning}</span>
                    </div>
                  )}
                </div>

                {!isSandboxMode && (
                  <div className="mt-6 pt-4 border-t border-slate-50 flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSavePloEdit(plo.id)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                          title="Save PLO"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingPloId(null)}
                          className="p-1.5 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-lg transition"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEditPlo(plo)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                          title="Edit PLO"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePlo(plo.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete PLO"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bloom's Taxonomy Verbs Reference Section */}
        <div id="bloom-taxonomy-pyramid-section" className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6 text-left">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" />
              Interactive Bloom's Taxonomy Curriculum Pyramid
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore the cognitive rigor of the MBA curriculum map. Click any tier of the pyramid to inspect matching Program Learning Outcomes (PLOs) and representative action verbs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Pyramid Visual Container (Left Side) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center py-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-6">Cognitive Complexity</span>
              
              <div className="flex flex-col items-center space-y-2 w-full max-w-md">
                {pyramidLevels.map((p, index) => {
                  const isSelected = selectedPyramidLevel === p.level;
                  const plosAtLevel = plos.filter(plo => plo.bloomLevel === p.level);
                  
                  // Style colors based on level and selected state
                  let tierStyles = '';
                  if (p.level === 'Create') {
                    tierStyles = isSelected 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 border-purple-700' 
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200/60';
                  } else if (p.level === 'Evaluate') {
                    tierStyles = isSelected 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 border-orange-700' 
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200/60';
                  } else if (p.level === 'Analyze') {
                    tierStyles = isSelected 
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-100 border-amber-700' 
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200/60';
                  } else if (p.level === 'Apply') {
                    tierStyles = isSelected 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 border-indigo-700' 
                      : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-200/60';
                  } else if (p.level === 'Understand') {
                    tierStyles = isSelected 
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100 border-cyan-700' 
                      : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-200/60';
                  } else if (p.level === 'Remember') {
                    tierStyles = isSelected 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 border-blue-700' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200/60';
                  }

                  return (
                    <button
                      key={p.level}
                      onClick={() => setSelectedPyramidLevel(p.level)}
                      className={`h-11 ${p.widthClass} flex items-center justify-between px-6 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm select-none ${tierStyles} ${
                        isSelected ? 'scale-[1.03] ring-2 ring-offset-2 ring-slate-400 border-transparent z-10' : 'hover:scale-[1.01]'
                      }`}
                      style={{
                        clipPath: 'polygon(7% 0%, 93% 0%, 100% 100%, 0% 100%)'
                      }}
                    >
                      <span className="pl-2 font-sans tracking-wide text-[11px] uppercase font-bold">{p.level}</span>
                      <span className="pr-2 font-mono text-[9px] font-bold opacity-90">
                        {plosAtLevel.length} {plosAtLevel.length === 1 ? 'PLO' : 'PLOs'}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-between w-full max-w-xs mt-6 text-[9px] font-mono text-slate-400 font-bold px-2">
                <span>HIGHER-ORDER (TOP)</span>
                <span>LOWER-ORDER (BASE)</span>
              </div>
            </div>

            {/* Selected Level Reference Card (Right Side) */}
            <div className="lg:col-span-7">
              {(() => {
                const currentData = pyramidLevels.find(p => p.level === selectedPyramidLevel) || pyramidLevels[0];
                const matchingPlos = plos.filter(plo => plo.bloomLevel === currentData.level);
                
                return (
                  <div className={`p-6 rounded-2xl border transition-all duration-300 ${currentData.activeColorClass} shadow-sm space-y-4`}>
                    <div className="flex justify-between items-start border-b border-slate-200/40 pb-3">
                      <div>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${currentData.badgeColor}`}>
                          Cognitive Level {6 - bloomLevels.indexOf(currentData.level)} of 6
                        </span>
                        <h4 className="text-xl font-black tracking-tight mt-1.5 text-slate-800">{currentData.level}</h4>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Cognitive Definition</span>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium mt-1">
                          {currentData.desc}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200/40">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Action Verbs List</span>
                          <p className="text-xs text-slate-800 font-bold leading-relaxed mt-1">
                            {currentData.verbs}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Learning Objective Example</span>
                          <p className="text-xs text-slate-600 italic mt-1 leading-relaxed">
                            "{currentData.example}"
                          </p>
                        </div>
                      </div>

                      {/* Matching PLOs List */}
                      <div className="pt-3 border-t border-slate-200/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
                          Program Learning Outcomes mapped to this level ({matchingPlos.length})
                        </span>
                        
                        {matchingPlos.length === 0 ? (
                          <div className="text-center py-4 bg-white/50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 italic">
                            No PLOs are currently mapped to the {currentData.level} level.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            {matchingPlos.map(plo => (
                              <button
                                key={plo.id}
                                onClick={() => {
                                  const card = document.getElementById(`plo-card-${plo.id}`);
                                  if (card) {
                                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    card.classList.add('ring-2', 'ring-blue-500');
                                    setTimeout(() => card.classList.remove('ring-2', 'ring-blue-500'), 2000);
                                  }
                                }}
                                className="bg-white border border-slate-200/80 hover:border-slate-300 p-2.5 rounded-xl text-left transition hover:shadow-sm flex flex-col justify-between h-full group"
                              >
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{plo.id}</span>
                                    {plo.shortNotation && (
                                      <span className="text-[9px] font-mono text-slate-500 truncate max-w-[120px]">{plo.shortNotation}</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-700 font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    {plo.verb} {plo.text}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
