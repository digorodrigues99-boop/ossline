// Built-in archetype engine. Generates an RPG-style class from a point
// allocation without any network call — the AI generator (claudeArchetype.ts)
// produces the same shape with richer prose when an API key is configured.

import type { Archetype, PointMap, TreeDef } from './buildData';
import { ALL_SKILLS, TREES, spentPoints, treeTotal } from './buildData';

interface Persona {
  name: string;
  epithet: string;
  description: string;
  signature: string[];
  playstyle: string;
}

// Two-skill combos, checked first. Key is "a+b" with ids sorted alphabetically.
const COMBOS: Record<string, Persona> = {
  'top-pressure+wrestling': {
    name: 'The Juggernaut',
    epithet: 'Pressure Incarnate',
    description:
      'A relentless forward-marching force. Every exchange starts with a takedown threat and ends with an opponent flattened under crushing top pressure, praying for the round timer.',
    signature: ['Blast double to smash pass', 'Knee cut with crossface', 'Body lock passing'],
    playstyle:
      'Impose grinding top position early. Trade flash for inevitability — win the gas-tank war.',
  },
  'chokes+back-taking': {
    name: 'The Backpack',
    epithet: 'Strangler of Worlds',
    description:
      'Everything funnels to one destination: the back. Seatbelt, hooks, patient hand-fighting, and then the slow inevitability of the rear naked choke.',
    signature: ['Chair-sit back take', 'Straitjacket system', 'RNC finishing sequence'],
    playstyle: 'Take calculated risks to reach the back, then be infinitely patient there.',
  },
  'closed-guard+triangles': {
    name: 'The Web Weaver',
    epithet: 'Spider of the Closed Guard',
    description:
      'Opponents enter the closed guard like flies into a web. Wrist control, angles, and hip movement chain armbar, triangle, and omoplata threats until something sticks.',
    signature: ['Triangle-armbar-omoplata chain', 'Hidden collar grips', 'Flower sweep setups'],
    playstyle: 'Slow the game down, break posture, and attack in overlapping threats.',
  },
  'heel-hooks+butterfly-x': {
    name: 'The Leg Reaper',
    epithet: 'Harvester of Heels',
    description:
      'Every seated exchange is an entry. Butterfly elevations become X-guard, X-guard becomes a leg entanglement, and the entanglement ends with an inside heel hook.',
    signature: ['Butterfly to X entry', 'Backside 50/50 finishing', 'Saddle control'],
    playstyle: 'Sit, entangle, and hunt legs. Concede nothing on top — the guard is an ambush.',
  },
  'judo+top-pressure': {
    name: 'The Ippon Warlord',
    epithet: 'Gravity’s Enforcer',
    description:
      'The fight is decided in the clinch. Grips like industrial clamps, a throw that turns the world sideways, and landing pressure that makes the impact feel like the easy part.',
    signature: ['Uchi mata to knee-on-belly', 'Grip-fighting dominance', 'Osoto gari blast'],
    playstyle: 'Win the grip exchanges, launch, land heavy, and never give an inch back up.',
  },
  'scrambling+wrestling': {
    name: 'The Funk Master',
    epithet: 'Lord of the Scramble',
    description:
      'Where others see chaos, this build sees opportunity. Every transition is a coin flip the Funk Master has rigged — rolls, re-shots, and limb-riding funk that leaves opponents chasing shadows.',
    signature: ['Granby roll escapes', 'Re-shot counters', 'Front headlock spins'],
    playstyle: 'Force pace and chaos. The more positions per minute, the bigger the edge.',
  },
};

