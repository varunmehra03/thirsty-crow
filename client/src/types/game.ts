// Game Controls
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  pickup = 'pickup',
  drop = 'drop',
  descend = 'descend',
  restart = 'restart'
}

// Game phases
export enum GamePhase {
  INTRO = 'intro',
  TUTORIAL = 'tutorial',
  PLAYING = 'playing',
  SUCCESS = 'success',
}

// Stone sizes and their properties with math values
export enum StoneSize {
  SMALL = 'small',   // Value 1
  MEDIUM = 'medium', // Value 2
  LARGE = 'large'    // Value 3
}

export interface StoneData {
  id: string;
  size: StoneSize;
  position: [number, number, number];
  isPickedUp: boolean;
  waterRise: number; // How much water level rises when this stone is added
  value: number;     // Numeric value for math game (1, 2, or 3)
}

// Stone values and properties
export const STONE_PROPERTIES = {
  [StoneSize.SMALL]: {
    scale: 0.6,
    waterRise: 0.1,
    weight: 0.5,     // Affects crow movement speed
    value: 1,        // Math value of stone
    color: "#33CC33" // Green
  },
  [StoneSize.MEDIUM]: {
    scale: 0.8,
    waterRise: 0.2,
    weight: 1.0,
    value: 2,
    color: "#3366CC" // Blue
  },
  [StoneSize.LARGE]: {
    scale: 1.0,
    waterRise: 0.3,
    weight: 1.5,
    value: 3,
    color: "#CC3333" // Red
  },
};

// Water level thresholds
export const WATER_LEVEL = {
  MIN: 0,
  MAX: 1,
  SUCCESS_THRESHOLD: 0.8, // When water level reaches 80%, the crow can drink
};

// Story segments for progressive storytelling
export interface StorySegment {
  id: string;
  text: string;
  trigger: 'start' | 'pickup_first' | 'drop_first' | 'halfway' | 'success';
  shown: boolean;
}
