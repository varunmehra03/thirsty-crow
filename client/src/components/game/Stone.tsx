import { useState, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { StoneData, StoneSize, STONE_PROPERTIES } from "../../types/game";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useAudio } from "../../lib/stores/useAudio";

interface StoneProps {
  stoneData: StoneData;
}

export function Stone({ stoneData }: StoneProps) {
  const { id, size, position, isPickedUp } = stoneData;
  
  // Get game state
  const crowPosition = useThirstyCrow(state => state.crowPosition);
  const pickupStone = useThirstyCrow(state => state.pickupStone);
  const hasStone = useThirstyCrow(state => state.hasStone);
  const heldStoneId = useThirstyCrow(state => state.heldStoneId);
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  
  // Sound effect
  const playHit = useAudio(state => state.playHit);
  
  // Stone properties based on size
  const { scale, value, color } = STONE_PROPERTIES[size];
  
  // Stone mesh reference
  const stoneRef = useRef<THREE.Mesh>(null);
  
  // Stone hover state
  const [hovered, setHovered] = useState(false);
  
  // Check if stone is near crow for pickup
  const [isNearCrow, setIsNearCrow] = useState(false);
  
  // Load wood texture for stones
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Check distance to crow each frame for pickup logic
  useFrame(() => {
    if (isPickedUp || gamePhase !== 'playing') return;
    
    if (stoneRef.current) {
      const crowDistanceSq = new THREE.Vector3(...crowPosition)
        .distanceToSquared(new THREE.Vector3(...position));
      
      // Pickup radius - squared distance to avoid sqrt
      const isNear = crowDistanceSq < 4;
      setIsNearCrow(isNear);
    }
  });
  
  // Handle pickup logic
  const handlePickup = () => {
    if (!isNearCrow || hasStone || isPickedUp || gamePhase !== 'playing') return;
    
    pickupStone(id);
    playHit();
    console.log("Stone picked up: ", id);
  };
  
  // Effect to interact with keyboard/touch pickup
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'KeyE' || e.code === 'Space') && isNearCrow && !hasStone && !isPickedUp && gamePhase === 'playing') {
        handlePickup();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isNearCrow, hasStone, isPickedUp, gamePhase]);
  
  // Don't render if stone is picked up
  if (isPickedUp && id !== heldStoneId) return null;
  
  return (
    <mesh
      ref={stoneRef}
      position={position}
      scale={scale}
      onClick={handlePickup}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial 
        map={woodTexture} 
        color={hovered || isNearCrow ? "#aaaaaa" : "#666666"} 
        roughness={0.8}
        metalness={0.1}
      />
      
      {/* Weight/value indicator - display stone value (1, 2, or 3) */}
      <group position={[0, 0.35, 0]}>
        {/* Circle background for value */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 16]} />
          <meshBasicMaterial color={
            size === StoneSize.SMALL ? "#33CC33" : 
            size === StoneSize.MEDIUM ? "#3366CC" : 
            "#CC3333"
          } />
        </mesh>
        
        {/* Number value on top */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Value indicators - simple shapes to represent 1, 2, or 3 */}
        {size === StoneSize.SMALL && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.05, 0.12, 0.01]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        )}
        
        {size === StoneSize.MEDIUM && (
          <>
            <mesh position={[-0.04, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.01]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0.04, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.01]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </>
        )}
        
        {size === StoneSize.LARGE && (
          <>
            <mesh position={[-0.05, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.01]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.01]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0.05, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.01]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          </>
        )}
      </group>
      
      {/* Enhanced highlight effect when stone is near crow and can be picked up */}
      {isNearCrow && !hasStone && (
        <>
          {/* Larger highlight sphere */}
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#FFFF00" transparent opacity={0.7} />
          </mesh>
          
          {/* "Press E" text indicator */}
          <group position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.2, 0.05]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.5, 0.15, 0.05]} />
              <meshBasicMaterial color="#FF0000" />
            </mesh>
          </group>
          
          {/* Arrow pointing up */}
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshBasicMaterial color="#00FF00" />
          </mesh>
        </>
      )}
    </mesh>
  );
}
