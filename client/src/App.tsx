import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls, OrbitControls, Preload } from "@react-three/drei";
import { Environment } from "./components/game/Environment";
import { GameUI } from "./components/ui/GameUI";
import { GameController } from "./components/game/GameController";
import { useAudioSetup } from "./lib/hooks/useAudioSetup";
import { GameProvider } from "./lib/stores/useThirstyCrow";
import { Controls } from "./types/game";
import { useIsMobile } from "./hooks/use-is-mobile";
import { Tutorial } from "./components/ui/Tutorial";
import "@fontsource/inter";

// Define keyboard controls for the game
const keyboardMap = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.pickup, keys: ["KeyE", "Space"] },
  { name: Controls.drop, keys: ["KeyQ", "ShiftLeft"] },
  { name: Controls.descend, keys: ["KeyF", "ControlLeft"] },
  { name: Controls.restart, keys: ["KeyR"] },
];

function App() {
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Initialize audio
  useAudioSetup();

  // Simulate loading assets
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-primary">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-primary-foreground">The Thirsty Crow</h1>
          <p className="text-primary-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <GameProvider>
      <KeyboardControls map={keyboardMap}>
        <div className="w-full h-full relative">
          <Canvas
            shadows
            camera={{
              position: [0, 5, 10],
              fov: 60,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            <color attach="background" args={["#87CEEB"]} />
            
            <Suspense fallback={null}>
              {/* The game environment and all 3D elements */}
              <Environment />
              
              {/* Game controller for game logic */}
              <GameController />
              
              {/* Helper to control camera during development */}
              {!isMobile && <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} />}
              
              {/* Preload assets */}
              <Preload all />
            </Suspense>
          </Canvas>
          
          {/* UI overlays */}
          <GameUI />
          <Tutorial />
        </div>
      </KeyboardControls>
    </GameProvider>
  );
}

export default App;
