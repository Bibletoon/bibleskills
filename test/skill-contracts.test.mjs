import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { listFiles, readMarkdown, repositoryRoot } from '../scripts/bundle.mjs';

const skillsDirectory = path.join(repositoryRoot, '.opencode', 'skills');
const skill = (id) => readMarkdown(path.join(skillsDirectory, id, 'SKILL.md'));

// These are instruction/metadata contract checks, not an LLM routing benchmark.
for (const id of ['get-task', 'diagnosing-bugs', 'research', 'codebase-design']) {
  test(`${id} advertises its use cases and selection boundary`, async () => {
    const { metadata } = await skill(id);
    assert.match(metadata.description, /Use (when|for)/);
    assert.match(metadata.description, /Not (for|a) /);
    assert.notEqual(metadata['disable-model-invocation'], true);
    assert.notEqual(metadata.metadata?.['opencode/autoinvoke'], false);
  });
}

test('the 12 remaining user-invoked skills retain supported visibility flags', async () => {
  const files = (await listFiles(skillsDirectory)).filter((file) => path.basename(file) === 'SKILL.md');
  const definitions = await Promise.all(files.map(readMarkdown));
  const hidden = definitions.filter(({ metadata }) => metadata['disable-model-invocation'] === true);
  assert.equal(hidden.length, 12);
  assert.ok(hidden.every(({ metadata }) => metadata.metadata?.['opencode/autoinvoke'] === undefined));
  const mechanics = await readFile(path.join(skillsDirectory, 'writing-for-agents', 'SKILL-MECHANICS.md'), 'utf8');
  assert.match(mechanics, /metadata\.opencode\/autoinvoke.*wins/);
  assert.match(mechanics, /not an access restriction/);
});

test('the grilling tool example asks exactly one question with built-in free text', async () => {
  const { body } = await skill('grilling');
  const example = body.match(/```json\r?\n([\s\S]*?)```/);
  assert.ok(example, 'Missing interactive question example');
  const input = JSON.parse(example[1]);
  assert.equal(input.questions.length, 1);
  const question = input.questions[0];
  assert.ok(question.header.length <= 30);
  assert.equal(typeof question.question, 'string');
  assert.equal(question.multiple, false);
  assert.ok(question.options.length >= 2);
  assert.match(question.options[0].label, /\(Recommended\)$/);
  assert.ok(question.options.every((option) => typeof option.description === 'string'));
  assert.ok(question.options.every((option) => !/your own|free.text/i.test(option.label)));
});

test('task and review tracker readers use the same alias-independent access contract', async () => {
  const callers = [
    (await skill('get-task')).body,
    (await skill('review-branch')).body,
    (await readMarkdown(path.join(repositoryRoot, '.opencode', 'agents', 'bibleskills', 'task-builder.md'))).text,
  ];
  for (const text of callers) {
    assert.match(text, /tracker-access\.md/);
    assert.doesNotMatch(text, /\bjit\b|jira_get_issue/);
  }
  const contract = await readFile(path.join(repositoryRoot, 'docs', 'tracker-access.md'), 'utf8');
  assert.match(contract, /actual input schemas/);
  assert.match(contract, /execute/);
  assert.match(contract, /User-supplied text\/export/);
  assert.match(contract, /not a semantic read-only filter/);
});

test('unified preparation requires intent, not the presence or absence of a tracker key', async () => {
  const get = (await skill('get-task')).body;
  assert.match(get, /Selection requires a specification-preparation request/);
  assert.match(get, /plain description/);
  assert.match(get, /local durable ticket/);
  assert.match(get, /no key is required/);
  assert.match(get, /cold `task-critic` review/);
  assert.match(get, /not automatic execution/);
  const router = (await skill('which-skill')).body;
  assert.match(router, /requested result/);
  assert.match(router, /key alone does not start task preparation/);
});

test('the approved skill set removes only merged/retired workflows and adds no verification entry point', async () => {
  const files = (await listFiles(skillsDirectory)).filter((file) => path.basename(file) === 'SKILL.md');
  const ids = files.map((file) => path.basename(path.dirname(file))).sort();
  assert.deepEqual(ids, [
    'ai-slop-cleaner', 'codebase-design', 'diagnosing-bugs', 'domain-modeling',
    'get-task', 'grill-with-docs', 'grilling', 'handoff', 'implement',
    'improve-codebase-architecture', 'prototype', 'research', 'retro',
    'review-branch', 'review-diff', 'teach', 'to-questionnaire', 'to-tickets',
    'wait-what', 'wayfinder', 'which-skill', 'writing-for-agents',
  ].sort());
  const maintained = [
    ...files,
    ...await listFiles(path.join(repositoryRoot, '.opencode', 'agents')),
    ...await listFiles(path.join(repositoryRoot, 'docs')),
    path.join(repositoryRoot, 'README.md'),
  ].filter((file) => file.endsWith('.md'));
  for (const file of maintained) {
    assert.doesNotMatch(await readFile(file, 'utf8'), /\b(?:create-task|to-jira|to-spec|implement-spec|verify-problem|get-ticket)\b/, file);
  }
});

