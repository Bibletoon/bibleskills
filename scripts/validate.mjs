import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { isMain, listFiles, readMarkdown, repositoryRoot } from './bundle.mjs';

export async function validate(root = repositoryRoot) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const skillFiles = (await listFiles(path.join(root, '.opencode', 'skills'))).filter((file) => path.basename(file) === 'SKILL.md');
  const agentFiles = await listFiles(path.join(root, '.opencode', 'agents', 'bibleskills'));
  const skills = new Set();
  for (const file of skillFiles) {
    const { metadata, body } = await readMarkdown(file);
    const id = path.basename(path.dirname(file));
    check(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) && id.length <= 64, `Invalid skill ID: ${id}`);
    check(!skills.has(id), `Duplicate skill ID: ${id}`);
    skills.add(id);
    check(metadata.name === id, `Skill name/directory mismatch: ${file}`);
    check(typeof metadata.description === 'string' && metadata.description.length > 0, `Missing description: ${file}`);
    check(body.trim().length > 0, `Empty skill: ${file}`);
    check(!('argument-hint' in metadata), `Unsupported skill argument-hint field: ${file}`);
    check(metadata['disable-model-invocation'] === undefined || typeof metadata['disable-model-invocation'] === 'boolean', `Invalid invocation flag: ${file}`);
  }
  const agents = new Set();
  for (const file of agentFiles) {
    const { metadata } = await readMarkdown(file);
    const id = `bibleskills/${path.basename(file, '.md')}`;
    agents.add(id);
    check(metadata.mode === 'subagent', `Missing subagent mode: ${file}`);
    check(typeof metadata.description === 'string' && metadata.description.length > 0, `Missing agent description: ${file}`);
    check(!('tools' in metadata) && !('name' in metadata), `Legacy agent frontmatter: ${file}`);
    check(Array.isArray(metadata.permissions), `Missing permission rules: ${file}`);
    for (const rule of metadata.permissions || []) {
      check(typeof rule.action === 'string' && typeof rule.resource === 'string' && ['allow', 'deny', 'ask'].includes(rule.effect), `Invalid permission rule: ${file}`);
    }
  }
  const markdownFiles = [
    ...await listFiles(path.join(root, '.opencode')),
    ...await listFiles(path.join(root, 'docs')),
    path.join(root, 'README.md'), path.join(root, 'AGENTS.md'),
  ].filter((file) => file.endsWith('.md'));
  const allFiles = new Set([
    ...await listFiles(path.join(root, '.opencode')),
    ...await listFiles(path.join(root, 'docs')),
    path.join(root, 'README.md'), path.join(root, 'AGENTS.md'), path.join(root, 'THIRD_PARTY_LICENSES.md'),
  ]);
  for (const file of markdownFiles) {
    const text = await readFile(file, 'utf8');
    check(!/CLAUDE_PLUGIN_ROOT|bibleskills:|AskUserQuestion|\.claude(?:\/|-plugin)|CLAUDE\.md|claude plugin/.test(text), `Legacy Claude integration in ${file}`);
    check(!/`\/bibleskills\//.test(text), `Use @skill instead of a removed slash command in ${file}`);
    for (const match of text.matchAll(/`\/([a-z0-9-]+)(?=[` \t])/g)) {
      check(!skills.has(match[1]), `Use @${match[1]} instead of a removed slash command in ${file}`);
    }
    for (const match of text.matchAll(/`(bibleskills\/[a-z][a-z-]+)`/g)) {
      check(agents.has(match[1]), `Unknown agent ${match[1]} in ${file}`);
    }
    // Template/example paths describe future project artifacts, not bundle files.
    const prose = text.replace(/```[^\n]*\n[\s\S]*?```/g, '').replace(/<([\w-]+-template)>[\s\S]*?<\/\1>/g, '');
    const links = [...prose.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
    const pointers = [...prose.matchAll(/`((?:\.\.\/)+[^`]+\.md)`/g)].map((match) => match[1]);
    for (const target of [...links, ...pointers]) {
      if (/^(?:https?:|mailto:|#)/.test(target) || /[<>*]/.test(target)) continue;
      const resolved = path.resolve(path.dirname(file), target.split('#')[0]);
      check(allFiles.has(resolved), `Broken bundled reference ${target} in ${file}`);
    }
  }
  return { errors, skills: skills.size, agents: agents.size };
}

if (isMain(import.meta.url)) {
  try {
    const result = await validate();
    if (result.errors.length) {
      console.error(result.errors.join('\n'));
      process.exitCode = 1;
    } else {
      console.log(`Validated ${result.skills} skills and ${result.agents} agents.`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
