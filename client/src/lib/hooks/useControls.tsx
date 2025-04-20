import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import { useThirstyCrow } from '../stores/useThirstyCrow';
import { Controls } from '../../types/game';

// Constants for movement
const MOVE_SPEED = 0.15; // Increased from 0.1
const ROTATION_SPEED = 0.07; // Increased from 0.05
const MAX_HEIGHT = 3;
const MIN_HEIGHT = 0;

// Using const instead of function declaration for better HMR compatibility
export const useControls = () => {
  // Get keyboard controls using drei's useKeyboardControls
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Get game state from store
  const setCrowPosition = useThirstyCrow(state => state.setCrowPosition);
  const setCrowRotation = useThirstyCrow(state => state.setCrowRotation);
  const crowPosition = useThirstyCrow(state => state.crowPosition);
  const crowRotation = useThirstyCrow(state => state.crowRotation);
  const hasStone = useThirstyCrow(state => state.hasStone);
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  
  // Reference to track if the crow is flying
  const isFlying = useRef(false);
  
  // Setup the animation frame for constant movement
  useFrame(() => {
    if (gamePhase !== 'playing' && gamePhase !== 'tutorial') return;
    
    // Get current keyboard state
    const keys = getKeys();
    
    // Current position and rotation
    let [x, y, z] = crowPosition;
    let rotation = crowRotation;
    
    // Apply movement based on keys
    if (keys.forward) {
      x -= Math.sin(rotation) * MOVE_SPEED;
      z -= Math.cos(rotation) * MOVE_SPEED;
      isFlying.current = true;
    }
    
    if (keys.backward) {
      x += Math.sin(rotation) * MOVE_SPEED;
      z += Math.cos(rotation) * MOVE_SPEED;
      isFlying.current = true;
    }
    
    if (keys.leftward) {
      rotation += ROTATION_SPEED;
      isFlying.current = true;
    }
    
    if (keys.rightward) {
      rotation -= ROTATION_SPEED;
      isFlying.current = true;
    }
    
    // Flying up/down controls - separate from the pickup action
    if (keys.pickup) {
      // Always allow flying up, regardless of stone state
      y = Math.min(y + MOVE_SPEED, MAX_HEIGHT);
      isFlying.current = true;
      // Note: Pickup action for stones is handled separately in the Stone component
    }
    
    if (keys.descend) {
      y = Math.max(y - MOVE_SPEED, MIN_HEIGHT);
      isFlying.current = true;
    }
    
    // Apply boundaries to keep crow in the scene
    const boundary = 10;
    x = Math.max(-boundary, Math.min(boundary, x));
    z = Math.max(-boundary, Math.min(boundary, z));
    
    // Update state if position changed
    if (x !== crowPosition[0] || y !== crowPosition[1] || z !== crowPosition[2]) {
      setCrowPosition([x, y, z]);
    }
    
    // Update rotation if changed
    if (rotation !== crowRotation) {
      setCrowRotation(rotation);
    }
    
    // Reset flying flag for animation purposes
    if (!keys.forward && !keys.backward && !keys.leftward && !keys.rightward && !keys.pickup && !keys.descend) {
      isFlying.current = false;
    }
  });
  
  // Check if this is a mobile device
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  // Add touch controls for mobile devices
  useEffect(() => {
    if (!isMobile) return;
    
    // Touch controls will be handled by the TouchControls component
    
    // Return cleanup function
    return () => {
      // Cleanup any event listeners if needed
    };
  }, [isMobile]);
  
  return { isFlying: isFlying.current };
}
