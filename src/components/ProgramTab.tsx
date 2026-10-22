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
  ThumbsUp,
  AlertCircle
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

import { AcademicProgram, FeedbackLevelSettings } from '../types';

interface ProgramTabProps {
  programInfo: { description: string; objectives: string; name: string };
  plos: PLO[];
  onUpdateProgramInfo: (info: { description: string; objectives: string; name: string }) => Promise<void>;
  onUpdatePlos: (plos: PLO[]) => Promise<void>;
  currentProgram?: AcademicProgram;
  onUpdateProgram?: (program: AcademicProgram) => Promise<void>;
  isSandboxMode?: boolean;
  facultySandboxEnabled?: boolean;
  activeRoundId?: string;
  activeRoundName?: string;
  feedbackLevels?: FeedbackLevelSettings;
  comments?: FacultyComment[];
  onAddComment?: (comment: Omit<FacultyComment, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onUpvoteComment?: (commentId: string) => Promise<void>;
  userRole?: string | null;
  voterId?: string;
}

export default function ProgramTab({
  programInfo,
  plos,
  onUpdateProgramInfo,
  onUpdatePlos,
  currentProgram,
  onUpdateProgram,
  isSandboxMode = false,
  facultySandboxEnabled = false,
  activeRoundId = '',
  activeRoundName = '',
  feedbackLevels = { plo: true, dimension: true, rubric: true },
  comments = [],
  onAddComment,
  onDeleteComment,
  onUpvoteComment,
  userRole,
  voterId = ''
}: ProgramTabProps) {
  // Editing state for program info
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedName, setEditedName] = useState(programInfo.name);
  const [editedDesc, setEditedDesc] = useState(programInfo.description);
  const [editedObjectives, setEditedObjectives] = useState(programInfo.objectives);

  // Sync edited fields if programInfo changes
  React.useEffect(() => {
    setEditedName(programInfo.name);
    setEditedDesc(programInfo.description);
    setEditedObjectives(programInfo.objectives);
  }, [programInfo.name, programInfo.description, programInfo.objectives]);

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

  // Quick Paste & Import PLOs Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
  const [selectedPyramidLevel, setSelectedPyramidLevel] = useState<string>('Create');

