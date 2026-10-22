export type TargetControlSystem = 'Q-SYS' | 'Crestron' | 'Extron';

export type SystemFunction = 'AV' | 'VC' | 'Lighting Control' | 'Complex';

export type AspectRatioOption = 
  | 'Horizontal 16:9'
  | 'Horizontal 16:10'
  | 'Horizontal 4:3'
  | 'Vertical 16:9'
  | 'Vertical 16:10'
  | 'Vertical 4:3';

export type CoreFeature = 
  | 'Audio Control'
  | 'TV Source Selection'
  | 'PTZ Camera Controls'
  | 'VTC Dialing'
  | 'Lighting Faders';

export type ThemeType =
  | 'Flat Modern'
  | 'Neumorphic'
  | 'High Contrast'
  | 'Midnight Navy'
  | 'Graphite Slate'
  | 'Light Clean'
  | 'Warm Daylight';

export const THEME_TYPES: ThemeType[] = [
  'Flat Modern',
  'Neumorphic',
  'High Contrast',
  'Midnight Navy',
  'Graphite Slate',
  'Light Clean',
  'Warm Daylight',
];

export function isLightTheme(theme: ThemeType): boolean {
  return theme === 'Light Clean' || theme === 'Warm Daylight';
}

export interface ReferenceImage {
  id: string;
  name: string;
  url: string;
  tag: string;
  source: 'preset' | 'upload';
}

export interface ProjectState {
  // Step 1 Inputs
  controlSystem: TargetControlSystem;
  systemFunction: SystemFunction;
  aspectRatio: AspectRatioOption;
  coreFeatures: CoreFeature[];
  customFunctions: string[];
  detailedDescription: string;
  referenceImages: ReferenceImage[];
  selectedPresetImageId?: string;

  // Step 2 Inputs
  selectedTheme: ThemeType;
  aiRefinementPrompt: string;
  appliedRefinements: string[];

  // Step Navigation
  currentStep: 1 | 2 | 3;
}

export const INITIAL_PROJECT_STATE: ProjectState = {
  controlSystem: 'Q-SYS',
  systemFunction: 'Complex',
  aspectRatio: 'Horizontal 16:9',
  coreFeatures: ['Audio Control', 'TV Source Selection', 'PTZ Camera Controls', 'Lighting Faders'],
  customFunctions: ['Room Combine Mode', 'PIN Passcode Lock'],
  detailedDescription: 'Dual auditorium combined system with multi-screen video matrix, wireless casting, PTZ tracking camera presets, audio DSP gain controls, and lighting preset faders.',
  referenceImages: [],
  selectedTheme: 'Flat Modern',
  aiRefinementPrompt: '',
  appliedRefinements: [],
  currentStep: 1,
};

export const PRESET_REFERENCES: ReferenceImage[] = [
  {
    id: 'acb_video_matrix',
    name: 'ACB Auditorium Video Routing Matrix',
    url: '/assets/aistudio/ACB_QSYS_1_835dac00.png',
    tag: 'Q-SYS Video Matrix',
    source: 'preset',
  },
  {
    id: 'acb_audio_dsp',
    name: 'ACB 6-Channel Mic & Speaker Volumes',
    url: '/assets/aistudio/ACB_QSYS_3_db4cfe9d.png',
    tag: 'Q-SYS Audio DSP',
    source: 'preset',
  },
  {
    id: 'acb_ptz_camera',
    name: 'ACB Camera Pan-Tilt-Zoom & Presets',
    url: '/assets/aistudio/ACB_QSYS_2_8855b818.png',
    tag: 'Q-SYS Camera',
    source: 'preset',
  },
  {
    id: 'acb_pin_lock',
    name: 'ACB Security PIN Keypad Subpage',
    url: '/assets/aistudio/ACB_QSYS_5_7dd9e5f0.png',
    tag: 'Q-SYS Keypad',
    source: 'preset',
  },
  {
    id: 'acb_building_bgm',
    name: 'ACB Multi-Floor BGM & Lighting Level',
    url: '/assets/aistudio/ACB_QSYS_6_27bff6ba.png',
    tag: 'Q-SYS Lighting & BGM',
    source: 'preset',
  },
  {
    id: 'crestron_video_router',
    name: 'NAB Crestron Projector & Zoom Routing',
    url: '/assets/aistudio/NAB_crestron_2_0fa5190b.png',
    tag: 'Crestron Video',
    source: 'preset',
  },
  {
    id: 'crestron_audio_mics',
    name: 'NAB Crestron Ceiling & Handheld Faders',
    url: '/assets/aistudio/NAB_crestron_3_bf4e644c.png',
    tag: 'Crestron Audio',
    source: 'preset',
  },
  {
    id: 'crestron_pin',
    name: 'NAB Crestron Access Passcode Keypad',
    url: '/assets/aistudio/NAB_crestron_4_1114f98f.png',
    tag: 'Crestron Passcode',
    source: 'preset',
  },
  {
    id: 'crestron_settings',
    name: 'NAB System Settings & Lamp Diagnostics',
    url: '/assets/aistudio/NAB_crestron_5_299f133a.png',
    tag: 'Crestron Diagnostics',
    source: 'preset',
  },
  {
    id: 'inavate_display',
    name: 'INAVATE Dual Display Power & Source Select',
    url: '/assets/aistudio/demo_2_ba21050f.png',
    tag: 'Extron/Custom Display',
    source: 'preset',
  },
  {
    id: 'inavate_floorplan',
    name: 'INAVATE Floor Plan Volume Zones',
    url: '/assets/aistudio/demo_1_619f3ae4.png',
    tag: 'Extron/Custom Floorplan',
    source: 'preset',
  },
];

export function getAspectRatioDetails(ratio: AspectRatioOption) {
  switch (ratio) {
    case 'Horizontal 16:9':
      return { cssClass: 'aspect-[16/9]', resolution: '1920 × 1080', isVertical: false, ratioValue: 16 / 9 };
    case 'Horizontal 16:10':
      return { cssClass: 'aspect-[16/10]', resolution: '1920 × 1200 / 1280 × 800', isVertical: false, ratioValue: 16 / 10 };
    case 'Horizontal 4:3':
      return { cssClass: 'aspect-[4/3]', resolution: '1024 × 768 / 1600 × 1200', isVertical: false, ratioValue: 4 / 3 };
    case 'Vertical 16:9':
      return { cssClass: 'aspect-[9/16]', resolution: '1080 × 1920', isVertical: true, ratioValue: 9 / 16 };
    case 'Vertical 16:10':
      return { cssClass: 'aspect-[10/16]', resolution: '1200 × 1920 / 800 × 1280', isVertical: true, ratioValue: 10 / 16 };
    case 'Vertical 4:3':
      return { cssClass: 'aspect-[3/4]', resolution: '768 × 1024 / 1200 × 1600', isVertical: true, ratioValue: 3 / 4 };
  }
}
