// Runs the Code-node JavaScript straight from the shipped workflow JSON,
// with n8n's $, $input and $execution replaced by small stubs.
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
export const workflow = JSON.parse(readFileSync(new URL('workflow/ai-usecase-classifier.json', root), 'utf8'));
export const schema = JSON.parse(readFileSync(new URL('notion/register_schema.json', root), 'utf8'));

export function nodeCode(name) {
  const node = workflow.nodes.find(n => n.name === name);
  if (!node) throw new Error(`node not found: ${name}`);
  return node.parameters.jsCode;
}

function run(code, { upstream = {}, input, executionId = 'test-exec-1' }) {
  const $ = name => {
    if (!(name in upstream)) throw new Error(`unexpected $('${name}')`);
    return { first: () => ({ json: upstream[name] }) };
  };
  const $input = { item: { json: input }, first: () => ({ json: input }) };
  const $execution = { id: executionId };
  return new Function('$', '$input', '$execution', code)($, $input, $execution);
}

// intake: form answers; llm: object (serialized as the model's reply) or raw string
export function applyRules(intake, llm) {
  const text = typeof llm === 'string' ? llm : JSON.stringify(llm);
  return run(nodeCode('Validate & Apply Rules'), {
    upstream: { 'AI Intake Form': intake },
    input: { text },
  }).json;
}

export function buildEntry(rulesOutput, rawText = '') {
  return run(nodeCode('Build Register Entry'), {
    upstream: { 'Classify Use Case': { text: rawText } },
    input: rulesOutput,
  })[0].json.notionBody;
}
