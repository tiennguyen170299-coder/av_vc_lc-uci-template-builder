import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Check,
  Sliders,
  Tv,
  Camera,
  Maximize2,
  Volume2,
  Wand2,
  Sun,
  Shield,
  Layers,
} from 'lucide-react';
import { ProjectState, ThemeType, getAspectRatioDetails } from '../types/uci';

interface Step2ThemesProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
  onBackToIntake: () => void;
  onSelectThemeAndProceed: (theme: ThemeType) => void;
}

interface ThemeSpec {
  id: ThemeType;
  name: string;
  tagline: string;
  description: string;
  colors: {
    bg: string;
    card: string;
    accent: string;
    text: string;
    border: string;
  };
  features: string[];
}

const THEME_SPECS: ThemeSpec[] = [
  {
    id: 'Flat Modern',
    name: 'Flat Modern',
    tagline: 'Precision Vector & Dark Slate Minimalist',
    description: 'Crisp borders, clean typographic hierarchy, and electric cyan/blue accents. Engineered for rapid comprehension and high touch precision.',
    colors: {
      bg: 'bg-[#0f172a]',
      card: 'bg-[#1e293b]',
      accent: 'bg-cyan-500 text-white',
      text: 'text-slate-100',
      border: 'border-slate-700',
    },
    features: ['Low visual fatigue in dark control rooms', 'Standard Q-SYS / HTML5 CSS styling', 'Subtle 1px hairline dividers'],
  },
  {
    id: 'Neumorphic',
    name: 'Neumorphic Tactile',
    tagline: 'Extruded Touch Surfaces & Physical AV Feel',
    description: 'Soft debossed fader wells, elevated tactile button caps, and gentle ambient lighting. Recreates the feel of high-end hardware consoles.',
    colors: {
      bg: 'bg-[#151922]',
      card: 'bg-[#1b202c]',
      accent: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20',
      text: 'text-slate-200',
      border: 'border-slate-800/80',
    },
    features: ['Debossed slider tracks & push-button response', 'Crestron Smart Graphics tactile depth', 'Warm amber/gold feedback accents'],
  },
  {
    id: 'High Contrast',
    name: 'High Contrast Broadcast',
    tagline: 'OLED Pure Black & Vibrant Broadcast Tallies',
    description: 'Deep pitch-black backdrop with neon tally states (emerald green, alert crimson, vivid azure). Maximum legibility in live broadcast booths.',
    colors: {
      bg: 'bg-[#050505]',
      card: 'bg-[#111111]',
      accent: 'bg-emerald-500 text-black font-bold',
      text: 'text-white',
      border: 'border-emerald-500/50',
    },
    features: ['OLED true-black zero backlight bleed', 'Direct broadcast tally dots (Green active, Red mute)', 'Extra-large touch targets with thick borders'],
  },
  {
    id: 'Midnight Navy',
    name: 'Midnight Navy',
    tagline: 'Corporate Blue Depth & Executive Boardroom',
    description: 'Deep indigo-navy surfaces with crisp sky-blue accents. A refined, professional palette for boardrooms and command centers.',
    colors: {
      bg: 'bg-[#0b1428]',
      card: 'bg-[#1b2a4a]',
      accent: 'bg-indigo-600 text-white',
      text: 'text-slate-100',
      border: 'border-indigo-800/60',
    },
    features: ['Premium corporate blue tint', 'Sky-blue active routing tallies', 'Low-glare for dimmed meeting rooms'],
  },
  {
    id: 'Graphite Slate',
    name: 'Graphite Slate',
    tagline: 'Neutral Charcoal Monochrome',
    description: 'Cool graphite and zinc surfaces with restrained monochrome accents. A timeless, hardware-neutral finish that pairs with any AV rack.',
    colors: {
      bg: 'bg-[#1a1c21]',
      card: 'bg-[#2a2d34]',
      accent: 'bg-zinc-400 text-zinc-950',
      text: 'text-slate-200',
      border: 'border-zinc-700',
    },
    features: ['Hardware-neutral charcoal tone', 'Subtle tonal depth without color bias', 'Reduced eye strain in technical stations'],
  },
  {
    id: 'Light Clean',
    name: 'Light Clean',
    tagline: 'Bright Airy & Minimal White',
    description: 'Crisp white surfaces, hairline slate borders, and clean sky-blue accents. Ideal for daylight-lit lobbies and education spaces.',
    colors: {
      bg: 'bg-[#f6f8fa]',
      card: 'bg-white',
      accent: 'bg-sky-600 text-white',
      text: 'text-slate-800',
      border: 'border-slate-300',
    },
    features: ['Bright surfaces for daylight spaces', 'Minimal light-grey hairline dividers', 'Sky-blue active state distinction'],
  },
  {
    id: 'Warm Daylight',
    name: 'Warm Daylight',
    tagline: 'Soft Amber & Sunlit Comfort',
    description: 'Warm cream and amber surfaces that feel inviting and residential. Comfortable for hospitality, worship, and multi-purpose rooms.',
    colors: {
      bg: 'bg-[#fbf5e9]',
      card: 'bg-white',
      accent: 'bg-amber-500 text-white',
      text: 'text-amber-950',
      border: 'border-amber-200',
    },
    features: ['Warm cream hospitality palette', 'Amber active states & faders', 'Soft, glare-free sunlit surfaces'],
  },
];

