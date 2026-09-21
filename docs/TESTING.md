# Testing and validation

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
