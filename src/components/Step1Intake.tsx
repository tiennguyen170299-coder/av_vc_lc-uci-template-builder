import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Plus,
  X,
  Volume2,
  Tv,
  Camera,
  PhoneCall,
  SlidersHorizontal,
  Info,
  Image as ImageIcon,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  ProjectState,
  TargetControlSystem,
  SystemFunction,
  AspectRatioOption,
  CoreFeature,
  ReferenceImage,
  getAspectRatioDetails,
} from '../types/uci';

interface Step1IntakeProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
  onGenerateConcepts: () => void;
}

const CONTROL_SYSTEMS: { value: TargetControlSystem; label: string; desc: string; brandColor: string }[] = [
  {
    value: 'Q-SYS',
    label: 'Q-SYS (QSC)',
    desc: 'UCI Designer native touchscreen, CSS styles & Lua scripts',
    brandColor: 'text-cyan-400 border-cyan-500/30',
  },
  {
    value: 'Crestron',
    label: 'Crestron (SG / Construct)',
    desc: 'Smart Graphics, HTML5 Touch Panels (TSW-1070, TS-770)',
    brandColor: 'text-blue-400 border-blue-500/30',
  },
  {
    value: 'Extron',
    label: 'Extron (GUI Designer)',
    desc: 'TouchLink Pro (TLP Pro), GC Plus / Pro graphical interfaces',
    brandColor: 'text-amber-400 border-amber-500/30',
  },
];

const SYSTEM_FUNCTIONS: { value: SystemFunction; label: string; desc: string }[] = [
  { value: 'AV', label: 'Audio-Visual (AV)', desc: 'Presentation switching, audio gain, video distribution' },
  { value: 'VC', label: 'Video Conferencing (VC)', desc: 'Zoom/Teams room, PTZ camera tracking, soft codec dialing' },
  { value: 'Lighting Control', label: 'Lighting Control (LC)', desc: 'DMX/DALI scene presets, dimming zones, shades' },
  { value: 'Complex', label: 'Complex (Combined AV/VC/LC)', desc: 'Multi-system integration, divisible rooms, enterprise routing' },
];

const ASPECT_RATIOS: { value: AspectRatioOption; label: string; orientation: 'Horizontal' | 'Vertical' }[] = [
  { value: 'Horizontal 16:9', label: 'Horizontal 16:9 (Standard 1080p Touch Panels)', orientation: 'Horizontal' },
  { value: 'Horizontal 16:10', label: 'Horizontal 16:10 (Crestron TSW / Q-SYS TSC-101)', orientation: 'Horizontal' },
  { value: 'Horizontal 4:3', label: 'Horizontal 4:3 (Legacy / 8-inch Wall Mounts)', orientation: 'Horizontal' },
  { value: 'Vertical 16:9', label: 'Vertical 16:9 (Portrait Room Scheduler / Podium)', orientation: 'Vertical' },
  { value: 'Vertical 16:10', label: 'Vertical 16:10 (Portrait Wall Display / Kiosk)', orientation: 'Vertical' },
  { value: 'Vertical 4:3', label: 'Vertical 4:3 (Portrait Compact Tablet / Keypad)', orientation: 'Vertical' },
];

const CORE_FEATURE_LIST: { id: CoreFeature; label: string; icon: React.ElementType; note: string }[] = [
  { id: 'Audio Control', label: 'Audio Control', icon: Volume2, note: 'Mic gains, program volume, mutes, DSP faders' },
  { id: 'TV Source Selection', label: 'TV Source Selection', icon: Tv, note: 'Video routing matrix, Wireless casting, Blackout' },
  { id: 'PTZ Camera Controls', label: 'PTZ Camera Controls', icon: Camera, note: 'Pan-tilt-zoom, presets, camera 1/2 switcher' },
  { id: 'VTC Dialing', label: 'VTC Dialing', icon: PhoneCall, note: 'Keypad dialing, directory, call active telemetry' },
  { id: 'Lighting Faders', label: 'Lighting Faders', icon: SlidersHorizontal, note: 'Zone dimmers, meeting/preso scene buttons' },
];

