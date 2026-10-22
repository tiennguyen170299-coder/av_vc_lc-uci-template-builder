import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  Camera,
  PhoneCall,
  SlidersHorizontal,
  Lock,
  Settings,
  Power,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  ChevronRight,
  Shield,
  HelpCircle,
  Wifi,
  Radio,
  Clock,
  Home,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
  CornerUpLeft,
  CornerDownLeft,
  CornerDownRight,
  Share2,
  Laptop,
  Monitor,
  Video,
  Mic,
  Speaker,
  Cable,
  Lightbulb,
  LampCeiling,
  Sun,
  Combine,
  SplitSquareHorizontal,
} from 'lucide-react';
import {
  ProjectState,
  getAspectRatioDetails,
  CoreFeature,
  THEME_TYPES,
  isLightTheme,
} from '../types/uci';
import { downloadQsysThemeCss } from '../utils/qsysThemeCss';

interface Step3PrototypeProps {
  projectState: ProjectState;
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>;
  onBackToThemes: () => void;
  onBackToIntake: () => void;
}

// Subpage types that can flip over the screen
type ActiveSubpage = 'none' | 'pin_lock' | 'system_settings' | 'power_shutdown' | 'room_combine';

export const Step3Prototype: React.FC<Step3PrototypeProps> = ({
  projectState,
  setProjectState,
  onBackToThemes,
  onBackToIntake,
}) => {
  // Navigation tabs within the prototype
  const availableTabs = [
    ...(projectState.coreFeatures.includes('TV Source Selection') ? ['video'] : []),
    ...(projectState.coreFeatures.includes('Audio Control') ? ['audio'] : []),
    ...(projectState.coreFeatures.includes('PTZ Camera Controls') ? ['camera'] : []),
    ...(projectState.coreFeatures.includes('VTC Dialing') ? ['vtc'] : []),
    ...(projectState.coreFeatures.includes('Lighting Faders') ? ['lighting'] : []),
    ...(projectState.customFunctions.length > 0 ? ['custom'] : []),
  ];

  // Default active tab
  const [activeTab, setActiveTab] = useState<string>(availableTabs[0] || 'video');
  const [activeSubpage, setActiveSubpage] = useState<ActiveSubpage>('none');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [panelScale, setPanelScale] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Volumes state
  const [audioChannels, setAudioChannels] = useState<{ [id: string]: { level: number; muted: boolean } }>({
    lectern: { level: 85, muted: false },
    handheld1: { level: 80, muted: false },
    handheld2: { level: 75, muted: false },
    clipMic: { level: 90, muted: false },
    xlrOut: { level: 60, muted: false },
    speakers: { level: 85, muted: false },
  });

  // Video Matrix routing state
  const [selectedDestination, setSelectedDestination] = useState<string>('dest1');
  const [destMatrix, setDestMatrix] = useState<{ [destId: string]: string }>({
    dest1: 'src_hdmi1', // Led Screen 1
    dest2: 'src_barco', // Led Screen 2
    dest3: 'src_zoom',  // Mobile Cart TV
    dest4: 'src_ctrl',  // Confidence Monitor
  });
  const [isBlackout, setIsBlackout] = useState<boolean>(false);

  // PTZ Camera state
  const [activeCamera, setActiveCamera] = useState<1 | 2>(1);
  const [selectedPreset, setSelectedPreset] = useState<string>('Overview');
  const [ptzAction, setPtzAction] = useState<string>('Idle');

  // Lighting Faders state
  const [lightingLevels, setLightingLevels] = useState<{ [key: string]: number }>({
    stage: 80,
    podium: 90,
    audience: 60,
    perimeter: 40,
  });
  const [activeLightingScene, setActiveLightingScene] = useState<string>('Presentation');

  // VTC State
  const [dialString, setDialString] = useState<string>('');
  const [callActive, setCallActive] = useState<boolean>(false);

  // Passcode PIN Keypad state
  const [pinInput, setPinInput] = useState<string>('');
  const [pinStatus, setPinStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // System Settings state
  const [systemTimeoutEnabled, setSystemTimeoutEnabled] = useState<boolean>(true);
  const [roomModeCombined, setRoomModeCombined] = useState<boolean>(true);

  // Real-time clock for touch panel header
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ' · ' +
          now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio click feedback
  const playTouchTone = (freq = 800, duration = 0.04) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export Q-SYS CSS Theme handler
  const handleExportQsysCss = () => {
    playTouchTone(600, 0.08);
    try {
      downloadQsysThemeCss(projectState.selectedTheme);
      showToast(`Downloaded qsys-theme.css — ${projectState.selectedTheme} theme`);
    } catch (err) {
      console.error('Export CSS error:', err);
      showToast('Failed to generate CSS. Please retry.');
    }
  };

  const handleAudioLevelChange = (id: string, newLevel: number) => {
    playTouchTone(450, 0.02);
    setAudioChannels((prev) => ({
      ...prev,
      [id]: { ...prev[id], level: Math.min(100, Math.max(0, newLevel)) },
    }));
  };

  const toggleMute = (id: string) => {
    playTouchTone(audioChannels[id]?.muted ? 900 : 350, 0.05);
    setAudioChannels((prev) => ({
      ...prev,
      [id]: { ...prev[id], muted: !prev[id].muted },
    }));
  };

  const handlePinDigit = (digit: string) => {
    playTouchTone(900, 0.03);
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handlePinSubmit = () => {
    playTouchTone(1000, 0.06);
    if (pinInput === '1234' || pinInput.length >= 4) {
      setPinStatus('success');
      setTimeout(() => {
        setPinStatus('idle');
        setPinInput('');
        setActiveSubpage('none');
        showToast('Passcode Verified: Access Granted.');
      }, 700);
    } else {
      setPinStatus('error');
      setTimeout(() => {
        setPinStatus('idle');
        setPinInput('');
      }, 1000);
    }
  };

  const ratioInfo = getAspectRatioDetails(projectState.aspectRatio);
  const theme = projectState.selectedTheme;

  // Platform naming + DSP labels resolved against the selected control system
  const PLATFORM_LABEL: Record<string, string> = {
    'Q-SYS': 'Q-SYS Core · TSC Touch Panel',
    'Crestron': 'Crestron · TSW Touch Panel',
    'Extron': 'Extron · TLP Pro TouchLink',
  };
  const DSP_LABEL: Record<string, string> = {
    'Q-SYS': 'Q-SYS Core DSP Link',
    'Crestron': 'Crestron AV Framework',
    'Extron': 'Extron DSP Matrix',
  };

  // Active theme style classes
  const themeStyles = {
    'Flat Modern': {
      bezel: 'bg-slate-900 border-slate-700 shadow-2xl',
      screen: 'bg-[#0b101b] text-slate-100',
      header: 'bg-[#121827] border-slate-800 text-slate-300',
      activeTab: 'bg-cyan-600 text-white font-semibold shadow-sm',
      inactiveTab: 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800',
      activeBtn: 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/50',
      inactiveBtn: 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750',
      tallyDot: 'bg-emerald-400',
      faderThumb: 'accent-cyan-500',
      modalBg: 'bg-[#111726]/95 border-slate-700',
    },
    'Neumorphic': {
      bezel: 'bg-[#141822] border-slate-800 shadow-2xl',
      screen: 'bg-[#151922] text-slate-200',
      header: 'neu-flat border-slate-800/80 text-slate-300',
      activeTab: 'neu-pressed text-cyan-300 font-semibold border border-cyan-500/30',
      inactiveTab: 'neu-button text-slate-400 hover:text-slate-200',
      activeBtn: 'neu-pressed text-cyan-300 border border-cyan-500/40 shadow-inner',
      inactiveBtn: 'neu-button text-slate-300 border border-slate-800',
      tallyDot: 'bg-cyan-400',
      faderThumb: 'accent-blue-500',
      modalBg: 'bg-[#181d28]/95 border-slate-700 shadow-2xl',
    },
    'High Contrast': {
      bezel: 'bg-[#000000] border-zinc-800 shadow-2xl',
      screen: 'bg-[#000000] text-white',
      header: 'bg-[#0a0a0a] border-emerald-500/40 text-emerald-400',
      activeTab: 'bg-emerald-500 text-black font-bold tally-active-green',
      inactiveTab: 'bg-zinc-900 text-slate-300 border border-zinc-800 hover:bg-zinc-850',
      activeBtn: 'bg-emerald-500 text-black font-bold tally-active-green',
      inactiveBtn: 'bg-zinc-900 text-slate-300 border border-zinc-800 hover:border-zinc-700',
      tallyDot: 'bg-emerald-300',
      faderThumb: 'accent-emerald-400',
      modalBg: 'bg-zinc-950/98 border-emerald-500',
    },
    'Midnight Navy': {
      bezel: 'bg-[#0a1020] border-indigo-900 shadow-2xl',
      screen: 'bg-[#0b1428] text-slate-100',
      header: 'bg-[#101b33] border-indigo-800/60 text-slate-300',
      activeTab: 'bg-indigo-600 text-white font-semibold shadow-sm',
      inactiveTab: 'bg-[#1b2a4a]/80 text-slate-400 hover:text-slate-200 hover:bg-[#1b2a4a]',
      activeBtn: 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50',
      inactiveBtn: 'bg-[#1b2a4a] text-slate-300 border border-indigo-800/70 hover:bg-[#24365c]',
      tallyDot: 'bg-sky-400',
      faderThumb: 'accent-indigo-500',
      modalBg: 'bg-[#0d1830]/95 border-indigo-700',
    },
    'Graphite Slate': {
      bezel: 'bg-[#17181c] border-zinc-700 shadow-2xl',
      screen: 'bg-[#1a1c21] text-slate-200',
      header: 'bg-[#23252c] border-zinc-700/60 text-slate-300',
      activeTab: 'bg-zinc-500 text-white font-semibold shadow-sm',
      inactiveTab: 'bg-[#2a2d34] text-slate-400 hover:text-slate-200 hover:bg-[#33363e]',
      activeBtn: 'bg-zinc-400 text-zinc-950 font-semibold shadow-sm ring-1 ring-zinc-300/40',
      inactiveBtn: 'bg-[#2a2d34] text-slate-300 border border-zinc-700 hover:bg-[#33363e]',
      tallyDot: 'bg-emerald-400',
      faderThumb: 'accent-zinc-400',
      modalBg: 'bg-[#23252c]/95 border-zinc-600',
    },
    'Light Clean': {
      bezel: 'bg-[#e9edf2] border-slate-300 shadow-2xl',
      screen: 'bg-[#f6f8fa] text-slate-800',
      header: 'bg-white border-slate-200 text-slate-600',
      activeTab: 'bg-sky-600 text-white font-semibold shadow-sm',
      inactiveTab: 'bg-slate-200/70 text-slate-500 hover:text-slate-800 hover:bg-slate-200',
      activeBtn: 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400/50',
      inactiveBtn: 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100',
      tallyDot: 'bg-emerald-500',
      faderThumb: 'accent-sky-500',
      modalBg: 'bg-[#16202c]/95 border-slate-600',
    },
    'Warm Daylight': {
      bezel: 'bg-[#f5ecdc] border-amber-300 shadow-2xl',
      screen: 'bg-[#fbf5e9] text-amber-950',
      header: 'bg-[#fff8ec] border-amber-200 text-amber-800',
      activeTab: 'bg-amber-500 text-white font-semibold shadow-sm',
      inactiveTab: 'bg-amber-100/80 text-amber-700 hover:text-amber-900 hover:bg-amber-100',
      activeBtn: 'bg-amber-500 text-white shadow-sm ring-1 ring-amber-400/50',
      inactiveBtn: 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50',
      tallyDot: 'bg-emerald-500',
      faderThumb: 'accent-amber-500',
      modalBg: 'bg-[#201710]/95 border-amber-700',
    },
  }[theme];

  // Light-theme aware text tones (dark surfaces stay white-on-dark by default)
  const isLight = isLightTheme(theme);
  const txTitle = isLight ? 'text-slate-900' : 'text-white';
  const txHeading = isLight ? 'text-slate-700' : 'text-slate-300';
  const txBody = isLight ? 'text-slate-600' : 'text-slate-200';
  const txMuted = isLight ? 'text-slate-500' : 'text-slate-400';
  const bezelText = isLight ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Controls & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToThemes}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Themes (Step 2)</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={onBackToIntake}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Edit Intake Form (Step 1)
          </button>
        </div>

        {/* Theme switcher on the fly + Scale controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 px-2 font-mono">Theme:</span>
            {THEME_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  playTouchTone(650, 0.03);
                  setProjectState((prev) => ({ ...prev, selectedTheme: t }));
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  projectState.selectedTheme === t
                    ? 'bg-cyan-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Touch sound enabled' : 'Touch sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Scale zoom */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setPanelScale((s) => Math.max(0.65, Number((s - 0.1).toFixed(2))))}
              className="p-1 hover:text-white text-slate-400"
              title="Scale Down"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono text-cyan-400 min-w-[42px] text-center">
              {Math.round(panelScale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setPanelScale((s) => Math.min(1.2, Number((s + 0.1).toFixed(2))))}
              className="p-1 hover:text-white text-slate-400"
              title="Scale Up"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Interactive Prototype (Center-Left) + Export & Specs Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Prototype Column */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Panel Hardware Bezel Container */}
          <div
            style={{ transform: `scale(${panelScale})`, transformOrigin: 'top center' }}
            className={`w-full max-w-4xl transition-transform duration-200 ease-out`}
          >
            {/* The Outer AV Touch Panel Bezel */}
            <div
              className={`p-4 sm:p-6 rounded-2xl border-4 ${themeStyles.bezel} relative`}
            >
              {/* Hardware Logo & Status LEDs */}
              <div className="relative flex items-center justify-between pb-3 px-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold tracking-wider ${bezelText} font-mono text-[11px]`}>
                    {projectState.controlSystem.toUpperCase()}
                  </span>
                  <span className={`text-[10px] ${bezelText} font-mono`}>
                    {ratioInfo.resolution}
                  </span>
                </div>
                <div
                  aria-label="INAVATE"
                  className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center font-sans text-[15px] sm:text-lg font-light tracking-[0.18em] leading-none ${bezelText}`}
                >
                  <span>I</span>
                  <span>N</span>
                  <span className="text-sky-700">A</span>
                  <span className="text-sky-700">V</span>
                  <span>A</span>
                  <span>T</span>
                  <span>E</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 text-[10px] ${bezelText} font-mono`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ONLINE</span>
                  </div>
                  <span className={`${bezelText} text-[10px]`}>{PLATFORM_LABEL[projectState.controlSystem]}</span>
                </div>
              </div>

              {/* Dynamic Aspect Ratio Simulated Screen */}
              <div
                className={`w-full ${ratioInfo.cssClass} rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between relative shadow-inner ${themeStyles.screen}`}
              >
                {/* 1. Touch Panel Header Bar */}
                <div
                  className={`px-4 py-2.5 flex items-center justify-between border-b text-xs ${themeStyles.header}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`font-bold tracking-tight ${txTitle}`}>
                      AUDITORIUM 1 & 2
                    </span>
                    <span className="text-slate-400">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(700, 0.04);
                        setActiveSubpage(activeSubpage === 'room_combine' ? 'none' : 'room_combine');
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-900 transition-colors"
                      title="Click to toggle Room Partition / Combine Subpage"
                    >
                      Mode: {roomModeCombined ? 'Combined' : 'Split / Independent'}
                    </button>
                  </div>

                  {/* Header Actions: Clock, PIN lock subpage flip, Settings subpage flip, Power subpage flip */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`hidden sm:inline-block font-mono text-[11px] ${txMuted}`}>
                      {currentTime}
                    </span>

                    {/* Subpage Flip Trigger: PIN Lock */}
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(850, 0.04);
                        setActiveSubpage(activeSubpage === 'pin_lock' ? 'none' : 'pin_lock');
                      }}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Open Security PIN Keypad Subpage"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                    </button>

                    {/* Subpage Flip Trigger: System Settings & Diagnostics */}
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(850, 0.04);
                        setActiveSubpage(activeSubpage === 'system_settings' ? 'none' : 'system_settings');
                      }}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Open System Diagnostics Subpage"
                    >
                      <Settings className="w-4 h-4 text-cyan-400" />
                    </button>

                    {/* Subpage Flip Trigger: Standby / Power Shutdown */}
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(500, 0.05);
                        setActiveSubpage(activeSubpage === 'power_shutdown' ? 'none' : 'power_shutdown');
                      }}
                      className="p-1.5 rounded hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Open System Shutdown Subpage"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. Main Active View Body */}
                <div className="flex-1 p-2 sm:p-3 overflow-hidden relative">
                  {/* View A: TV Source Selection & Video Matrix */}
                  {activeTab === 'video' && (
                    <div className="space-y-4">
                      {/* Destination Selection Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                        <span className={`text-xs font-semibold ${txHeading} uppercase tracking-wider`}>
                          Video Routing Matrix
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              playTouchTone(400, 0.05);
                              setIsBlackout(!isBlackout);
                            }}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                              isBlackout
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-rose-950/60 text-rose-300 border border-rose-800/80 hover:bg-rose-900'
                            }`}
                          >
                            {isBlackout ? 'SCREEN BLACKOUT ACTIVE' : 'Black Out All Displays'}
                          </button>
                        </div>
                      </div>

                      {/* Displays Grid (Auditorium LED Screens, Mobile TV, Confidence) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'dest1', name: 'Aud. 1 - Near LED Wall' },
                          { id: 'dest2', name: 'Aud. 2 - Far LED Wall' },
                          { id: 'dest3', name: 'Aud. 1 & 2 Mobile Cart TV' },
                          { id: 'dest4', name: 'Lectern Confidence Monitor' },
                        ].map((dest) => {
                          const isDestActive = selectedDestination === dest.id;
                          const currentSrc = destMatrix[dest.id];

                          const srcLabels: { [key: string]: string } = {
                            src_hdmi1: 'Lectern HDMI 1',
                            src_hdmi2: 'Table Pod HDMI 2',
                            src_barco: 'Barco Wireless Casting',
                            src_zoom: 'Zoom Rooms PC',
                            src_ctrl: 'Control Room Master Feed',
                          };

                          return (
                            <div
                              key={dest.id}
                              onClick={() => {
                                playTouchTone(650, 0.03);
                                setSelectedDestination(dest.id);
                              }}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isDestActive
                                  ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500/40'
                                  : isLight
                                  ? 'bg-white border-slate-300 hover:border-slate-400'
                                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-bold ${txTitle} flex items-center gap-1.5`}>
                                  <Tv className="w-3.5 h-3.5 text-cyan-400" />
                                  {dest.name}
                                </span>
                                {isDestActive && (
                                  <span className="text-[10px] text-cyan-400 font-mono font-medium">Selected</span>
                                )}
                              </div>
                              <div className="p-2 bg-slate-950/80 rounded border border-slate-800 flex items-center justify-between text-xs">
                                <span className="text-slate-400 text-[11px]">Current Source:</span>
                                <span className="font-semibold text-cyan-300 font-mono">
                                  {isBlackout ? 'BLACKED OUT' : srcLabels[currentSrc] || 'None'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Source Selection Buttons for Currently Selected Display */}
                      <div className="pt-2">
                        <span className={`block text-xs font-semibold ${txHeading} uppercase tracking-wider mb-2`}>
                          Route Source:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'src_hdmi1', label: 'Lectern HDMI', note: '1080p60', Icon: Laptop },
                            { id: 'src_hdmi2', label: 'Table HDMI', note: '4K30', Icon: Monitor },
                            { id: 'src_barco', label: 'Barco ClickShare', note: 'Wireless', Icon: Wifi },
                            { id: 'src_zoom', label: 'Zoom Room PC', note: 'Soft Codec', Icon: Video },
                            { id: 'src_ctrl', label: 'Control Room Feed', note: 'SDI In', Icon: Radio },
                          ].map((src) => {
                            const isRouted = destMatrix[selectedDestination] === src.id;
                            const { Icon } = src;

                            return (
                              <button
                                key={src.id}
                                type="button"
                                onClick={() => {
                                  playTouchTone(800, 0.04);
                                  setDestMatrix((prev) => ({
                                    ...prev,
                                    [selectedDestination]: src.id,
                                  }));
                                }}
                                className={`p-3 rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                                  isRouted ? themeStyles.activeBtn : themeStyles.inactiveBtn
                                }`}
                              >
                                {isRouted && (
                                  <span
                                    className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${themeStyles.tallyDot}`}
                                    title="Active Tally Indicator"
                                  />
                                )}
                                <Icon className="w-4 h-4 mb-1 opacity-90" />
                                <span className="text-xs font-semibold">{src.label}</span>
                                <span className={`text-[10px] ${txMuted} mt-0.5 font-mono`}>{src.note}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View B: Audio DSP Gain Control & Faders */}
                  {activeTab === 'audio' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className={`text-xs font-semibold ${txHeading} uppercase tracking-wider`}>
                          Audio DSP Mixer
                        </span>
                        <span className={`text-xs ${txMuted} font-mono`}>{DSP_LABEL[projectState.controlSystem]}</span>
                      </div>

                      {/* 6-Channel Vertical Fader Bank (Lectern, Handhelds, Clip, XLR, Speakers) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { id: 'lectern', name: 'Aud. 1 Lectern Mic', Icon: Mic },
                          { id: 'handheld1', name: 'Aud. 1 Handheld 1', Icon: Mic },
                          { id: 'handheld2', name: 'Aud. 1 Handheld 2', Icon: Mic },
                          { id: 'clipMic', name: 'Aud. 1 Clip Mic', Icon: Mic },
                          { id: 'xlrOut', name: 'Aud. 1 XLR Output', Icon: Cable },
                          { id: 'speakers', name: 'Aud. 1 & 2 Speaker Vol', Icon: Speaker },
                        ].map((ch) => {
                          const state = audioChannels[ch.id] || { level: 80, muted: false };
                          const Icon = ch.Icon;

                          return (
                            <div
                              key={ch.id}
                              className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[200px] ${
                                theme === 'Neumorphic'
                                  ? 'neu-pressed border-slate-800'
                                  : theme === 'High Contrast'
                                  ? 'bg-zinc-950 border-zinc-800'
                                  : isLight
                                  ? 'bg-white border-slate-300'
                                  : 'bg-slate-900/80 border-slate-800'
                              }`}
                            >
                              {/* Channel Label */}
                              <span className={`text-[11px] font-bold text-center ${txBody} line-clamp-2 h-7 flex items-center justify-center gap-1`}>
                                <Icon className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                                {ch.name}
                              </span>

                              {/* Fine Nudge + Button */}
                              <button
                                type="button"
                                onClick={() => handleAudioLevelChange(ch.id, state.level + 2)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-700 font-bold"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              {/* Vertical Range Slider */}
                              <div className="py-2 flex items-center justify-center flex-1">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={state.level}
                                  onChange={(e) => handleAudioLevelChange(ch.id, Number(e.target.value))}
                                  className={`vertical-range h-24 cursor-pointer ${themeStyles.faderThumb}`}
                                />
                              </div>

                              {/* Numeric Percentage / dB display */}
                              <div className="w-full py-1 bg-slate-950/90 rounded border border-slate-800 text-center font-mono text-xs text-cyan-300 font-bold">
                                {state.level.toFixed(1)}%
                              </div>

                              {/* Fine Nudge - Button */}
                              <button
                                type="button"
                                onClick={() => handleAudioLevelChange(ch.id, state.level - 2)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center border border-slate-700 font-bold my-1"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              {/* Channel Mute Toggle Button */}
                              <button
                                type="button"
                                onClick={() => toggleMute(ch.id)}
                                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  state.muted
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                                }`}
                              >
                                {state.muted ? 'MUTED' : 'Mute'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* View C: PTZ Camera Controls */}
                  {activeTab === 'camera' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className={`text-xs font-semibold ${txHeading} uppercase tracking-wider`}>
                          PTZ Camera Control
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              playTouchTone(750, 0.03);
                              setActiveCamera(1);
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              activeCamera === 1 ? themeStyles.activeTab : themeStyles.inactiveTab
                            }`}
                          >
                            Camera 1 (Presenter)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playTouchTone(750, 0.03);
                              setActiveCamera(2);
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              activeCamera === 2 ? themeStyles.activeTab : themeStyles.inactiveTab
                            }`}
                          >
                            Camera 2 (Audience)
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Video Camera Preview Screen with live-feed placeholder image */}
                        <div className="md:col-span-7 aspect-video bg-black rounded-xl border border-slate-800 relative overflow-hidden">
                          <img
                            src="/assets/aistudio/ACB_QSYS_2_8855b818.png"
                            alt="Camera live feed preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            <span>CAM {activeCamera} · LIVE FEED</span>
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <Camera className="w-12 h-12 text-white/70 mb-2 drop-shadow" />
                            <span className="text-xs text-slate-200 font-mono drop-shadow">PTZ Action: {ptzAction}</span>
                            <span className="text-[10px] text-slate-300 font-mono mt-0.5 drop-shadow">Active Preset: {selectedPreset}</span>
                          </div>
                        </div>

                        {/* PTZ Direction D-Pad Control */}
                        <div className="md:col-span-5 flex flex-col items-center justify-center space-y-3">
                          <div className="grid grid-cols-3 gap-2 w-48">
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Pan Up-Left');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <CornerUpLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Tilt Up');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <ArrowUp className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Pan Up-Right');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <ArrowRight className="w-5 h-5 rotate-[-45deg]" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Pan Left');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playTouchTone(900, 0.05);
                                setPtzAction('Recalled Home');
                                setSelectedPreset('Overview');
                              }}
                              className={`p-3 rounded-lg flex items-center justify-center bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-600/50`}
                            >
                              <Home className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Pan Right');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Pan Down-Left');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <CornerDownLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Tilt Down');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <ArrowDown className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onMouseDown={() => {
                                playTouchTone(800, 0.04);
                                setPtzAction('Pan Down-Right');
                              }}
                              onMouseUp={() => setPtzAction('Idle')}
                              className={`p-3 rounded-lg flex items-center justify-center ${themeStyles.inactiveBtn}`}
                            >
                              <CornerDownRight className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Zoom controls */}
                          <div className="flex items-center gap-2 w-48">
                            <button
                              type="button"
                              onClick={() => {
                                playTouchTone(700, 0.04);
                                setPtzAction('Zoom Out');
                              }}
                              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold ${themeStyles.inactiveBtn}`}
                            >
                              <ZoomOut className="w-4 h-4" />
                              <span>Out</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playTouchTone(850, 0.04);
                                setPtzAction('Zoom In');
                              }}
                              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold ${themeStyles.inactiveBtn}`}
                            >
                              <ZoomIn className="w-4 h-4" />
                              <span>In</span>
                            </button>
                          </div>

                          {/* Presets row */}
                          <div className="w-full flex items-center gap-1 pt-2">
                            {['Overview', 'Presenter', 'Leftside', 'Rightside'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => {
                                  playTouchTone(850, 0.04);
                                  setSelectedPreset(preset);
                                  setPtzAction(`Preset: ${preset}`);
                                }}
                                className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium transition-colors ${
                                  selectedPreset === preset
                                    ? themeStyles.activeBtn
                                    : themeStyles.inactiveBtn
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View D: VTC Soft Codec Dialing */}
                  {activeTab === 'vtc' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className={`text-xs font-semibold ${txHeading} uppercase tracking-wider`}>
                          Video Conferencing
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${callActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                          <span className={`text-xs font-mono ${txHeading}`}>
                            {callActive ? 'Connected · In Conference' : 'Ready / On Hook'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start max-w-lg mx-auto">
                        <div className="md:col-span-12 space-y-3">
                          {/* Dial String Screen */}
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                            <span className="font-mono text-lg text-cyan-400 tracking-wider">
                              {dialString || 'Enter SIP URI or phone #...'}
                            </span>
                            {dialString && (
                              <button
                                type="button"
                                onClick={() => setDialString('')}
                                className="text-xs text-slate-500 hover:text-white"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* Numeric Keypad */}
                          <div className="grid grid-cols-3 gap-2">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => {
                                  playTouchTone(900, 0.03);
                                  setDialString((prev) => prev + k);
                                }}
                                className={`py-3 rounded-lg text-sm font-bold font-mono ${themeStyles.inactiveBtn}`}
                              >
                                {k}
                              </button>
                            ))}
                          </div>

                          {/* Call / Hangup Buttons */}
                          <div className="flex gap-2 pt-2">
                            {!callActive ? (
                              <button
                                type="button"
                                onClick={() => {
                                  playTouchTone(1000, 0.08);
                                  setCallActive(true);
                                  showToast('Initiating VTC Conference Call...');
                                }}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30"
                              >
                                <PhoneCall className="w-4 h-4" />
                                <span>Connect Call</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  playTouchTone(400, 0.08);
                                  setCallActive(false);
                                  showToast('VTC Call Disconnected.');
                                }}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30"
                              >
                                <PhoneCall className="w-4 h-4 rotate-[135deg]" />
                                <span>Disconnect / Hang Up</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View E: Lighting Control Faders */}
                  {activeTab === 'lighting' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className={`text-xs font-semibold ${txHeading} uppercase tracking-wider`}>
                          Lighting Control
                        </span>
                        <div className="flex items-center gap-1">
                          {['Presentation', 'Meeting', 'All Full', 'Blackout'].map((scene) => (
                            <button
                              key={scene}
                              type="button"
                              onClick={() => {
                                playTouchTone(750, 0.03);
                                setActiveLightingScene(scene);
                                if (scene === 'Presentation') setLightingLevels({ stage: 80, podium: 90, audience: 40, perimeter: 30 });
                                if (scene === 'Meeting') setLightingLevels({ stage: 70, podium: 70, audience: 85, perimeter: 70 });
                                if (scene === 'All Full') setLightingLevels({ stage: 100, podium: 100, audience: 100, perimeter: 100 });
                                if (scene === 'Blackout') setLightingLevels({ stage: 0, podium: 0, audience: 0, perimeter: 0 });
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-medium ${
                                activeLightingScene === scene ? themeStyles.activeTab : themeStyles.inactiveTab
                              }`}
                            >
                              {scene}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lighting Dimmers Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { id: 'stage', name: 'Stage Spots', Icon: Lightbulb },
                          { id: 'podium', name: 'Podium Wash', Icon: Sun },
                          { id: 'audience', name: 'Audience Seating', Icon: LampCeiling },
                          { id: 'perimeter', name: 'Perimeter Wall Wash', Icon: Lightbulb },
                        ].map((zone) => {
                          const level = lightingLevels[zone.id] ?? 50;
                          const Icon = zone.Icon;

                          return (
                            <div
                              key={zone.id}
                              className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[160px] ${
                                theme === 'Neumorphic'
                                  ? 'neu-pressed border-slate-800'
                                  : isLight
                                  ? 'bg-white border-slate-300'
                                  : 'bg-slate-900/80 border-slate-800'
                              }`}
                            >
                              <span className={`text-xs font-bold ${txTitle} text-center flex items-center justify-center gap-1`}>
                                <Icon className="w-3.5 h-3.5 text-amber-400" />
                                {zone.name}
                              </span>

                              <div className="py-2 flex items-center justify-center flex-1">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={level}
                                  onChange={(e) => {
                                    playTouchTone(500, 0.02);
                                    setLightingLevels((prev) => ({
                                      ...prev,
                                      [zone.id]: Number(e.target.value),
                                    }));
                                  }}
                                  className={`vertical-range h-20 cursor-pointer ${themeStyles.faderThumb}`}
                                />
                              </div>

                              <div className="w-full py-1 bg-slate-950/80 rounded border border-slate-800 text-center font-mono text-xs text-amber-300 font-bold">
                                {level}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* View F: Custom Functions */}
                  {activeTab === 'custom' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className={`text-xs font-semibold ${txHeading} uppercase tracking-wider`}>
                          Custom Controls
                        </span>
                        <span className={`text-xs ${txMuted} font-mono`}>
                          {projectState.customFunctions.length} Configured
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {projectState.customFunctions.map((fn, index) => {
                          const Icon = /combine|partition/i.test(fn)
                            ? Combine
                            : /pin|passcode|lock/i.test(fn)
                            ? Lock
                            : SlidersHorizontal;
                          return (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900/80 border-slate-800'} space-y-3`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${txTitle} flex items-center gap-1.5`}>
                                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                                {fn}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono">ENABLED</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  playTouchTone(800, 0.03);
                                  showToast(`${fn}: State Triggered (ON)`);
                                }}
                                className="flex-1 py-2 rounded bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/50 border border-cyan-500/40 text-xs font-medium"
                              >
                                Trigger ON / Open
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  playTouchTone(600, 0.03);
                                  showToast(`${fn}: State Triggered (OFF)`);
                                }}
                                className="flex-1 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-medium"
                              >
                                Trigger OFF / Close
                              </button>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Subpage Flip Overlay 1: PIN Passcode Modal */}
                  {activeSubpage === 'pin_lock' && (
                    <div className="absolute inset-0 z-30 p-4 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in">
                      <div className={`w-full max-w-xs p-5 rounded-2xl border ${themeStyles.modalBg} shadow-2xl space-y-4`}>
                        <div className="text-center">
                          <h4 className="text-sm font-bold text-white">Technician Access Keypad</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Please enter PIN to modify system settings</p>
                        </div>

                        {/* PIN Display box */}
                        <div
                          className={`p-3 rounded-lg border text-center font-mono tracking-widest text-lg font-bold ${
                            pinStatus === 'error'
                              ? 'border-rose-500 bg-rose-950/50 text-rose-300'
                              : pinStatus === 'success'
                              ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300'
                              : 'border-slate-700 bg-slate-950 text-cyan-400'
                          }`}
                        >
                          {pinInput ? '• '.repeat(pinInput.length) : 'Enter PIN'}
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-2">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', 'X'].map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                if (k === '←') setPinInput((p) => p.slice(0, -1));
                                else if (k === 'X') setPinInput('');
                                else handlePinDigit(k);
                              }}
                              className={`py-2.5 rounded-lg text-sm font-bold font-mono ${themeStyles.inactiveBtn}`}
                            >
                              {k}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveSubpage('none')}
                            className="flex-1 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handlePinSubmit}
                            className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs"
                          >
                            Enter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subpage Flip Overlay 2: System Settings & Diagnostics Modal */}
                  {activeSubpage === 'system_settings' && (
                    <div className="absolute inset-0 z-30 p-4 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in">
                      <div className={`w-full max-w-lg p-5 rounded-2xl border ${themeStyles.modalBg} shadow-2xl space-y-4`}>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div>
                            <h4 className="text-sm font-bold text-white">System Settings & Monitoring</h4>
                            <p className="text-[11px] text-slate-400">Hardware telemetry and auto-shutdown rules</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveSubpage('none')}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-400">Projector 1 (Left):</span>
                            <div className="font-mono text-cyan-300">192.168.10.45</div>
                            <div className="text-[10px] text-slate-400">Lamp Hours: 142 / 20,000h</div>
                          </div>
                          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-400">Projector 2 (Right):</span>
                            <div className="font-mono text-cyan-300">192.168.10.46</div>
                            <div className="text-[10px] text-slate-400">Lamp Hours: 142 / 20,000h</div>
                          </div>
                          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                            <span className="text-slate-400">Control Engine:</span>
                            <div className="font-mono text-slate-200">{projectState.controlSystem} Core 110f</div>
                            <div className="text-[10px] text-emerald-400">Connected · Status Normal</div>
                          </div>
                          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
                            <span className="text-slate-400">Auto Shutdown Timer:</span>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">10:00 PM Shutdown</span>
                              <input
                                type="checkbox"
                                checked={systemTimeoutEnabled}
                                onChange={(e) => setSystemTimeoutEnabled(e.target.checked)}
                                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              playTouchTone(300, 0.1);
                              showToast('System Reboot Sequence Initiated (Estimated 30s)...');
                              setActiveSubpage('none');
                            }}
                            className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-semibold"
                          >
                            Reboot System Core
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubpage('none')}
                            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subpage Flip Overlay 3: Room Partition / Combine Modal */}
                  {activeSubpage === 'room_combine' && (
                    <div className="absolute inset-0 z-30 p-4 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in">
                      <div className={`w-full max-w-md p-5 rounded-2xl border ${themeStyles.modalBg} shadow-2xl space-y-4`}>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <h4 className="text-sm font-bold text-white">Room Combine / Partition Mode</h4>
                          <button
                            type="button"
                            onClick={() => setActiveSubpage('none')}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <p className="text-xs text-slate-300">
                          Select auditorium operational mode. In Combined mode, audio DSP buses and video presentations route symmetrically across both spaces.
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              playTouchTone(800, 0.04);
                              setRoomModeCombined(true);
                              showToast('Switched to Combined Auditorium 1 & 2 Mode');
                              setActiveSubpage('none');
                            }}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${
                              roomModeCombined ? themeStyles.activeBtn : themeStyles.inactiveBtn
                            }`}
                          >
                            <Combine className="w-5 h-5" />
                            <span className="text-xs font-bold">Combined Mode</span>
                            <span className="text-[10px] text-slate-400 text-center">Auditorium 1 + 2 Linked</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              playTouchTone(800, 0.04);
                              setRoomModeCombined(false);
                              showToast('Switched to Split Independent Mode');
                              setActiveSubpage('none');
                            }}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 ${
                              !roomModeCombined ? themeStyles.activeBtn : themeStyles.inactiveBtn
                            }`}
                          >
                            <SplitSquareHorizontal className="w-5 h-5" />
                            <span className="text-xs font-bold">Split Mode</span>
                            <span className="text-[10px] text-slate-400 text-center">Separate Airwall Partition</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subpage Flip Overlay 4: Power Shutdown Confirmation Modal */}
                  {activeSubpage === 'power_shutdown' && (
                    <div className="absolute inset-0 z-30 p-4 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fade-in">
                      <div className={`w-full max-w-sm p-5 rounded-2xl border border-rose-800/80 bg-slate-950 shadow-2xl space-y-4 text-center`}>
                        <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto">
                          <Power className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">Power Down System?</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            This will power off all LED video walls, mute audio amplifiers, and return cameras to home positions.
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveSubpage('none')}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playTouchTone(350, 0.1);
                              setIsBlackout(true);
                              setActiveSubpage('none');
                              showToast('System Shutdown Complete. Standby Mode Active.');
                            }}
                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-rose-600/30"
                          >
                            Confirm Shutdown
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Touch Panel Navigation Tabs Footer */}
                <div
                  className={`p-2 border-t grid grid-cols-2 sm:grid-flow-col gap-1.5 ${themeStyles.header}`}
                >
                  {projectState.coreFeatures.includes('TV Source Selection') && (
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(700, 0.03);
                        setActiveTab('video');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs transition-all ${
                        activeTab === 'video' ? themeStyles.activeTab : themeStyles.inactiveTab
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Video Matrix</span>
                    </button>
                  )}

                  {projectState.coreFeatures.includes('Audio Control') && (
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(700, 0.03);
                        setActiveTab('audio');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs transition-all ${
                        activeTab === 'audio' ? themeStyles.activeTab : themeStyles.inactiveTab
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Audio DSP</span>
                    </button>
                  )}

                  {projectState.coreFeatures.includes('PTZ Camera Controls') && (
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(700, 0.03);
                        setActiveTab('camera');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs transition-all ${
                        activeTab === 'camera' ? themeStyles.activeTab : themeStyles.inactiveTab
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">PTZ Camera</span>
                    </button>
                  )}

                  {projectState.coreFeatures.includes('VTC Dialing') && (
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(700, 0.03);
                        setActiveTab('vtc');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs transition-all ${
                        activeTab === 'vtc' ? themeStyles.activeTab : themeStyles.inactiveTab
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">VTC Dialing</span>
                    </button>
                  )}

                  {projectState.coreFeatures.includes('Lighting Faders') && (
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(700, 0.03);
                        setActiveTab('lighting');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs transition-all ${
                        activeTab === 'lighting' ? themeStyles.activeTab : themeStyles.inactiveTab
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Lighting</span>
                    </button>
                  )}

                  {projectState.customFunctions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        playTouchTone(700, 0.03);
                        setActiveTab('custom');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs transition-all ${
                        activeTab === 'custom' ? themeStyles.activeTab : themeStyles.inactiveTab
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Custom</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Export Panel & Specifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* Export Panel */}
          <div className="p-6 bg-[#111726]/90 border border-slate-800 rounded-xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                UCI Export Panel
              </h3>
              <span className="text-xs text-slate-400 font-mono">v2.5 Output</span>
            </div>

            <p className="text-xs text-slate-300">
              Export a Q-SYS Designer CSS theme mapped from the active UCI theme, ready to paste into your touch panel styling.
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Export Q-SYS CSS Theme */}
              <button
                type="button"
                onClick={handleExportQsysCss}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-cyan-600/20 transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-cyan-200" />
                  <div className="text-left">
                    <div>Export Q-SYS CSS Theme</div>
                    <div className="text-[10px] text-cyan-200/80 font-normal">Download qsys-theme.css · {projectState.selectedTheme}</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-cyan-200" />
              </button>
            </div>
          </div>

          {/* UCI Specifications Audit */}
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3 text-xs">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              UCI Architecture Profile
            </h4>
            <div className="space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Target Hardware:</span>
                <span className="text-cyan-400 font-semibold">{projectState.controlSystem}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>System Function:</span>
                <span className="text-blue-400">{projectState.systemFunction}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Aspect Ratio:</span>
                <span className="text-slate-200">{projectState.aspectRatio}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Target Resolution:</span>
                <span className="text-slate-200">{ratioInfo.resolution}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Theme Engine:</span>
                <span className="text-emerald-400 font-semibold">{projectState.selectedTheme}</span>
              </div>
            </div>

            {projectState.appliedRefinements.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-mono">Applied Refinements:</span>
                {projectState.appliedRefinements.map((r, i) => (
                  <div key={i} className="text-[11px] text-cyan-300 truncate">
                    • {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Subpage Flip Guide */}
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs space-y-2">
            <span className="font-semibold text-slate-300 block">Subpage Flip Interaction:</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click the header icons inside the prototype (Lock, Settings, Power, or Room Mode button) to test subpage flip overlays and PIN security modals.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 border border-cyan-500 text-white text-xs font-medium rounded-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
