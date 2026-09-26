import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { applyRules, buildEntry } from '../tests/harness.mjs';

const intake = {
  use_case: 'Loan pre-approval scoring',
  description: 'Score applicants for loan pre-approval using income, credit and identity data.',
  business_owner: 'Consumer Lending',
  domain: 'credit',
  data_types: ['PII', 'financial'],
  affects_individuals: 'Yes',
  model_source: 'in-house',
  user_facing: 'customer',
  human_in_loop: 'No',
  submittedAt: '2026-09-26T00:00:00Z',
};

const mockedLlmDraft = {
  eu_ai_act_tier: 'minimal',
  tier_rationale: 'The model incorrectly treats the recommendation as low impact.',
  nist_rmf_focus: [{ function: 'MAP', reason: 'Document the decision context and affected people.' }],
  control_themes: ['impact'],
  key_risks: ['Incorrect eligibility recommendation'],
  open_questions: ['What evidence supports the score?'],
  confidence: 'high',
};

const rulesOutput = applyRules(intake, mockedLlmDraft);
const notionRequestBody = buildEntry(rulesOutput, JSON.stringify(mockedLlmDraft));

const artifact = {
  artifact_type: 'deterministic_test_harness_sample',
  disclaimer: 'Synthetic evidence generated without a live model, n8n or Notion. This proves rule and payload behavior, not model accuracy.',
  regenerate: 'node scripts/generate-sample-run.mjs',
  intake,
  mocked_llm_draft: mockedLlmDraft,
  rules_output: rulesOutput,
  notion_request_body: notionRequestBody,
};

const output = fileURLToPath(new URL('../docs/sample-run.json', import.meta.url));
mkdirSync(fileURLToPath(new URL('../docs/', import.meta.url)), { recursive: true });
writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
console.log(`Wrote ${output}`);
