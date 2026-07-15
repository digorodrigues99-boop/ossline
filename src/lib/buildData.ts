// Skill tree definitions for the Build Lab.

export const TOTAL_POINTS = 25;
export const MAX_PER_SKILL = 5;

export type TreeId = 'takedowns' | 'top' | 'guard' | 'submissions';

export interface SkillDef {
  id: string;
  name: string;
  blurb: string;
}

export interface TreeDef {
  id: TreeId;
  name: string;
  icon: string;
  skills: SkillDef[];
}

export const TREES: TreeDef[] = [
  {
    id: 'takedowns',
    name: 'Takedowns & Wrestling',
    icon: '🤼',
    skills: [
      { id: 'wrestling', name: 'Wrestling', blurb: 'Shots, level changes, chain wrestling' },
      { id: 'judo', name: 'Judo & Trips', blurb: 'Throws, foot sweeps, upper-body clinch' },
      { id: 'td-defense', name: 'Takedown Defense', blurb: 'Sprawls, whizzers, front headlock' },
      { id: 'scrambling', name: 'Scrambling', blurb: 'Winning the chaos in transitions' },
    ],
  },
  {
    id: 'top',
    name: 'Top Game',
    icon: '🏔️',
    skills: [
      { id: 'top-pressure', name: 'Top Pressure', blurb: 'Heavy hips, crossface, smash passing' },
      { id: 'top-movement', name: 'Top Movement', blurb: 'Toreando, leg drags, floating passes' },
      { id: 'pins-control', name: 'Pins & Control', blurb: 'Side control, mount, knee on belly' },
      { id: 'back-taking', name: 'Back Taking', blurb: 'Hunting the back from every position' },
    ],
  },
  {
    id: 'guard',
    name: 'Guard',
    icon: '🛡️',
    skills: [
      { id: 'closed-guard', name: 'Closed Guard', blurb: 'Breaking posture, attacks off your back' },
      { id: 'half-guard', name: 'Half Guard', blurb: 'Underhooks, dogfight, deep half' },
      { id: 'open-guard', name: 'Open Guard', blurb: 'De La Riva, spider, lasso, collar-sleeve' },
      { id: 'butterfly-x', name: 'Butterfly & X', blurb: 'Elevations, sweeps, entries to legs' },
    ],
  },
  {
    id: 'submissions',
    name: 'Submissions',
    icon: '⚔️',
    skills: [
      { id: 'armbars', name: 'Armbars', blurb: 'Juji gatame from everywhere' },
      { id: 'triangles', name: 'Triangles', blurb: 'Front, side, mounted, reverse' },
      { id: 'chokes', name: 'Chokes', blurb: 'RNC, guillotines, collar strangles' },
      { id: 'heel-hooks', name: 'Heel Hooks & Leg Locks', blurb: 'Leg entanglements, inside heel hooks' },
      { id: 'kimuras', name: 'Kimuras & Shoulder Locks', blurb: 'Kimura traps, americanas, omoplatas' },
    ],
  },
];

export const ALL_SKILLS: SkillDef[] = TREES.flatMap((t) => t.skills);

export type PointMap = Record<string, number>;

export function emptyPoints(): PointMap {
  return Object.fromEntries(ALL_SKILLS.map((s) => [s.id, 0]));
}

export function spentPoints(points: PointMap): number {
  return Object.values(points).reduce((a, b) => a + (b || 0), 0);
}

export function treeTotal(points: PointMap, tree: TreeDef): number {
  return tree.skills.reduce((sum, s) => sum + (points[s.id] || 0), 0);
}

export interface Archetype {
  name: string;
  epithet: string;
  classType: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  signature: string[];
  playstyle: string;
  source: 'local' | 'ai';
}

export interface SavedBuild {
  id: string;
  name: string;
  createdAt: string; // ISO date
  points: PointMap;
  archetype: Archetype | null;
}

// Derived stat line (0-100) shown as bars on the archetype card.
export interface StatLine {
  label: string;
  value: number;
}

export function computeStats(points: PointMap): StatLine[] {
  const p = (id: string) => points[id] || 0;
  const pct = (raw: number, max: number) => Math.round(Math.min(1, raw / max) * 100);

  const pressure = p('top-pressure') * 2 + p('pins-control') + p('wrestling');
  const speed = p('top-movement') + p('scrambling') * 2 + p('butterfly-x');
  const control = p('pins-control') + p('back-taking') + p('closed-guard') + p('td-defense');
  const danger =
    p('armbars') + p('triangles') + p('chokes') + p('heel-hooks') + p('kimuras');
  const bottom = p('closed-guard') + p('half-guard') + p('open-guard') + p('butterfly-x');
  const standup = p('wrestling') + p('judo') + p('td-defense');

  return [
    { label: 'Pressure', value: pct(pressure, 4 * MAX_PER_SKILL) },
    { label: 'Speed', value: pct(speed, 4 * MAX_PER_SKILL) },
    { label: 'Control', value: pct(control, 4 * MAX_PER_SKILL) },
    { label: 'Sub Threat', value: pct(danger, 3 * MAX_PER_SKILL) },
    { label: 'Guard', value: pct(bottom, 3 * MAX_PER_SKILL) },
    { label: 'Standup', value: pct(standup, 3 * MAX_PER_SKILL) },
  ];
}