  // Helper to toggle PLO expansion
  const togglePloExpanded = (id: string) => {
    setExpandedPloIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleParseAndImportPlos = async () => {
    if (!importRawText.trim()) {
      setImportStatusMsg({ type: 'error', text: 'Please paste the curriculum content before importing.' });
      return;
    }

    setIsImporting(true);
    setImportStatusMsg(null);

    try {
      const parsedPlos: PLO[] = [];
      const trimmed = importRawText.trim();

      // Check if user provided JSON format
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const raw = JSON.parse(trimmed);
          const list = Array.isArray(raw) ? raw : [raw];
          list.forEach((item: any, idx: number) => {
            parsedPlos.push({
              id: item.id || `PLO${idx + 1}`,
              programId: currentProgram?.id || 'bcom',
              verb: item.verb || (item.text ? item.text.split(' ')[0] : 'Demonstrate'),
              text: item.text || '',
              bloomLevel: item.bloomLevel || 'Apply',
              order: item.order || idx + 1,
              shortNotation: item.shortNotation || item.name || '',
              dimensions: item.dimensions || []
            });
          });
        } catch (e: any) {
          // If JSON parsing fails, fallback to line-by-line parser below
        }
      }

      // If not parsed via JSON, parse line-by-line structured text
      if (parsedPlos.length === 0) {
        const lines = trimmed.split('\n');
        let currentPlo: Partial<PLO> | null = null;
        let currentDim: any = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Detect PLO header (e.g. "PLO 1:", "PLO1:", "1. PLO:", "PLO 1 - ")
          const ploMatch = line.match(/^(?:PLO|plo)\s*(\d+)[\s.:-]+(.*)$/i);
          if (ploMatch) {
            if (currentPlo && currentPlo.text) {
              parsedPlos.push(currentPlo as PLO);
            }
            const orderNum = parseInt(ploMatch[1]) || (parsedPlos.length + 1);
            const remaining = ploMatch[2].trim();
            const firstWord = remaining.split(' ')[0] || 'Demonstrate';

            currentPlo = {
              id: `PLO${orderNum}`,
              programId: currentProgram?.id || 'bcom',
              order: orderNum,
              verb: firstWord,
              text: remaining || `PLO ${orderNum} Statement`,
              bloomLevel: 'Apply',
              shortNotation: `Outcome ${orderNum}`,
              dimensions: []
            };
            currentDim = null;
            continue;
          }

          if (!currentPlo) {
            // First outcome fallback
            currentPlo = {
              id: `PLO${parsedPlos.length + 1}`,
              programId: currentProgram?.id || 'bcom',
              order: parsedPlos.length + 1,
              verb: line.split(' ')[0] || 'Demonstrate',
              text: line,
              bloomLevel: 'Apply',
              shortNotation: `Outcome ${parsedPlos.length + 1}`,
              dimensions: []
            };
            continue;
          }

          // Detect Bloom Level (e.g. "Bloom: Create" or "Level: Evaluate")
          const bloomMatch = line.match(/^(?:Bloom(?:'s)?(?:\s*Taxonomy)?|Level)[\s.:-]+([A-Za-z]+)/i);
          if (bloomMatch) {
            const levelCandidate = bloomMatch[1].charAt(0).toUpperCase() + bloomMatch[1].slice(1).toLowerCase();
            if (bloomLevels.includes(levelCandidate)) {
              currentPlo.bloomLevel = levelCandidate;
            }
            continue;
          }

          // Detect Short Notation (e.g. "Short: Strategic Responses" or "Title: ...")
          const shortMatch = line.match(/^(?:Short(?:\s*Notation)?|Title|Competency)[\s.:-]+(.*)$/i);
          if (shortMatch) {
            currentPlo.shortNotation = shortMatch[1].trim();
            continue;
          }

          // Detect Dimension (e.g. "Dimension 1.1: Business Environment" or "Dim 1.1:")
          const dimMatch = line.match(/^(?:Dimension|Dim)\s*([\d.]+)[\s.:-]+(.*)$/i);
          if (dimMatch) {
            const dimId = dimMatch[1];
            const dimName = dimMatch[2].trim();
            currentDim = {
              id: dimId,
              name: dimName || `Dimension ${dimId}`,
              rubric: { exceeds: '', meets: '', doesNotMeet: '' }
            };
            currentPlo.dimensions = currentPlo.dimensions || [];
            currentPlo.dimensions.push(currentDim);
            continue;
          }

          // Detect Rubrics
          const exceedsMatch = line.match(/^(?:Exceeds|Exceeds\s*Criteria|Mastery)[\s.:-]+(.*)$/i);
          if (exceedsMatch && currentDim) {
            currentDim.rubric.exceeds = exceedsMatch[1].trim();
            continue;
          }

          const meetsMatch = line.match(/^(?:Meets|Meets\s*Criteria|Proficient)[\s.:-]+(.*)$/i);
          if (meetsMatch && currentDim) {
            currentDim.rubric.meets = meetsMatch[1].trim();
            continue;
          }

          const notMeetsMatch = line.match(/^(?:Does\s*Not\s*Meet|Below\s*Criteria|Developing|Unsatisfactory)[\s.:-]+(.*)$/i);
          if (notMeetsMatch && currentDim) {
            currentDim.rubric.doesNotMeet = notMeetsMatch[1].trim();
            continue;
          }
        }

        if (currentPlo && currentPlo.text) {
          parsedPlos.push(currentPlo as PLO);
        }
      }

      if (parsedPlos.length === 0) {
        throw new Error('No valid PLOs could be parsed from the provided text. Please ensure lines start with "PLO 1:", "Dimension 1.1:", etc.');
      }

      await onUpdatePlos(parsedPlos);
      setImportStatusMsg({ type: 'success', text: `Successfully populated ${parsedPlos.length} PLOs and assessment dimensions!` });
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportRawText('');
        setImportStatusMsg(null);
      }, 1500);
    } catch (err: any) {
      setImportStatusMsg({ type: 'error', text: err.message || 'Import failed. Please check the text format.' });
    } finally {
      setIsImporting(false);
    }
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
    if (!facultySandboxEnabled) return [];
    return comments.filter(c => {
      if (activeRoundId && c.roundId && c.roundId !== activeRoundId) {
        return false;
      }
      if (activeRoundId && !c.roundId && activeRoundId !== 'mba_round_july_2026') {
        return false;
      }
      return (
        c.ploId === ploId &&
        c.targetType === targetType &&
        (targetType === 'description' || c.dimensionId === dimensionId) &&
        (targetType !== 'metric' || c.metricType === metricType)
      );
    });
  };

  const renderCommentTriggerAndPanel = (
    ploId: string,
    targetType: 'description' | 'dimension' | 'metric',
    dimensionId?: string,
    metricType?: 'exceeds' | 'meets' | 'doesNotMeet',
    label: string = ''
  ) => {
    // Check if the specific feedback level is enabled in admin settings
    const isLevelAllowed = 
      targetType === 'description' ? (feedbackLevels?.plo !== false) :
      targetType === 'dimension' ? (feedbackLevels?.dimension !== false) :
      (feedbackLevels?.rubric !== false);

    const targetComments = getCommentsForTarget(ploId, targetType, dimensionId, metricType);

    // If sandbox is inactive, do not render inline comment triggers on live PLOs (archived rounds are viewed in Faculty Feedback Reviews Board tab)
    if (!facultySandboxEnabled) {
      return null;
    }

    // If feedback level is not permitted and no comments exist in this active round, do not render
    if (!isLevelAllowed && targetComments.length === 0) {
      return null;
    }

    return (
      <div className="mt-1 flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveCommentTarget({
              ploId,
              targetType,
              dimensionId,
              metricType,
              label: label || `Feedback Target (${targetType})`
            });
          }}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
            targetComments.length > 0
              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 shadow-xs'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
          }`}
          title="Open faculty feedback dialog"
        >
          <MessageSquare size={11} className={targetComments.length > 0 ? 'text-amber-600 fill-amber-100' : 'text-slate-400'} />
          <span>
            {targetComments.length > 0 ? `${targetComments.length} Feedback` : 'Feedback'}
          </span>
        </button>
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
      const programId = currentProgram?.id || 'mba';
      const cleanPrefix = programId === 'mba' ? '' : `${programId.toUpperCase()}_`;
      const nextNum = plos.length > 0 
        ? Math.max(...plos.map(p => {
            const digits = p.id.replace(/[^0-9]/g, '');
            return parseInt(digits) || 0;
          })) + 1 
        : 1;

      const verbsToSave = newPloHighlightedVerbs.trim()
        ? newPloHighlightedVerbs.split(',').map(v => v.trim()).filter(Boolean)
        : getDefaultBloomVerbs(newPloLevel);

      const newPlo: PLO = {
        id: `${cleanPrefix}PLO${nextNum}`,
        programId: programId,
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
                {programInfo.description || "The ACBSP-accredited Master of Business Administration (MBA) program from University Canada West (UCW) will prepare you for leadership on the global stage. You will learn how to take challenging situations in stride, apply pragmatic solutions to problems and ultimately drive the success of an organization."}
              </p>
            )}
          </div>
          <div className="space-y-4 border-l border-slate-100 pl-8">
            <h3 className="text-sm font-mono font-semibold tracking-wider text-slate-400 uppercase">Program Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Degree Level</span>
                <span className="font-semibold text-slate-700">{currentProgram?.degreeLevel || 'Graduate'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Structure</span>
                <span className="font-semibold text-slate-700">{currentProgram?.termsCount || 4} {currentProgram?.termLabel || 'Term'}s</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Accreditation</span>
                <span className="font-semibold text-slate-700">{currentProgram?.accreditation || 'ACBSP Accredited'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Program PLOs</span>
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

      {/* Program Learning Outcomes (PLOs) Section */}
      <div id="plos-management-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">Program Learning Outcomes (PLOs)</h3>
              {facultySandboxEnabled && activeRoundName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <MessageSquare size={11} className="text-amber-700" />
                  Active Comment Round: {activeRoundName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Define competencies required for graduation, mapping progressive Bloom's levels from early to advanced courses.</p>
          </div>
          {!isSandboxMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition font-semibold text-xs border border-blue-200 shadow-xs cursor-pointer"
                title="Paste and import PLOs, dimensions and rubrics"
              >
                <FileText size={14} /> Quick Paste & Import
              </button>
              <button
                onClick={() => setIsAddingPlo(true)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-medium text-sm shadow-sm cursor-pointer"
              >
                <Plus size={16} /> Add PLO
              </button>
            </div>
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

        {/* PLOs List Grid or Empty State */}
        {plos.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Award size={24} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-bold text-slate-800 text-base">
                No Learning Outcomes defined for {currentProgram?.name || 'this program'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add outcomes manually or use the <strong>Quick Paste & Import</strong> tool to load your complete list of PLOs, Bloom taxonomy levels, assessment dimensions, and rubrics in a single step.
              </p>
            </div>
            {!isSandboxMode && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <FileText size={14} /> Quick Paste & Import Curriculum
                </button>
                <button
                  onClick={() => setIsAddingPlo(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Plus size={14} /> + Add Single PLO
                </button>
              </div>
            )}
          </div>
        ) : (
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded-md">{plo.id}</span>
                      </div>
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
      )}

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
      {/* Active Comment Feedback Drawer / Modal */}
      {activeCommentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl mt-0.5">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">Faculty Feedback & Reviews</h3>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {activeCommentTarget.targetType === 'description' ? 'PLO Statement' : activeCommentTarget.targetType === 'dimension' ? 'Dimension' : 'Rubric Metric'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-1 line-clamp-2">
                    {activeCommentTarget.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveCommentTarget(null);
                  setCommentSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body: Existing Comments */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Reviews & Recommendations ({getCommentsForTarget(activeCommentTarget.ploId, activeCommentTarget.targetType, activeCommentTarget.dimensionId, activeCommentTarget.metricType).length})
                </span>

                {getCommentsForTarget(activeCommentTarget.ploId, activeCommentTarget.targetType, activeCommentTarget.dimensionId, activeCommentTarget.metricType).length === 0 ? (
                  <div className="p-5 text-center bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <p className="text-xs text-slate-500 font-medium">No reviews submitted on this item yet.</p>
                    <p className="text-[11px] text-slate-400">Be the first to share suggestions, taxonomy adjustments, or rubric clarifications.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCommentsForTarget(activeCommentTarget.ploId, activeCommentTarget.targetType, activeCommentTarget.dimensionId, activeCommentTarget.metricType).map((c) => (
                      <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <User size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-800">{c.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">• {new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onUpvoteComment && onUpvoteComment(c.id)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition cursor-pointer ${
                                (c.upvotes || []).includes(voterId)
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                              }`}
                              title="Upvote review"
                            >
                              <ThumbsUp size={10} className={(c.upvotes || []).includes(voterId) ? 'fill-amber-600 text-amber-600' : ''} />
                              <span>{(c.upvotes || []).length}</span>
                            </button>
                            {onDeleteComment && (
                              <button
                                type="button"
                                onClick={() => setCommentToDelete(c)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="Delete review"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                          {c.commentText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {facultySandboxEnabled && (
                activeCommentTarget?.targetType === 'description' ? (feedbackLevels?.plo !== false) :
                activeCommentTarget?.targetType === 'dimension' ? (feedbackLevels?.dimension !== false) :
                (feedbackLevels?.rubric !== false)
              ) ? (
                <form onSubmit={handleSubmitComment} className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Add Your Review
                  </span>

                  <div>
                    <input
                      type="text"
                      placeholder="Your Name (Faculty / Reviewer)"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="Share your evaluation, rubric recommendations, or Bloom level comments..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {commentSuccess && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <Check size={14} />
                      <span>Thank you! Your feedback has been recorded successfully.</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveCommentTarget(null)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Done
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingComment || !authorName.trim() || !commentText.trim()}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      {isSavingComment ? 'Submitting...' : 'Post Feedback'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Feedback Closed
                  </div>
                  <p className="text-[11px] text-amber-700">
                    {!facultySandboxEnabled
                      ? `Faculty Sandbox Review mode is currently inactive for ${currentProgram?.name || 'this program'}. Feedback submissions are paused.`
                      : `New feedback submissions on this specific level (${activeCommentTarget?.targetType}) have been deactivated in Admin Settings. Existing feedback remains recorded.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
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
                  You are about to permanently delete this faculty feedback comment from the ongoing comment round.
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

      {/* Quick Paste & Import Curriculum Structure Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Quick Paste & Import Curriculum Structure</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paste your PLOs, Bloom taxonomy levels, assessment dimensions, and rubrics for <strong>{currentProgram?.name}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatusMsg(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <div className="text-[11px] text-blue-800">
                  <span>Accepts formatted text (<code>PLO 1: ...</code>, <code>Dimension 1.1: ...</code>, <code>Exceeds: ...</code>) or JSON array.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sample = `PLO 1: Apply foundational commercial and business disciplines to evaluate real-world organizational challenges.
Bloom: Apply
Short: Foundational Business Knowledge
Dimension 1.1: Multi-Disciplinary Integration
Exceeds: Demonstrates deep cross-functional understanding connecting marketing, accounting, and finance frameworks.
Meets: Demonstrates adequate integration across two or more core business areas.
Does Not Meet: Lacks integration; treats business functions in complete isolation.

PLO 2: Analyze quantitative and qualitative business data to formulate data-informed decisions.
Bloom: Analyze
Short: Analytical Decision-Making
Dimension 2.1: Quantitative Analysis
Exceeds: Employs rigorous statistical and financial modeling with clear business interpretations.
Meets: Applies standard quantitative tools with minor inaccuracies.
Does Not Meet: Fails to compute or interpret standard business metrics.
Dimension 2.2: Qualitative Analysis
Exceeds: Synthesizes complex qualitative factors and stakeholder perspectives into coherent insights.
Meets: Identifies main qualitative drivers with reasonable contextual relevance.
Does Not Meet: Ignores qualitative factors or draws ungrounded conclusions.

PLO 3: Demonstrate professional communication and ethical leadership in diverse organizational contexts.
Bloom: Evaluate
Short: Ethics & Leadership
Dimension 3.1: Ethical Reasoning
Exceeds: Systematically evaluates complex ethical dilemmas using recognized professional codes and standards.
Meets: Identifies ethical dimensions with basic application of corporate responsibility.
Does Not Meet: Fails to recognize ethical issues or suggests unethical courses of action.
Dimension 3.2: Written Communication
Exceeds: High-impact, polished business reports with professional structure, executive clarity, and impeccable formatting.
Meets: Clear and organized writing appropriate for standard business audiences.
Does Not Meet: Poorly organized writing with substantial clarity or grammatical issues.`;
                    setImportRawText(sample);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg shrink-0 transition cursor-pointer"
                >
                  Load Sample BCom Template
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Curriculum Text / JSON
                </label>
                <textarea
                  value={importRawText}
                  onChange={(e) => setImportRawText(e.target.value)}
                  placeholder="Paste your curriculum outline or JSON here..."
                  rows={12}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {importStatusMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  importStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {importStatusMsg.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                  <span>{importStatusMsg.text}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatusMsg(null);
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParseAndImportPlos}
                disabled={isImporting || !importRawText.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {isImporting ? 'Processing & Saving...' : 'Parse & Save to Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
