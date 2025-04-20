import { useEffect, useRef } from "react";
import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { Controls } from "../../types/game";
import { Button } from "./button";

export function TouchControls() {
  // Get game state from store
  const setCrowPosition = useThirstyCrow(state => state.setCrowPosition);
  const setCrowRotation = useThirstyCrow(state => state.setCrowRotation);
  const crowPosition = useThirstyCrow(state => state.crowPosition);
  const crowRotation = useThirstyCrow(state => state.crowRotation);
  const hasStone = useThirstyCrow(state => state.hasStone);
  const stones = useThirstyCrow(state => state.stones);
  const dropStone = useThirstyCrow(state => state.dropStone);
  const pickupStone = useThirstyCrow(state => state.pickupStone);
  
  // Joystick state
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const joystickActive = useRef(false);
  const joystickOrigin = useRef({ x: 0, y: 0 });
  const joystickPosition = useRef({ x: 0, y: 0 });
  
  // Constants for movement
  const MOVE_SPEED = 0.1;
  const MAX_HEIGHT = 3;
  const MIN_HEIGHT = 0;
  
  // Setup joystick touch controls
  useEffect(() => {
    const joystickElement = joystickRef.current;
    const knobElement = knobRef.current;
    
    if (!joystickElement || !knobElement) return;
    
    // Reset knob position initially
    knobElement.style.transform = `translate(0px, 0px)`;
    
    // Start touch
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      const touch = e.touches[0];
      const joystickRect = joystickElement.getBoundingClientRect();
      
      joystickOrigin.current = {
        x: joystickRect.left + joystickRect.width / 2,
        y: joystickRect.top + joystickRect.height / 2
      };
      
      joystickActive.current = true;
      
      // Initial position
      handleTouchMove(e);
    };
    
    // Move touch
    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickActive.current) return;
      
      const touch = e.touches[0];
      
      // Calculate delta from origin
      const deltaX = touch.clientX - joystickOrigin.current.x;
      const deltaY = touch.clientY - joystickOrigin.current.y;
      
      // Limit joystick movement radius
      const maxRadius = 40;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      let limitedX = deltaX;
      let limitedY = deltaY;
      
      if (distance > maxRadius) {
        const scale = maxRadius / distance;
        limitedX *= scale;
        limitedY *= scale;
      }
      
      // Update knob position
      knobElement.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
      
      // Store normalized position for movement
      joystickPosition.current = {
        x: limitedX / maxRadius,
        y: limitedY / maxRadius
      };
    };
    
    // End touch
    const handleTouchEnd = (e: TouchEvent) => {
      joystickActive.current = false;
      
      // Reset knob position
      knobElement.style.transform = `translate(0px, 0px)`;
      
      // Reset joystick values
      joystickPosition.current = { x: 0, y: 0 };
    };
    
    // Add event listeners
    joystickElement.addEventListener('touchstart', handleTouchStart);
    joystickElement.addEventListener('touchmove', handleTouchMove);
    joystickElement.addEventListener('touchend', handleTouchEnd);
    joystickElement.addEventListener('touchcancel', handleTouchEnd);
    
    // Setup movement loop
    const moveInterval = setInterval(() => {
      if (!joystickActive.current) return;
      
      // Get joystick values
      const { x, y } = joystickPosition.current;
      
      // Only move if values are not zero
      if (x !== 0 || y !== 0) {
        const [crowX, crowY, crowZ] = crowPosition;
        let rotation = crowRotation;
        
        // Update rotation based on movement direction
        if (x !== 0) {
          rotation = -Math.atan2(x, -y) || rotation;
        }
        
        // Update crow position
        const newX = crowX + x * MOVE_SPEED;
        const newZ = crowZ + y * MOVE_SPEED;
        
        // Apply boundaries
        const boundary = 10;
        const boundedX = Math.max(-boundary, Math.min(boundary, newX));
        const boundedZ = Math.max(-boundary, Math.min(boundary, newZ));
        
        // Update state
        setCrowPosition([boundedX, crowY, boundedZ]);
        setCrowRotation(rotation);
      }
    }, 16); // 60fps approx
    
    // Cleanup
    return () => {
      joystickElement.removeEventListener('touchstart', handleTouchStart);
      joystickElement.removeEventListener('touchmove', handleTouchMove);
      joystickElement.removeEventListener('touchend', handleTouchEnd);
      joystickElement.removeEventListener('touchcancel', handleTouchEnd);
      
      clearInterval(moveInterval);
    };
  }, [crowPosition, crowRotation, setCrowPosition, setCrowRotation]);
  
  // Find nearest stone to the crow
  const findNearestStone = (): string | null => {
    if (hasStone) return null;
    
    let nearestStone = null;
    let minDistance = Infinity;
    
    for (const stone of stones) {
      if (stone.isPickedUp) continue;
      
      const distance = Math.sqrt(
        Math.pow(stone.position[0] - crowPosition[0], 2) +
        Math.pow(stone.position[2] - crowPosition[2], 2)
      );
      
      if (distance < 2 && distance < minDistance) {
        nearestStone = stone.id;
        minDistance = distance;
      }
    }
    
    return nearestStone;
  };
  
  // Check if crow is above pitcher
  const isAbovePitcher = (): boolean => {
    if (!hasStone) return false;
    
    const [x, y, z] = crowPosition;
    const pitcherPosition = [0, 0, 0]; // Pitcher is at center
    
    const horizontalDist = Math.sqrt(
      Math.pow(x - pitcherPosition[0], 2) +
      Math.pow(z - pitcherPosition[2], 2)
    );
    
    const isAbove = horizontalDist < 0.8 && y > 1.0;
    return isAbove;
  };
  
  // Handle action buttons
  const handlePickup = () => {
    const nearestStone = findNearestStone();
    if (nearestStone) {
      pickupStone(nearestStone);
    }
  };
  
  const handleDrop = () => {
    if (hasStone && isAbovePitcher()) {
      dropStone();
    }
  };
  
  const handleFlyUp = () => {
    const [x, y, z] = crowPosition;
    if (y < MAX_HEIGHT) {
      setCrowPosition([x, Math.min(y + MOVE_SPEED, MAX_HEIGHT), z]);
    }
  };
  
  const handleFlyDown = () => {
    const [x, y, z] = crowPosition;
    if (y > MIN_HEIGHT) {
      setCrowPosition([x, Math.max(y - MOVE_SPEED, MIN_HEIGHT), z]);
    }
  };
  
  // Determine button availability
  const canPickup = findNearestStone() !== null;
  const canDrop = hasStone && isAbovePitcher();
  
  return (
    <div className="fixed bottom-4 left-0 right-0 flex flex-col items-center">
      {/* Altitude controls */}
      <div className="flex justify-center mb-4 gap-4">
        <Button
          variant={hasStone ? "outline" : "default"}
          size="lg"
          className="w-16 h-16 rounded-full shadow-lg"
          onClick={handleFlyUp}
          disabled={hasStone}
        >
          ⬆️
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full shadow-lg"
          onClick={handleFlyDown}
        >
          ⬇️
        </Button>
      </div>
      
      {/* Joystick container */}
      <div className="flex justify-between items-center w-full px-4 mb-4">
        {/* Left side: Movement joystick */}
        <div 
          ref={joystickRef}
          className="w-32 h-32 bg-black bg-opacity-20 rounded-full relative"
        >
          <div 
            ref={knobRef}
            className="w-16 h-16 bg-white bg-opacity-50 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        
        {/* Right side: Action buttons */}
        <div className="flex flex-col gap-4">
          <Button
            variant={canPickup ? "default" : "outline"}
            size="lg"
            className="w-32 shadow-lg"
            onClick={handlePickup}
            disabled={!canPickup}
          >
            Pick Up
          </Button>
          
          <Button
            variant={canDrop ? "default" : "outline"}
            size="lg"
            className="w-32 shadow-lg"
            onClick={handleDrop}
            disabled={!canDrop}
          >
            Drop
          </Button>
        </div>
      </div>
    </div>
  );
}