// Single-skill specialist personas.
const SPECIALISTS: Record<string, Persona> = {
  wrestling: {
    name: 'The Takedown Tyrant',
    epithet: 'First to the Legs',
    description:
      'A wrestler first and everything else second. The match starts standing and, on this build’s terms, it ends there too — with a takedown and top position on demand.',
    signature: ['Double leg blast', 'Snap-down to go-behind', 'Chain wrestling sequences'],
    playstyle: 'Dictate where the fight happens. Score first, ride hard, repeat.',
  },
  judo: {
    name: 'The Throw Artist',
    epithet: 'Master of the Clinch',
    description:
      'Elegant violence in the tie-ups. This build turns lapels and sleeves into levers and the mat into a landing zone.',
    signature: ['Uchi mata', 'Foot sweep timing', 'Seoi nage counters'],
    playstyle: 'Hand-fight for dominant grips and end exchanges in a single decisive throw.',
  },
  'td-defense': {
    name: 'The Wall',
    epithet: 'Unmovable Object',
    description:
      'Shots bounce off this build like waves off a cliff. Sprawls, whizzers, and a front headlock that turns failed takedowns into offense.',
    signature: ['Sprawl to front headlock', 'Whizzer defense', 'Guillotine counters'],
    playstyle: 'Let them shoot. Every failed attempt is your best entry.',
  },
  scrambling: {
    name: 'The Scramble Rogue',
    epithet: 'Thief of Positions',
    description:
      'Never pinned, never settled, never where they expect. This build wins the in-between moments everyone else treats as noise.',
    signature: ['Granby rolls', 'Wrestle-ups', 'Turtle attacks and escapes'],
    playstyle: 'Keep every position unsettled until you land on the winning side of it.',
  },
  'top-pressure': {
    name: 'The Boulder',
    epithet: 'Heavier Than Advertised',
    description:
      'Weight is a technique. Chest-to-chest, hips low, breath stolen — opponents describe rounds with this build like natural disasters.',
    signature: ['Smash passing', 'Crossface and shoulder pressure', 'Half-guard grind'],
    playstyle: 'Advance slowly and irreversibly. Comfort is the enemy — theirs.',
  },
  'top-movement': {
    name: 'The Matador',
    epithet: 'Never Where the Horns Are',
    description:
      'Legs are swept aside like a cape. This build passes with angles and momentum, floating around guards that never get to start playing.',
    signature: ['Toreando pass', 'Leg drag', 'Floating passes off hip switches'],
    playstyle: 'Stay light, chain passes, and beat the guard before it forms grips.',
  },
  'pins-control': {
    name: 'The Anaconda',
    epithet: 'Position Before Submission, Forever',
    description:
      'Every pin tightens. Side control becomes mount, mount becomes misery, and escapes only feed the squeeze.',
    signature: ['Gift-wrap control', 'Mount consolidation', 'Knee-on-belly torture'],
    playstyle: 'Trade submissions for control until the opponent gives one up for free.',
  },
  'back-taking': {
    name: 'The Back Hunter',
    epithet: 'Always Behind You',
    description:
      'Turn for one second and it is over. This build sees back exposure in every scramble, every pass, every panicked turn.',
    signature: ['Arm drags', 'Berimbolo finishes to the back', 'Body triangle rides'],
    playstyle: 'Herd opponents into turning away, then never let go.',
  },
  'closed-guard': {
    name: 'The Old-School Assassin',
    epithet: 'Keeper of the Closed Guard',
    description:
      'A fundamentalist with fangs. The closed guard is a fortress with trapdoors — posture dies first, then arms, then hope.',
    signature: ['Cross-collar choke', 'Hip-bump sweep series', 'Kimura from guard'],
    playstyle: 'Break posture relentlessly and make every inch of space a mistake.',
  },
  'half-guard': {
    name: 'The Dogfighter',
    epithet: 'Underhook Evangelist',
    description:
      'Half guard is not a last resort — it is home. Deep underhooks, knee levers, and a wrestle-up game that flips matches from the bottom.',
    signature: ['Dogfight sweeps', 'Deep half entries', 'Knee shield to wrestle-up'],
    playstyle: 'Win the underhook war and turn bottom into top, one battle at a time.',
  },
  'open-guard': {
    name: 'The Guard Sorcerer',
    epithet: 'Weaver of Grips',
    description:
      'De La Riva hooks, spider grips, lasso tension — a spellbook of open guards that trap opponents in geometry they cannot read.',
    signature: ['DLR to berimbolo', 'Spider-lasso sweeps', 'Collar-sleeve triangles'],
    playstyle: 'Establish grips first, then off-balance until a sweep or submission appears.',
  },
  'butterfly-x': {
    name: 'The Elevator',
    epithet: 'Going Up',
    description:
      'Seated but never passive. Hooks lift, X-guard extends, and suddenly the opponent is airborne and the build is on top — or on a leg.',
    signature: ['Butterfly sweep', 'X-guard technical stand-up', 'Single-leg X transitions'],
    playstyle: 'Elevate everything. Every lifted hip is a sweep or an entry.',
  },
  armbars: {
    name: 'The Arm Collector',
    epithet: 'Juji Gatame Devotee',
    description:
      'Every extended arm is an invitation. Spinning, flying, rolling — this build finishes armbars from positions that should not exist.',
    signature: ['Armbar from mount', 'Spinning armbar', 'Belly-down finishes'],
    playstyle: 'Threaten everywhere, isolate one arm, and trade position for the finish.',
  },
  triangles: {
    name: 'The Triangle Machine',
    epithet: 'Three Sides of Doom',
    description:
      'Legs like a bear trap. Front triangles, side triangles, mounted triangles — every configuration of three limbs and a neck.',
    signature: ['Punch-choke triangle', 'Back-step side triangle', 'Mounted triangle'],
    playstyle: 'Funnel arms across the centerline and close the trap without warning.',
  },
  chokes: {
    name: 'The Strangler',
    epithet: 'Sleep Merchant',
    description:
      'Blood chokes end arguments. Guillotines for the reckless, collar chokes for the confident, and the rear naked for everyone eventually.',
    signature: ['High-elbow guillotine', 'Bow and arrow choke', 'Arm-in darce series'],
    playstyle: 'Attack the neck at every level change and scramble — no position required.',
  },
  'heel-hooks': {
    name: 'The Leglock Assassin',
    epithet: 'Below the Belt',
    description:
      'While everyone else fights for the upper body, this build already has a leg. Entries from everywhere, breaking mechanics from nightmare fuel.',
    signature: ['Inside heel hook', 'Saddle entries', '50/50 sweeps to finish'],
    playstyle: 'Enter on any extended leg. The entanglement is the position; the finish is a formality.',
  },
  kimuras: {
    name: 'The Shoulder Surgeon',
    epithet: 'Kimura Trap Technician',
    description:
      'One grip changes everything. The kimura is a submission, a sweep, a pass, and a back take — this build knows all four.',
    signature: ['Kimura trap to back take', 'Rolling kimuras', 'Omoplata chains'],
    playstyle: 'Hunt the figure-four grip and let the whole system unfold from it.',
  },
};

