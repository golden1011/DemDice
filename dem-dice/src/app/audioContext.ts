// Shared AudioContext for all sound effects
// Mobile browsers have strict limits on AudioContext instances, so we reuse a single one

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Resume if suspended (required for mobile)
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {
      // Ignore resume errors - will be handled on next play attempt
    });
  }
  
  return sharedAudioContext;
}

export function closeAudioContext() {
  if (sharedAudioContext && sharedAudioContext.state !== 'closed') {
    sharedAudioContext.close().catch(() => {
      // Ignore close errors
    });
    sharedAudioContext = null;
  }
}

