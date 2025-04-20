import { useState, useEffect, useCallback } from 'react';
import { useThirstyCrow } from '../stores/useThirstyCrow';
import { GamePhase } from '../../types/game';

export function useTimer() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const gamePhase = useThirstyCrow(state => state.gamePhase);
  const startTime = useThirstyCrow(state => state.startTime);
  const endTime = useThirstyCrow(state => state.endTime);
  
  // Format time in mm:ss format
  const formatTime = useCallback((timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);
  
  // Update timer every second when game is in playing phase
  useEffect(() => {
    let intervalId: number;
    
    if (gamePhase === GamePhase.PLAYING && startTime && !endTime) {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        setElapsedTime(now - startTime);
      }, 1000);
    } else if (gamePhase === GamePhase.SUCCESS && startTime && endTime) {
      // Set final time when game is completed
      setElapsedTime(endTime - startTime);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gamePhase, startTime, endTime]);
  
  // Format elapsed time
  const formattedTime = formatTime(elapsedTime);
  
  return { elapsedTime, formattedTime };
}
