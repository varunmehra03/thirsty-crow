import { useRef, useEffect, useState } from "react";
import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WATER_LEVEL } from "../../types/game";
import { useTexture } from "@react-three/drei";
import { useAudio } from "../../lib/stores/useAudio";

// Water ripple animation component
function WaterRipple({ position, radius }: { position: [number, number, number], radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rippleTime, setRippleTime] = useState(0);
  
  // Animate the ripple effect
  useFrame((state, delta) => {
    setRippleTime(prev => prev + delta);
    
    if (meshRef.current) {
      // Gentle pulsing scale effect
      const pulseScale = 0.95 + 0.1 * Math.sin(rippleTime * 2);
      meshRef.current.scale.set(pulseScale, 1, pulseScale);
      
      // Rotate slowly
      meshRef.current.rotation.z += delta * 0.2;
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius * 0.7, radius * 0.9, 32]} />
      <meshBasicMaterial 
        color="#80FFFF" 
        transparent 
        opacity={0.6}
      />
    </mesh>
  );
}

interface PitcherProps {
  position: [number, number, number];
}

export function Pitcher({ position }: PitcherProps) {
  // Get game state
  const waterLevel = useThirstyCrow(state => state.waterLevel);
  const crowPosition = useThirstyCrow(state => state.crowPosition);
  const hasStone = useThirstyCrow(state => state.hasStone);
  const dropStone = useThirstyCrow(state => state.dropStone);
  const heldStoneId = useThirstyCrow(state => state.heldStoneId);
  const stones = useThirstyCrow(state => state.stones);
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  
  // Play sound effects
  const playHit = useAudio(state => state.playHit);
  const playSuccess = useAudio(state => state.playSuccess);
  
  // Pitcher dimensions - increased size for better visibility
  const pitcherHeight = 2.5; // Increased from 2
  const pitcherRadius = 1.0; // Increased from 0.8
  
  // References
  const pitcherRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  
  // Load textures
  const sandTexture = useTexture("/textures/sand.jpg");
  
  // Check if crow is above pitcher
  const [isAbovePitcher, setIsAbovePitcher] = useState(false);
  
  // Update water level height
  useEffect(() => {
    if (waterRef.current) {
      console.log("Water level updated:", waterLevel);
      
      // Update water cylinder height based on water level (0-1)
      // Use a minimum scale to ensure water is always visible
      waterRef.current.scale.y = Math.max(0.05, waterLevel);
      
      // No need to update position since we've fixed it in the JSX
      
      // Play success sound when water level rises
      if (waterLevel >= WATER_LEVEL.SUCCESS_THRESHOLD) {
        console.log("Water level success reached!");
        playSuccess();
      }
    }
  }, [waterLevel, playSuccess]);
  
  // Check if crow is above pitcher each frame for drop logic
  useFrame(() => {
    if (!hasStone || gamePhase !== 'playing') {
      setIsAbovePitcher(false);
      return;
    }
    
    const [crowX, crowY, crowZ] = crowPosition;
    const [pitcherX, pitcherY, pitcherZ] = position;
    
    // Check horizontal distance to pitcher
    const horizontalDistSq = (crowX - pitcherX) ** 2 + (crowZ - pitcherZ) ** 2;
    
    // Check vertical position - must be above pitcher
    const isAbove = crowY > pitcherY + pitcherHeight / 2 && horizontalDistSq < pitcherRadius ** 2;
    
    setIsAbovePitcher(isAbove);
  });
  
  // Handle drop logic
  const handleDrop = () => {
    if (!isAbovePitcher || !hasStone || gamePhase !== 'playing') return;
    
    const heldStone = stones.find(stone => stone.id === heldStoneId);
    if (!heldStone) return;
    
    dropStone();
    playHit();
    console.log("Stone dropped in pitcher", heldStone.size);
  };
  
  // Effect to interact with keyboard/touch drop
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'KeyQ' || e.code === 'ShiftLeft') && isAbovePitcher && hasStone && gamePhase === 'playing') {
        handleDrop();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAbovePitcher, hasStone, gamePhase]);
  
  return (
    <group ref={pitcherRef} position={position} castShadow>
      {/* Pitcher base - transparent glass */}
      <mesh position={[0, pitcherHeight / 4, 0]} castShadow>
        <cylinderGeometry 
          args={[
            pitcherRadius, 
            pitcherRadius * 1.2, 
            pitcherHeight / 2, 
            16
          ]} 
        />
        <meshPhysicalMaterial 
          color="#FFFFFF" 
          transparent={true}
          opacity={0.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          ior={1.5}
          thickness={0.5}
        />
      </mesh>
      
      {/* Pitcher top - transparent glass */}
      <mesh position={[0, pitcherHeight * 0.6, 0]} castShadow>
        <cylinderGeometry 
          args={[
            pitcherRadius * 1.2, 
            pitcherRadius * 0.8, 
            pitcherHeight / 2, 
            16
          ]} 
        />
        <meshPhysicalMaterial 
          color="#FFFFFF" 
          transparent={true}
          opacity={0.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.9}
          ior={1.5}
          thickness={0.5}
        />
      </mesh>
      
      {/* Pitcher rim decoration */}
      <mesh position={[0, pitcherHeight * 0.85, 0]} castShadow>
        <torusGeometry args={[pitcherRadius * 0.85, 0.05, 8, 24]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Pitcher base decoration */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <torusGeometry args={[pitcherRadius * 1.15, 0.05, 8, 24]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Blue water inside pitcher */}
      <mesh 
        ref={waterRef} 
        position={[0, 0.2, 0]} 
        scale={[0.9, waterLevel, 0.9]}
      >
        <cylinderGeometry 
          args={[
            pitcherRadius * 0.7, 
            pitcherRadius * 0.7, 
            pitcherHeight, 
            16
          ]} 
        />
        <meshStandardMaterial 
          color="#0066FF" 
          transparent 
          opacity={0.9} 
          emissive="#0088FF"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Water surface with bright water color */}
      <mesh 
        position={[0, 0.2 + waterLevel * pitcherHeight * 0.5, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[pitcherRadius * 0.65, 32]} />
        <meshBasicMaterial 
          color="#0099FF" 
        />
      </mesh>
      
      {/* Floating items to make water more visible */}
      <group position={[0, 0.2 + waterLevel * pitcherHeight * 0.5, 0]}>
        {/* Floating leaf 1 */}
        <mesh position={[0.2, 0, 0.1]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
          <circleGeometry args={[0.15, 3]} />
          <meshBasicMaterial color="#00AA00" />
        </mesh>
        
        {/* Floating leaf 2 */}
        <mesh position={[-0.2, 0, -0.1]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
          <circleGeometry args={[0.12, 3]} />
          <meshBasicMaterial color="#00AA00" />
        </mesh>
        
        {/* Water ripple highlight */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
        </mesh>
      </group>
      
      {/* Enhanced drop zone indicator - only visible when crow is holding a stone */}
      {hasStone && (
        <group position={[0, pitcherHeight + 0.5, 0]}>
          {/* Target circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshBasicMaterial 
              color={isAbovePitcher ? "#00FF00" : "#FFFF00"} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
          
          {/* Inner target circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[0.1, 0.2, 32]} />
            <meshBasicMaterial 
              color={isAbovePitcher ? "#00FF00" : "#FFFF00"} 
              transparent 
              opacity={0.8} 
            />
          </mesh>
          
          {/* Text indicator */}
          {isAbovePitcher && (
            <group position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]}>
              <mesh>
                <boxGeometry args={[0.8, 0.3, 0.05]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0, 0, 0.03]}>
                <boxGeometry args={[0.7, 0.2, 0.05]} />
                <meshBasicMaterial color="#FF0000" />
              </mesh>
              <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.2, 0.5, 16]} />
                <meshBasicMaterial color="#00FF00" />
              </mesh>
            </group>
          )}
          
          {/* Downward arrow indicator */}
          <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.2, 0.5, 16]} />
            <meshBasicMaterial 
              color={isAbovePitcher ? "#00FF00" : "#FFFF00"} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