test('durable drafts and local specifications have distinct authoritative templates', async () => {
  const local = await readFile(path.join(repositoryRoot, 'docs', 'ai-ready-task.md'), 'utf8');
  const durable = await readFile(path.join(repositoryRoot, 'docs', 'durable-ticket.md'), 'utf8');
  const localTemplate = local.match(/<task-template>([\s\S]*?)<\/task-template>/)?.[1];
  const durableTemplate = durable.match(/<durable-ticket-template>([\s\S]*?)<\/durable-ticket-template>/)?.[1];
  assert.ok(localTemplate);
  assert.ok(durableTemplate);
  assert.deepEqual([...localTemplate.matchAll(/^## (.+)$/gm)].map((match) => match[1].trim()), [
    'Problem', 'Expected outcome', 'Known facts', 'Hypotheses', 'Constraints',
    'Non-goals', 'Source of truth', 'Required checks', 'Stop conditions',
  ]);
  assert.deepEqual([...durableTemplate.matchAll(/^\*\*(.+)\*\*$/gm)].map((match) => match[1]), [
    'Problem', 'Actions', 'Definition of done',
  ]);
  assert.doesNotMatch(durableTemplate, /Status|Blocked by|task\.md|Required checks/);
  assert.match(durable, /No source file paths, line numbers, private functions, implementation snippets/);
  assert.match(durable, /Public API paths/);
  assert.match(durable, /exact summary titles/);
  assert.match(durable, /acyclic dependency graph/);
  assert.match(durable, /Publication is a separate explicit user request/);
});

test('ticket synthesis saves standalone drafts without preparing or dispatching implementation', async () => {
  const tickets = (await skill('to-tickets')).body;
  assert.match(tickets, /no formal starting document is required/);
  assert.match(tickets, /One small piece of work needs one ticket/);
  assert.match(tickets, /confirmed defect from a suspected cause/);
  assert.match(tickets, /issues\/<NN>-<slug>\.md/);
  assert.match(tickets, /Do not add local `ready`\/`claimed`\/`done` status or dispatch implementation/);
  assert.match(tickets, /does not publish to a tracker/);
  assert.doesNotMatch(tickets, /Every ticket is an.*AI-Ready|Tickets are executed right after/);
});

test('implementation pins its local specification and checks the state after cleanup/review fixes', async () => {
  const implement = (await skill('implement')).body;
  assert.match(implement, /one prepared local specification/i);
  assert.match(implement, /must first go through `get-task`/);
  assert.match(implement, /git rev-parse HEAD/);
  assert.match(implement, /pre-existing work separately/);
  assert.match(implement, /absolute local specification path/);
  const cleanup = implement.indexOf('### 4. Clean and review');
  const verify = implement.indexOf('### 5. Verify the final state');
  assert.ok(cleanup >= 0 && verify > cleanup);
  assert.match(implement.slice(verify), /After the last cleanup or review fix, freshly run/);
  assert.match(implement.slice(verify), /full test suite/);
  assert.match(implement, /does not update the durable ticket or its tracker status/);
});

test('review discovery prefers the local task and does not automatically execute durable drafts', async () => {
  const review = (await skill('review-diff')).body;
  assert.match(review, /captured baseline and explicit local specification path/);
  assert.match(review, /prepared local `task\.md`/);
  assert.match(review, /only when the user explicitly selects that behavioral brief/);
  const critic = (await readMarkdown(path.join(repositoryRoot, '.opencode', 'agents', 'bibleskills', 'task-critic.md'))).body;
  assert.match(critic, /Durable drafts under `issues\/` use a different contract/);
});

test('preparation and verification keep consent, uncertainty and no-fix boundaries', async () => {
  const flow = await readFile(path.join(repositoryRoot, 'docs', 'task-flow.md'), 'utf8');
  assert.match(flow, /Ask it and wait for the answer before doing anything else/);
  assert.match(flow, /If everything is settled, skip the interview/);
  assert.match(flow, /cold|fresh-eyes/);
  assert.match(flow, /Production code, durable source drafts and remote tracker issues remain unchanged/);
  const diagnosis = (await skill('diagnosing-bugs')).body;
  assert.match(diagnosis, /Stop before Phase 5 unless fixing is explicitly requested/);
  const router = (await skill('which-skill')).body;
  assert.match(router, /no formal artifact or dedicated verification skill is required/);
  assert.match(router, /confirmed \/ not confirmed \/ insufficient data/);
  assert.match(router, /verification-only request does not authorize fixes/);
  const verifier = (await readMarkdown(path.join(repositoryRoot, '.opencode', 'agents', 'bibleskills', 'local-verifier.md'))).body;
  assert.match(verifier, /never fix code, change tracker issues/);
  assert.match(verifier, /`confirmed` \/ `not confirmed` \/ `insufficient data`/);
  assert.match(verifier, /suspected cause stays a hypothesis/);
});
