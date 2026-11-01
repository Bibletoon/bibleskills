import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse } from 'jsonc-parser';
import { repositoryRoot } from '../scripts/bundle.mjs';
import { defaultConfigDirectory, install, updateSkillSource } from '../scripts/install.mjs';

async function sandbox(t) {
  const parent = path.join(tmpdir(), 'opencode');
  await mkdir(parent, { recursive: true });
  const directory = await mkdtemp(path.join(parent, 'bibleskills-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('config directory follows HOME/XDG rather than APPDATA', () => {
  const home = path.resolve('test-home');
  const xdg = path.resolve('custom-config');
  assert.equal(defaultConfigDirectory({}, home), path.join(home, '.config', 'opencode'));
  assert.equal(defaultConfigDirectory({ XDG_CONFIG_HOME: xdg, APPDATA: 'ignored' }, home), path.join(xdg, 'opencode'));
});

test('JSONC edit preserves comments, unrelated settings and other skill sources', () => {
  const input = '// keep me\n{\n  "model": "my/model",\n  "skills": ["other", "old"],\n  "mcp": {"servers": {}},\n}\n';
  const output = updateSkillSource(input, '/new/skills', 'old');
  assert.match(output, /\/\/ keep me/);
  assert.deepEqual(parse(output), { model: 'my/model', skills: ['other', '/new/skills'], mcp: { servers: {} } });
  assert.equal(updateSkillSource(output, '/new/skills', '/new/skills'), output);
});

test('updating an existing source preserves its precedence relative to other skills', () => {
  const input = '{"skills":["before","/old/skills","after"]}';
  const output = updateSkillSource(input, '/new/skills', '/old/skills');
  assert.deepEqual(parse(output).skills, ['before', '/new/skills', 'after']);
  assert.equal(updateSkillSource(output, '/new/skills', '/new/skills'), output);
});

test('comments inside the skills array survive both append and relocation', () => {
  const input = '{\n  "skills": [\n    // team sources\n    "before",\n    // my bundle\n    "/old/skills",\n    "after" // final override\n  ]\n}';
  const moved = updateSkillSource(input, '/new/skills', '/old/skills');
  const appended = updateSkillSource(input, '/additional/skills');
  for (const output of [moved, appended]) {
    assert.match(output, /\/\/ team sources/);
    assert.match(output, /\/\/ my bundle/);
    assert.match(output, /\/\/ final override/);
  }
  assert.deepEqual(parse(moved).skills, ['before', '/new/skills', 'after']);
  assert.deepEqual(parse(appended).skills, ['before', '/old/skills', 'after', '/additional/skills']);
});

test('ambiguous duplicate skills keys are rejected rather than editing the wrong one', () => {
  assert.throws(() => updateSkillSource('{"skills":[],"skills":[]}', '/new/skills'), /Duplicate skills keys/);
});

test('fresh installation is absolute, complete and idempotent in paths with spaces and Unicode', async (t) => {
  const directory = await sandbox(t);
  const configDirectory = path.join(directory, 'OpenCode настройки');
  const first = await install({ configDirectory });
  assert.equal(first.skillCount, 22);
  assert.equal(first.fileCount, 6);
  assert.equal(first.backups.length, 0);
  assert.ok(path.isAbsolute(first.skillsPath));
  const configBefore = await readFile(first.configPath, 'utf8');
  assert.deepEqual(parse(configBefore).skills, [first.skillsPath]);
  assert.equal(parse(configBefore).$schema, 'https://opencode.ai/config.json');
  assert.equal((await readdir(path.join(configDirectory, 'agents', 'bibleskills'))).length, 6);
  assert.ok(!(await readdir(configDirectory)).includes('commands'));
  assert.equal(await readFile(path.join(configDirectory, 'agents', 'bibleskills', 'task-critic.md'), 'utf8'),
    await readFile(path.join(repositoryRoot, '.opencode', 'agents', 'bibleskills', 'task-critic.md'), 'utf8'));
  // Skills remain attached to the checkout, keeping ../../../docs references valid.
  assert.match(await readFile(path.resolve(first.skillsPath, 'implement', '../../../docs/verification.md'), 'utf8'), /Verification before/);
  assert.ok(!(await readdir(configDirectory)).includes('AGENTS.md'));
  const second = await install({ configDirectory });
  assert.equal(second.backups.length, 0);
  assert.equal(await readFile(first.configPath, 'utf8'), configBefore);
});

test('installer preserves an existing JSON config and backs it up once', async (t) => {
  const configDirectory = await sandbox(t);
  const configPath = path.join(configDirectory, 'opencode.json');
  const original = '{"model":"my/model","skills":["another-source"],"permissions":[{"action":"shell","resource":"*","effect":"ask"}]}\n';
  await writeFile(configPath, original);
  const result = await install({ configDirectory });
  assert.equal(result.configPath, configPath);
  assert.equal(result.backups.length, 1);
  assert.equal(await readFile(result.backups[0], 'utf8'), original);
  const config = parse(await readFile(configPath, 'utf8'));
  assert.equal(config.model, 'my/model');
  assert.equal(config.skills[0], 'another-source');
  assert.deepEqual(config.permissions, parse(original).permissions);
});

test('JSONC wins when both config files exist, without touching JSON', async (t) => {
  const configDirectory = await sandbox(t);
  await writeFile(path.join(configDirectory, 'opencode.json'), '{"model":"base"}');
  await writeFile(path.join(configDirectory, 'opencode.jsonc'), '// comment\n{"skills":["other"]}');
  const result = await install({ configDirectory });
  assert.ok(result.configPath.endsWith('.jsonc'));
  assert.match(await readFile(result.configPath, 'utf8'), /\/\/ comment/);
  assert.equal(await readFile(path.join(configDirectory, 'opencode.json'), 'utf8'), '{"model":"base"}');
});

test('malformed or legacy-shaped config causes no agent writes', async (t) => {
  for (const text of ['{ broken', '{"skills":{"paths":[]}}', '[]', '{"skills":[12]}']) {
    const configDirectory = await sandbox(t);
    await writeFile(path.join(configDirectory, 'opencode.jsonc'), text);
    await assert.rejects(install({ configDirectory }), /config must be|array of strings/);
    assert.deepEqual(await readdir(configDirectory), ['opencode.jsonc']);
    assert.equal(await readFile(path.join(configDirectory, 'opencode.jsonc'), 'utf8'), text);
  }
});

test('conflicting files are preserved; explicit force creates backups', async (t) => {
  const configDirectory = await sandbox(t);
  const file = path.join(configDirectory, 'agents', 'bibleskills', 'task-critic.md');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, 'user content');
  await assert.rejects(install({ configDirectory }), /Refusing to overwrite/);
  assert.equal(await readFile(file, 'utf8'), 'user content');
  assert.deepEqual(await readdir(configDirectory), ['agents']);
  const result = await install({ configDirectory, force: true });
  assert.equal(result.backups.length, 1);
  assert.equal(await readFile(result.backups[0], 'utf8'), 'user content');
});

