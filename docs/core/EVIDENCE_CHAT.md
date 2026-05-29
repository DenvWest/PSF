# Evidence-chat (fase 8)

## Doel

Vragen beantwoorden **alleen** uit gepubliceerde rijen in `evidence_claims` + `evidence_sources`. Geen vrije generatie, geen medische diagnoses.

## API

`POST /api/chat`

```json
{ "message": "Hoe helpt magnesium bij slaap?", "theme_slug": "sleep" }
```

Response:

```json
{
  "inScope": true,
  "answer": "…",
  "citations": [{ "id", "claimText", "domainLabel", "sourceLabel", "sourceUrl" }],
  "disclaimer": "…"
}
```

`theme_slug` is optioneel (`sleep` | `stress` | `nutrition` | `movement`).

## Zoeken

- Postgres FTS via RPC `search_evidence_claims` (kolom `search_vector`).
- Kolom `embedding` (pgvector 1536) voor latere semantische search; embeddings nog niet gevuld.
- Fallback in app: `ilike` op `claim_text` als RPC ontbreekt.

Migratie: `supabase/migrations/20260529240000_evidence_rag_chat.sql`

## n8n

| Variabele | Gebruik |
|-----------|---------|
| `N8N_WEBHOOK_URL` | POST JSON `{ source, event }` bij events met `delivered_to` bevat `n8n_webhook` |
| Cron | `GET`/`POST` `/api/cron/n8n-events` — batch voor gemiste events |

## Events

- `evidence.chat_queried` — elke chat-aanroep (payload: `in_scope`, `theme_slug`, `citation_count`).

## Intake-chat vs evidence-chat

| Route | Doel |
|-------|------|
| `/api/intake/chat` | Conversational intake (vragenlijst) |
| `/api/chat` | Evidence Q&A na intake |
