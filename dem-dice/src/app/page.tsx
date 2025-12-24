'use client';

import { useState, useEffect } from 'react';
import { rollDice, generateDemDiceTask, MEANINGS, DiceType } from './engine';
import Dice3D from './Dice3D';
import AudioManager from './AudioManager';

export default function DemDice() {
  const [task, setTask] = useState<any | null>(null);
  const [rolling, setRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<{signal?: number, friction?: number, fire?: number}>({});
  // GOLDEN DICE MODE - COMMENTED OUT (can be re-enabled later)
  // const [goldenDice, setGoldenDice] = useState<{signal?: boolean, friction?: boolean, fire?: boolean}>({});
  const [showInstructions, setShowInstructions] = useState(false);
  const [note, setNote] = useState('');
  const [shared, setShared] = useState(false);
  const [diceType, setDiceType] = useState<8 | 10 | 12 | 20>(8);
  // const [yourName, setYourName] = useState('');
  // const [friendName, setFriendName] = useState('');
  // const [friendEmail, setFriendEmail] = useState('');
  // const [yourEmail, setYourEmail] = useState('');
  // const [discord, setDiscord] = useState('');

  const handleRoll = async () => {
    // Start background music directly from user gesture (required for mobile)
    // @ts-ignore - global function exposed from AudioManager
    if (window.startBackgroundMusic) {
      // @ts-ignore
      window.startBackgroundMusic();
    }
    
    setRolling(true);
    setTask(null);
    setDiceValues({});
    // setGoldenDice({});
    setNote('');
    setShared(false);
    // setYourName('');
    // setFriendName('');
    // setFriendEmail('');
    // setYourEmail('');
    // setDiscord('');

    // Wait for animation to complete before showing results (25% longer: 1.5s * 1.25 = 1.875s)
    setTimeout(() => {
      const s = rollDice(diceType);
      const fr = rollDice(diceType);
      const fi = rollDice(diceType);
      const result = generateDemDiceTask(s, fr, fi, diceType);
      
      // GOLDEN DICE MODE - COMMENTED OUT
      // Determine golden dice (1.5% chance per dice - low odds)
      // const isSignalGolden = Math.random() < 0.015;
      // const isFrictionGolden = Math.random() < 0.015;
      // const isFireGolden = Math.random() < 0.015;
      
      setDiceValues({ signal: s, friction: fr, fire: fi });
      // setGoldenDice({ signal: isSignalGolden, friction: isFrictionGolden, fire: isFireGolden });
      setTask(result);
      setRolling(false);
    }, 1875); // Match the animation duration (1.875s - 25% longer)
  };

  // Cyberpunk sound effects for buttons
  const playButtonHoverSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01); // Reduced by 50%
    gainNode.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + 0.1); // Reduced by 50%
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playButtonClickSound = () => {
    // Start background music directly from user gesture (required for mobile)
    // @ts-ignore - global function exposed from AudioManager
    if (window.startBackgroundMusic) {
      // @ts-ignore
      window.startBackgroundMusic();
    }
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create a short cyberpunk beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
    
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    filter.Q.value = 2;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.075, audioContext.currentTime + 0.01); // Reduced by 50%
    gainNode.gain.exponentialRampToValueAtTime(0.005, audioContext.currentTime + 0.08); // Reduced by 50%
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  };

  const handleShareToDiscord = async () => {
    const discordUrl = 'https://discord.com/channels/1383509694164766811/1425148948355748161';
    
    // Copy the note text to clipboard (if note exists)
    // Use async/await for better mobile support
    if (note && note.trim()) {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(note);
          setShared(true);
        } else {
          // Fallback for older browsers/mobile
          const textArea = document.createElement('textarea');
          textArea.value = note;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            const successful = document.execCommand('copy');
            if (successful) {
              setShared(true);
            } else {
              setShared(true); // Still mark as shared even if copy fails
            }
          } catch (err) {
            setShared(true); // Still mark as shared even if copy fails
          } finally {
            document.body.removeChild(textArea);
          }
        }
      } catch (error) {
        // If clipboard fails, still mark as shared
        setShared(true);
      }
    } else {
      // If no note, just mark as shared
      setShared(true);
    }
    
    // Wait 1 second before opening Discord URL
    setTimeout(() => {
      window.open(discordUrl, '_blank');
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-transparent text-[#e0e0e0] font-mono flex flex-col items-center justify-start p-2 sm:p-4 selection:bg-white selection:text-black relative overflow-x-hidden">
      <AudioManager rolling={rolling} />
      
      {/* HEADER */}
      <header className="w-full text-center space-y-1 sm:space-y-2 mb-2 sm:mb-4 mt-1 sm:mt-2">
        <div className="opacity-95">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-2">
            <span className="text-3xl sm:text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">🎲</span>
            <span className="demdice-header-glow">DemDice</span>
          </h1>
        </div>
        <div className="opacity-70 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base w-full max-w-fit mx-auto px-2">
          <span className="text-gray-300">Built For</span>
          <a href="https://mandemos.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity inline-block">
            <img 
              src="https://mandemos.com/cdn/shop/files/ChatGPT_Image_Sep_3_2025_04_04_53_PM.png?v=1756929961&width=150" 
              alt="MandemOS" 
              className="h-6 sm:h-8 md:h-10 w-auto"
            />
          </a>
          <span className="text-gray-300">OS Players</span>
        </div>
      </header>

      {/* HELP BUTTON */}
      <button
        onClick={() => {
          setShowInstructions(!showInstructions);
          playButtonClickSound();
        }}
        onMouseEnter={() => playButtonHoverSound()}
        className="absolute top-1 right-1 sm:top-2 sm:right-2 w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 border-cyan-500/50 bg-cyan-500/20 hover:bg-cyan-500/30 hover:border-cyan-400 active:bg-cyan-500/40 flex items-center justify-center text-cyan-300 text-base sm:text-lg font-bold transition-all z-50 shadow-[0_0_15px_rgba(6,182,212,0.5)] touch-manipulation"
        aria-label="Show instructions"
      >
        ?
      </button>

      {/* INSTRUCTIONS MODAL */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={() => setShowInstructions(false)}>
          <div className="bg-[#0a0a0a] border border-cyan-500/30 rounded-lg p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 uppercase tracking-wider">DemDice Legend</h2>
              <button 
                onClick={() => {
                  setShowInstructions(false);
                  playButtonClickSound();
                }}
                onMouseEnter={() => playButtonHoverSound()}
                className="text-cyan-400 hover:text-cyan-300 active:text-cyan-200 text-2xl sm:text-3xl w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center touch-manipulation"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm">
              <div>
                <h3 className="text-cyan-400 font-bold mb-2 uppercase text-sm sm:text-base">📡 SIGNAL</h3>
                <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm">The core action or intention. What you're being called to do.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                  {Array.from({ length: diceType }, (_, i) => i + 1).map(num => (
                    <div key={num} className="bg-cyan-500/10 border border-cyan-500/30 p-1.5 sm:p-2 rounded">
                      <div className="font-bold text-cyan-400 text-xs sm:text-sm">{num}</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs">{MEANINGS[diceType][num]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-purple-400 font-bold mb-2 uppercase text-sm sm:text-base">⚡ FRICTION</h3>
                <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm">The constraint or limitation that shapes how you approach the signal.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                  {Array.from({ length: diceType }, (_, i) => i + 1).map(num => (
                    <div key={num} className="bg-purple-500/10 border border-purple-500/30 p-1.5 sm:p-2 rounded">
                      <div className="font-bold text-purple-400 text-xs sm:text-sm">{num}</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs">{MEANINGS[diceType][num]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-orange-400 font-bold mb-2 uppercase text-sm sm:text-base">🔥 FIRE</h3>
                <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm">The completion condition. How you'll know when the task is done.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                  {Array.from({ length: diceType }, (_, i) => i + 1).map(num => (
                    <div key={num} className="bg-orange-500/10 border border-orange-500/30 p-1.5 sm:p-2 rounded">
                      <div className="font-bold text-orange-400 text-xs sm:text-sm">{num}</div>
                      <div className="text-gray-400 text-[10px] sm:text-xs">{MEANINGS[diceType][num]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GOLDEN DICE REWARDS SECTION - COMMENTED OUT */}
              {/* 
              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-yellow-400 font-bold mb-3 uppercase">✨ Golden Dice Rewards</h3>
                <div className="space-y-3 text-gray-300 text-sm">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded">
                    <p className="font-bold text-yellow-400 mb-1">1 Golden Dice:</p>
                    <p>Invite a friend (name & email) who's not in MandemOS yet. Once they join, they'll be entered into a free merch draw.</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded">
                    <p className="font-bold text-yellow-400 mb-1">2 Golden Dice:</p>
                    <p>Win a $25 Mandem Giftcard! Your reward will be sent to your account.</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded">
                    <p className="font-bold text-yellow-400 mb-1">3 Golden Dice (JACKPOT):</p>
                    <p>Win 3 items of your choice from the merch store + 3 map invites! Your rewards will be processed and sent to your account.</p>
                  </div>
                </div>
              </div>
              */}

              <div className="pt-4 border-t border-gray-800">
                <p className="text-gray-400 italic">"You don't roll to win. You roll to listen."</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THE DICE CONTAINER */}
      <div className={`flex gap-1 sm:gap-2 md:gap-4 lg:gap-6 mb-2 ${!task ? 'mt-0' : 'mt-0'} flex-wrap justify-center`}>
        <Dice3D 
          label="SIGNAL" 
          value={diceValues.signal ?? task?.signal} 
          rolling={rolling} 
          diceColor="cyan"
          // GOLDEN DICE MODE - COMMENTED OUT
          // diceColor={goldenDice.signal ? "gold" : "cyan"} 
          icon="📡" 
          diceType={diceType}
          // isGolden={goldenDice.signal}
          // hasAnyGolden={[goldenDice.signal, goldenDice.friction, goldenDice.fire].some(Boolean)}
        />
        <Dice3D 
          label="FRICTION" 
          value={diceValues.friction ?? task?.friction} 
          rolling={rolling} 
          diceColor="purple"
          // GOLDEN DICE MODE - COMMENTED OUT
          // diceColor={goldenDice.friction ? "gold" : "purple"} 
          icon="⚡" 
          diceType={diceType}
          // isGolden={goldenDice.friction}
          // hasAnyGolden={[goldenDice.signal, goldenDice.friction, goldenDice.fire].some(Boolean)}
        />
        <Dice3D 
          label="FIRE" 
          value={diceValues.fire ?? task?.fire} 
          rolling={rolling} 
          diceColor="orange"
          // GOLDEN DICE MODE - COMMENTED OUT
          // diceColor={goldenDice.fire ? "gold" : "orange"} 
          icon="🔥" 
          diceType={diceType}
          // isGolden={goldenDice.fire}
          // hasAnyGolden={[goldenDice.signal, goldenDice.friction, goldenDice.fire].some(Boolean)}
        />
      </div>

      {/* GOLDEN DICE REWARDS - COMMENTED OUT */}
      {/* {task && (() => {
        const goldenCount = [goldenDice.signal, goldenDice.friction, goldenDice.fire].filter(Boolean).length;
        if (goldenCount === 0) return null;
        
        return (
          <div className="max-w-2xl w-full mx-auto mt-4 mb-4 p-6 bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-yellow-500/10 border-2 border-yellow-500/50 rounded-lg">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider">
              🏆 Golden Dice Reward!
            </h3>
            
            {goldenCount === 1 && (
              <div className="space-y-4">
                <p className="text-yellow-300 text-center mb-4">
                  You rolled <span className="font-bold">1 Golden Dice</span>! Invite a friend to MandemOS and you'll both be entered to win MandemOS Merch.
                </p>
                <div className="space-y-3">
                  <div className="border-t border-yellow-500/30 pt-3">
                    <p className="text-yellow-400 text-xs uppercase tracking-widest mb-2">Your Information</p>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={yourName}
                      onChange={(e) => setYourName(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 mb-2"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={yourEmail}
                      onChange={(e) => setYourEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Your Discord (optional)"
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div className="border-t border-yellow-500/30 pt-3">
                    <p className="text-yellow-400 text-xs uppercase tracking-widest mb-2">Friend's Information</p>
                    <input
                      type="text"
                      placeholder="Friend's Name"
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 mb-2"
                    />
                    <input
                      type="email"
                      placeholder="Friend's Email"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (yourName && yourEmail && friendName && friendEmail) {
                        // Here you would submit to your backend
                        alert(`Invitation sent to ${friendName} (${friendEmail})! You (${yourName}) and your friend have been entered into the MandemOS Merch draw!`);
                        // Reset and allow re-roll
                        setTask(null);
                        setDiceValues({});
                        setGoldenDice({});
                        setYourName('');
                        setYourEmail('');
                        setDiscord('');
                        setFriendName('');
                        setFriendEmail('');
                        setRolling(false);
                      }
                    }}
                    disabled={!yourName || !yourEmail || !friendName || !friendEmail}
                    onMouseEnter={() => playButtonHoverSound()}
                    onClickCapture={() => playButtonClickSound()}
                    className="w-full py-2 px-4 bg-yellow-500/20 border border-yellow-400 text-yellow-300 rounded hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-sm"
                  >
                    Send Invite + Claim Draw Entry
                  </button>
                </div>
              </div>
            )}
            
            {goldenCount === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-yellow-300 text-lg">
                    You rolled <span className="font-bold">2 Golden Dice</span>!
                  </p>
                  <p className="text-yellow-400 text-xl font-bold">
                    🎁 You've won a $25 Mandem Giftcard!
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={yourEmail}
                    onChange={(e) => setYourEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    onClick={() => {
                      if (yourName && yourEmail) {
                        // Here you would submit to your backend
                        alert(`Coupon code for $25 will be sent to ${yourEmail}, ${yourName}!`);
                        setTask(null);
                        setDiceValues({});
                        setGoldenDice({});
                        setYourName('');
                        setYourEmail('');
                        setRolling(false);
                      }
                    }}
                    disabled={!yourName || !yourEmail}
                    onMouseEnter={() => playButtonHoverSound()}
                    onClickCapture={() => playButtonClickSound()}
                    className="w-full py-2 px-4 bg-yellow-500/20 border border-yellow-400 text-yellow-300 rounded hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-sm"
                  >
                    Claim Giftcard
                  </button>
                </div>
              </div>
            )}
            
            {goldenCount === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-yellow-300 text-lg">
                    You rolled <span className="font-bold">3 Golden Dice</span>!
                  </p>
                  <p className="text-yellow-400 text-xl font-bold">
                    🎉 JACKPOT! You've won:
                  </p>
                  <ul className="text-yellow-300 space-y-2 text-left max-w-md mx-auto mt-2">
                    <li>• 3 items of your choice from the merch store</li>
                    <li>• 3 map invites</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={yourEmail}
                    onChange={(e) => setYourEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="text"
                    placeholder="Your Discord"
                    value={discord}
                    onChange={(e) => setDiscord(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                  />
                  <textarea
                    placeholder="Note what you won (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-2 bg-black/50 border border-yellow-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 min-h-[80px] resize-none"
                  />
                  <button
                    onClick={() => {
                      if (yourName && yourEmail && discord) {
                        // Here you would submit to your backend
                        alert(`Thank you ${yourName}! We'll contact you at ${yourEmail} and ${discord} about your jackpot prize!`);
                        setTask(null);
                        setDiceValues({});
                        setGoldenDice({});
                        setYourName('');
                        setYourEmail('');
                        setDiscord('');
                        setNote('');
                        setRolling(false);
                      }
                    }}
                    disabled={!yourName || !yourEmail || !discord}
                    onMouseEnter={() => playButtonHoverSound()}
                    onClickCapture={() => playButtonClickSound()}
                    className="w-full py-2 px-4 bg-yellow-500/20 border border-yellow-400 text-yellow-300 rounded hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-sm"
                  >
                    Submit & Claim Jackpot
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}
      */}

      {/* ACTION AREA */}
      {!task && !rolling && (
        <div className="px-2 sm:px-4 py-2 space-y-2 sm:space-y-3 mt-2 sm:mt-4 w-full max-w-md mx-auto">
          {/* DICE TYPE SELECTOR */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mt-2">
            <span className="text-xs sm:text-sm text-gray-300 uppercase tracking-widest font-semibold">Select Dice Type:</span>
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              {([8, 10, 12, 20] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    if (diceType !== type) {
                      setDiceType(type);
                      playButtonClickSound();
                    }
                  }}
                  onMouseEnter={() => playButtonHoverSound()}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base uppercase tracking-widest rounded border transition-all touch-manipulation active:scale-95 font-bold ${
                    diceType === type
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-105'
                      : 'border-gray-600 bg-gray-800/30 text-gray-500 hover:border-gray-500 hover:text-gray-400'
                  }`}
                >
                  D{type}
                </button>
              ))}
            </div>
          </div>
          
          {/* ROLL BUTTON - Always visible */}
          <button 
            onClick={() => {
              playButtonClickSound();
              handleRoll();
            }}
            onMouseEnter={() => playButtonHoverSound()}
            className="w-full border border-cyan-500/50 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10 px-4 sm:px-8 py-2.5 sm:py-2 text-xs sm:text-sm hover:from-cyan-500/20 hover:via-purple-500/20 hover:to-orange-500/20 hover:border-cyan-400 active:scale-95 transition-all duration-300 uppercase tracking-widest text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 mt-2 touch-manipulation"
          >
            <span className="text-base sm:text-lg animate-spin text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">🎲</span>
            <span>[ Roll The Dice ]</span>
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {rolling && (
        <div className="text-[10px] sm:text-xs animate-pulse tracking-widest opacity-50">
          LISTENING...
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {/* GOLDEN DICE MODE - COMMENTED OUT: Only show if no golden dice */}
      {task && (
        // !([goldenDice.signal, goldenDice.friction, goldenDice.fire].some(Boolean)) && 
        <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700 mt-0 flex-1 flex flex-col overflow-hidden px-2 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch flex-1 min-h-0">
            
            {/* LEFT COLUMN - THE CARD */}
            <div className="border-l-2 border-cyan-500/20 pl-2 sm:pl-4 py-1 space-y-2 sm:space-y-3 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-orange-500/5 p-2 sm:p-3 rounded-lg flex flex-col overflow-y-auto">
              
              <div className="pt-1 sm:pt-2">
                <h2 className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-cyan-400/70 mb-1 flex items-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base">📡</span> <span>Instruction</span>
                </h2>
                <p className="text-xs sm:text-sm md:text-base leading-relaxed font-light text-white border-l-2 border-cyan-500/30 pl-2 sm:pl-3">
                  {task.instruction}
                </p>
              </div>

              <div>
                <h2 className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-purple-400/70 mb-1 flex items-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base">⚡</span> <span>Constraint</span>
                </h2>
                <p className="text-xs sm:text-sm md:text-base opacity-80 border-l-2 border-purple-500/30 pl-2 sm:pl-3">{task.constraint}</p>
              </div>

              <div>
                <h2 className="text-[10px] sm:text-xs md:text-sm uppercase tracking-widest text-orange-400/70 mb-1 flex items-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base">🔥</span> <span>Completion Condition</span>
                </h2>
                <p className="text-xs sm:text-sm md:text-base opacity-80 border-l-2 border-orange-500/30 pl-2 sm:pl-3">{task.completion}</p>
              </div>

            </div>

            {/* RIGHT COLUMN - NOTE */}
            <div className="space-y-2 flex flex-col h-full min-h-0">
              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-[8px] sm:text-[9px] uppercase tracking-widest opacity-50 mb-1">Note what happened</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Document your experience, insights, or outcomes..."
                  className="w-full flex-1 bg-[#1a1a1a] border border-[#444] rounded-sm px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none shadow-inner min-h-0"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '100% 20px',
                    backgroundPosition: '0 0'
                  }}
                />
              </div>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-2 sm:mt-3 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  playButtonClickSound();
                  handleRoll();
                }}
                onMouseEnter={() => playButtonHoverSound()}
                className="flex-1 py-2.5 sm:py-2 px-3 sm:px-4 rounded border border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 active:scale-95 transition-all uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <span className="text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] animate-spin">🎲</span>
                <span>Re-Roll Dem Dice</span>
              </button>
              
              <button
                onClick={() => {
                  if (!shared) {
                    playButtonClickSound();
                    handleShareToDiscord();
                  }
                }}
                onMouseEnter={() => !shared && playButtonHoverSound()}
                disabled={shared}
                className={`flex-1 py-2.5 sm:py-2 px-3 sm:px-4 rounded border transition-all uppercase tracking-widest text-[10px] sm:text-xs active:scale-95 touch-manipulation ${
                  shared
                    ? 'border-green-500/50 bg-green-500/10 text-green-400 cursor-not-allowed'
                    : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500'
                }`}
              >
                {shared ? (note && note.trim() ? '✓ Note Copied to Clipboard! Paste it in Discord' : '✓ Shared') : 'Share to Discord'}
              </button>
            </div>
            
            {/* CHANGE DICE TYPE */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest">Change Dice Type:</span>
              {([8, 10, 12, 20] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setDiceType(type);
                    playButtonClickSound();
                  }}
                  onMouseEnter={() => playButtonHoverSound()}
                  className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs uppercase tracking-widest rounded border transition-all active:scale-95 touch-manipulation ${
                    diceType === type
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : 'border-gray-600 bg-gray-800/30 text-gray-500 hover:border-gray-500 hover:text-gray-400'
                  }`}
                >
                  D{type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto pt-2 sm:pt-4 pb-2 text-center z-10 px-2">
        <div className="opacity-30 text-[8px] sm:text-[9px] uppercase tracking-widest flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
          <span>"You don't roll to win. You roll to listen."</span>
          <span className="opacity-70 text-[8px] sm:text-[9px] font-semibold">© 2025 Hammer Studios</span>
        </div>
      </footer>
    </main>
  );
}