const SUGGESTED_REFINEMENT_PROMPTS = [
  'Add glowing tally indicators on active video routing crosspoints',
  'Include high-contrast PIN passcode lock subpage flip for admin',
  'Configure vertical mic fader bank with Lectern, Handhelds, and Mute',
  'Crestron Dark Navy corporate palette with Room Combine status banner',
  'Compact touch targets optimized for 10-inch TSC touch panel',
];

export const Step2Themes: React.FC<Step2ThemesProps> = ({
  projectState,
  setProjectState,
  onBackToIntake,
  onSelectThemeAndProceed,
}) => {
  const [promptInput, setPromptInput] = useState(projectState.aiRefinementPrompt);
  const [activeRefinementFeedback, setActiveRefinementFeedback] = useState<string | null>(null);

  const ratioInfo = getAspectRatioDetails(projectState.aspectRatio);

  const handleApplyRefinement = () => {
    const trimmed = promptInput.trim();
    if (!trimmed) return;

    setProjectState((prev) => ({
      ...prev,
      aiRefinementPrompt: trimmed,
      appliedRefinements: Array.from(new Set([...prev.appliedRefinements, trimmed])),
    }));

    setActiveRefinementFeedback(`Refinement applied: "${trimmed.slice(0, 48)}..."`);
    setTimeout(() => setActiveRefinementFeedback(null), 3000);
  };

  const handleQuickPromptClick = (text: string) => {
    setPromptInput(text);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <button
            type="button"
            onClick={onBackToIntake}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Intake Form (Step 1)</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Theme Selection & AI Refinement
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Compare {THEME_SPECS.length} visual themes formatted precisely in your selected{' '}
            <span className="text-cyan-400 font-mono font-medium">{projectState.aspectRatio}</span> ({ratioInfo.resolution}) aspect ratio.
          </p>
        </div>

        {/* Selected Intake Specs Summary Badge */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
          <span className="text-slate-400">Target:</span>
          <span className="text-cyan-400 font-semibold">{projectState.controlSystem}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Function:</span>
          <span className="text-blue-400">{projectState.systemFunction}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">{ratioInfo.isVertical ? 'Portrait' : 'Landscape'}</span>
        </div>
      </div>

      {/* Prominent AI Refinement Prompt Box */}
      <div className="p-6 bg-gradient-to-br from-[#121829] to-[#0d121e] border border-cyan-500/30 rounded-xl shadow-2xl mb-10 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="ai-refine-input" className="text-sm font-bold text-white block">
                AI Refinement Prompt
              </label>
              <p className="text-xs text-slate-400">
                Type natural language adjustments to refine UI layout, styling, tally behaviors, or custom subpages.
              </p>
            </div>
          </div>

          {activeRefinementFeedback && (
            <span className="text-xs text-emerald-400 font-medium animate-fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {activeRefinementFeedback}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="ai-refine-input"
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyRefinement();
              }
            }}
            placeholder="e.g. Add broadcast tally dots to active source buttons, Crestron blue styling, PIN lock modal..."
            className="flex-1 px-4 py-3 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={handleApplyRefinement}
            className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md shadow-cyan-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Refinement</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Quick suggestions:</span>
          {SUGGESTED_REFINEMENT_PROMPTS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleQuickPromptClick(suggestion)}
              className="px-2.5 py-1 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 rounded-md transition-colors text-left"
            >
              + {suggestion}
            </button>
          ))}
        </div>

        {/* Applied Refinements Display */}
        {projectState.appliedRefinements.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs text-cyan-400 font-mono">Active Refinements ({projectState.appliedRefinements.length}):</span>
            {projectState.appliedRefinements.map((ref, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] bg-cyan-950/40 text-cyan-300 border border-cyan-800/50 rounded"
              >
                {ref}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {THEME_SPECS.map((theme) => {
          const isSelected = projectState.selectedTheme === theme.id;

          return (
            <div
              key={theme.id}
              className={`flex flex-col rounded-xl overflow-hidden border transition-all ${
                isSelected
                  ? 'border-cyan-500 ring-2 ring-cyan-500/40 bg-slate-900/90 shadow-2xl shadow-cyan-500/10'
                  : 'border-slate-800 bg-[#101522]/90 hover:border-slate-700'
              }`}
            >
              {/* Header info */}
              <div className="p-5 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{theme.name}</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {projectState.aspectRatio.split(' ')[0]}
                  </span>
                </div>
                <p className="text-xs text-cyan-400 font-medium mt-0.5">{theme.tagline}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{theme.description}</p>
              </div>

              {/* Aspect Ratio Matching UCI Placeholder Frame */}
              <div className="p-4 bg-slate-950/60 flex items-center justify-center">
                <div className="w-full flex flex-col items-center">
                  <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex items-center gap-1.5">
                    <Maximize2 className="w-3 h-3 text-cyan-400" />
                    <span>Ratio: {projectState.aspectRatio}</span>
                  </div>

                  {/* The Dynamic Aspect Ratio Placeholder Container */}
                  <div
                    className={`w-full max-h-[340px] ${ratioInfo.cssClass} rounded-lg border ${theme.colors.bg} ${theme.colors.border} ${theme.colors.text} overflow-hidden p-3 flex flex-col justify-between transition-all shadow-md`}
                  >
                    {/* Simulated Touch Panel Header */}
                    <div className={`flex items-center justify-between pb-1.5 border-b ${theme.colors.border} text-[10px] font-mono opacity-80`}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold tracking-tight">{projectState.controlSystem}</span>
                        <span>·</span>
                        <span className="truncate max-w-[120px]">Auditorium 1</span>
                      </div>
                      <span className="text-[9px]">14:35 · Ready</span>
                    </div>

                    {/* Simulated Body Content reflecting the theme style */}
                    <div className="my-auto py-2 grid grid-cols-2 gap-2 text-center">
                      {/* Left: Source selection buttons */}
                      <div className="space-y-1.5">
                        <div className={`p-1.5 rounded text-[10px] font-medium ${theme.colors.accent}`}>
                          <div className="flex items-center justify-center gap-1">
                            <Tv className="w-3 h-3 shrink-0" />
                            <span className="truncate">Laptop HDMI</span>
                          </div>
                        </div>

                        <div className={`p-1.5 rounded text-[10px] font-medium ${theme.colors.card} ${theme.colors.border}`}>
                          <div className="flex items-center justify-center gap-1">
                            <Tv className="w-3 h-3 shrink-0" />
                            <span className="truncate">Wireless Cast</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Simulated Fader & Mic Volume */}
                      <div className={`p-2 rounded flex flex-col items-center justify-between ${theme.colors.card} ${theme.colors.border}`}>
                        <div className={`flex items-center justify-between w-full text-[9px] ${theme.colors.text} opacity-80`}>
                          <span>Master</span>
                          <span className="font-mono font-bold">85%</span>
                        </div>
                        {/* Horizontal mini fader track */}
                        <div className="w-full h-2 bg-black/30 rounded-full my-1.5 relative overflow-hidden">
                          <div className={`h-full w-[85%] ${theme.colors.accent}`} />
                        </div>
                        <div className="w-full py-0.5 rounded text-[9px] font-semibold bg-rose-500/20 text-rose-500 border border-rose-500/40">
                          MUTE
                        </div>
                      </div>
                    </div>

                    {/* Simulated Navigation Footer Bar */}
                    <div className={`grid grid-cols-4 gap-1 pt-1.5 border-t ${theme.colors.border} text-[9px] font-medium text-center ${theme.colors.text} opacity-80`}>
                      <div className={`p-1 rounded truncate ${theme.colors.accent}`}>Video</div>
                      <div className="p-1 truncate">Audio</div>
                      <div className="p-1 truncate">Camera</div>
                      <div className="p-1 truncate">Lighting</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme feature bullets */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <ul className="space-y-2 text-xs text-slate-300">
                  {theme.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▪</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Theme & Build Prototype Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (promptInput.trim()) {
                      handleApplyRefinement();
                    }
                    onSelectThemeAndProceed(theme.id);
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Select Theme & Build Prototype</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