const TREE_FALLBACK: Record<string, Persona> = {
  takedowns: SPECIALISTS['wrestling'],
  top: SPECIALISTS['top-pressure'],
  guard: SPECIALISTS['open-guard'],
  submissions: SPECIALISTS['chokes'],
};

function skillName(id: string): string {
  return ALL_SKILLS.find((s) => s.id === id)?.name ?? id;
}

function classTypeFor(points: PointMap, trees: TreeDef[]): string {
  const total = spentPoints(points);
  const totals = trees
    .map((t) => ({ tree: t, total: treeTotal(points, t) }))
    .sort((a, b) => b.total - a.total);
  const top = totals[0];
  const topShare = top.total / total;
  const topTwoShare = (top.total + totals[1].total) / total;
  if (topShare >= 0.55) return `${top.tree.name} Specialist`;
  if (topTwoShare >= 0.6) return `${top.tree.name} / ${totals[1].tree.name} Hybrid`;
  return 'Well-Rounded Generalist';
}

export function generateLocalArchetype(points: PointMap): Archetype | null {
  const total = spentPoints(points);
  if (total === 0) return null;

  const ranked = ALL_SKILLS.map((s) => ({ id: s.id, pts: points[s.id] || 0 }))
    .filter((s) => s.pts > 0)
    .sort((a, b) => b.pts - a.pts);

  // Combo match: top two skills, both carrying real investment.
  let persona: Persona | undefined;
  if (ranked.length >= 2 && ranked[1].pts >= 3) {
    const key = [ranked[0].id, ranked[1].id].sort().join('+');
    persona = COMBOS[key];
  }
  if (!persona) persona = SPECIALISTS[ranked[0].id];
  if (!persona) {
    const domTree = [...TREES].sort((a, b) => treeTotal(points, b) - treeTotal(points, a))[0];
    persona = TREE_FALLBACK[domTree.id];
  }

  const strengths = ranked.slice(0, 3).map((s) => `${skillName(s.id)} (${s.pts} pts)`);

  const weakTrees = TREES.map((t) => ({ tree: t, total: treeTotal(points, t) }))
    .sort((a, b) => a.total - b.total)
    .filter((t) => t.total <= 2)
    .slice(0, 2);
  const weaknesses =
    weakTrees.length > 0
      ? weakTrees.map((t) =>
          t.total === 0
            ? `${t.tree.name}: completely untrained — a glaring hole`
            : `${t.tree.name}: barely developed (${t.total} pts)`,
        )
      : ['No obvious holes — but a jack of all trades can be out-specialized'];

  return {
    ...persona,
    classType: classTypeFor(points, TREES),
    strengths,
    weaknesses,
    source: 'local',
  };
}
