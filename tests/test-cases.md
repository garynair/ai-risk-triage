# Smoke test cases

## Test 1 — expected: minimal, CLASSIFIED
| Field | Value |
|---|---|
| use_case | Meeting notes summarizer |
| description | Summarizes internal Teams meeting transcripts into action items for project managers. No customer data. |
| business_owner | PMO |
| domain | internal_ops |
| data_types | none |
| affects_individuals | No |
| model_source | GenAI API |
| user_facing | internal |
| human_in_loop | Yes |

Note: `third_party` is added by rule (GenAI API). Arguably `data_types` should include PII (transcripts name employees) — a deliberate example of intake under-reporting.

## Test 2 — expected: limited, NEEDS_REVIEW
| Field | Value |
|---|---|
| use_case | Loan FAQ chatbot |
| description | Customer-facing chatbot on the website answering general questions about loan products. Does not make decisions or access accounts. |
| business_owner | Digital Banking |
| domain | credit |
| data_types | PII |
| affects_individuals | No |
| model_source | vendor SaaS |
| user_facing | customer |
| human_in_loop | No |

Expect overrides: `Rule: no human in loop`. The high-tier override must **not** fire (affects_individuals = No).

## Test 3 — expected: high, NEEDS_REVIEW
| Field | Value |
|---|---|
| use_case | Loan pre-approval scoring |
| description | Model scores applicants and automatically approves or declines personal loan pre-approvals. |
| business_owner | Consumer Lending |
| domain | credit |
| data_types | PII, financial |
| affects_individuals | Yes |
| model_source | in-house |
| user_facing | customer |
| human_in_loop | No |

Expect additions: `Rule: sensitive data declared`; `third_party` must **not** be added (in-house).
