import type { TrainingSession } from '../types';

export interface Stats {
  totalSessions: number;
  totalHours: number;
  totalRounds: number;
  submissionsFor: number;
  submissionsAgainst: number;
  giCount: number;
  nogiCount: number;
  currentStreakWeeks: number;
  sessionsThisWeek: number;
  topTechniques: { name: string; count: number }[];
  last12Weeks: { label: string; count: number }[];
}

/** Monday-based start of the week containing `d`. */
function weekStart(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (out.getDay() + 6) % 7; // Mon=0 … Sun=6
  out.setDate(out.getDate() - day);
  return out;
}

function parseISO(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function computeStats(sessions: TrainingSession[], now = new Date()): Stats {
  const totalMinutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);

  const techCounts = new Map<string, number>();
  for (const s of sessions) {
    for (const t of s.techniques) {
      const key = t.trim().toLowerCase();
      if (!key) continue;
      techCounts.set(key, (techCounts.get(key) ?? 0) + 1);
    }
  }
  const topTechniques = [...techCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Sessions bucketed by week start, for streak + sparkline.
  const byWeek = new Map<number, number>();
  for (const s of sessions) {
    const ws = weekStart(parseISO(s.date)).getTime();
    byWeek.set(ws, (byWeek.get(ws) ?? 0) + 1);
  }

  const thisWeek = weekStart(now).getTime();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  let currentStreakWeeks = 0;
  // Current week counts toward the streak if trained; if not yet, streak
  // continues from last week (the week isn't over).
  let cursor = thisWeek;
  if (!byWeek.has(cursor)) cursor -= WEEK_MS;
  while (byWeek.has(cursor)) {
    currentStreakWeeks++;
    cursor -= WEEK_MS;
  }

  const last12Weeks: { label: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const ws = thisWeek - i * WEEK_MS;
    const d = new Date(ws);
    last12Weeks.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: byWeek.get(ws) ?? 0,
    });
  }

  return {
    totalSessions: sessions.length,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    totalRounds: sessions.reduce((s, x) => s + x.rounds, 0),
    submissionsFor: sessions.reduce((s, x) => s + x.submissionsFor, 0),
    submissionsAgainst: sessions.reduce((s, x) => s + x.submissionsAgainst, 0),
    giCount: sessions.filter((s) => s.giType === 'gi').length,
    nogiCount: sessions.filter((s) => s.giType === 'nogi').length,
    currentStreakWeeks,
    sessionsThisWeek: byWeek.get(thisWeek) ?? 0,
    topTechniques,
    last12Weeks,
  };
}
