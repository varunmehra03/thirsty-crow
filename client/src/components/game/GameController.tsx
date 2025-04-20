import { useEffect } from "react";
import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { Stone } from "./Stone";
import { useKeyboardControls } from "@react-three/drei";
import { Controls, GamePhase } from "../../types/game";
import { useAudio } from "../../lib/stores/useAudio";

export function GameController() {
  // Get game state
  const stones = useThirstyCrow(state => state.stones);
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  const resetGame = useThirstyCrow(state => state.resetGame);
  
  // Get keyboard controls
  const restart = useKeyboardControls<Controls>(state => state.restart);
  
  // Get audio controls
  const backgroundMusic = useAudio(state => state.backgroundMusic);
  const isMuted = useAudio(state => state.isMuted);
  const toggleMute = useAudio(state => state.toggleMute);
  
  // Handle restart game with 'R' key
  useEffect(() => {
    if (restart && gamePhase === GamePhase.SUCCESS) {
      resetGame();
    }
  }, [restart, gamePhase, resetGame]);
  
  // Play background music when game starts
  useEffect(() => {
    if (backgroundMusic && gamePhase === GamePhase.PLAYING && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
        // Auto-unmute on first user interaction
        const handleUserInteraction = () => {
          toggleMute();
          backgroundMusic.play().catch(console.error);
          
          // Remove listeners after first interaction
          document.removeEventListener('click', handleUserInteraction);
          document.removeEventListener('touchstart', handleUserInteraction);
          document.removeEventListener('keydown', handleUserInteraction);
        };
        
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);
      });
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic, gamePhase, isMuted, toggleMute]);
  
  // Render all stones in the scene
  return (
    <>
      {stones.map(stone => (
        <Stone key={stone.id} stoneData={stone} />
      ))}
    </>
  );
}
