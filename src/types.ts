export type GiType = 'gi' | 'nogi';

export type ClassType =
  | 'class'
  | 'open-mat'
  | 'private'
  | 'drilling'
  | 'competition'
  | 'seminar';

export interface TrainingSession {
  id: string;
  date: string; // ISO date (yyyy-mm-dd)
  giType: GiType;
  classType: ClassType;
  durationMinutes: number;
  techniques: string[];
  rounds: number;
  submissionsFor: number;
  submissionsAgainst: number;
  partners: string;
  notes: string;
  energy: number; // 1-5
}

export interface JournalEntry {
  id: string;
  date: string; // ISO date
  title: string;
  body: string;
  mood: number; // 1-5
}

export type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Promotion {
  id: string;
  date: string;
  belt: Belt;
  stripes: number;
}

export interface Profile {
  name: string;
  academy: string;
  belt: Belt;
  stripes: number;
  startedDate: string;
  weeklyGoal: number; // target sessions per week
  promotions: Promotion[];
}

export const DEFAULT_PROFILE: Profile = {
  name: '',
  academy: '',
  belt: 'white',
  stripes: 0,
  startedDate: '',
  weeklyGoal: 3,
  promotions: [],
};

export const BELTS: Belt[] = ['white', 'blue', 'purple', 'brown', 'black'];

export const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  class: 'Class',
  'open-mat': 'Open Mat',
  private: 'Private',
  drilling: 'Drilling',
  competition: 'Competition',
  seminar: 'Seminar',
};

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
