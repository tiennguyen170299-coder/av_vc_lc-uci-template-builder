import React from 'react';
import { Sliders, Layers, Monitor, RotateCcw, CheckCircle2 } from 'lucide-react';
import { ProjectState } from '../types/uci';

interface HeaderProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectState,
  setProjectState,
  onReset,
}) => {
  const steps = [
    { num: 1, label: 'Intake Form', icon: Sliders },
    { num: 2, label: 'Theme Selection', icon: Layers },
    { num: 3, label: 'Interactive Prototype', icon: Monitor },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0e131f]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand title, one line */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-sm tracking-tighter">
          UCI
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white font-sans">
            AV/VC/LC UCI Template Builder
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">
            v2.4 Prototyper
          </span>
        </div>
      </div>

      {/* Zone 2: Step Progress Indicator */}
      <nav aria-label="Wizard Steps" className="hidden md:flex items-center gap-2 text-xs font-medium">
        {steps.map((s, idx) => {
          const isActive = projectState.currentStep === s.num;
          const isDone = projectState.currentStep > s.num;
          const Icon = s.icon;

          return (
            <React.Fragment key={s.num}>
              {idx > 0 && (
                <div
                  className={`w-8 h-[2px] rounded-full transition-colors ${
                    isDone ? 'bg-cyan-500/80' : 'bg-slate-800'
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  // Allow clicking previous steps or current step
                  if (isDone || isActive) {
                    setProjectState((prev) => ({ ...prev, currentStep: s.num as 1 | 2 | 3 }));
                  }
                }}
                disabled={!isDone && !isActive}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-400 ring-1 ring-cyan-500/40 font-semibold'
                    : isDone
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/50 cursor-pointer'
                    : 'text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                )}
                <span>
                  {s.num}. {s.label}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
          title="Reset back to initial intake configuration"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New UCI Intake</span>
        </button>
      </div>
    </header>
  );
};
