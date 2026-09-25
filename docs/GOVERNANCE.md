# Governance logic

## Processing order
1. **LLM draft** — tier, rationale, NIST AI RMF focus, control themes (restricted to a fixed list), risks, open questions, confidence.
2. **Validation** — unparseable output or an invalid tier → `NEEDS_REVIEW` with the raw output preserved.
3. **Overrides** — rules that change the tier or force review.
4. **Additions** — rules that add control themes without forcing review.
5. **Status** — `NEEDS_REVIEW` if any override fired, confidence is `low`, or tier is `high`/`prohibited`; otherwise `CLASSIFIED`.

## Rules

| Type | Condition (form answers) | Effect |
|---|---|---|
| Override | `affects_individuals = Yes` **and** domain ∈ credit, employment, insurance, healthcare | Tier raised to at least `high` |
| Override | `human_in_loop = No` | Adds `human_oversight`; forces review |
| Addition | `model_source` ∈ vendor SaaS, GenAI API | Adds `third_party` |
| Addition | `data_types` includes PII, PHI, or financial | Adds `data` |
| Status | tier `high`/`prohibited`, any override, or low confidence | `NEEDS_REVIEW` |

Rules can **raise** severity and **add** controls; they never lower what the model returned.

## Framework mapping (simplified)

### EU AI Act tiers
| Tier | Triage meaning used here |
|---|---|
| prohibited | Practices banned outright (Art. 5) |
| high | Annex III-type uses, e.g., creditworthiness, employment decisions, life/health insurance pricing, access to essential services |
| limited | Transparency obligations, e.g., chatbots interacting with people, AI-generated content |
| minimal | Everything else |

The `HIGH_DOMAINS` list is a **proxy**, not Annex III in full. Annex III contains more categories and exceptions (e.g., fraud detection in credit is treated differently). Extend the list for your context.

### ISO/IEC 42001:2023 Annex A (control themes)
| Theme | Annex A | Objective area |
|---|---|---|
| impact | A.5 | Assessing impacts of AI systems |
| lifecycle | A.6 | AI system life cycle |
| data | A.7 | Data for AI systems |
| transparency | A.8 | Information for interested parties |
| human_oversight | A.9 | Use of AI systems |
| third_party | A.10 | Third-party and customer relationships |

A.2–A.4 (policies, internal organization, resources) are organization-level and not assessed per use case.

### NIST AI RMF 1.0
The model names the core functions (GOVERN, MAP, MEASURE, MANAGE) needing the most attention. Treat this as a prompt for the reviewer, not a completed assessment.

## Where this fits in an AI management system
- **Inventory:** every submission becomes a register entry (ISO 42001 A.5/A.6; NIST AI RMF MAP).
- **Triage, not assessment:** high-risk entries still need a full AI impact assessment.
- **Human oversight of the tool itself:** the classifier is an AI system too. Validate it, version its prompt, and monitor reviewer overrides (see [TESTING.md](TESTING.md)).

## Known limitations
- The automated tests prove the rules behave as documented; the three smoke cases prove the pipeline. Neither measures classification accuracy. Validate before production use.
- Small models under-report domain-specific risks (e.g., misstated loan terms as consumer-protection exposure). Add domain hints to the prompt's CONTEXT or use a stronger model.
- Intake quality limits output quality: "no customer data" is not "no personal data" (meeting transcripts contain employee PII). Consider stricter field wording.
- The Notion register is editable, so it is not tamper-evident. Keep n8n execution history and periodic exports as the secondary record.
