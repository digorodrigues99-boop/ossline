import { useState } from 'react';
import type { Archetype, PointMap, SavedBuild, SkillDef, TreeDef } from '../lib/buildData';
import {
  MAX_PER_SKILL,
  TOTAL_POINTS,
  TREES,
  computeStats,
  emptyPoints,
  spentPoints,
  treeTotal,
} from '../lib/buildData';
import { generateLocalArchetype } from '../lib/archetype';
import { describeAiError, generateAiArchetype, looksLikeApiKey } from '../lib/claudeArchetype';
import { useStoredState } from '../storage';
import { newId, todayISO } from '../types';

export default function BuildLab() {
  const [points, setPoints] = useStoredState<PointMap>('buildDraft', emptyPoints());
  const [builds, setBuilds] = useStoredState<SavedBuild[]>('builds', []);
  const [apiKey, setApiKey] = useStoredState<string>('anthropicApiKey', '');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [buildName, setBuildName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const spent = spentPoints(points);
  const remaining = TOTAL_POINTS - spent;

  function setSkill(id: string, value: number) {
    const clamped = Math.max(0, Math.min(MAX_PER_SKILL, value));
    const nextSpent = spent - (points[id] || 0) + clamped;
    if (nextSpent > TOTAL_POINTS) return;
    setPoints({ ...points, [id]: clamped });
  }

  async function generate() {
    setError(null);
    if (spent === 0) {
      setError('Put some points into your build first.');
      return;
    }
    const key = apiKey.trim();
    if (key) {
      setGenerating(true);
      try {
        setArchetype(await generateAiArchetype(key, points));
      } catch (err) {
        setError(`${describeAiError(err)} Showing the built-in archetype instead.`);
        setArchetype(generateLocalArchetype(points));
      } finally {
        setGenerating(false);
      }
    } else {
      setArchetype(generateLocalArchetype(points));
    }
  }

  function saveBuild() {
    if (!archetype) return;
    const build: SavedBuild = {
      id: newId(),
      name: buildName.trim() || archetype.name,
      createdAt: todayISO(),
      points: { ...points },
      archetype,
    };
    setBuilds([build, ...builds]);
    setBuildName('');
  }

  function loadBuild(build: SavedBuild) {
    setPoints({ ...emptyPoints(), ...build.points });
    setArchetype(build.archetype);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteBuild(id: string) {
    if (!window.confirm('Delete this saved build?')) return;
    setBuilds(builds.filter((b) => b.id !== id));
  }

  function reset() {
    setPoints(emptyPoints());
    setArchetype(null);
    setError(null);
  }

  return (
    <div className="build-lab">
      <div className="panel points-banner">
        <div>
          <span className="stat-value">{remaining}</span>
          <span className="points-of"> / {TOTAL_POINTS}</span>
          <div className="stat-label">points remaining</div>
        </div>
        <div className="points-actions">
          <button
            className="btn-ghost btn-small"
            onClick={() => setShowSettings(!showSettings)}
            aria-expanded={showSettings}
          >
            ✨ AI settings
          </button>
          <button className="btn-ghost btn-small btn-danger" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="panel">
          <h3>AI-generated archetypes</h3>
          <p className="muted settings-note">
            Add an Anthropic API key and archetypes are written fresh by Claude for your exact
            build. Without a key, Ossline uses its built-in archetype engine. The key is stored
            only in this browser and sent only to Anthropic.
          </p>
          <label className="full">
            Anthropic API key
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
            />
          </label>
          {apiKey.trim() !== '' && !looksLikeApiKey(apiKey) && (
            <p className="error-text">This doesn’t look like an Anthropic key (sk-ant-…).</p>
          )}
        </div>
      )}

      {TREES.map((tree) => (
        <SkillTree
          key={tree.id}
          tree={tree}
          points={points}
          remaining={remaining}
          onSet={setSkill}
        />
      ))}

      <button className="btn-primary btn-wide" onClick={generate} disabled={generating}>
        {generating
          ? 'Consulting the oracle…'
          : apiKey.trim()
            ? '✨ Generate archetype with AI'
            : '⚡ Generate archetype'}
      </button>

      {error && <p className="error-text panel-error">{error}</p>}

      {archetype && (
        <ArchetypeCard archetype={archetype} points={points}>
          <div className="save-row">
            <input
              type="text"
              placeholder={`Name this build (default: ${archetype.name})`}
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
            />
            <button className="btn-primary" onClick={saveBuild}>
              Save build
            </button>
          </div>
        </ArchetypeCard>
      )}

      {builds.length > 0 && (
        <div className="panel">
          <h3>Saved builds</h3>
          <ul className="build-list">
            {builds.map((build) => (
              <li key={build.id}>
                <div className="build-list-info">
                  <strong>{build.name}</strong>
                  <span className="session-date">
                    {build.archetype ? `${build.archetype.name} · ` : ''}
                    {build.createdAt}
                  </span>
                </div>
                <div className="card-actions">
                  <button className="btn-ghost btn-small" onClick={() => loadBuild(build)}>
                    Load
                  </button>
                  <button
                    className="btn-ghost btn-small btn-danger"
                    onClick={() => deleteBuild(build.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!archetype && builds.length === 0 && spent === 0 && (
        <div className="empty-state">
          <h2>Forge your grappler</h2>
          <p>
            Spend {TOTAL_POINTS} points across takedowns, top game, guard, and submissions — then
            generate your RPG-style character archetype.
          </p>
        </div>
      )}
    </div>
  );
}

function SkillTree({
  tree,
  points,
  remaining,
  onSet,
}: {
  tree: TreeDef;
  points: PointMap;
  remaining: number;
  onSet: (id: string, value: number) => void;
}) {
  return (
    <div className="panel skill-tree">
      <div className="tree-head">
        <h3>
          <span aria-hidden="true">{tree.icon}</span> {tree.name}
        </h3>
        <span className="tree-total">{treeTotal(points, tree)} pts</span>
      </div>
      {tree.skills.map((skill) => (
        <SkillRow
          key={skill.id}
          skill={skill}
          value={points[skill.id] || 0}
          canAdd={remaining > 0}
          onSet={onSet}
        />
      ))}
    </div>
  );
}

function SkillRow({
  skill,
  value,
  canAdd,
  onSet,
}: {
  skill: SkillDef;
  value: number;
  canAdd: boolean;
  onSet: (id: string, value: number) => void;
}) {
  return (
    <div className="skill-row">
      <div className="skill-info">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-blurb">{skill.blurb}</span>
      </div>
      <div className="skill-controls">
        <button
          className="pip-btn"
          onClick={() => onSet(skill.id, value - 1)}
          disabled={value === 0}
          aria-label={`Remove point from ${skill.name}`}
        >
          −
        </button>
        <div className="pips" role="meter" aria-valuenow={value} aria-valuemax={MAX_PER_SKILL} aria-label={skill.name}>
          {Array.from({ length: MAX_PER_SKILL }, (_, i) => (
            <span key={i} className={i < value ? 'pip filled' : 'pip'} />
          ))}
        </div>
        <button
          className="pip-btn"
          onClick={() => onSet(skill.id, value + 1)}
          disabled={value >= MAX_PER_SKILL || !canAdd}
          aria-label={`Add point to ${skill.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function ArchetypeCard({
  archetype,
  points,
  children,
}: {
  archetype: Archetype;
  points: PointMap;
  children?: React.ReactNode;
}) {
  const stats = computeStats(points);
  return (
    <div className="archetype-card">
      <div className="archetype-head">
        <div>
          <h2 className="archetype-name">{archetype.name}</h2>
          <p className="archetype-epithet">“{archetype.epithet}”</p>
        </div>
        <span className={archetype.source === 'ai' ? 'badge badge-ai' : 'badge'}>
          {archetype.source === 'ai' ? '✨ AI generated' : '⚡ Built-in engine'}
        </span>
      </div>
      <span className="chip class-chip">{archetype.classType}</span>
      <p className="archetype-desc">{archetype.description}</p>

      <div className="archetype-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="astat">
            <span className="astat-label">{stat.label}</span>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: `${stat.value}%` }} />
            </div>
            <span className="astat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="panel-row archetype-lists">
        <div>
          <h4 className="list-title strengths-title">Strengths</h4>
          <ul>
            {archetype.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="list-title weaknesses-title">Weaknesses</h4>
          <ul>
            {archetype.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      <h4 className="list-title">Signature techniques</h4>
      <div className="chip-row">
        {archetype.signature.map((move) => (
          <span key={move} className="chip">
            {move}
          </span>
        ))}
      </div>

      <p className="archetype-playstyle">
        <strong>Playstyle:</strong> {archetype.playstyle}
      </p>

      {children}
    </div>
  );
}
