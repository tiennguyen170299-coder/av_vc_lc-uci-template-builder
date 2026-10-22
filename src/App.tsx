import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Step1Intake } from './components/Step1Intake';
import { Step2Themes } from './components/Step2Themes';
import { Step3Prototype } from './components/Step3Prototype';
import { ProjectState, INITIAL_PROJECT_STATE, ThemeType } from './types/uci';

const STORAGE_KEY = 'av_vc_lc_uci_builder_state_v1';

export default function App() {
  const [projectState, setProjectState] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to default
    }
    return INITIAL_PROJECT_STATE;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projectState));
    } catch {
      // Ignore storage errors
    }
  }, [projectState]);

  const handleReset = () => {
    if (window.confirm('Reset all UCI configuration to defaults?')) {
      setProjectState(INITIAL_PROJECT_STATE);
    }
  };

  const handleGenerateConcepts = () => {
    setProjectState((prev) => ({ ...prev, currentStep: 2 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToIntake = () => {
    setProjectState((prev) => ({ ...prev, currentStep: 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectThemeAndProceed = (theme: ThemeType) => {
    setProjectState((prev) => ({
      ...prev,
      selectedTheme: theme,
      currentStep: 3,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToThemes = () => {
    setProjectState((prev) => ({ ...prev, currentStep: 2 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100">
      <Header
        projectState={projectState}
        setProjectState={setProjectState}
        onReset={handleReset}
      />

      <main className="flex-1">
        {projectState.currentStep === 1 && (
          <Step1Intake
            projectState={projectState}
            setProjectState={setProjectState}
            onGenerateConcepts={handleGenerateConcepts}
          />
        )}

        {projectState.currentStep === 2 && (
          <Step2Themes
            projectState={projectState}
            setProjectState={setProjectState}
            onBackToIntake={handleBackToIntake}
            onSelectThemeAndProceed={handleSelectThemeAndProceed}
          />
        )}

        {projectState.currentStep === 3 && (
          <Step3Prototype
            projectState={projectState}
            setProjectState={setProjectState}
            onBackToThemes={handleBackToThemes}
            onBackToIntake={handleBackToIntake}
          />
        )}
      </main>

      <footer className="mt-auto border-t border-slate-800/80 bg-[#0e131f] px-6 py-4 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AV/VC/LC UCI Template Builder</span>
            <span>·</span>
            <span>Control System Prototyper</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Compatible with Q-SYS Designer, Crestron Construct & Extron GUI Designer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
