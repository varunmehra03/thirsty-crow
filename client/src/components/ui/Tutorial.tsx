import { useState, useEffect } from "react";
import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { GamePhase } from "../../types/game";
import { Button } from "./button";

export function Tutorial() {
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  const tutorialComplete = useThirstyCrow(state => state.tutorialComplete);
  const completeTutorial = useThirstyCrow(state => state.completeTutorial);
  
  // Track tutorial step
  const [step, setStep] = useState(0);
  
  // Reset step when game phase changes
  useEffect(() => {
    if (gamePhase === GamePhase.TUTORIAL) {
      setStep(0);
    }
  }, [gamePhase]);
  
  // Don't show tutorial if game isn't in tutorial phase or tutorial is complete
  if (gamePhase !== GamePhase.TUTORIAL || tutorialComplete) {
    return null;
  }
  
  // Tutorial steps with improved instructions
  const steps = [
    {
      title: "Welcome to The Thirsty Crow!",
      content: "In this game, you'll help a thirsty crow get water from a pitcher by adding stones to raise the water level!"
    },
    {
      title: "Move Around",
      content: "Use WASD or Arrow Keys to fly the crow around. Look for the brown transparent pitcher with blue water inside."
    },
    {
      title: "Change Altitude",
      content: "Press SPACE to fly upward, and CTRL to descend. Flying up and down is important to reach stones and the pitcher."
    },
    {
      title: "Picking Up Stones",
      content: "Find a stone on the ground (brown cubes). Fly close to it and press 'E' to pick it up. You'll see the stone attached to the crow when picked up."
    },
    {
      title: "Dropping Stones in the Pitcher",
      content: "After picking up a stone, fly directly above the pitcher. A green indicator will appear when you're in position. Press 'Q' to drop the stone."
    },
    {
      title: "Watch the Water Rise",
      content: "When you drop a stone in the pitcher, the blue water level will rise. The floating green leaves show the water surface level clearly."
    },
    {
      title: "Your Goal: Fill the Pitcher",
      content: "Drop multiple stones to raise the water level high enough for the crow to drink. Your score is based on how quickly you complete this task!"
    }
  ];
  
  // Get current step data
  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  
  // Navigate between steps
  const nextStep = () => {
    if (isLastStep) {
      completeTutorial();
    } else {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-4 max-w-sm shadow-lg z-20">
      <h3 className="text-lg font-bold mb-2">{currentStep.title}</h3>
      <p className="mb-4">{currentStep.content}</p>
      
      <div className="flex justify-between items-center">
        {/* Step indicator */}
        <div className="text-sm">
          Step {step + 1} of {steps.length}
        </div>
        
        <div className="flex gap-2">
          {step > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevStep}
            >
              Back
            </Button>
          )}
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={nextStep}
          >
            {isLastStep ? "Start Game" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
