# Testing and validation

## Automated rule tests
The deterministic rules and the Notion payload are tested without n8n, Notion or a model. The tests load the JavaScript directly from the Code nodes in `workflow/ai-usecase-classifier.json`, so they test the workflow you import, not a copy of it.

```bash
node --test    # Node 22+
```

| File | Covers |
|---|---|
| `tests/rules.test.mjs` | The three smoke cases below, the tier floor for each high-risk domain, the human-oversight override, third-party and sensitive-data additions, status routing, Annex A mapping, malformed or fenced model output, a prompt-injection attempt, and the Notion properties, traceability fields and 2,000-character limit |
| `tests/workflow.test.mjs` | Node connections, pipeline order, no committed credentials or database IDs, prompt guardrails |

Model output is supplied by the test, so these tests prove the rules behave as documented in [GOVERNANCE.md](GOVERNANCE.md). They do not measure classification accuracy; for that, use the validation method below. The tests run in GitHub Actions on every push.

## Smoke tests
Submit each case in [tests/test-cases.md](../tests/test-cases.md). Expected results:

| # | Case | Expected tier | Expected status | What it proves |
|---|---|---|---|---|
| 1 | Meeting notes summarizer | minimal | CLASSIFIED | Low-risk path doesn't over-flag |
| 2 | Loan FAQ chatbot | limited | NEEDS_REVIEW (no-human-in-loop override) | Credit domain alone doesn't force `high`; oversight rule fires |
| 3 | Loan pre-approval scoring | high | NEEDS_REVIEW | High-risk path; override would fire if the model under-tiered |

Run each case **twice**. Tier should match across runs; wording of risks may differ.

## Validation before production use
Three cases prove the plumbing, not accuracy. Before relying on it:

1. **Build a labeled set** of 20–30 realistic use cases across all tiers and domains — include ambiguous and adversarial ones (e.g., a description that tries to instruct the model). Use [tests/validation-template.csv](../tests/validation-template.csv).
2. **Label independently**: a qualified reviewer assigns the expected tier *before* seeing the output.
3. **Run and compare**: record classifier tier, status, overrides.
4. **Measure**: tier agreement rate; **under-tiering count** (the costly error); parse failures.
5. **Decide acceptance criteria up front**, e.g., zero under-tiered high-risk cases, ≥ 85% agreement, ≤ 1 parse failure.
6. **Keep the evidence**: the labeled set, results, model, and `PROMPT_VERSION` — this is your validation record.

## Regression
Re-run the validation set whenever you change the **model**, the **prompt** (bump `PROMPT_VERSION`), or the **rules**.

## Ongoing monitoring
In Notion, filter `Review Decision = Reclassified`. A rising reclassification rate means drift in either the model or the intake population.