const QUICK_PRESETS = [
  {
    title: 'Auditorium Dual-Screen Combined',
    system: 'Q-SYS' as TargetControlSystem,
    function: 'Complex' as SystemFunction,
    ratio: 'Horizontal 16:9' as AspectRatioOption,
    features: ['Audio Control', 'TV Source Selection', 'PTZ Camera Controls', 'Lighting Faders'] as CoreFeature[],
    custom: ['Room Combine Mode', 'PIN Passcode Lock', 'Barco ClickShare'],
    description: 'Dual auditorium combined system with 4-screen video routing matrix, wireless casting, PTZ tracking camera presets, audio DSP gain controls, and lighting preset faders with PIN security modal.',
  },
  {
    title: 'Executive Boardroom VTC',
    system: 'Crestron' as TargetControlSystem,
    function: 'VC' as SystemFunction,
    ratio: 'Horizontal 16:10' as AspectRatioOption,
    features: ['Audio Control', 'TV Source Selection', 'PTZ Camera Controls', 'VTC Dialing'] as CoreFeature[],
    custom: ['Ceiling Mic Mute Sync', 'Table Lift Controls'],
    description: 'Boardroom interface with auto-framing dual camera controls, SIP dial pad, Zoom room touch controls, and high-contrast mic mute bars.',
  },
  {
    title: 'Divisible Training Center',
    system: 'Extron' as TargetControlSystem,
    function: 'AV' as SystemFunction,
    ratio: 'Horizontal 16:9' as AspectRatioOption,
    features: ['Audio Control', 'TV Source Selection', 'Lighting Faders'] as CoreFeature[],
    custom: ['Airwall Partition Sensor', 'Projector Screen Drop'],
    description: 'Divisible classroom with independent or combined matrix routing, presentation mode presets, and teacher lectern microphone controls.',
  },
];

