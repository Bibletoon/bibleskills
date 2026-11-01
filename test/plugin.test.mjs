import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { Agent, Skill } from '@opencode/plugin';
import plugin from '../src/index.mjs';
import { listFiles, readMarkdown, repositoryRoot } from '../scripts/bundle.mjs';

// Model V2 transform replay and AgentEditor.update's create-if-missing behavior.
// The packed-package smoke test and a native OpenCode check cover the real loader.
function registry(kind, initial = []) {
  const transforms = new Map();
  const entries = () => {
    const values = new Map(initial.map((entry) => [entry.id, structuredClone(entry)]));
    const editor = {
      get: (id) => values.get(id),
      add: (entry) => values.set(entry.id, entry),
      update: (id, update) => {
        const value = values.get(id) ?? Agent.Info.default(Agent.ID.make(id));
        values.set(id, value);
        update(value);
      },
    };
    for (const transform of transforms.values()) transform(editor);
    for (const value of values.values()) {
      (kind === 'agent' ? Agent.Info : Skill.Info).make(value);
    }
    return values;
  };
  return {
    entries,
    async transform(callback) {
      const key = Symbol();
      transforms.set(key, callback);
      entries();
      return { async dispose() { transforms.delete(key); } };
    },
  };
}

test('plugin registers all Markdown skills and agents without exposing hidden skills automatically', async () => {
  const ctx = { agent: registry('agent'), skill: registry('skill') };
  assert.equal(plugin.id, 'bibleskills');
  const cleanup = await plugin.setup(ctx);
  const skills = ctx.skill.entries();
  assert.equal(skills.size, 22);
  assert.equal([...skills.values()].filter((entry) => !entry.autoinvoke).length, 12);
  assert.equal(skills.get('get-task').autoinvoke, true);
  for (const skill of skills.values()) {
    assert.ok(path.isAbsolute(skill.path));
    const source = await readMarkdown(skill.path);
    assert.equal(skill.content, source.body.trim());
    assert.equal(skill.name, source.metadata.name);
    assert.doesNotMatch(skill.content, /^---/);
  }
  const agents = ctx.agent.entries();
  assert.equal(agents.size, 6);
  const files = await listFiles(path.join(repositoryRoot, '.opencode', 'agents', 'bibleskills'));
  for (const file of files) {
    const source = await readMarkdown(file);
    const agent = agents.get(`bibleskills/${path.basename(file, '.md')}`);
    assert.equal(agent.mode, 'subagent');
    assert.equal(agent.system, source.body.trim());
    assert.equal(agent.description, source.metadata.description);
    assert.deepEqual(agent.permissions.slice(-source.metadata.permissions.length), source.metadata.permissions);
    assert.equal(agent.model, undefined, 'Unconfigured models must still inherit the parent model');
  }
  // Replays must not accumulate permission rules or mutate captured definitions.
  assert.deepEqual(ctx.agent.entries(), agents);
  assert.deepEqual(ctx.skill.entries(), skills);
  await cleanup();
  await cleanup();
  assert.equal(ctx.agent.entries().size, 0);
  assert.equal(ctx.skill.entries().size, 0);
});

test('already registered native definitions are untouched and survive plugin cleanup', async () => {
  const agent = {
    ...Agent.Info.default(Agent.ID.make('bibleskills/task-critic')),
    system: 'Custom complete agent', mode: 'subagent',
    permissions: [{ action: '*', resource: '*', effect: 'deny' }],
  };
  const skill = { id: 'get-task', name: 'Custom', path: path.join(repositoryRoot, 'custom.md'), content: 'Custom skill', autoinvoke: false };
  const ctx = { agent: registry('agent', [agent]), skill: registry('skill', [skill]) };
  const cleanup = await plugin.setup(ctx);
  assert.deepEqual(ctx.agent.entries().get(agent.id), agent);
  assert.deepEqual(ctx.skill.entries().get(skill.id), skill);
  await cleanup();
  assert.deepEqual([...ctx.agent.entries().values()], [agent]);
  assert.deepEqual([...ctx.skill.entries().values()], [skill]);
});

test('failed skill registration disposes the already registered agents', async () => {
  const agent = registry('agent');
  const failure = new Error('Registration rejected');
  await assert.rejects(plugin.setup({ agent, skill: { transform: async () => { throw failure; } } }), (error) => error === failure);
  assert.equal(agent.entries().size, 0);
});

test('skill paths retain the shared references and private supporting files', async () => {
  const ctx = { agent: registry('agent'), skill: registry('skill') };
  const cleanup = await plugin.setup(ctx);
  try {
    const implement = ctx.skill.entries().get('implement');
    assert.match(await readFile(path.resolve(path.dirname(implement.path), '../../../docs/verification.md'), 'utf8'), /Verification before/);
    const grilling = ctx.skill.entries().get('grilling');
    assert.match(await readFile(grilling.path, 'utf8'), /question/);
    const diagnostics = ctx.skill.entries().get('diagnosing-bugs');
    assert.match(await readFile(path.resolve(path.dirname(diagnostics.path), 'scripts/hitl-loop.template.sh'), 'utf8'), /bash/);
  } finally {
    await cleanup();
  }
});
