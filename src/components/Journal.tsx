import { useState } from 'react';
import type { JournalEntry } from '../types';
import { newId, todayISO } from '../types';

interface Props {
  entries: JournalEntry[];
  onChange: (entries: JournalEntry[]) => void;
}

const MOODS = ['😖', '😕', '😐', '🙂', '🔥'];

export default function Journal({ entries, onChange }: Props) {
  const [date, setDate] = useState(todayISO());
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  function reset() {
    setDate(todayISO());
    setTitle('');
    setBody('');
    setMood(3);
    setEditingId(null);
    setShowForm(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() && !title.trim()) return;
    const entry: JournalEntry = {
      id: editingId ?? newId(),
      date: date || todayISO(),
      title: title.trim(),
      body: body.trim(),
      mood,
    };
    onChange(
      editingId ? entries.map((x) => (x.id === editingId ? entry : x)) : [...entries, entry],
    );
    reset();
  }

  function edit(entry: JournalEntry) {
    setDate(entry.date);
    setTitle(entry.title);
    setBody(entry.body);
    setMood(entry.mood);
    setEditingId(entry.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function remove(id: string) {
    if (!window.confirm('Delete this entry?')) return;
    onChange(entries.filter((x) => x.id !== id));
    if (editingId === id) reset();
  }

  return (
    <div className="journal">
      {!showForm && (
        <button className="btn-primary btn-wide" onClick={() => setShowForm(true)}>
          + New journal entry
        </button>
      )}

      {showForm && (
        <form className="panel session-form" onSubmit={submit}>
          <h3>{editingId ? 'Edit entry' : 'New entry'}</h3>
          <div className="form-grid">
            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <div className="field">
              <span className="field-label">Mood</span>
              <div className="toggle-group" role="radiogroup" aria-label="Mood">
                {MOODS.map((emoji, i) => (
                  <button
                    type="button"
                    key={emoji}
                    className={mood === i + 1 ? 'toggle active' : 'toggle'}
                    onClick={() => setMood(i + 1)}
                    aria-label={`Mood ${i + 1} of 5`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <label className="full">
            Title
            <input
              type="text"
              placeholder="e.g. Finally hit the berimbolo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="full">
            Entry
            <textarea
              rows={6}
              placeholder="How did training feel? Breakthroughs, frustrations, things to remember…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Save changes' : 'Add entry'}
            </button>
            <button type="button" className="btn-ghost" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {sorted.length === 0 && !showForm && (
        <div className="empty-state">
          <h2>Your training journal</h2>
          <p>Write down what you learned, how you felt, and what to work on. Future you will thank you.</p>
        </div>
      )}

      <ul className="journal-list">
        {sorted.map((entry) => (
          <li key={entry.id} className="journal-card">
            <div className="journal-head">
              <span className="journal-mood">{MOODS[entry.mood - 1] ?? '😐'}</span>
              <div>
                {entry.title && <h4>{entry.title}</h4>}
                <span className="session-date">{entry.date}</span>
              </div>
            </div>
            {entry.body && <p className="journal-body">{entry.body}</p>}
            <div className="card-actions">
              <button className="btn-ghost btn-small" onClick={() => edit(entry)}>
                Edit
              </button>
              <button className="btn-ghost btn-small btn-danger" onClick={() => remove(entry.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
