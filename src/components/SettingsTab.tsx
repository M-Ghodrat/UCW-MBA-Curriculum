import React, { useState } from 'react';
import { Setting } from '../types';
import { Settings, Check, HelpCircle, Save, Info, AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface SettingsTabProps {
  settings: Setting;
  onSaveSettings: (settings: Setting) => Promise<void>;
  onResetToDefaults?: () => Promise<void>;
  isSeeding?: boolean;
}

export default function SettingsTab({
  settings,
  onSaveSettings,
  onResetToDefaults,
  isSeeding
}: SettingsTabProps) {
  const [termVal, setTermVal] = useState<number>(settings.thresholdTerm);
  const [progVal, setProgVal] = useState<number>(settings.thresholdProgram);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await onSaveSettings({
      id: 'general',
      thresholdTerm: termVal,
      thresholdProgram: progVal
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div id="settings-tab-root" className="max-w-3xl mx-auto space-y-6">
      {/* Settings Panel */}
      <div id="settings-panel-card" className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Curriculum Threshold Settings</h3>
              <p className="text-xs text-slate-400">Configure parameters used to calculate course mapping density and visual indicators.</p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Term threshold slider */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center justify-between">
                <span>Term-Wise PLO Target</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{termVal} CLOs</span>
              </label>
              <p className="text-xs text-slate-400 leading-normal">
                Minimum number of Course Learning Outcome (CLO) mappings required per term to mark a Program Learning Outcome (PLO) as fully covered (Green). Less than this will trigger warning status indicators (Blue/Red).
              </p>
              <input
                type="range"
                min={1}
                max={10}
                value={termVal}
                onChange={(e) => setTermVal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min (1)</span>
                <span>Max (10)</span>
              </div>
            </div>

            {/* Program threshold slider */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 flex items-center justify-between">
                <span>Program-Level PLO Target</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{progVal} CLOs</span>
              </label>
              <p className="text-xs text-slate-400 leading-normal">
                Minimum aggregate number of CLO-to-PLO mappings throughout the entire 2-year MBA curriculum required to certify the PLO is sufficiently established in the whole program.
              </p>
              <input
                type="range"
                min={1}
                max={20}
                value={progVal}
                onChange={(e) => setProgVal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min (1)</span>
                <span>Max (20)</span>
              </div>
            </div>
          </div>

          {/* Explanation panel */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
            <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
              <strong className="text-slate-700 font-bold block">Status and Color Threshold Logic:</strong>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span><strong>Red (Uncovered / 0 mappings)</strong>: PLO has zero course learning outcomes pointing to it. Requires immediate syllabus additions.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                <span><strong>Blue (Partial / &lt; Target)</strong>: PLO is covered but has fewer CLOs than the specified threshold.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span><strong>Green (Sufficient / &gt;= Target)</strong>: PLO receives excellent representation. Well-anchored in the term/program.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
          <div className="flex items-center gap-1">
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                <Check size={14} /> Settings successfully saved database-wide.
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold text-sm shadow-sm"
          >
            <Save size={16} /> Save Thresholds
          </button>
        </div>

        {/* Reset Database Section (Danger Zone) */}
        {onResetToDefaults && (
          <div className="border-t border-red-100 pt-6 mt-6 space-y-4">
            <div>
              <h4 className="font-bold text-rose-700 text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500 shrink-0" /> Danger Zone: Restore AI-designed UCW MBA Curriculum
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                This will reset your database to the complete AI-extracted initial curriculum mapping for the University Canada West (UCW) Master of Business Administration (MBA). All custom added courses, outcomes, and student grades will be overwritten.
              </p>
            </div>
            <div>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to completely restore the database to the AI-designed UCW MBA curriculum and initial mappings? This will delete your custom changes.")) {
                    try {
                      await onResetToDefaults();
                    } catch (e: any) {
                      alert("Error restoring database: " + (e.message || String(e)));
                    }
                  }
                }}
                disabled={isSeeding}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 disabled:opacity-50 transition font-bold text-sm shadow-sm"
              >
                {isSeeding ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> Overwriting with UCW MBA Defaults...
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} /> Restore UCW MBA AI Selection
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