test('edits to previously installed managed files are not silently overwritten', async (t) => {
  const configDirectory = await sandbox(t);
  await install({ configDirectory });
  const file = path.join(configDirectory, 'agents', 'bibleskills', 'task-critic.md');
  await writeFile(file, 'local agent edit');
  await assert.rejects(install({ configDirectory }), /Refusing to overwrite/);
  assert.equal(await readFile(file, 'utf8'), 'local agent edit');
});

test('upgrade removes only unchanged legacy commands recorded in the installer manifest', async (t) => {
  const configDirectory = await sandbox(t);
  await install({ configDirectory });
  const manifestPath = path.join(configDirectory, 'bibleskills-install.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const directory = path.join(configDirectory, 'commands', 'bibleskills');
  await mkdir(directory, { recursive: true });
  const original = 'old generated command';
  const hash = createHash('sha256').update(original).digest('hex');
  await writeFile(path.join(directory, 'implement.md'), original);
  await writeFile(path.join(directory, 'which-skill.md'), 'user edit');
  await writeFile(path.join(directory, 'personal.md'), 'unmanaged command');
  manifest.files['commands/bibleskills/implement.md'] = hash;
  manifest.files['commands/bibleskills/which-skill.md'] = hash;
  // Unexpected manifest paths must never authorize deletion outside the old wrappers.
  manifest.files['commands/bibleskills/../../personal.md'] = hash;
  await writeFile(manifestPath, JSON.stringify(manifest));
  const result = await install({ configDirectory, force: true });
  assert.equal(result.removedCommands, 1);
  assert.equal(result.fileCount, 6);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /which-skill.md/);
  assert.deepEqual((await readdir(directory)).sort(), ['personal.md', 'which-skill.md']);
  assert.equal(await readFile(path.join(directory, 'which-skill.md'), 'utf8'), 'user edit');
  const updated = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.ok(Object.keys(updated.files).every((key) => key.startsWith('agents/')));
});

test('moving a checkout replaces only its previously managed skills entry', async (t) => {
  const configDirectory = await sandbox(t);
  const result = await install({ configDirectory });
  const manifestPath = path.join(configDirectory, 'bibleskills-install.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.skillsPath = '/previous/checkout/.opencode/skills';
  await writeFile(manifestPath, JSON.stringify(manifest));
  await writeFile(result.configPath, JSON.stringify({ skills: ['keep-this', manifest.skillsPath] }));
  await install({ configDirectory });
  assert.deepEqual(parse(await readFile(result.configPath, 'utf8')).skills, ['keep-this', result.skillsPath]);
});

test('installer refuses directory links inside its destination', async (t) => {
  const directory = await sandbox(t);
  const configDirectory = path.join(directory, 'config');
  const elsewhere = path.join(directory, 'elsewhere');
  await mkdir(elsewhere);
  await mkdir(path.join(configDirectory, 'agents'), { recursive: true });
  try {
    await symlink(elsewhere, path.join(configDirectory, 'agents', 'bibleskills'), 'junction');
  } catch (error) {
    if (error.code === 'EPERM') return t.skip('Host does not permit directory links');
    throw error;
  }
  await assert.rejects(install({ configDirectory, force: true }), /Refusing symlink/);
  assert.deepEqual(await readdir(elsewhere), []);
});

test('CLI works from outside the checkout and does not depend on host-shell syntax', async (t) => {
  const directory = await sandbox(t);
  const configDirectory = path.join(directory, 'custom config');
  const output = execFileSync(process.execPath, [path.join(repositoryRoot, 'scripts', 'install.mjs'), '--config-dir', configDirectory], {
    cwd: directory, encoding: 'utf8',
  });
  assert.match(output, /Registered 22 skills/);
  assert.equal(parse(await readFile(path.join(configDirectory, 'opencode.jsonc'), 'utf8')).skills.length, 1);
});
