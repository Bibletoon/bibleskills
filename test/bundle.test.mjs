import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { readMarkdown, repositoryRoot } from '../scripts/bundle.mjs';
import { validate } from '../scripts/validate.mjs';

// Model the documented last-match-wins rules; this is not a runtime sandbox test.
function matches(pattern, value) {
  if (pattern.endsWith(' *') && value === pattern.slice(0, -2)) return true;
  const expression = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*').replaceAll('?', '.');
  return new RegExp(`^${expression}$`).test(value);
}

function effect(rules, action, resource) {
  return rules.filter((rule) => matches(rule.action, action) && matches(rule.resource, resource)).at(-1)?.effect;
}

async function permissions(name) {
  const { metadata } = await readMarkdown(path.join(repositoryRoot, '.opencode', 'agents', 'bibleskills', `${name}.md`));
  return metadata.permissions;
}

test('the bundle has 22 skills and retains all six agents', async () => {
  const result = await validate();
  assert.deepEqual(result.errors, []);
  assert.equal(result.skills, 22);
  assert.equal(result.agents, 6);
});

test('task critic is file-inspection-only, including Code Mode and delegation', async () => {
  const rules = await permissions('task-critic');
  assert.equal(effect(rules, 'read', 'src/code.ts'), 'allow');
  assert.equal(effect(rules, 'edit', 'src/code.ts'), 'deny');
  assert.equal(effect(rules, 'shell', 'git diff'), 'deny');
  assert.equal(effect(rules, 'execute', '*'), 'deny');
  assert.equal(effect(rules, 'subagent', 'general'), 'deny');
  assert.equal(effect(rules, 'read', '.env'), 'ask');
});

for (const name of ['logic-reviewer', 'standards-reviewer', 'spec-reviewer']) {
  test(`${name} permits Git inspection, not editing or arbitrary execution`, async () => {
    const rules = await permissions(name);
    for (const command of ['git diff', 'git diff --no-ext-diff --no-textconv main', 'git show --no-ext-diff --no-textconv HEAD:src/file.ts', 'git log -Sremoved --oneline', 'git grep -n name HEAD', 'git blame HEAD -- src/file.ts']) {
      assert.equal(effect(rules, 'shell', command), 'allow', command);
    }
    for (const command of ['git reset --hard', 'git checkout main', 'git push', 'node change.mjs', 'git diff --output=file', 'git show --ext-diff HEAD', 'git log --textconv -p', 'git grep --open-files-in-pager=sh name']) {
      assert.equal(effect(rules, 'shell', command), 'deny', command);
    }
    assert.equal(effect(rules, 'edit', 'src/file.ts'), 'deny');
    assert.equal(effect(rules, 'execute', '*'), 'deny');
    assert.equal(effect(rules, 'subagent', 'general'), 'deny');
  });
}

test('task builder asks before MCP calls under any alias and limits native writes', async () => {
  const rules = await permissions('task-builder');
  assert.equal(effect(rules, 'execute', '*'), 'allow');
  for (const action of ['jira-cloud_getJiraIssue', 'my-tracker_read_issue', 'company-jira_fetchComments']) {
    assert.equal(effect(rules, action, '*'), 'ask', action);
  }
  // Generic discovery does not silently authorize even apparently read-only tools,
  // and the permission pattern is not a semantic mutation filter.
  assert.equal(effect(rules, 'my-tracker_update_issue', '*'), 'ask');
  assert.equal(effect(rules, 'opencode_list_mcp_resources', 'company-jira'), 'allow');
  assert.equal(effect(rules, 'opencode_read_mcp_resource', 'company-jira:issue/PROJ-123'), 'ask');
  assert.equal(effect(rules, 'edit', '.agent-docs/work/PROJ-123/task.md'), 'allow');
  assert.equal(effect(rules, 'edit', 'C:/repo/.agent-docs/work/PROJ-123/task.md'), 'allow');
  assert.equal(effect(rules, 'edit', 'src/file.ts'), 'deny');
  assert.equal(effect(rules, 'shell', 'git reset --hard'), 'deny');
  assert.equal(effect(rules, 'subagent', 'general'), 'deny');
  assert.equal(effect(rules, 'experimental_image_generate', 'any/image-model'), 'deny');
  assert.equal(effect(rules, 'external_directory', 'C:/reference/*'), 'allow');
});

test('local verifier asks before shell execution and has no editing tools', async () => {
  const rules = await permissions('local-verifier');
  assert.equal(effect(rules, 'shell', 'npm run dev'), 'ask');
  assert.equal(effect(rules, 'edit', 'src/file.ts'), 'deny');
  assert.equal(effect(rules, 'subagent', 'general'), 'deny');
});
