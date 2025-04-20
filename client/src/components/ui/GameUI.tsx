import { useState, useEffect } from "react";
import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { GamePhase } from "../../types/game";
import { Button } from "./button";
import { TouchControls } from "./TouchControls";
import { ScoreDisplay } from "./ScoreDisplay";
import { useAudio } from "../../lib/stores/useAudio";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { useTimer } from "../../lib/hooks/useTimer";

export function GameUI() {
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  const startGame = useThirstyCrow(state => state.startGame);
  const resetGame = useThirstyCrow(state => state.resetGame);
  const completeTutorial = useThirstyCrow(state => state.completeTutorial);
  const tutorialComplete = useThirstyCrow(state => state.tutorialComplete);
  const currentStoryId = useThirstyCrow(state => state.currentStoryId);
  const storySegments = useThirstyCrow(state => state.storySegments);
  
  const { formattedTime } = useTimer();
  const isMobile = useIsMobile();
  
  // Audio controls
  const { isMuted, toggleMute } = useAudio();
  
  // Current story text from storySegments
  const [storyText, setStoryText] = useState("");
  
  // Update story text when currentStoryId changes
  useEffect(() => {
    if (currentStoryId) {
      const segment = storySegments.find(s => s.id === currentStoryId);
      if (segment) {
        setStoryText(segment.text);
      }
    }
  }, [currentStoryId, storySegments]);
  
  // Intro/start screen
  if (gamePhase === GamePhase.INTRO) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">The Thirsty Crow</h1>
          <p className="mb-6">
            Help the crow find a way to drink water from a pitcher by adding stones to raise the water level.
          </p>
          <Button 
            variant="default" 
            size="lg" 
            onClick={startGame}
            className="text-lg px-8 py-3"
          >
            Start Game
          </Button>
        </div>
      </div>
    );
  }
  
  // Tutorial screen
  if (gamePhase === GamePhase.TUTORIAL && !tutorialComplete) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>
          
          <div className="mb-4">
            <h3 className="font-bold mb-1">Move the Crow:</h3>
            {isMobile ? (
              <p>Use the on-screen joystick to move around</p>
            ) : (
              <p>Use WASD or Arrow Keys to fly around</p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold mb-1">Pick Up Stones:</h3>
            {isMobile ? (
              <p>Tap the "Pick Up" button when near a stone</p>
            ) : (
              <p>Press E or Space when near a stone</p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold mb-1">Drop Stones:</h3>
            {isMobile ? (
              <p>Tap the "Drop" button when over the pitcher</p>
            ) : (
              <p>Press Q or Shift when flying over the pitcher</p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold mb-1">Flying Up/Down:</h3>
            {isMobile ? (
              <p>Use the Up/Down buttons to change altitude</p>
            ) : (
              <p>Press E/Space to fly up, F/Ctrl to descend</p>
            )}
          </div>
          
          <Button 
            variant="default" 
            size="lg" 
            onClick={completeTutorial}
            className="w-full mt-4"
          >
            Got it!
          </Button>
        </div>
      </div>
    );
  }
  
  // Success screen
  if (gamePhase === GamePhase.SUCCESS) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Great Job!</h1>
          
          <p className="mb-6">
            The crow was able to drink the water thanks to you!<br />
            You've learned that patience and ingenuity can solve difficult problems.
          </p>
          
          <ScoreDisplay />
          
          <div className="mt-4">
            <p className="mb-2">Your time: {formattedTime}</p>
          </div>
          
          <Button 
            variant="default" 
            size="lg" 
            onClick={resetGame}
            className="text-lg px-8 py-3 mt-4"
          >
            Play Again
          </Button>
        </div>
      </div>
    );
  }
  
  // In-game UI overlays
  return (
    <>
      {/* Top bar with timer */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center">
        {/* Timer display */}
        <div className="bg-white bg-opacity-80 px-4 py-2 rounded-lg font-bold">
          {formattedTime}
        </div>
        
        {/* Sound toggle button */}
        <button 
          onClick={toggleMute}
          className="bg-white bg-opacity-80 p-2 rounded-lg"
        >
          {isMuted ? (
            <span role="img" aria-label="unmute">🔇</span>
          ) : (
            <span role="img" aria-label="mute">🔊</span>
          )}
        </button>
      </div>
      
      {/* Story text narrative */}
      {storyText && (
        <div className="fixed top-16 left-0 right-0 p-4 flex justify-center">
          <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg max-w-md text-center shadow-lg">
            {storyText}
          </div>
        </div>
      )}
      
      {/* Touch controls for mobile */}
      {isMobile && gamePhase === GamePhase.PLAYING && (
        <TouchControls />
      )}
      
      {/* Keyboard controls reminder for desktop */}
      {!isMobile && gamePhase === GamePhase.PLAYING && (
        <div className="fixed bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg text-xs">
          <p><strong>WASD</strong>: Move | <strong>E/Space</strong>: Up/Pickup | <strong>F/Ctrl</strong>: Down | <strong>Q/Shift</strong>: Drop</p>
        </div>
      )}
    </>
  );
}
