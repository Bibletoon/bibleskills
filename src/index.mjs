import path from 'node:path';
import { Plugin } from '@opencode/plugin';
import { listFiles, readMarkdown, repositoryRoot } from '../scripts/bundle.mjs';

async function loadSkills() {
  const files = (await listFiles(path.join(repositoryRoot, '.opencode', 'skills')))
    .filter((file) => path.basename(file) === 'SKILL.md');
  return Promise.all(files.map(async (file) => {
    const { metadata, body } = await readMarkdown(file);
    return {
      id: path.basename(path.dirname(file)),
      name: metadata.name,
      description: metadata.description,
      autoinvoke: metadata.metadata?.['opencode/autoinvoke'] ?? metadata['disable-model-invocation'] !== true,
      path: file,
      content: body.trim(),
    };
  }));
}

async function loadAgents() {
  const directory = path.join(repositoryRoot, '.opencode', 'agents', 'bibleskills');
  return Promise.all((await listFiles(directory)).map(async (file) => {
    const { metadata, body } = await readMarkdown(file);
    return {
      id: `bibleskills/${path.basename(file, '.md')}`,
      definition: { ...metadata, system: body.trim() },
    };
  }));
}

export default Plugin.define({
  id: 'bibleskills',
  async setup(ctx) {
    // Load once; transforms are synchronous and may be replayed on fresh registries.
    const [skills, agents] = await Promise.all([loadSkills(), loadAgents()]);
    const registrations = [];
    const cleanup = async () => { await Promise.all(registrations.map((entry) => entry.dispose())); };
    try {
      registrations.push(await ctx.agent.transform((editor) => {
        for (const { id, definition } of agents) {
          // Native definitions, including local edits from the old installer, win.
          if (editor.get(id)) continue;
          // V2 AgentEditor.update creates missing agents with the host's defaults.
          editor.update(id, (agent) => {
            const { permissions, ...fields } = structuredClone(definition);
            Object.assign(agent, fields);
            agent.permissions.push(...permissions);
          });
        }
      }));
      registrations.push(await ctx.skill.transform((editor) => {
        for (const skill of skills) {
          if (!editor.get(skill.id)) editor.add(structuredClone(skill));
        }
      }));
    } catch (error) {
      try {
        await cleanup();
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], 'Plugin registration and cleanup failed.');
      }
      throw error;
    }
    return cleanup;
  },
});
