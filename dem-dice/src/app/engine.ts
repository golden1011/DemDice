// DemDice Engine - Generates creative tasks from dice rolls

export type DiceType = 8 | 10 | 12 | 20;

export const MEANINGS: Record<DiceType, Record<number, string>> = {
  8: {
    1: "Listen", 2: "Observe", 3: "Create", 4: "Connect",
    5: "Transform", 6: "Release", 7: "Integrate", 8: "Transcend"
  },
  10: {
    1: "Listen", 2: "Observe", 3: "Create", 4: "Connect", 5: "Transform",
    6: "Release", 7: "Integrate", 8: "Transcend", 9: "Surrender", 10: "Awaken"
  },
  12: {
    1: "Listen", 2: "Observe", 3: "Create", 4: "Connect", 5: "Transform",
    6: "Release", 7: "Integrate", 8: "Transcend", 9: "Surrender", 10: "Awaken",
    11: "Dissolve", 12: "Emerge"
  },
  20: {
    1: "Listen", 2: "Observe", 3: "Create", 4: "Connect", 5: "Transform",
    6: "Release", 7: "Integrate", 8: "Transcend", 9: "Surrender", 10: "Awaken",
    11: "Dissolve", 12: "Emerge", 13: "Merge", 14: "Separate", 15: "Illuminate",
    16: "Conceal", 17: "Expand", 18: "Contract", 19: "Synthesize", 20: "Transmute"
  }
};

export function rollDice(sides: DiceType): number {
  return Math.floor(Math.random() * sides) + 1;
}

export interface DemDiceTask {
  signal: number;
  friction: number;
  fire: number;
  instruction: string;
  constraint: string;
  completion: string;
}

const SIGNAL_INSTRUCTIONS: Record<DiceType, Record<number, string>> = {
  8: {
    1: "Listen to the quietest voice in your environment today.",
    2: "Observe a pattern you've been ignoring.",
    3: "Create something that exists only in the space between intention and action.",
    4: "Connect two things that seem unrelated.",
    5: "Transform a routine into a ritual.",
    6: "Release something you've been holding onto.",
    7: "Integrate a contradiction into your practice.",
    8: "Transcend a limitation you've accepted as permanent."
  },
  10: {
    1: "Listen to the quietest voice in your environment today.",
    2: "Observe a pattern you've been ignoring.",
    3: "Create something that exists only in the space between intention and action.",
    4: "Connect two things that seem unrelated.",
    5: "Transform a routine into a ritual.",
    6: "Release something you've been holding onto.",
    7: "Integrate a contradiction into your practice.",
    8: "Transcend a limitation you've accepted as permanent.",
    9: "Surrender to what wants to emerge through you.",
    10: "Awaken to what has been sleeping in plain sight."
  },
  12: {
    1: "Listen to the quietest voice in your environment today.",
    2: "Observe a pattern you've been ignoring.",
    3: "Create something that exists only in the space between intention and action.",
    4: "Connect two things that seem unrelated.",
    5: "Transform a routine into a ritual.",
    6: "Release something you've been holding onto.",
    7: "Integrate a contradiction into your practice.",
    8: "Transcend a limitation you've accepted as permanent.",
    9: "Surrender to what wants to emerge through you.",
    10: "Awaken to what has been sleeping in plain sight.",
    11: "Dissolve the boundary between inner and outer.",
    12: "Emerge from what you thought was impossible."
  },
  20: {
    1: "Listen to the quietest voice in your environment today.",
    2: "Observe a pattern you've been ignoring.",
    3: "Create something that exists only in the space between intention and action.",
    4: "Connect two things that seem unrelated.",
    5: "Transform a routine into a ritual.",
    6: "Release something you've been holding onto.",
    7: "Integrate a contradiction into your practice.",
    8: "Transcend a limitation you've accepted as permanent.",
    9: "Surrender to what wants to emerge through you.",
    10: "Awaken to what has been sleeping in plain sight.",
    11: "Dissolve the boundary between inner and outer.",
    12: "Emerge from what you thought was impossible.",
    13: "Merge with the rhythm of what's already happening.",
    14: "Separate what has been falsely joined.",
    15: "Illuminate what has been hiding in shadow.",
    16: "Conceal what needs protection to grow.",
    17: "Expand beyond your current understanding.",
    18: "Contract to the essential core.",
    19: "Synthesize fragments into a new whole.",
    20: "Transmute resistance into fuel for transformation."
  }
};

