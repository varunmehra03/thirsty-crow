import { useTexture } from "@react-three/drei";
import { CrowCharacter } from "./CrowCharacter";
import { Pitcher } from "./Pitcher";
import { Physics } from "./Physics";
import { Suspense } from "react";
import * as THREE from "three";

export function Environment() {
  // Load textures
  const grassTexture = useTexture("/textures/grass.png");
  const skyTexture = useTexture("/textures/sky.png");
  
  return (
    <Suspense fallback={null}>
      {/* Scene lighting - enhanced for better water visibility */}
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.0} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Additional spotlight to highlight the pitcher */}
      <spotLight
        position={[0, 8, 2]}
        angle={0.3}
        penumbra={0.2}
        intensity={1.5}
        castShadow
        color="#FFFFFF"
      />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          map={grassTexture} 
          map-repeat={[6, 6]} 
          map-wrapS={THREE.RepeatWrapping} 
          map-wrapT={THREE.RepeatWrapping} 
        />
      </mesh>
      
      {/* Skybox - simple version */}
      <mesh position={[0, 0, -15]} scale={[40, 20, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={skyTexture} />
      </mesh>
      
      {/* Physics world for interactions */}
      <Physics />
      
      {/* Main game objects */}
      <CrowCharacter />
      <Pitcher position={[0, 0, 2]} />
    </Suspense>
  );
}
