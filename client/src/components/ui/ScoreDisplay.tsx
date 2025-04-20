import { useThirstyCrow } from "../../lib/stores/useThirstyCrow";
import { useEffect, useState } from "react";
import { Button } from "./button";

export function ScoreDisplay() {
  const score = useThirstyCrow(state => state.score);
  const startTime = useThirstyCrow(state => state.startTime);
  const endTime = useThirstyCrow(state => state.endTime);
  const resetGame = useThirstyCrow(state => state.resetGame);
  
  // Calculate completion time
  const completionTimeSeconds = startTime && endTime 
    ? Math.floor((endTime - startTime) / 1000) 
    : 0;
  
  // Format time for display
  const minutes = Math.floor(completionTimeSeconds / 60);
  const seconds = completionTimeSeconds % 60;
  const timeDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Determine scoring tier and message
  let scoreMessage = "";
  let scoreColor = "";
  let medalImage = "";
  
  if (score >= 900) {
    scoreMessage = "Amazing job! You're as clever as the crow!";
    scoreColor = "text-green-600";
    medalImage = "🥇";
  } else if (score >= 700) {
    scoreMessage = "Great job! You helped the crow quickly!";
    scoreColor = "text-green-500";
    medalImage = "🥈";
  } else if (score >= 500) {
    scoreMessage = "Good work! The crow is no longer thirsty.";
    scoreColor = "text-blue-500";
    medalImage = "🥉";
  } else if (score >= 300) {
    scoreMessage = "You did it! The crow got to drink.";
    scoreColor = "text-blue-400";
    medalImage = "🎖️";
  } else {
    scoreMessage = "The crow is happy to have water!";
    scoreColor = "text-purple-500";
    medalImage = "🏆";
  }
  
  // Add counter animation for score
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    // Animate score count up
    if (score > 0) {
      const duration = 1500; // ms
      const interval = 30; // ms
      const steps = duration / interval;
      const increment = score / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [score]);
  
  // Calculate a wisdom score
  const wisdomScore = Math.min(100, Math.round((score / 1000) * 100));
  
  return (
    <div className="text-center bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4">Success! The Crow is No Longer Thirsty</h2>
      
      <div className="flex justify-center items-center mb-6">
        <span className="text-6xl mr-4">{medalImage}</span>
        <div>
          <div className={`text-5xl font-bold ${scoreColor}`}>
            {displayScore}
          </div>
          <div className="text-gray-600 mt-1">POINTS</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-gray-600">Time</div>
          <div className="text-2xl font-semibold">{timeDisplay}</div>
        </div>
        <div className="bg-gray-100 p-3 rounded">
          <div className="text-gray-600">Wisdom</div>
          <div className="text-2xl font-semibold">{wisdomScore}%</div>
        </div>
      </div>
      
      <p className="text-lg text-gray-700 mb-6">{scoreMessage}</p>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Moral of the Story:</h3>
        <p className="text-gray-700 italic">"Necessity is the mother of invention. When faced with a problem, think creatively to find a solution."</p>
      </div>
      
      <Button 
        onClick={() => resetGame()}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full"
      >
        Play Again
      </Button>
    </div>
  );
}
