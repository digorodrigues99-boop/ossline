// AI archetype generation via the Anthropic API, called directly from the
// browser with a user-supplied key (Ossline is a static site — there is no
// backend to proxy through). The key never leaves this device except to go
// to Anthropic.

import Anthropic from '@anthropic-ai/sdk';
import type { Archetype, PointMap } from './buildData';
import { TREES, spentPoints, treeTotal } from './buildData';

const MODEL = 'claude-opus-4-8';

const ARCHETYPE_SCHEMA = {
  type: 'object' as const,
  properties: {
    name: {
      type: 'string',
      description: 'Evocative RPG class name, e.g. "The Leg Reaper". 2-4 words.',
    },
    epithet: {
      type: 'string',
      description: 'A short flavor subtitle, e.g. "Harvester of Heels".',
    },
    classType: {
      type: 'string',
      description: 'RPG-style class category, e.g. "Pressure Tank / Controller".',
    },
    description: {
      type: 'string',
      description:
        '2-4 sentence vivid character description of how this grappler fights, written like RPG class lore.',
    },
    strengths: {
      type: 'array',
      items: { type: 'string' },
      description: '3 short strength bullets grounded in the highest-invested skills.',
    },
    weaknesses: {
      type: 'array',
      items: { type: 'string' },
      description: '2-3 short weakness bullets grounded in the least-invested areas.',
    },
    signature: {
      type: 'array',
      items: { type: 'string' },
      description: '3 signature techniques or sequences this build would rely on.',
    },
    playstyle: {
      type: 'string',
      description: 'One sentence of strategy advice for playing this build.',
    },
  },
  required: [
    'name',
    'epithet',
    'classType',
    'description',
    'strengths',
    'weaknesses',
    'signature',
    'playstyle',
  ],
  additionalProperties: false,
};

function describeBuild(points: PointMap): string {
  const lines: string[] = [];
  for (const tree of TREES) {
    const total = treeTotal(points, tree);
    lines.push(`${tree.name} (${total} pts total):`);
    for (const skill of tree.skills) {
      const pts = points[skill.id] || 0;
      lines.push(`  - ${skill.name}: ${pts}/5${pts === 0 ? ' (untrained)' : ''}`);
    }
  }
  return lines.join('\n');
}

export async function generateAiArchetype(
  apiKey: string,
  points: PointMap,
): Promise<Archetype> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const totalSpent = spentPoints(points);
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    output_config: { format: { type: 'json_schema', schema: ARCHETYPE_SCHEMA } },
    system:
      'You generate Brazilian jiu jitsu character archetypes in the style of RPG classes. ' +
      'You receive a skill-point allocation and return one archetype as JSON matching the schema. ' +
      'Be creative and specific: the name should feel like a video game class, the description like ' +
      'class lore, and every strength, weakness, and signature technique must be grounded in the ' +
      'actual point distribution (call out real BJJ techniques and positions). Weaknesses must ' +
      'reference the skills or trees with little or no investment.',
    messages: [
      {
        role: 'user',
        content:
          `Here is my jiu jitsu build (${totalSpent} points spent, 5 max per skill):\n\n` +
          `${describeBuild(points)}\n\nGenerate my character archetype.`,
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('The model declined to generate this archetype. Try adjusting your build.');
  }

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === 'text',
  );
  if (!textBlock) throw new Error('The model returned no content.');

  const parsed = JSON.parse(textBlock.text) as Omit<Archetype, 'source'>;
  return { ...parsed, source: 'ai' };
}

/** Map SDK errors to a message we can show in the UI. */
export function describeAiError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'Invalid API key. Check the key in AI settings.';
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return 'This API key does not have access to the model.';
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limited by the API — wait a moment and try again.';
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the Anthropic API. Check your connection.';
  }
  if (err instanceof Anthropic.APIError) {
    return `API error${err.status ? ` (${err.status})` : ''}: ${err.message}`;
  }
  return err instanceof Error ? err.message : 'Something went wrong generating the archetype.';
}

// Rough sanity check so we can warn before a doomed request.
export function looksLikeApiKey(key: string): boolean {
  return key.trim().startsWith('sk-ant-');
}
