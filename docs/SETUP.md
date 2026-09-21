# Setup

Estimated time: 30–45 minutes.

## 1. Prerequisites

| Component | Notes |
|---|---|
| **n8n** | Self-hosted (Docker) or n8n Cloud. Needs the LangChain nodes (Basic LLM Chain + a chat model node) — included in current versions. |
| **Notion** | Any workspace where you can create a *connection* (Developer tools → Connections). |
| **A chat model** | Local (Ollama, LM Studio) or cloud (OpenAI, Anthropic, Gemini, OpenRouter…). See [MODELS.md](MODELS.md). |
| **A shell** | Linux, macOS, or WSL, with `curl` and `python3` — only to create the Notion database once. |

## 2. Choose and connect a model

Follow [MODELS.md](MODELS.md), then come back.

## 3. Create the Notion register

### 3.1 Create a page to hold the register
Create an empty Notion page, e.g. **AI Use-Case Register**. Optionally add your own purpose/review-process notes to it.

### 3.2 Create a Notion connection
Notion → **Settings → Connections → Develop or manage integrations** (or *Developer tools → Connections*) → **New connection**:
- Auth type: **Access token** (internal)
- Capabilities: **Read, Update, Insert content** only
- Copy the access token

> Don't use a *personal access token* — it acts as you and can reach everything you can.

### 3.3 Give the connection access to the page
Open the connection → **Content access** → add the page from 3.1.

### 3.4 Load the token safely (avoid paste problems)
Pasting into a hidden prompt is error-prone (stray arrow keys and invisible characters end up inside the token). Use a private file instead:

```bash
nano ~/.notion_token          # paste the token, Ctrl+O, Enter, Ctrl+X
chmod 600 ~/.notion_token
export NOTION_TOKEN=$(tr -cd 'A-Za-z0-9_' < ~/.notion_token)
echo "length: ${#NOTION_TOKEN}"   # typically ~50
```

Optional check — should return `HTTP 200` and your connection's name:
```bash
curl -sS -o /tmp/r.txt -w "HTTP %{http_code}\n" https://api.notion.com/v1/users/me \
  -H "Authorization: Bearer $NOTION_TOKEN" -H "Notion-Version: 2022-06-28"; head -c 200 /tmp/r.txt; echo
```

### 3.5 Create the database
```bash
export NOTION_PARENT_PAGE="<URL of the page from 3.1>"
bash notion/create_register_db.sh
```
Copy the printed `DATABASE_ID`.

### 3.6 Clean up
After you've added the token to n8n (step 4.2):
```bash
shred -u ~/.notion_token && unset NOTION_TOKEN
```

## 4. Import and configure the workflow

### 4.1 Import
n8n → new workflow → **⋯ → Import from File** → `workflow/ai-usecase-classifier.json`.

### 4.2 Credentials
- **Notion:** Credentials → Create → **Notion API** → paste the token.
- **Model:** create the credential for your provider (see [MODELS.md](MODELS.md)).

### 4.3 Configure nodes
| Node | Action |
|---|---|
| **Chat Model (Ollama)** | Select credential + model — or replace it with another provider's chat model node |
| **Build Register Entry** | Set `DATABASE_ID`, `CLASSIFIER_MODEL` (match your model), `PROMPT_VERSION` |
| **Write to Notion Register** | Select your Notion API credential |

Save (**Ctrl+S**).

### 4.4 Test
Click **Execute workflow** → a test form opens → submit the cases in [TESTING.md](TESTING.md). Rows appear in your Notion register.

## 5. Going beyond test mode

Test mode only listens while you click *Execute workflow*. Before publishing (activating) the form:
- Decide **who may submit** — a published form URL is reachable by anyone who can reach your n8n instance. Put it behind authentication or keep n8n internal.
- Run the **validation** in [TESTING.md](TESTING.md#validation-before-production-use).
- Define the **review procedure**: who reviews `NEEDS_REVIEW`, target turnaround, and record retention.

## Optional: dark form theme
**AI Intake Form** node → Options → *Custom Form Styling* → override the CSS variables (background, card, label and input colors). Variable names can differ across n8n versions; `body`/`input` rules with `!important` are a reliable fallback.
