import type { Profile, TrainingSession } from '../types';
import { computeStats } from '../lib/stats';

interface Props {
  sessions: TrainingSession[];
  profile: Profile;
}

export default function Dashboard({ sessions, profile }: Props) {
  const stats = computeStats(sessions);
  const maxWeek = Math.max(1, ...stats.last12Weeks.map((w) => w.count));
  const goal = Math.max(1, profile.weeklyGoal);
  const goalPct = Math.min(100, Math.round((stats.sessionsThisWeek / goal) * 100));
  const giTotal = stats.giCount + stats.nogiCount;

  if (sessions.length === 0) {
    return (
      <div className="empty-state">
        <h2>Welcome to the mats</h2>
        <p>
          Log your first training session in the <strong>Train</strong> tab and
          your stats will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalHours}</span>
          <span className="stat-label">Mat hours</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalRounds}</span>
          <span className="stat-label">Rounds</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.currentStreakWeeks}</span>
          <span className="stat-label">Week streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.submissionsFor}</span>
          <span className="stat-label">Subs landed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.submissionsAgainst}</span>
          <span className="stat-label">Subs conceded</span>
        </div>
      </div>

      <section className="panel">
        <h3>This week&rsquo;s goal</h3>
        <div className="goal-row">
          <div className="goal-bar">
            <div className="goal-fill" style={{ width: `${goalPct}%` }} />
          </div>
          <span className="goal-text">
            {stats.sessionsThisWeek} / {goal} sessions
          </span>
        </div>
      </section>

      <section className="panel">
        <h3>Last 12 weeks</h3>
        <div className="week-chart" role="img" aria-label="Sessions per week, last 12 weeks">
          {stats.last12Weeks.map((w) => (
            <div className="week-col" key={w.label} title={`${w.label}: ${w.count} sessions`}>
              <div
                className="week-bar"
                style={{ height: `${Math.max(4, (w.count / maxWeek) * 100)}%` }}
                data-empty={w.count === 0 || undefined}
              />
              <span className="week-label">{w.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="panel-row">
        <section className="panel">
          <h3>Gi / No-Gi</h3>
          {giTotal > 0 ? (
            <>
              <div className="split-bar">
                <div className="split-gi" style={{ width: `${(stats.giCount / giTotal) * 100}%` }} />
              </div>
              <div className="split-legend">
                <span>Gi · {stats.giCount}</span>
                <span>No-Gi · {stats.nogiCount}</span>
              </div>
            </>
          ) : (
            <p className="muted">No sessions yet.</p>
          )}
        </section>

        <section className="panel">
          <h3>Most drilled techniques</h3>
          {stats.topTechniques.length > 0 ? (
            <ul className="tech-list">
              {stats.topTechniques.map((t) => (
                <li key={t.name}>
                  <span className="tech-name">{t.name}</span>
                  <span className="tech-count">×{t.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Tag techniques on your sessions to see them here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
