import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { applyEdits, modify, parse, parseTree } from 'jsonc-parser';
import { isMain, listFiles, repositoryRoot } from './bundle.mjs';

const manifestName = 'bibleskills-install.json';
const digest = (text) => createHash('sha256').update(text).digest('hex');
const portable = (value) => value.replaceAll('\\', '/');

export function defaultConfigDirectory(env = process.env, home = homedir()) {
  return path.resolve(env.XDG_CONFIG_HOME || path.join(home, '.config'), 'opencode');
}

async function readOptional(file) {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

// Refuse links inside the installation tree before following or overwriting them.
async function checkDestination(root, file) {
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Outside config directory: ${file}`);
  let current = root;
  for (const part of ['', ...relative.split(path.sep).filter(Boolean)]) {
    current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error(`Refusing symlink destination: ${current}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

export function updateSkillSource(text, skillsPath, previousPath) {
  const errors = [];
  const config = parse(text || '{}', errors, { allowTrailingComma: true });
  if (errors.length || !config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('OpenCode config must be a valid JSON/JSONC object; no files were changed.');
  }
  if (config.skills !== undefined && (!Array.isArray(config.skills) || config.skills.some((item) => typeof item !== 'string'))) {
    throw new Error('Expected OpenCode V2 skills to be an array of strings; no files were changed.');
  }
  const skillProperties = parseTree(text || '{}').children.filter((property) => property.children[0].value === 'skills');
  if (skillProperties.length > 1) throw new Error('Duplicate skills keys in OpenCode config; no files were changed.');
  const samePath = (left, right) => {
    if (!right) return false;
    const normalize = (value) => process.platform === 'win32' ? portable(value).toLowerCase() : portable(value);
    return normalize(left) === normalize(right);
  };
  const skills = config.skills || [];
  const index = skills.findIndex((item) => samePath(item, skillsPath) || samePath(item, previousPath));
  if (index >= 0 && samePath(skills[index], skillsPath)) return text;
  // Change one array element or append one, retaining comments on existing sources.
  const jsonPath = config.skills === undefined ? ['skills'] : ['skills', index >= 0 ? index : skills.length];
  const value = config.skills === undefined ? [skillsPath] : skillsPath;
  return applyEdits(text || '{}\n', modify(text || '{}\n', jsonPath, value, {
    isArrayInsertion: config.skills !== undefined && index < 0,
    formattingOptions: { insertSpaces: true, tabSize: 2, eol: text.includes('\r\n') ? '\r\n' : '\n' },
  }));
}

async function backup(file, content) {
  const target = `${file}.bibleskills-backup-${randomUUID()}`;
  await writeFile(target, content, { flag: 'wx', mode: 0o600 });
  return target;
}

export async function install({ sourceRoot = repositoryRoot, configDirectory = defaultConfigDirectory(), force = false } = {}) {
  const source = await realpath(sourceRoot);
  const target = path.resolve(configDirectory);
  const skillsPath = portable(path.join(source, '.opencode', 'skills'));
  const manifestPath = path.join(target, manifestName);
  await checkDestination(target, manifestPath);
  const oldManifestText = await readOptional(manifestPath);
  const previous = oldManifestText ? JSON.parse(oldManifestText) : { files: {} };
  if (previous.schema !== undefined && previous.schema !== 1) throw new Error('Unsupported installer manifest version.');
  const files = {};
  const writes = [];
  const sourceDirectory = path.join(source, '.opencode', 'agents');
  for (const file of await listFiles(path.join(sourceDirectory, 'bibleskills'))) {
    const key = portable(path.join('agents', path.relative(sourceDirectory, file)));
    const destination = path.join(target, key);
    await checkDestination(target, destination);
    const content = await readFile(file, 'utf8');
    const existing = await readOptional(destination);
    const modified = existing !== undefined && existing !== content && digest(existing) !== previous.files?.[key];
    if (modified && !force) throw new Error(`Refusing to overwrite ${destination}. Back it up or rerun with --force.`);
    files[key] = digest(content);
    if (existing !== content) writes.push({ destination, content, existing, modified });
  }
  const removals = [];
  const warnings = [];
  for (const [key, hash] of Object.entries(previous.files || {})) {
    if (!/^commands\/bibleskills\/[a-z0-9-]+\.md$/.test(key)) continue;
    const destination = path.join(target, key);
    await checkDestination(target, destination);
    const existing = await readOptional(destination);
    if (existing === undefined) continue;
    if (digest(existing) === hash) removals.push(destination);
    else {
      warnings.push(`Kept locally edited command: ${destination}. Remove it manually if no longer needed.`);
    }
  }
  const skills = (await listFiles(path.join(source, '.opencode', 'skills'))).filter((file) => path.basename(file) === 'SKILL.md');
  if (!skills.length || !Object.keys(files).length) throw new Error('Source bundle is empty.');
  const packageInfo = JSON.parse(await readFile(path.join(source, 'package.json'), 'utf8'));

  // JSONC takes precedence if both files exist. Preserve every other setting and comment.
  const jsoncPath = path.join(target, 'opencode.jsonc');
  const jsonPath = path.join(target, 'opencode.json');
  await checkDestination(target, jsoncPath);
  await checkDestination(target, jsonPath);
  const jsonc = await readOptional(jsoncPath);
  const json = await readOptional(jsonPath);
  const configPath = jsonc !== undefined ? jsoncPath : json !== undefined ? jsonPath : jsoncPath;
  const originalConfig = jsonc ?? json;
  const initialConfig = originalConfig ?? '{\n  "$schema": "https://opencode.ai/config.json"\n}\n';
  const config = updateSkillSource(initialConfig, skillsPath, previous.skillsPath);
  const manifest = `${JSON.stringify({ schema: 1, version: packageInfo.version, skillsPath, files }, null, 2)}\n`;

  // All conflicts and config parse errors have been checked before the first write.
  await mkdir(target, { recursive: true });
  const backups = [];
  for (const item of writes) {
    await mkdir(path.dirname(item.destination), { recursive: true });
    if (item.modified) backups.push(await backup(item.destination, item.existing));
    await writeFile(item.destination, item.content);
  }
  for (const file of removals) await unlink(file);
  if (originalConfig !== config) {
    if (originalConfig !== undefined) backups.push(await backup(configPath, originalConfig));
    await writeFile(configPath, config, { mode: 0o600 });
  }
  if (manifest !== oldManifestText) await writeFile(manifestPath, manifest);
  return { configPath, skillsPath, fileCount: Object.keys(files).length, skillCount: skills.length, backups, removedCommands: removals.length, warnings };
}

if (isMain(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: {
      'config-dir': { type: 'string' },
      force: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    } });
    if (values.help) {
      console.log('Usage: npm run setup -- [--config-dir <OpenCode config directory>] [--force]');
    } else {
      const result = await install({ configDirectory: values['config-dir'] || defaultConfigDirectory(), force: values.force });
      console.log(`Registered ${result.skillCount} skills and installed ${result.fileCount} agents.\nConfig: ${result.configPath}\nKeep this checkout at: ${path.dirname(path.dirname(result.skillsPath))}\nRun /reload in OpenCode, then select @which-skill.`);
      for (const file of result.backups) console.log(`Backup: ${file}`);
      if (result.removedCommands) console.log(`Removed ${result.removedCommands} obsolete command wrappers.`);
      for (const warning of result.warnings) console.warn(warning);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
