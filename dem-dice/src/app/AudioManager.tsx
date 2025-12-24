'use client';

import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  rolling: boolean;
  onRollComplete?: () => void;
}

export default function AudioManager({ rolling, onRollComplete }: AudioManagerProps) {
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const rollSoundRef = useRef<HTMLAudioElement | null>(null);
  const settleSoundRef = useRef<HTMLAudioElement | null>(null);

  // Background music - gloomy city of the future
  useEffect(() => {
    const audio = new Audio('/sounds-of-the-gloomy-city-of-the-future-126442.mp3');
    audio.loop = true;
    audio.volume = 0.25; // 25% volume - plays continuously
    audio.preload = 'auto'; // Preload the audio
    bgMusicRef.current = audio;

    // Start playing automatically on mount - autoplay without user interaction
    const playAudio = () => {
      // Set autoplay attribute
      audio.autoplay = true;
      
      // Try to play immediately
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio is playing
            console.log('Background music started');
          })
          .catch((error) => {
            // Autoplay was prevented - try again after a short delay
            console.log('Autoplay prevented, retrying...');
            setTimeout(() => {
              audio.play().catch(() => {
                // If still fails, wait for any user interaction
                const handleInteraction = () => {
                  audio.play().catch(() => {});
                  document.removeEventListener('click', handleInteraction);
                  document.removeEventListener('touchstart', handleInteraction);
                  document.removeEventListener('keydown', handleInteraction);
                };
                document.addEventListener('click', handleInteraction, { once: true });
                document.addEventListener('touchstart', handleInteraction, { once: true });
                document.addEventListener('keydown', handleInteraction, { once: true });
              });
            }, 500);
          });
      }
    };

    // Small delay to ensure audio is ready
    setTimeout(playAudio, 100);

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
        bgMusicRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (rolling) {
      // Play rolling sound
      playRollSound();
    } else {
      // No settle sound - just callback
      if (onRollComplete) {
        setTimeout(() => {
          onRollComplete();
        }, 1500);
      }
    }
  }, [rolling, onRollComplete]);

  const playRollSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create a tumbling/rolling sound effect
    const createRollSound = () => {
      const duration = 1.5;
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        // Create a chaotic tumbling sound
        const t = i / sampleRate;
        const freq1 = 200 + Math.sin(t * 10) * 50;
        const freq2 = 300 + Math.cos(t * 8) * 40;
        const freq3 = 150 + Math.sin(t * 12) * 30;
        
        data[i] = (
          Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
          Math.sin(2 * Math.PI * freq2 * t) * 0.2 +
          Math.sin(2 * Math.PI * freq3 * t) * 0.1
        ) * Math.exp(-t * 0.5); // Fade out
      }
      
      return buffer;
    };

    const buffer = createRollSound();
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = 0.3;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start();
  };

  // Settle sound removed - no beeping/chime sounds

  return null; // This component doesn't render anything
}

