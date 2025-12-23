// DemDice Engine - Generates creative tasks from three D8 rolls

export const MEANINGS: Record<number, string> = {
  1: "Listen",
  2: "Observe",
  3: "Create",
  4: "Connect",
  5: "Transform",
  6: "Release",
  7: "Integrate",
  8: "Transcend"
};

export function rollD8(): number {
  return Math.floor(Math.random() * 8) + 1;
}

export interface DemDiceTask {
  signal: number;
  friction: number;
  fire: number;
  instruction: string;
  constraint: string;
  completion: string;
}

const SIGNAL_INSTRUCTIONS: Record<number, string> = {
  1: "Listen to the quietest voice in your environment today.",
  2: "Observe a pattern you've been ignoring.",
  3: "Create something that exists only in the space between intention and action.",
  4: "Connect two things that seem unrelated.",
  5: "Transform a routine into a ritual.",
  6: "Release something you've been holding onto.",
  7: "Integrate a contradiction into your practice.",
  8: "Transcend a limitation you've accepted as permanent."
};

const FRICTION_CONSTRAINTS: Record<number, string> = {
  1: "You must work with only what you have immediately available.",
  2: "You cannot use any digital tools or screens.",
  3: "You must complete this in complete silence.",
  4: "You can only work in a space smaller than 3x3 feet.",
  5: "You must involve at least one other person.",
  6: "You cannot use any words or language.",
  7: "You must work backwards from the end result.",
  8: "You can only use materials that are considered 'waste'."
};

const FIRE_COMPLETIONS: Record<number, string> = {
  1: "You're done when you feel a shift in your breathing.",
  2: "You're done when something unexpected emerges.",
  3: "You're done when you've documented the process, not the product.",
  4: "You're done when you've shared it with someone who wasn't expecting it.",
  5: "You're done when you've destroyed or transformed what you created.",
  6: "You're done when you can't remember why you started.",
  7: "You're done when the work begins to work on you.",
  8: "You're done when you realize you were never the one doing it."
};

export function generateDemDiceTask(signal: number, friction: number, fire: number): DemDiceTask {
  return {
    signal,
    friction,
    fire,
    instruction: SIGNAL_INSTRUCTIONS[signal] || "Listen to what needs to be heard.",
    constraint: FRICTION_CONSTRAINTS[friction] || "Work within the constraints that emerge.",
    completion: FIRE_COMPLETIONS[fire] || "You're done when you know you're done."
  };
}