const FRICTION_CONSTRAINTS: Record<DiceType, Record<number, string>> = {
  8: {
    1: "You must work with only what you have immediately available.",
    2: "You cannot use any digital tools or screens.",
    3: "You must complete this in complete silence.",
    4: "You can only work in a space smaller than 3x3 feet.",
    5: "You must involve at least one other person.",
    6: "You cannot use any words or language.",
    7: "You must work backwards from the end result.",
    8: "You can only use materials that are considered 'waste'."
  },
  10: {
    1: "You must work with only what you have immediately available.",
    2: "You cannot use any digital tools or screens.",
    3: "You must complete this in complete silence.",
    4: "You can only work in a space smaller than 3x3 feet.",
    5: "You must involve at least one other person.",
    6: "You cannot use any words or language.",
    7: "You must work backwards from the end result.",
    8: "You can only use materials that are considered 'waste'.",
    9: "You must work with your non-dominant hand or method.",
    10: "You can only work during a specific time window (dawn, dusk, or midnight)."
  },
  12: {
    1: "You must work with only what you have immediately available.",
    2: "You cannot use any digital tools or screens.",
    3: "You must complete this in complete silence.",
    4: "You can only work in a space smaller than 3x3 feet.",
    5: "You must involve at least one other person.",
    6: "You cannot use any words or language.",
    7: "You must work backwards from the end result.",
    8: "You can only use materials that are considered 'waste'.",
    9: "You must work with your non-dominant hand or method.",
    10: "You can only work during a specific time window (dawn, dusk, or midnight).",
    11: "You must incorporate an element of chance or randomness.",
    12: "You cannot see what you're creating until it's complete."
  },
  20: {
    1: "You must work with only what you have immediately available.",
    2: "You cannot use any digital tools or screens.",
    3: "You must complete this in complete silence.",
    4: "You can only work in a space smaller than 3x3 feet.",
    5: "You must involve at least one other person.",
    6: "You cannot use any words or language.",
    7: "You must work backwards from the end result.",
    8: "You can only use materials that are considered 'waste'.",
    9: "You must work with your non-dominant hand or method.",
    10: "You can only work during a specific time window (dawn, dusk, or midnight).",
    11: "You must incorporate an element of chance or randomness.",
    12: "You cannot see what you're creating until it's complete.",
    13: "You must work in complete darkness or with eyes closed.",
    14: "You can only use one color or one material throughout.",
    15: "You must work while moving or in motion.",
    16: "You cannot use your hands (or primary tool).",
    17: "You must work in a place you've never been before.",
    18: "You can only work with what you can carry.",
    19: "You must involve an element from nature directly.",
    20: "You cannot work alone—collaboration is required."
  }
};

const FIRE_COMPLETIONS: Record<DiceType, Record<number, string>> = {
  8: {
    1: "You're done when you feel a shift in your breathing.",
    2: "You're done when something unexpected emerges.",
    3: "You're done when you've documented the process, not the product.",
    4: "You're done when you've shared it with someone who wasn't expecting it.",
    5: "You're done when you've destroyed or transformed what you created.",
    6: "You're done when you can't remember why you started.",
    7: "You're done when the work begins to work on you.",
    8: "You're done when you realize you were never the one doing it."
  },
  10: {
    1: "You're done when you feel a shift in your breathing.",
    2: "You're done when something unexpected emerges.",
    3: "You're done when you've documented the process, not the product.",
    4: "You're done when you've shared it with someone who wasn't expecting it.",
    5: "You're done when you've destroyed or transformed what you created.",
    6: "You're done when you can't remember why you started.",
    7: "You're done when the work begins to work on you.",
    8: "You're done when you realize you were never the one doing it.",
    9: "You're done when you've forgotten the original intention.",
    10: "You're done when it becomes clear this was always happening."
  },
  12: {
    1: "You're done when you feel a shift in your breathing.",
    2: "You're done when something unexpected emerges.",
    3: "You're done when you've documented the process, not the product.",
    4: "You're done when you've shared it with someone who wasn't expecting it.",
    5: "You're done when you've destroyed or transformed what you created.",
    6: "You're done when you can't remember why you started.",
    7: "You're done when the work begins to work on you.",
    8: "You're done when you realize you were never the one doing it.",
    9: "You're done when you've forgotten the original intention.",
    10: "You're done when it becomes clear this was always happening.",
    11: "You're done when the boundary between you and the work dissolves.",
    12: "You're done when you recognize this as the beginning of something else."
  },
  20: {
    1: "You're done when you feel a shift in your breathing.",
    2: "You're done when something unexpected emerges.",
    3: "You're done when you've documented the process, not the product.",
    4: "You're done when you've shared it with someone who wasn't expecting it.",
    5: "You're done when you've destroyed or transformed what you created.",
    6: "You're done when you can't remember why you started.",
    7: "You're done when the work begins to work on you.",
    8: "You're done when you realize you were never the one doing it.",
    9: "You're done when you've forgotten the original intention.",
    10: "You're done when it becomes clear this was always happening.",
    11: "You're done when the boundary between you and the work dissolves.",
    12: "You're done when you recognize this as the beginning of something else.",
    13: "You're done when time seems to have moved differently.",
    14: "You're done when you've created something that creates you.",
    15: "You're done when the work reveals what you didn't know you were looking for.",
    16: "You're done when you've touched something that touches back.",
    17: "You're done when the process becomes the purpose.",
    18: "You're done when you've entered a state you can't describe.",
    19: "You're done when the work becomes a mirror you can't look away from.",
    20: "You're done when you understand this was never about completion."
  }
};

export function generateDemDiceTask(signal: number, friction: number, fire: number, diceType: DiceType = 8): DemDiceTask {
  return {
    signal,
    friction,
    fire,
    instruction: SIGNAL_INSTRUCTIONS[diceType][signal] || "Listen to what needs to be heard.",
    constraint: FRICTION_CONSTRAINTS[diceType][friction] || "Work within the constraints that emerge.",
    completion: FIRE_COMPLETIONS[diceType][fire] || "You're done when you know you're done."
  };
}

