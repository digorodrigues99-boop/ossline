import { useState } from 'react';
import type { ClassType, GiType, TrainingSession } from '../types';
import { CLASS_TYPE_LABELS, newId, todayISO } from '../types';

interface Props {
  sessions: TrainingSession[];
  onChange: (sessions: TrainingSession[]) => void;
}

interface FormState {
  date: string;
  giType: GiType;
  classType: ClassType;
  durationMinutes: string;
  techniques: string;
  rounds: string;
  submissionsFor: string;
  submissionsAgainst: string;
  partners: string;
  notes: string;
  energy: number;
}

const EMPTY_FORM: FormState = {
  date: todayISO(),
  giType: 'gi',
  classType: 'class',
  durationMinutes: '60',
  techniques: '',
  rounds: '5',
  submissionsFor: '0',
  submissionsAgainst: '0',
  partners: '',
  notes: '',
  energy: 3,
};

function toForm(s: TrainingSession): FormState {
  return {
    date: s.date,
    giType: s.giType,
    classType: s.classType,
    durationMinutes: String(s.durationMinutes),
    techniques: s.techniques.join(', '),
    rounds: String(s.rounds),
    submissionsFor: String(s.submissionsFor),
    submissionsAgainst: String(s.submissionsAgainst),
    partners: s.partners,
    notes: s.notes,
    energy: s.energy,
  };
}

function num(v: string): number {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function Sessions({ sessions, onChange }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const session: TrainingSession = {
      id: editingId ?? newId(),
      date: form.date || todayISO(),
      giType: form.giType,
      classType: form.classType,
      durationMinutes: num(form.durationMinutes),
      techniques: form.techniques
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      rounds: num(form.rounds),
      submissionsFor: num(form.submissionsFor),
      submissionsAgainst: num(form.submissionsAgainst),
      partners: form.partners.trim(),
      notes: form.notes.trim(),
      energy: form.energy,
    };
    onChange(
      editingId
        ? sessions.map((s) => (s.id === editingId ? session : s))
        : [...sessions, session],
    );
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  function edit(s: TrainingSession) {
    setForm(toForm(s));
    setEditingId(s.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function remove(id: string) {
    if (!window.confirm('Delete this session?')) return;
    onChange(sessions.filter((s) => s.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(EMPTY_FORM);
      setShowForm(false);
    }
  }

  function cancel() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <div className="sessions">
      {!showForm && (
        <button className="btn-primary btn-wide" onClick={() => setShowForm(true)}>
          + Log a session
        </button>
      )}

      {showForm && (
        <form className="panel session-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit session' : 'Log a session'}</h3>

          <div className="form-grid">
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
              />
            </label>
            <label>
              Duration (min)
              <input
                type="number"
                min="0"
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', e.target.value)}
              />
            </label>
            <label>
              Type
              <select value={form.classType} onChange={(e) => set('classType', e.target.value as ClassType)}>
                {Object.entries(CLASS_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="field">
              <span className="field-label">Gi / No-Gi</span>
              <div className="toggle-group" role="radiogroup" aria-label="Gi or No-Gi">
                {(['gi', 'nogi'] as const).map((g) => (
                  <button
                    type="button"
                    key={g}
                    className={form.giType === g ? 'toggle active' : 'toggle'}
                    onClick={() => set('giType', g)}
                  >
                    {g === 'gi' ? 'Gi' : 'No-Gi'}
                  </button>
                ))}
              </div>
            </div>
            <label>
              Rounds sparred
              <input type="number" min="0" value={form.rounds} onChange={(e) => set('rounds', e.target.value)} />
            </label>
            <label>
              Subs landed
              <input
                type="number"
                min="0"
                value={form.submissionsFor}
                onChange={(e) => set('submissionsFor', e.target.value)}
              />
            </label>
            <label>
              Subs conceded
              <input
                type="number"
                min="0"
                value={form.submissionsAgainst}
                onChange={(e) => set('submissionsAgainst', e.target.value)}
              />
            </label>
            <div className="field">
              <span className="field-label">Energy</span>
              <div className="toggle-group" role="radiogroup" aria-label="Energy level">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={form.energy === n ? 'toggle active' : 'toggle'}
                    onClick={() => set('energy', n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="full">
            Techniques drilled <span className="hint">(comma-separated)</span>
            <input
              type="text"
              placeholder="armbar from guard, knee cut pass, triangle"
              value={form.techniques}
              onChange={(e) => set('techniques', e.target.value)}
            />
          </label>

          <label className="full">
            Training partners
            <input
              type="text"
              placeholder="Who did you roll with?"
              value={form.partners}
              onChange={(e) => set('partners', e.target.value)}
            />
          </label>

          <label className="full">
            Notes
            <textarea
              rows={3}
              placeholder="What worked? What got you caught? What to focus on next time?"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Save changes' : 'Add session'}
            </button>
            <button type="button" className="btn-ghost" onClick={cancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <div className="empty-state">
          <h2>No sessions yet</h2>
          <p>Every black belt started with session #1. Log yours above.</p>
        </div>
      )}

      <ul className="session-list">
        {sorted.map((s) => (
          <li key={s.id} className="session-card">
            <div className="session-head">
              <span className={`badge badge-${s.giType}`}>{s.giType === 'gi' ? 'Gi' : 'No-Gi'}</span>
              <span className="badge">{CLASS_TYPE_LABELS[s.classType]}</span>
              <span className="session-date">{s.date}</span>
              <span className="session-duration">{s.durationMinutes} min</span>
            </div>
            <div className="session-meta">
              {s.rounds > 0 && <span>{s.rounds} rounds</span>}
              {(s.submissionsFor > 0 || s.submissionsAgainst > 0) && (
                <span>
                  subs {s.submissionsFor}–{s.submissionsAgainst}
                </span>
              )}
              <span>energy {s.energy}/5</span>
            </div>
            {s.techniques.length > 0 && (
              <div className="chip-row">
                {s.techniques.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {s.partners && <p className="session-partners">with {s.partners}</p>}
            {s.notes && <p className="session-notes">{s.notes}</p>}
            <div className="card-actions">
              <button className="btn-ghost btn-small" onClick={() => edit(s)}>
                Edit
              </button>
              <button className="btn-ghost btn-small btn-danger" onClick={() => remove(s.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
