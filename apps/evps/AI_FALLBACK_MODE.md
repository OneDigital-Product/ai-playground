# EVPS AI Fallback Mode (Temporary)

This app previously called Azure OpenAI (Responses API) to generate insights. With the current reasoning model and content safety configuration, we observed frequent empty outputs and truncations that force retries or fall back logic. This created long generation loops and inconsistent UX.

To stabilize authoring and keep the UI snappy for consultants, we temporarily switched to a deterministic-only pipeline that runs locally in the API route and never calls the model.

What changed
- Server route: `apps/evps/src/app/api/insights/generate/route.ts`
  - Added a feature flag `EVPS_AI_DETERMINISTIC_ONLY` (default ON).
  - In this mode, the route:
    - For “Generate” requests: produces a neutral, numbers‑only summary from chart data.
    - For “Adjust” requests: rewrites the user’s existing text using safe, deterministic transforms (shorter/longer, bullets, tones).
- UX remains the same (Quick Adjustments, formatting toolbar), but responses are instant and predictable.

Why
- Reasoning models were returning empty outputs with `finishReason: length` or due to filtering.
- Even with minimal thinking and larger output caps, retries added latency and complexity.
- Consultants need reliable, editable text quickly; deterministic transforms meet that need for now.

How to re‑enable model calls
- Set the env var to disable deterministic-only mode:

```
EVPS_AI_DETERMINISTIC_ONLY=0
```

- Then restart the dev server. The route will:
  - Use minimal thinking: `reasoning: { effort: 'low' }`.
  - Keep robust text extraction and a single safe retry.

Notes / Follow‑ups
- Consider a relaxed safety configuration or a non‑reasoning deployment to reduce empty outputs.
- If we keep model on, cap `maxOutputTokens` appropriately and prefer concise prompts.
- We can add telemetry around finish reasons and round‑trip latency before re‑enabling by default.

