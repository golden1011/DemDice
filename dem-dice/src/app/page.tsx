'use client';

import { useState } from 'react';
import { rollD8, generateDemDiceTask, MEANINGS } from './engine';

export default function DemDice() {
  const [task, setTask] = useState<any | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);
    setTask(null);

    // Artificial "ritual" delay for tension
    setTimeout(() => {
      const s = rollD8();
      const fr = rollD8();
      const fi = rollD8();
      const result = generateDemDiceTask(s, fr, fi);
      setTask(result);
      setRolling(false);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[#e0e0e0] font-mono flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
      
      {/* HEADER */}
      <header className="fixed top-8 uppercase tracking-[0.3em] text-xs opacity-40">
        DemDice // Daily Protocol
      </header>

      {/* THE DICE CONTAINER */}
      <div className="flex gap-4 md:gap-12 mb-12">
        <Die label="SIGNAL" value={task?.signal} rolling={rolling} />
        <Die label="FRICTION" value={task?.friction} rolling={rolling} />
        <Die label="FIRE" value={task?.fire} rolling={rolling} />
      </div>

      {/* ACTION AREA */}
      {!task && !rolling && (
        <button 
          onClick={handleRoll}
          className="border border-[#333] px-8 py-3 text-sm hover:bg-[#eaeaea] hover:text-black hover:border-transparent transition-all duration-300 uppercase tracking-widest"
        >
          [ Roll The Dice ]
        </button>
      )}

      {/* LOADING STATE */}
      {rolling && (
        <div className="text-xs animate-pulse tracking-widest opacity-50">
          LISTENING...
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {task && (
        <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* THE CARD */}
          <div className="border-l-2 border-[#333] pl-6 py-2 space-y-8">
            
            <div>
              <h2 className="text-[10px] uppercase tracking-widest opacity-50 mb-2">🧭 Instruction</h2>
              <p className="text-lg md:text-xl leading-relaxed font-light text-white">
                {task.instruction}
              </p>
            </div>

            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-yellow-500/70 mb-1">⚠️ Constraint</h2>
              <p className="text-sm opacity-80">{task.constraint}</p>
            </div>

            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-red-500/70 mb-1">🔥 Completion Condition</h2>
              <p className="text-sm opacity-80">{task.completion}</p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => window.location.reload()} 
              className="text-[10px] uppercase opacity-30 hover:opacity-100 transition-opacity"
            >
              Reset Protocol
            </button>
          </div>
        </div>
      )}

      {/* FOOTER QUOTE */}
      <footer className="fixed bottom-8 text-center opacity-30 text-[10px] uppercase tracking-widest w-full">
        "You don't roll to win. You roll to listen."
      </footer>
    </main>
  );
}

// SUB-COMPONENT: The Visual Die (Triangle Representation)
function Die({ label, value, rolling }: { label: string, value?: number, rolling: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* The Triangle Graphic */}
      <div className={`
        relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center
        transition-all duration-500
        ${rolling ? 'animate-spin opacity-50' : 'opacity-100'}
      `}>
         {/* CSS Triangle */}
         <div className="absolute inset-0 border-l-[32px] border-r-[32px] border-b-[56px] border-l-transparent border-r-transparent border-b-[#1a1a1a] md:border-l-[48px] md:border-r-[48px] md:border-b-[84px]" />
         
         {/* The Number */}
         <span className="relative z-10 pt-4 text-xl md:text-3xl font-bold text-white">
           {value ?? "?"}
         </span>
      </div>

      {/* Label */}
      <div className="text-[10px] tracking-widest uppercase opacity-40">
        {label}
      </div>
      
      {/* Meaning (Only show if value exists) */}
      {value && (
        <div className="text-[9px] uppercase text-[#666] tracking-tight">
          {MEANINGS[value].split(' ')[0]}
        </div>
      )}
    </div>
  );
}