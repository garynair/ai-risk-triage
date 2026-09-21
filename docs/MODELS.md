# Choosing and connecting a model

The workflow uses n8n's **Basic LLM Chain**. Any chat-model sub-node can be attached to its **Model** input — the prompt, rules, and register stay the same.

## Options

| Provider | n8n node | Data leaves your machine? | Notes |
|---|---|---|---|
| **Ollama** (default in the workflow) | Ollama Chat Model | No | Free, private. Quality depends on model size and your hardware. |
| LM Studio / vLLM / other OpenAI-compatible servers | OpenAI Chat Model with a custom base URL (if your n8n version's OpenAI credential exposes one) | No (if self-hosted) | |
| OpenAI / Azure OpenAI | OpenAI / Azure OpenAI Chat Model | Yes | Set response format to JSON if offered |
| Anthropic | Anthropic Chat Model | Yes | |
| Google | Google Gemini Chat Model | Yes | |
| OpenRouter, Groq, Mistral, Bedrock | Matching chat model node | Yes | |

**Whichever you use:** temperature **0**, JSON output mode if available, and update `CLASSIFIER_MODEL` in *Build Register Entry* so the audit trail stays accurate.

## Swapping the model
1. Delete the **Chat Model (Ollama)** node.
2. Add your provider's chat model node; connect it to the **Model** input of **Classify Use Case**.
3. Create/select its credential, pick the model, set temperature 0.
4. Update `CLASSIFIER_MODEL`, bump `PROMPT_VERSION` if you also changed the prompt, and re-run the tests.

## Ollama notes

**n8n in Docker, Ollama on the host:** containers can't reach the host's `localhost`.
- Start n8n with `--add-host=host.docker.internal:host-gateway` (Linux/WSL native Docker; Docker Desktop provides it automatically).
- Make Ollama listen beyond loopback: `sudo systemctl edit ollama` →
  ```ini
  [Service]
  Environment="OLLAMA_HOST=0.0.0.0"
  ```
- Credential base URL: `http://host.docker.internal:11434`.
- Security: Ollama has no authentication — never expose port 11434 beyond your machine.

**Measure before choosing:**
```bash
ollama run <model> --verbose "Classify: customer chatbot for loan FAQs. Reply in 3 sentences."
ollama ps     # PROCESSOR column: GPU vs CPU split
```

Reference numbers from the author's test laptop (Quadro P1000 4 GB, 6 CPU cores) — **yours will differ**:

| Model | Placement | Output speed | Time per classification |
|---|---|---|---|
| llama3.2:3b | ~93% GPU | ~15.6 tok/s | ~25–30 s |
| qwen2.5:7b | 52/48 CPU/GPU split | ~1.8 tok/s | ~4 min |
| qwen2.5:7b | CPU only (`num_gpu 0`) | ~5.1 tok/s | ~1.5 min |

Lesson: on small GPUs a partial offload can be **slower than CPU-only**. Force CPU for a model with a Modelfile:
```bash
printf 'FROM qwen2.5:7b\nPARAMETER num_gpu 0\n' > Modelfile.cpu && ollama create qwen2.5-7b-cpu -f Modelfile.cpu
```

## Quality vs speed
- **Small models (≈3B):** tier decisions were stable in testing; control themes and risk wording vary between runs. The deterministic rules compensate for the most consequential misses.
- **Larger/cloud models:** richer risks and questions (e.g., domain-specific consumer-protection issues) at the cost of speed, money, or data residency.
- A practical hybrid: small local model for triage, escalate `NEEDS_REVIEW` cases to a stronger model — only if sending intake data externally is acceptable.
