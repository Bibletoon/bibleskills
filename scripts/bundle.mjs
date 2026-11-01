import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDocument } from 'yaml';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

export function isMain(url) {
  return process.argv[1] && url === pathToFileURL(path.resolve(process.argv[1])).href;
}

export async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in bundle: ${target}`);
    if (entry.isDirectory()) files.push(...await listFiles(target));
    else if (entry.isFile()) files.push(target);
  }
  return files.sort();
}

export async function readMarkdown(file) {
  const text = await readFile(file, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error(`Missing frontmatter: ${file}`);
  const document = parseDocument(match[1]);
  if (document.errors.length) throw new Error(`Invalid YAML in ${file}: ${document.errors[0].message}`);
  const metadata = document.toJS();
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new Error(`Frontmatter must be a mapping: ${file}`);
  }
  return { metadata, body: text.slice(match[0].length), text };
}
