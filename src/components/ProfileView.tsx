import { useState } from 'react';
import type { Belt, Profile } from '../types';
import { BELTS, newId, todayISO } from '../types';

interface Props {
  profile: Profile;
  onChange: (profile: Profile) => void;
}

const BELT_LABELS: Record<Belt, string> = {
  white: 'White',
  blue: 'Blue',
  purple: 'Purple',
  brown: 'Brown',
  black: 'Black',
};

export default function ProfileView({ profile, onChange }: Props) {
  const [promoDate, setPromoDate] = useState(todayISO());
  const [promoBelt, setPromoBelt] = useState<Belt>(profile.belt);
  const [promoStripes, setPromoStripes] = useState(0);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    onChange({ ...profile, [key]: value });
  }

  function addPromotion(e: React.FormEvent) {
    e.preventDefault();
    const promotion = {
      id: newId(),
      date: promoDate || todayISO(),
      belt: promoBelt,
      stripes: promoStripes,
    };
    onChange({
      ...profile,
      belt: promoBelt,
      stripes: promoStripes,
      promotions: [...profile.promotions, promotion].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    });
  }

  function removePromotion(id: string) {
    onChange({ ...profile, promotions: profile.promotions.filter((p) => p.id !== id) });
  }

  const stripeDots = Array.from({ length: 4 }, (_, i) => i < profile.stripes);

  return (
    <div className="profile">
      <section className="panel belt-panel">
        <div className={`belt belt-${profile.belt}`}>
          <div className="belt-bar">
            <span className="belt-rank">
              {stripeDots.map((filled, i) => (
                <span key={i} className={filled ? 'stripe filled' : 'stripe'} />
              ))}
            </span>
          </div>
        </div>
        <p className="belt-caption">
          {BELT_LABELS[profile.belt]} belt
          {profile.stripes > 0 && `, ${profile.stripes} stripe${profile.stripes > 1 ? 's' : ''}`}
        </p>
      </section>

      <section className="panel">
        <h3>About you</h3>
        <div className="form-grid">
          <label>
            Name
            <input type="text" value={profile.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label>
            Academy
            <input type="text" value={profile.academy} onChange={(e) => set('academy', e.target.value)} />
          </label>
          <label>
            Training since
            <input
              type="date"
              value={profile.startedDate}
              onChange={(e) => set('startedDate', e.target.value)}
            />
          </label>
          <label>
            Weekly session goal
            <input
              type="number"
              min="1"
              max="14"
              value={profile.weeklyGoal}
              onChange={(e) => set('weeklyGoal', Math.max(1, parseInt(e.target.value, 10) || 1))}
            />
          </label>
          <label>
            Current belt
            <select value={profile.belt} onChange={(e) => set('belt', e.target.value as Belt)}>
              {BELTS.map((b) => (
                <option key={b} value={b}>
                  {BELT_LABELS[b]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Stripes
            <select
              value={profile.stripes}
              onChange={(e) => set('stripes', parseInt(e.target.value, 10))}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <h3>Promotion history</h3>
        <form className="promo-form" onSubmit={addPromotion}>
          <input type="date" value={promoDate} onChange={(e) => setPromoDate(e.target.value)} required />
          <select value={promoBelt} onChange={(e) => setPromoBelt(e.target.value as Belt)}>
            {BELTS.map((b) => (
              <option key={b} value={b}>
                {BELT_LABELS[b]}
              </option>
            ))}
          </select>
          <select value={promoStripes} onChange={(e) => setPromoStripes(parseInt(e.target.value, 10))}>
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} stripe{n === 1 ? '' : 's'}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
        {profile.promotions.length === 0 ? (
          <p className="muted">Record your promotions to build your lineage timeline.</p>
        ) : (
          <ul className="promo-list">
            {[...profile.promotions].reverse().map((p) => (
              <li key={p.id}>
                <span className={`belt-dot belt-${p.belt}`} />
                <span className="promo-text">
                  {BELT_LABELS[p.belt]}
                  {p.stripes > 0 && ` · ${p.stripes} stripe${p.stripes > 1 ? 's' : ''}`}
                </span>
                <span className="session-date">{p.date}</span>
                <button
                  className="btn-ghost btn-small btn-danger"
                  onClick={() => removePromotion(p.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
