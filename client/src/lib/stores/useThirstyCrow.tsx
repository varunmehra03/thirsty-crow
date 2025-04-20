import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createContext, useContext, ReactNode } from "react";
import { GamePhase, StoneData, StoneSize, WATER_LEVEL, STONE_PROPERTIES, StorySegment } from "../../types/game";
import { nanoid } from "nanoid";

// Define story segments with progressive storytelling
const STORY_SEGMENTS: StorySegment[] = [
  {
    id: "intro",
    text: "Once upon a time, a thirsty crow was flying around on a hot summer day, looking for water.",
    trigger: "start",
    shown: false,
  },
  {
    id: "first_stone",
    text: "The crow found a pitcher with water, but the water level was too low to reach with its beak.",
    trigger: "pickup_first",
    shown: false,
  },
  {
    id: "first_drop",
    text: "The clever crow had an idea! By dropping stones into the pitcher, the water level would rise.",
    trigger: "drop_first",
    shown: false,
  },
  {
    id: "halfway",
    text: "As more stones were added, the water level continued to rise. Keep going!",
    trigger: "halfway",
    shown: false,
  },
  {
    id: "success",
    text: "Success! The water level has risen enough for the crow to drink. What a smart crow!",
    trigger: "success",
    shown: false,
  },
];

// Generate initial stones with random positions - more sparse
const generateStones = () => {
  const stones: StoneData[] = [];
  
  // Create stones with different values that add up to various combinations to reach 10
  // This encourages mathematical thinking in selecting the right stones
  const stoneSizes = [
    // Various combinations of stones (values 1, 2, and 3)
    StoneSize.SMALL, StoneSize.SMALL, StoneSize.SMALL, StoneSize.SMALL,  // Four 1s (total: 4)
    StoneSize.MEDIUM, StoneSize.MEDIUM, StoneSize.MEDIUM,                // Three 2s (total: 6)
    StoneSize.LARGE, StoneSize.LARGE                                     // Two 3s (total: 6)
    // Total available value: 16, need 10 to fill the pitcher
  ];
  
  // Create a more sparse distribution around the scene
  const numStones = stoneSizes.length;
  const areaSize = 15; // Larger area for more spacing
  
  stoneSizes.forEach((size, i) => {
    // Get properties for this size
    const { waterRise, value } = STONE_PROPERTIES[size];
    
    // Randomly position stones with more spacing
    // Add variation to angles for more natural placement
    const angle = (Math.PI * 2 * (i / numStones)) + (Math.random() * 0.5 - 0.25);
    
    // Vary distance from center - further out for more exploration
    const minRadius = 5;
    const maxRadius = 12;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    
    // Position stones in a scattered pattern
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Add small random height variation to some stones for visual interest
    const y = Math.random() < 0.3 ? Math.random() * 0.1 : 0;
    
    stones.push({
      id: nanoid(),
      size,
      position: [x, y, z],
      isPickedUp: false,
      waterRise,
      value, // Add the numeric value based on stone size
    });
  });
  
  return stones;
};

interface ThirstyCrowState {
  // Game state
  gamePhase: GamePhase;
  tutorialComplete: boolean;
  waterLevel: number;
  startTime: number | null;
  endTime: number | null;
  score: number;
  
  // Crow state
  crowPosition: [number, number, number];
  crowRotation: number;
  hasStone: boolean;
  heldStoneId: string | null;
  
  // Environment objects
  stones: StoneData[];
  
  // Story progression
  storySegments: StorySegment[];
  currentStoryId: string | null;
  
  // Actions
  setCrowPosition: (position: [number, number, number]) => void;
  setCrowRotation: (rotation: number) => void;
  pickupStone: (stoneId: string) => void;
  dropStone: () => void;
  increaseWaterLevel: (amount: number) => void;
  startGame: () => void;
  resetGame: () => void;
  completeGame: () => void;
  completeTutorial: () => void;
  markStoryAsShown: (storyId: string) => void;
  setCurrentStory: (storyId: string | null) => void;
}

