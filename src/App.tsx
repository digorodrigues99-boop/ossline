import { useState } from 'react';
import type { JournalEntry, Profile, TrainingSession } from './types';
import { DEFAULT_PROFILE } from './types';
import { useStoredState } from './storage';
import Dashboard from './components/Dashboard';
import Sessions from './components/Sessions';
import Journal from './components/Journal';
import ProfileView from './components/ProfileView';
import BuildLab from './components/BuildLab';

type Tab = 'dashboard' | 'train' | 'build' | 'journal' | 'profile';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'train', label: 'Train', icon: '🥋' },
  { id: 'build', label: 'Build', icon: '🧬' },
  { id: 'journal', label: 'Journal', icon: '📓' },
  { id: 'profile', label: 'Profile', icon: '🎖️' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sessions, setSessions] = useStoredState<TrainingSession[]>('sessions', []);
  const [entries, setEntries] = useStoredState<JournalEntry[]>('journal', []);
  const [profile, setProfile] = useStoredState<Profile>('profile', DEFAULT_PROFILE);

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">OSS</span>
          <div>
            <h1>Ossline</h1>
            <p className="tagline">
              {profile.name ? `${profile.name} · ` : ''}
              {profile.academy || 'Your jiu jitsu training log'}
            </p>
          </div>
        </div>
        <span className={`belt-chip belt-${profile.belt}`}>
          {profile.belt}
          {profile.stripes > 0 && ` · ${profile.stripes}`}
        </span>
      </header>

      <nav className="tabs" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'dashboard' && <Dashboard sessions={sessions} profile={profile} />}
        {tab === 'train' && <Sessions sessions={sessions} onChange={setSessions} />}
        {tab === 'build' && <BuildLab />}
        {tab === 'journal' && <Journal entries={entries} onChange={setEntries} />}
        {tab === 'profile' && <ProfileView profile={profile} onChange={setProfile} />}
      </main>

      <footer className="app-footer">Data stays on this device (localStorage). Oss. 🤙</footer>
    </div>
  );
}
