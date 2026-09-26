# Reproducible sample run

This sample shows the deterministic governance layer correcting an unsafe model draft. It is generated from the JavaScript embedded in the shipped n8n workflow export.

## Evidence boundary

The sample uses a synthetic intake and mocked LLM output. It does not call a live model, n8n or Notion, and it is not classification-accuracy evidence. It proves that the published rules and register-entry builder behave as documented.

## Scenario

| Stage | Result |
|---|---|
| Intake | Loan pre-approval scoring using PII and financial data, affecting individuals, with no human in the loop |
| Mocked LLM draft | Incorrectly assigns `minimal` risk with `high` confidence |
| Deterministic tier rule | Raises the tier to `high` because this is an individual-impacting credit decision |
| Oversight rule | Adds `human_oversight` and forces review |
| Data rule | Adds the `data` control theme |
| Final status | `NEEDS_REVIEW` |

The complete generated artifact includes the intake, mocked model draft, rules output and Notion request body: [sample-run.json](sample-run.json).

## Regenerate

From the repository root, using Node.js 22 or later:

```bash
node scripts/generate-sample-run.mjs
node --test
```

The first command overwrites `docs/sample-run.json` deterministically. The second reruns the complete automated test suite.

## What this does not prove

- Accuracy of any live model
- Correctness for every EU AI Act scenario or exception
- Production readiness of an n8n or Notion deployment
- Legal or compliance adequacy of an individual classification

Use the labeled-set method in [TESTING.md](TESTING.md) to create a model-specific validation record before production use.