export const useThirstyCrow = create<ThirstyCrowState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gamePhase: GamePhase.INTRO,
    tutorialComplete: false,
    waterLevel: 0.5, // Start with higher water level for better visibility
    startTime: null,
    endTime: null,
    score: 0,
    
    crowPosition: [0, 0, 5],
    crowRotation: 0,
    hasStone: false,
    heldStoneId: null,
    
    stones: generateStones(),
    
    storySegments: STORY_SEGMENTS,
    currentStoryId: "intro",
    
    // Actions
    setCrowPosition: (position) => {
      set({ crowPosition: position });
    },
    
    setCrowRotation: (rotation) => {
      set({ crowRotation: rotation });
    },
    
    pickupStone: (stoneId) => {
      const { stones, hasStone } = get();
      
      // Can't pick up a stone if already holding one
      if (hasStone) return;
      
      const updatedStones = stones.map(stone => 
        stone.id === stoneId 
          ? { ...stone, isPickedUp: true } 
          : stone
      );
      
      // Check if this is the first stone pickup for story progression
      const firstPickup = !stones.some(stone => stone.isPickedUp);
      const storySegments = get().storySegments;
      
      if (firstPickup) {
        const updatedStorySegments = storySegments.map(segment => 
          segment.trigger === 'pickup_first' 
            ? { ...segment, shown: true } 
            : segment
        );
        
        set({ 
          stones: updatedStones,
          hasStone: true,
          heldStoneId: stoneId,
          storySegments: updatedStorySegments,
          currentStoryId: "first_stone"
        });
      } else {
        set({ 
          stones: updatedStones,
          hasStone: true,
          heldStoneId: stoneId
        });
      }
    },
    
    dropStone: () => {
      const { hasStone, heldStoneId, stones, waterLevel } = get();
      
      // Can't drop if not holding a stone
      if (!hasStone || !heldStoneId) return;
      
      // Find the held stone
      const heldStone = stones.find(stone => stone.id === heldStoneId);
      if (!heldStone) return;
      
      // Increase water level based on stone size
      // Amplify water rise effect for better visibility and gameplay
      const waterRiseMultiplier = 1.5; // Increase effect by 50%
      const waterRiseAmount = heldStone.waterRise * waterRiseMultiplier;
      const newWaterLevel = Math.min(WATER_LEVEL.MAX, waterLevel + waterRiseAmount);
      
      console.log("Stone dropped! Water level:", waterLevel, "->", newWaterLevel);
      
      // Check if this is the first stone drop for story progression
      const firstDrop = !stones.some(stone => !stone.isPickedUp && stone.id !== heldStoneId);
      const storySegments = get().storySegments;
      let updatedStorySegments = [...storySegments];
      let newStoryId = get().currentStoryId;
      
      if (firstDrop) {
        updatedStorySegments = storySegments.map(segment => 
          segment.trigger === 'drop_first' 
            ? { ...segment, shown: true } 
            : segment
        );
        newStoryId = "first_drop";
      } 
      else if (newWaterLevel >= WATER_LEVEL.SUCCESS_THRESHOLD && waterLevel < WATER_LEVEL.SUCCESS_THRESHOLD) {
        // Reached success threshold
        updatedStorySegments = storySegments.map(segment => 
          segment.trigger === 'success' 
            ? { ...segment, shown: true } 
            : segment
        );
        newStoryId = "success";
      }
      else if (newWaterLevel >= WATER_LEVEL.MAX / 2 && waterLevel < WATER_LEVEL.MAX / 2) {
        // Reached halfway point
        updatedStorySegments = storySegments.map(segment => 
          segment.trigger === 'halfway' 
            ? { ...segment, shown: true } 
            : segment
        );
        newStoryId = "halfway";
      }
      
      // Remove the stone from play
      const updatedStones = stones.filter(stone => stone.id !== heldStoneId);
      
      set({ 
        stones: updatedStones,
        hasStone: false,
        heldStoneId: null,
        waterLevel: newWaterLevel,
        storySegments: updatedStorySegments,
        currentStoryId: newStoryId
      });
      
      // Check if game completed
      if (newWaterLevel >= WATER_LEVEL.SUCCESS_THRESHOLD) {
        get().completeGame();
      }
    },
    
    increaseWaterLevel: (amount) => {
      const { waterLevel } = get();
      const newWaterLevel = Math.min(WATER_LEVEL.MAX, waterLevel + amount);
      
      set({ waterLevel: newWaterLevel });
      
      // Check if game completed
      if (newWaterLevel >= WATER_LEVEL.SUCCESS_THRESHOLD) {
        get().completeGame();
      }
    },
    
    startGame: () => {
      // Start the timer
      set({ 
        gamePhase: GamePhase.TUTORIAL,
        startTime: Date.now(),
        storySegments: STORY_SEGMENTS.map(segment => 
          segment.trigger === 'start'
            ? { ...segment, shown: true }
            : segment
        ),
        currentStoryId: "intro"
      });
    },
    
    resetGame: () => {
      set({ 
        gamePhase: GamePhase.INTRO, 
        waterLevel: 0.5, // Match the initial state
        startTime: null,
        endTime: null,
        score: 0,
        crowPosition: [0, 0, 5],
        crowRotation: 0,
        hasStone: false,
        heldStoneId: null,
        stones: generateStones(),
        storySegments: STORY_SEGMENTS.map(segment => ({ ...segment, shown: false })),
        currentStoryId: "intro"
      });
    },
    
    completeGame: () => {
      const { startTime } = get();
      if (!startTime) return;
      
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      
      // Calculate score based on time (faster = higher score)
      // Base score of 1000, minus 10 points per second
      const timePenalty = Math.floor(elapsedTime / 1000) * 10;
      const score = Math.max(0, 1000 - timePenalty);
      
      set({ 
        gamePhase: GamePhase.SUCCESS, 
        endTime, 
        score
      });
    },
    
    completeTutorial: () => {
      set({ 
        tutorialComplete: true,
        gamePhase: GamePhase.PLAYING
      });
    },
    
    markStoryAsShown: (storyId) => {
      const { storySegments } = get();
      const updatedStorySegments = storySegments.map(segment => 
        segment.id === storyId
          ? { ...segment, shown: true }
          : segment
      );
      
      set({ storySegments: updatedStorySegments });
    },
    
    setCurrentStory: (storyId) => {
      set({ currentStoryId: storyId });
    }
  }))
);

// Create a React context for the game state
const GameContext = createContext<ReturnType<typeof useThirstyCrow.getState> | null>(null);

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  return (
    <GameContext.Provider value={useThirstyCrow.getState()}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use the game state in components
export function useThirstyCrowContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useThirstyCrowContext must be used within a GameProvider');
  }
  return context;
}
