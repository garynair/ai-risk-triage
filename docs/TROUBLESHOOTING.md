# Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Form says "Problem submitting response" | Test listener stopped (workflow edited after opening the form) **or** a node failed | Check **Executions**. No new execution → click *Execute workflow* again and submit the new form. Failed execution → open the red node |
| n8n can't reach Ollama (`ECONNREFUSED`) | `localhost` inside the n8n container is the container itself | Use `http://host.docker.internal:11434`; add `--add-host=host.docker.internal:host-gateway`; set `OLLAMA_HOST=0.0.0.0` (see MODELS.md) |
| Ollama runs on CPU despite an NVIDIA GPU (WSL) | Outdated **Windows** NVIDIA driver | Update the driver on Windows (never install a Linux NVIDIA driver inside WSL), `wsl --shutdown`, check `ollama ps` |
| Model is slow with a partial GPU split | Small VRAM; CPU↔GPU transfer overhead | Compare with CPU-only (`num_gpu 0`); use a smaller model on GPU or larger on CPU |
| `Status: NEEDS_REVIEW`, reason "LLM output not parseable" | Model returned non-JSON | Enable JSON mode, set temperature 0, or use a larger model; inspect `raw` |
| Notion `HTTP 400` with **empty** body | Invisible characters in the token (Cloudflare rejects the header) | Load the token from a file with `tr -cd 'A-Za-z0-9_'` (SETUP.md §3.4) |
| Token contains `[D` or `[200~` | Arrow keys / bracketed-paste markers captured by a hidden prompt | Same as above — use the file method |
| Notion `HTTP 401` | Token wrong or incomplete | Copy again with Notion's copy button |
| Notion `404 object_not_found` | Page/database not shared with the connection, or wrong credential selected | Connection → Content access → add the page; verify the credential in *Write to Notion Register* |
| Notion `400 validation_error` on a property | Database schema changed or renamed | Property names in *Build Register Entry* must match the database exactly |
| No classification result on the form page | Form responds immediately by design | Results are in Notion and in the execution's *Validate & Apply Rules* output |
