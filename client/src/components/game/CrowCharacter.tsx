import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { useControls } from "../../lib/hooks/useControls";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { GamePhase } from "../../types/game";

export function CrowCharacter() {
  // Get game state
  const crowPosition = useThirstyCrow(state => state.crowPosition);
  const crowRotation = useThirstyCrow(state => state.crowRotation);
  const hasStone = useThirstyCrow(state => state.hasStone);
  const heldStoneId = useThirstyCrow(state => state.heldStoneId);
  const stones = useThirstyCrow(state => state.stones);
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  
  // Get active controls
  const { isFlying } = useControls();
  
  // References for animation
  const crowRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);
  
  // Animate crow's wings when flying
  useFrame((state, delta) => {
    if (!wingLeftRef.current || !wingRightRef.current) return;
    
    if (isFlying) {
      // Flapping wings animation - increased speed and angle
      const wingSpeed = 25; // Increased from 15
      const wingAngle = 0.4 * Math.sin(state.clock.elapsedTime * wingSpeed); // Increased from 0.3
      
      wingLeftRef.current.rotation.y = Math.PI / 4 + wingAngle;
      wingRightRef.current.rotation.y = -Math.PI / 4 - wingAngle;
    } else {
      // Idle wings animation - gentle movement
      const idleSpeed = 3; // Increased from 2
      const idleAngle = 0.08 * Math.sin(state.clock.elapsedTime * idleSpeed); // Increased from 0.05
      
      wingLeftRef.current.rotation.y = Math.PI / 6 + idleAngle;
      wingRightRef.current.rotation.y = -Math.PI / 6 - idleAngle;
    }
    
    // Gentle bobbing for crow body
    if (crowRef.current) {
      crowRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.05;
    }
  });
  
  // Log current crow position for debugging
  useEffect(() => {
    console.log("Crow position:", crowPosition);
  }, [crowPosition]);
  
  // Get the held stone if any
  const heldStone = stones.find(stone => stone.id === heldStoneId);
  
  return (
    <group position={crowPosition} rotation={[0, crowRotation, 0]}>
      {/* Crow body */}
      <group ref={crowRef}>
        {/* Main body */}
        <mesh castShadow position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Head */}
        <mesh castShadow position={[0, 0.9, 0.25]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        
        {/* Beak */}
        <mesh castShadow position={[0, 0.85, 0.5]}>
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        
        {/* Left wing */}
        <mesh castShadow ref={wingLeftRef} position={[0.3, 0.5, 0]} rotation={[0, Math.PI / 6, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Right wing */}
        <mesh castShadow ref={wingRightRef} position={[-0.3, 0.5, 0]} rotation={[0, -Math.PI / 6, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Tail */}
        <mesh castShadow position={[0, 0.4, -0.4]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        {/* Held stone visualization */}
        {hasStone && heldStone && (
          <mesh castShadow position={[0, 0.3, 0.5]} scale={heldStone.size === 'small' ? 0.5 : (heldStone.size === 'medium' ? 0.75 : 1)}>
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshStandardMaterial color="gray" />
          </mesh>
        )}
        
        {/* Speech bubble for story narration */}
        {gamePhase !== GamePhase.PLAYING && (
          <Html
            position={[0, 1.5, 0]}
            center
            style={{
              width: '150px',
              height: '80px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'white',
              borderRadius: '50%',
              padding: '10px',
              border: '2px solid black',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
              opacity: 0.9,
              transform: 'scale(0.5)'
            }}
          >
            {gamePhase === GamePhase.INTRO && "I'm so thirsty! Help me find water!"}
            {gamePhase === GamePhase.TUTORIAL && "Help me move stones to the pitcher!"}
            {gamePhase === GamePhase.SUCCESS && "Thank you for helping me drink water!"}
          </Html>
        )}
      </group>
    </group>
  );
}
