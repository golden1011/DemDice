'use client';

import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  rolling: boolean;
  onRollComplete?: () => void;
}

// Global function to start background music - must be called directly from user gesture
let globalStartBackgroundMusic: (() => Promise<void>) | null = null;

export default function AudioManager({ rolling, onRollComplete }: AudioManagerProps) {
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const rollSoundRef = useRef<HTMLAudioElement | null>(null);
  const settleSoundRef = useRef<HTMLAudioElement | null>(null);

  // Background music - gloomy city of the future
  useEffect(() => {
    let hasStarted = false;
    let audio: HTMLAudioElement | null = null;
    
    // Detect if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                     (typeof window !== 'undefined' && window.innerWidth < 768);

    // Function to create and start audio playback
    // On mobile, audio must be created AND played within the same user gesture
    const startAudio = async (createNew = false, forceStart = false) => {
      // On mobile, if already started, don't restart - just let it loop
      if (isMobile && hasStarted && audio && !createNew) {
        return;
      }
      
      if (hasStarted && audio && !createNew && !forceStart) return;
      
      // On mobile, only create audio element when explicitly requested (user interaction)
      if (isMobile && !createNew && !audio) {
        return; // Don't create audio element on mobile until user interacts
      }
      
      try {
        // On mobile, we need to create the audio element within the user gesture handler
        if (!audio || createNew) {
          // Clean up old audio if exists
          if (audio) {
            audio.pause();
            audio.removeEventListener('error', () => {});
            audio.removeEventListener('loadstart', () => {});
            audio.removeEventListener('canplay', () => {});
            audio.removeEventListener('canplaythrough', () => {});
            audio.src = '';
            audio = null;
          }
          
          // Create new audio element - MUST be done in user gesture handler on mobile
          audio = new Audio('/sounds-of-the-gloomy-city-of-the-future-126442.mp3');
          audio.loop = true;
          audio.volume = 0.1875; // ~19% volume (reduced by 25% from 0.25) - plays continuously
          // On mobile, don't preload - only load when user interacts
          audio.preload = isMobile ? 'none' : 'auto';
          
          // Set up error handling with more details
          const errorHandler = () => {
            // Use setTimeout to ensure error property is set
            setTimeout(() => {
              const error = audio?.error;
              if (error && error.code !== null) {
                // Only log if there's an actual error code
                const errorMessages: Record<number, string> = {
                  1: 'MEDIA_ERR_ABORTED - The user aborted the loading',
                  2: 'MEDIA_ERR_NETWORK - A network error occurred',
                  3: 'MEDIA_ERR_DECODE - An error occurred while decoding',
                  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - The audio source is not supported'
                };
                
                console.error('Audio error:', {
                  code: error.code,
                  message: error.message || errorMessages[error.code] || 'Unknown error',
                  src: audio?.src,
                  networkState: audio?.networkState,
                  readyState: audio?.readyState
                });
              }
              // If no error code, it might be a false alarm or the error was already handled
              // Don't log this as it's often not a real problem
            }, 100); // Slightly longer delay to ensure error is set
          };
          
          audio.addEventListener('error', errorHandler);
          
          bgMusicRef.current = audio;
          
          // Wait a bit for the audio to start loading (but don't wait too long on mobile)
          // On mobile, we need to call play() quickly after creation
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        
        // Resume audio context if suspended (important for mobile)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // Try to play the audio - MUST be called in same user gesture handler on mobile
        if (audio) {
          // Check if audio has an error before trying to play
          if (audio.error) {
            console.error('Audio has error before play attempt:', {
              code: audio.error.code,
              message: audio.error.message
            });
            hasStarted = false;
            return;
          }
          
          // On mobile, we need to call play() immediately in the gesture handler
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
            hasStarted = true;
            console.log('Background music started');
          }
        }
      } catch (error) {
        // Autoplay was prevented - this is expected on mobile
        console.log('Audio play failed:', error);
        if (audio?.error) {
          const audioError = audio.error;
          console.error('Audio element error details:', {
            code: audioError.code,
            message: audioError.message || 'Unknown error'
          });
        }
        hasStarted = false;
      }
    };

    // Expose startAudio globally so it can be called directly from user gestures
    globalStartBackgroundMusic = async () => {
      // On mobile, if already started and playing, don't restart - just return
      if (isMobile && hasStarted && audio && !audio.paused) {
        return; // Already playing, don't restart
      }
      await startAudio(true);
    };
    
    // Also expose on window for direct access from button handlers
    (window as any).startBackgroundMusic = globalStartBackgroundMusic;

    // Function to handle user interaction - MUST create and play in same handler on mobile
    const handleInteraction = async (event?: Event) => {
      // On mobile, only start if not already started (don't restart)
      if (isMobile && hasStarted) {
        return;
      }
      
      // On mobile, only create and start on explicit roll button click, not general interactions
      // This prevents downloading audio on accidental touches
      if (isMobile && !hasStarted) {
        // Only start if this is triggered from the roll button (via userInteraction event)
        // Don't start on general clicks/touches to save bandwidth
        return;
      }
      
      if (!hasStarted) {
        // Create and play in the same gesture handler (required for mobile)
        await startAudio(true);
      }
    };

    // Try to start immediately on page load (works on desktop)
    // On mobile, don't create audio element at all until user interacts
    if (!isMobile) {
      const tryAutoplay = async () => {
        try {
          // Create audio element first (desktop only)
          if (!audio) {
            audio = new Audio('/sounds-of-the-gloomy-city-of-the-future-126442.mp3');
            audio.loop = true;
            audio.volume = 0.1875; // ~19% volume (reduced by 25% from 0.25)
            audio.preload = 'auto';
            bgMusicRef.current = audio;
          }
          
          // Try to start playing
          await startAudio(false, true);
        } catch (error) {
          // Expected to fail on some browsers, will start on interaction
        }
      };
      
      // Try immediately when component mounts (desktop only)
      tryAutoplay();
      
      // Also try after short delays in case the page is still loading
      setTimeout(tryAutoplay, 100);
      setTimeout(tryAutoplay, 500);
      setTimeout(tryAutoplay, 1000);
    } else {
      // On mobile, don't create audio element or attempt to load anything
      // It will only be created when user clicks roll button
      console.log('Mobile detected - background audio will start on first roll');
    }

    // Set up event listeners for user interaction (required for mobile)
    // Use capture phase and multiple events for better mobile support
    const options = { capture: true, passive: true };
    
    document.addEventListener('click', handleInteraction, options);
    document.addEventListener('touchstart', handleInteraction, options);
    document.addEventListener('touchend', handleInteraction, options);
    document.addEventListener('touchmove', handleInteraction, options);
    document.addEventListener('keydown', handleInteraction, options);
    
    // Also try to start when rolling (user interaction)
    // For custom events, we still need to create/play in the handler
    const handleRollStart = async (event?: Event) => {
      // On mobile, only start if not already started (don't restart)
      if (isMobile && hasStarted) {
        return;
      }
      
      // On mobile, we MUST create and play in the same handler
      // The custom event is triggered from a real user gesture (roll button), so this will work
      // This is the ONLY place we create audio on mobile - when user clicks roll
      if (!hasStarted) {
        await startAudio(true);
      }
    };
    
    // Listen for custom event that can be triggered from page
    window.addEventListener('userInteraction', handleRollStart, { passive: true });

    return () => {
      // Clean up event listeners
      document.removeEventListener('click', handleInteraction, options);
      document.removeEventListener('touchstart', handleInteraction, options);
      document.removeEventListener('touchend', handleInteraction, options);
      document.removeEventListener('touchmove', handleInteraction, options);
      document.removeEventListener('keydown', handleInteraction, options);
      window.removeEventListener('userInteraction', handleRollStart);
      
      if (audio) {
        audio.pause();
        audio.src = '';
        audio = null;
      }
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.src = '';
        bgMusicRef.current = null;
      }
      globalStartBackgroundMusic = null;
      (window as any).startBackgroundMusic = null;
    };
  }, []);

  useEffect(() => {
    if (rolling) {
      // On mobile, only trigger start if audio hasn't started yet
      // Once started, don't restart it - just let it loop continuously
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                       (typeof window !== 'undefined' && window.innerWidth < 768);
      
      // Only trigger start if not already started and playing (mobile)
      // On desktop, we can always try (for autoplay retry scenarios)
      if (!isMobile) {
        // Desktop: always trigger (might help with autoplay)
        window.dispatchEvent(new Event('userInteraction'));
      } else {
        // Mobile: only trigger if audio doesn't exist or is paused
        if (!bgMusicRef.current || bgMusicRef.current.paused) {
          window.dispatchEvent(new Event('userInteraction'));
        }
        // If audio exists and is playing, do nothing - let it continue looping
      }
      
      // Play rolling sound (this is separate from background music)
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

