import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { repositoryRoot } from '../scripts/bundle.mjs';

test('published tarball installs and loads outside the checkout with all bundled assets', { timeout: 120_000 }, async (t) => {
  const parent = path.join(tmpdir(), 'opencode');
  await mkdir(parent, { recursive: true });
  const directory = await mkdtemp(path.join(parent, 'bibleskills-package-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  assert.ok(process.env.npm_execpath, 'Run this package test through npm test or npm run check');
  const npm = (args, cwd) => execFileSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd, encoding: 'utf8', timeout: 90_000, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const [packed] = JSON.parse(npm(['pack', '--json', '--ignore-scripts', '--pack-destination', directory], repositoryRoot));
  assert.equal(packed.name, '@bibletoon/bibleskills');
  const files = packed.files.map((entry) => entry.path);
  assert.ok(files.includes('src/index.mjs'));
  assert.ok(files.includes('scripts/bundle.mjs'));
  assert.ok(files.includes('THIRD_PARTY_LICENSES.md'));
  assert.ok(files.includes('LICENSE'));
  assert.equal(files.filter((file) => /\/SKILL\.md$/.test(file)).length, 22);
  assert.equal(files.filter((file) => file.startsWith('.opencode/agents/')).length, 6);
  assert.ok(files.includes('docs/durable-ticket.md'));
  assert.ok(files.includes('.opencode/skills/diagnosing-bugs/scripts/hitl-loop.template.sh'));
  assert.ok(files.every((file) => !/^(?:test\/|node_modules\/|AGENTS\.md$|\.github\/|\.agent-docs\/|\.claude)/.test(file)));
  const consumer = path.join(directory, 'consumer with spaces');
  await mkdir(consumer);
  await writeFile(path.join(consumer, 'package.json'), '{"private":true,"type":"module"}\n');
  // Prefer npm ci's cache, but allow missing registry metadata on a cold CI cache.
  npm(['install', '--prefer-offline', '--ignore-scripts', '--no-audit', '--no-fund', path.join(directory, packed.filename)], consumer);
  const script = `
    import assert from 'node:assert/strict';
    import { readFile } from 'node:fs/promises';
    import path from 'node:path';
    import plugin from '@bibletoon/bibleskills';
    const agents = new Map();
    const skills = new Map();
    const cleanup = await plugin.setup({
      agent: { transform: async (run) => {
        run({ get: (id) => agents.get(id), update: (id, change) => {
          const agent = { id, permissions: [] };
          change(agent);
          agents.set(id, agent);
        } });
        return { dispose: async () => agents.clear() };
      } },
      skill: { transform: async (run) => {
        run({ get: (id) => skills.get(id), add: (skill) => skills.set(skill.id, skill) });
        return { dispose: async () => skills.clear() };
      } },
    });
    assert.equal(agents.size, 6);
    assert.equal(skills.size, 22);
    assert.equal(skills.get('implement').autoinvoke, false);
    for (const skill of skills.values()) {
      assert.ok(skill.path.includes('node_modules'));
      await readFile(skill.path);
    }
    const base = path.dirname(skills.get('implement').path);
    await readFile(path.resolve(base, '../../../docs/verification.md'));
    assert.ok(agents.get('bibleskills/task-critic').permissions.some((rule) => rule.action === '*' && rule.effect === 'deny'));
    await cleanup();
    console.log('Packed plugin loaded: 22 skills, 6 agents; references readable.');
  `;
  await writeFile(path.join(consumer, 'smoke.mjs'), script);
  const output = execFileSync(process.execPath, ['smoke.mjs'], { cwd: consumer, encoding: 'utf8', timeout: 30_000 });
  assert.match(output, /Packed plugin loaded: 22 skills, 6 agents/);
  const metadata = JSON.parse(await readFile(path.join(consumer, 'node_modules', '@bibletoon', 'bibleskills', 'package.json'), 'utf8'));
  assert.equal(metadata.private, undefined);
  assert.equal(metadata.publishConfig.access, 'public');
  assert.equal(metadata.license, 'MIT');
  const installed = path.join(consumer, 'node_modules', '@bibletoon', 'bibleskills');
  assert.equal(await readFile(path.join(installed, 'LICENSE'), 'utf8'), await readFile(path.join(repositoryRoot, 'LICENSE'), 'utf8'));
  const notices = await readFile(path.join(installed, 'THIRD_PARTY_LICENSES.md'), 'utf8');
  assert.match(notices, /Copyright \(c\) 2026 Matt Pocock/);
  assert.match(notices, /Copyright \(c\) 2025 Yeachan Heo/);
  assert.equal(metadata.scripts.postinstall, undefined);
  assert.equal(metadata.bin, undefined, 'The chosen distribution is a plugin, not an npx installer');
});
