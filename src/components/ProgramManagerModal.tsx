import React, { useState } from 'react';
import { AcademicProgram } from '../types';
import { 
  X, 
  Plus, 
  GraduationCap, 
  Check, 
  Layers, 
  Trash2, 
  Edit3, 
  ArrowRight,
  BookOpen,
  Sparkles,
  HelpCircle,
  Building
} from 'lucide-react';

interface ProgramManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  programs: AcademicProgram[];
  selectedProgramId: string;
  onSelectProgram: (programId: string) => void;
  onCreateProgram: (
    newProgram: AcademicProgram, 
    templateChoice: 'blank' | 'bcom_template' | 'mba_template'
  ) => Promise<void>;
  onUpdateProgram: (updatedProgram: AcademicProgram) => Promise<void>;
  onDeleteProgram: (programId: string) => Promise<void>;
}

export default function ProgramManagerModal({
  isOpen,
  onClose,
  programs,
  selectedProgramId,
  onSelectProgram,
  onCreateProgram,
  onUpdateProgram,
  onDeleteProgram
}: ProgramManagerModalProps) {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);

  // Form states for Create / Edit
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [degreeLevel, setDegreeLevel] = useState<'Graduate' | 'Undergraduate' | 'Certificate'>('Undergraduate');
  const [accreditation, setAccreditation] = useState('ACBSP Accredited');
  const [termsCount, setTermsCount] = useState<number>(8);
  const [termLabel, setTermLabel] = useState('Term');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [templateChoice, setTemplateChoice] = useState<'blank' | 'bcom_template' | 'mba_template'>('blank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setCode('');
    setName('');
    setDegreeLevel('Undergraduate');
    setAccreditation('ACBSP Accredited');
    setTermsCount(8);
    setTermLabel('Term');
    setDescription('');
    setObjectives('');
    setTemplateChoice('blank');
    setErrorMessage('');
    setEditingProgram(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveView('create');
  };

  const handleStartEdit = (p: AcademicProgram) => {
    setEditingProgram(p);
    setCode(p.code);
    setName(p.name);
    setDegreeLevel(p.degreeLevel);
    setAccreditation(p.accreditation || '');
    setTermsCount(p.termsCount || 4);
    setTermLabel(p.termLabel || 'Term');
    setDescription(p.description || '');
    setObjectives(p.objectives || '');
    setErrorMessage('');
    setActiveView('edit');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!code.trim() || !name.trim()) {
      setErrorMessage('Program Code and Program Name are required.');
      return;
    }

    const cleanId = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanId) {
      setErrorMessage('Please provide a valid alphanumeric program code.');
      return;
    }

    if (programs.some(p => p.id === cleanId)) {
      setErrorMessage(`A program with code/ID "${cleanId}" already exists. Please choose a unique code.`);
      return;
    }

    const newProg: AcademicProgram = {
      id: cleanId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      degreeLevel,
      accreditation: accreditation.trim() || undefined,
      termsCount: Number(termsCount) || 4,
      termLabel: termLabel.trim() || 'Term',
      description: description.trim() || `Official curriculum workspace for ${name.trim()}.`,
      objectives: objectives.trim() || `Develop competent graduates equipped with discipline-specific and leadership capabilities in ${name.trim()}.`,
      createdAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    try {
      await onCreateProgram(newProg, templateChoice);
      onSelectProgram(cleanId);
      setActiveView('list');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    setErrorMessage('');

    if (!code.trim() || !name.trim()) {
      setErrorMessage('Program Code and Program Name are required.');
      return;
    }

    const updatedProg: AcademicProgram = {
      ...editingProgram,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      degreeLevel,
      accreditation: accreditation.trim() || undefined,
      termsCount: Number(termsCount) || 4,
      termLabel: termLabel.trim() || 'Term',
      description: description.trim(),
      objectives: objectives.trim()
    };

    setIsSubmitting(true);
    try {
      await onUpdateProgram(updatedProg);
      setActiveView('list');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {activeView === 'list' && 'Academic Programs Directory'}
                {activeView === 'create' && 'Add New Academic Program'}
                {activeView === 'edit' && `Edit Program: ${editingProgram?.code}`}
              </h3>
              <p className="text-xs text-slate-400">
                {activeView === 'list' && 'Switch active curriculum workspaces or create new university programs.'}
                {activeView === 'create' && 'Configure structure, degree level, and starting content for the new program.'}
                {activeView === 'edit' && 'Update program metadata, term structures, and accreditation tags.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          {activeView === 'list' ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Available Programs ({programs.length})
                </span>
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-semibold shadow-sm transition"
                >
                  <Plus size={14} /> Add New Program
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {programs.map((p) => {
                  const isSelected = p.id === selectedProgramId;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-300/50 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                            {p.code}
                          </span>
                          <span className="font-bold text-sm text-slate-800">
                            {p.name}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.degreeLevel === 'Graduate' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {p.degreeLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {p.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span>{p.termsCount || 4} {p.termLabel || 'Term'}s</span>
                          {p.accreditation && <span>• {p.accreditation}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected ? (
                          <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">
                            <Check size={13} /> Active
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectProgram(p.id);
                              onClose();
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-xs font-semibold transition"
                          >
                            Switch <ArrowRight size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Program Details"
                        >
                          <Edit3 size={15} />
                        </button>

                        {programs.length > 1 && p.id !== 'mba' && (
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete program "${p.name}"? This action cannot be undone.`)) {
                                await onDeleteProgram(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Program"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={activeView === 'create' ? handleCreateSubmit : handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCom, MBA, BABA"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={activeView === 'edit'}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                  />
                  {activeView === 'create' && (
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Short identifier used in routes and IDs</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Degree Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={degreeLevel}
                    onChange={(e) => setDegreeLevel(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Undergraduate">Undergraduate (Bachelor)</option>
                    <option value="Graduate">Graduate (Master / Post-Grad)</option>
                    <option value="Certificate">Certificate / Diploma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Program Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Commerce (BCom)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Terms
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={termsCount}
                    onChange={(e) => setTermsCount(parseInt(e.target.value) || 4)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. 4 for MBA, 8 for BCom</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Term Label
                  </label>
                  <input
                    type="text"
                    value={termLabel}
                    onChange={(e) => setTermLabel(e.target.value)}
                    placeholder="Term, Semester, Quarter"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Displayed on tabs and matrix</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accreditation
                  </label>
                  <input
                    type="text"
                    value={accreditation}
                    onChange={(e) => setAccreditation(e.target.value)}
                    placeholder="e.g. ACBSP Accredited"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {activeView === 'create' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Starter Curriculum Template
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setTemplateChoice('bcom_template')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        templateChoice === 'bcom_template'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-400'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-1">BCom Starter Kit</span>
                      <span className="text-[11px] text-slate-500 leading-snug block">
                        Includes 6 undergraduate PLOs, 9 core commerce courses, and mappings.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplateChoice('blank')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        templateChoice === 'blank'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-400'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-1">Blank Slate</span>
                      <span className="text-[11px] text-slate-500 leading-snug block">
                        Start with a completely empty curriculum to design from scratch.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTemplateChoice('mba_template')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        templateChoice === 'mba_template'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-400'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-1">Clone MBA Model</span>
                      <span className="text-[11px] text-slate-500 leading-snug block">
                        Preload with the 6 MBA PLOs and 4-tier course outline structure.
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Official program description..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Learning Goals & Objectives
                </label>
                <textarea
                  rows={3}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Core objectives developed in graduates..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveView('list');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !code.trim() || !name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting 
                    ? 'Saving...' 
                    : (activeView === 'create' ? 'Create Program Workspace' : 'Save Changes')
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
