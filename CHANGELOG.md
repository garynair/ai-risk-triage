# Changelog

## v1.1.0
- Fix: `human_in_loop = No` now always forces review. Previously, if the model had already chosen the `human_oversight` theme, no override was recorded and the entry could be marked `CLASSIFIED`.
- Automated tests (`node --test`) that run the rules and register-entry code directly from the workflow export, covering the three smoke cases, every rule, status routing, malformed model output and the Notion payload
- GitHub Actions runs the tests on every push and pull request

## v1.0.0
- Intake form → LLM triage → deterministic rules → Notion register
- Rules: Annex III-type tier floor, human-oversight override, third-party and sensitive-data control themes, review routing for high/prohibited/low-confidence
- Traceability: model, prompt version (`v1`), n8n execution ID, raw LLM output per entry
- Model-agnostic (Ollama default)