export const Step1Intake: React.FC<Step1IntakeProps> = ({
  projectState,
  setProjectState,
  onGenerateConcepts,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCustomFunction = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (projectState.customFunctions.includes(trimmed)) {
      setCustomInput('');
      return;
    }
    setProjectState((prev) => ({
      ...prev,
      customFunctions: [...prev.customFunctions, trimmed],
    }));
    setCustomInput('');
  };

  const handleRemoveCustomFunction = (item: string) => {
    setProjectState((prev) => ({
      ...prev,
      customFunctions: prev.customFunctions.filter((f) => f !== item),
    }));
  };

  const toggleCoreFeature = (feature: CoreFeature) => {
    setProjectState((prev) => {
      const exists = prev.coreFeatures.includes(feature);
      const updated = exists
        ? prev.coreFeatures.filter((f) => f !== feature)
        : [...prev.coreFeatures, feature];
      return { ...prev, coreFeatures: updated };
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newRef: ReferenceImage = {
            id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            url: event.target.result as string,
            tag: 'User Upload',
            source: 'upload',
          };
          setProjectState((prev) => ({
            ...prev,
            referenceImages: [newRef, ...prev.referenceImages],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (id: string) => {
    setProjectState((prev) => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((img) => img.id !== id),
    }));
  };

  const handleApplyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setProjectState((prev) => ({
      ...prev,
      controlSystem: preset.system,
      systemFunction: preset.function,
      aspectRatio: preset.ratio,
      coreFeatures: preset.features,
      customFunctions: preset.custom,
      detailedDescription: preset.description,
    }));
  };

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectState.coreFeatures.length === 0 && projectState.customFunctions.length === 0) {
      setValidationError('Please select at least one core feature or enter a custom function.');
      return;
    }
    setValidationError(null);
    onGenerateConcepts();
  };

  const ratioInfo = getAspectRatioDetails(projectState.aspectRatio);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              UCI Project Intake & Architecture
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Configure control hardware specifications, aspect ratio geometry, and operational capabilities to generate tailored touch panel layouts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick AV Scenarios:</span>
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-md transition-colors"
              >
                {p.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Informational strip */}
        <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Hardware Targets support standard QSC Q-SYS TSC touchscreens, Crestron TSW/TSS touch screens, and Extron TLP Pro controllers. State will be preserved across all 3 steps.
          </span>
        </div>
      </div>

      <form onSubmit={handleValidateAndSubmit} className="space-y-8">
        {/* Section 1: Critical Inputs (Required) */}
        <div className="p-6 bg-[#111726]/90 border border-slate-800 rounded-xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Critical Hardware & System Inputs (Required)
            </h2>
            <span className="text-xs text-slate-400 font-mono">Step 1.1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Control System */}
            <div>
              <label htmlFor="control-system" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Control System <span className="text-rose-400">*</span>
              </label>
              <select
                id="control-system"
                value={projectState.controlSystem}
                onChange={(e) =>
                  setProjectState((prev) => ({
                    ...prev,
                    controlSystem: e.target.value as TargetControlSystem,
                  }))
                }
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                required
              >
                {CONTROL_SYSTEMS.map((sys) => (
                  <option key={sys.value} value={sys.value}>
                    {sys.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-400">
                {CONTROL_SYSTEMS.find((s) => s.value === projectState.controlSystem)?.desc}
              </p>
            </div>

            {/* System Function */}
            <div>
              <label htmlFor="system-function" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                System Function <span className="text-rose-400">*</span>
              </label>
              <select
                id="system-function"
                value={projectState.systemFunction}
                onChange={(e) =>
                  setProjectState((prev) => ({
                    ...prev,
                    systemFunction: e.target.value as SystemFunction,
                  }))
                }
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                required
              >
                {SYSTEM_FUNCTIONS.map((fn) => (
                  <option key={fn.value} value={fn.value}>
                    {fn.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-400">
                {SYSTEM_FUNCTIONS.find((s) => s.value === projectState.systemFunction)?.desc}
              </p>
            </div>

            {/* Panel Orientation & Aspect Ratio */}
            <div>
              <label htmlFor="aspect-ratio" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Panel Orientation & Aspect Ratio <span className="text-rose-400">*</span>
              </label>
              <select
                id="aspect-ratio"
                value={projectState.aspectRatio}
                onChange={(e) =>
                  setProjectState((prev) => ({
                    ...prev,
                    aspectRatio: e.target.value as AspectRatioOption,
                  }))
                }
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                required
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar.value} value={ar.value}>
                    {ar.label}
                  </option>
                ))}
              </select>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-cyan-400 font-mono">
                <span>Native res: {ratioInfo.resolution}</span>
                <span>•</span>
                <span>{ratioInfo.isVertical ? 'Portrait mount' : 'Landscape mount'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Core Features & Custom Functions */}
        <div className="p-6 bg-[#111726]/90 border border-slate-800 rounded-xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white">Core AV Subsystems & Capabilities</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select subsystem controllers to populate dedicated touch panel navigation views and gain faders.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Step 1.2</span>
          </div>

          {/* Core Feature Checkboxes */}
          <div>
            <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Core Features (Checkboxes)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CORE_FEATURE_LIST.map((feat) => {
                const isChecked = projectState.coreFeatures.includes(feat.id);
                const Icon = feat.icon;

                return (
                  <label
                    key={feat.id}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-cyan-950/30 border-cyan-500/60 text-white shadow-sm ring-1 ring-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCoreFeature(feat.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Icon className={`w-4 h-4 ${isChecked ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{feat.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{feat.note}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Custom Functions Input */}
          <div className="pt-2">
            <label htmlFor="custom-fn-input" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Custom Functions (Text Input)
            </label>
            <div className="flex gap-2">
              <input
                id="custom-fn-input"
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomFunction();
                  }
                }}
                placeholder="e.g. HVAC Climate Setpoint, Motorized Projection Screen, PIN Lock Keypad..."
                className="flex-1 px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddCustomFunction}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium text-xs rounded-lg border border-slate-700 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Function</span>
              </button>
            </div>

            {/* Rendered custom tags */}
            {projectState.customFunctions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs text-slate-400 font-mono">Active custom controls:</span>
                {projectState.customFunctions.map((fn) => (
                  <span
                    key={fn}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800/90 border border-slate-700 rounded-md"
                  >
                    <span>{fn}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomFunction(fn)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Detailed Description & Logic */}
        <div className="p-6 bg-[#111726]/90 border border-slate-800 rounded-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <label htmlFor="detailed-desc" className="text-base font-semibold text-white block">
                Detailed Description & UI/UX Workflow Logic
              </label>
              <p className="text-xs text-slate-400 mt-0.5">
                Specify subpage flip behaviors, room partitioning rules, default volume ceilings, or macro sequences.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Step 1.3</span>
          </div>

          <textarea
            id="detailed-desc"
            rows={4}
            value={projectState.detailedDescription}
            onChange={(e) =>
              setProjectState((prev) => ({
                ...prev,
                detailedDescription: e.target.value,
              }))
            }
            placeholder="Describe specific UI/UX ideas, button feedback behavior, lock subpages, combined mode matrices, or audio zone grouping..."
            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors resize-y"
          />
        </div>

        {/* Section 4: Reference Upload & Preloaded Benchmarks */}
        <div className="p-6 bg-[#111726]/90 border border-slate-800 rounded-xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Reference Image Upload
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag and drop your own UCI mockups to use as styling references for the generated touch panel.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Step 1.4</span>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Drag & Drop reference UI mockups, or <span className="text-cyan-400 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PNG, JPG, WebP, SVG (Simulated upload for styling reference)
            </p>
          </div>

          {/* Render uploaded images */}
          {projectState.referenceImages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                User Uploaded References ({projectState.referenceImages.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {projectState.referenceImages.map((img) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900 aspect-video">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(img.id);
                      }}
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-0 inset-x-0 p-1 text-[10px] bg-black/75 text-slate-200 truncate">
                      {img.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-200 text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-slate-400">
            Hardware: <span className="text-slate-200 font-mono">{projectState.controlSystem}</span> · Aspect: <span className="text-slate-200 font-mono">{projectState.aspectRatio}</span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Concepts (Step 2)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
