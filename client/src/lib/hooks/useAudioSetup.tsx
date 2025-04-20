import { useEffect } from 'react';
import { useAudio } from '../stores/useAudio';

export function useAudioSetup() {
  // Setup all audio elements for the game
  useEffect(() => {
    // Setup background music
    const backgroundMusic = new Audio('/sounds/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    // Setup sound effects
    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = 0.5;
    
    const successSound = new Audio('/sounds/success.mp3');
    successSound.volume = 0.6;
    
    // Store in the zustand store
    const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio.getState();
    setBackgroundMusic(backgroundMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    
    // Cleanup
    return () => {
      backgroundMusic.pause();
      backgroundMusic.src = '';
      hitSound.src = '';
      successSound.src = '';
    };
  }, []);
  
  return null;
}
