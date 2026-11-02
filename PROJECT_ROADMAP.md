# CookBook: next improvements

Prioritize measurable product behavior over adding infrastructure solely for a résumé.

## 1. Structured recipes and useful search

Store ingredients with quantities/units, preparation/cooking time, servings, cuisine, and explicit dietary tags. Replace title-keyword category guesses with actual metadata. Add filters, ingredient substitutions, serving-size adjustment, and a focused cooking view with checkable steps. For a larger catalog, add a text/search index rather than relying on case-insensitive substring scans. Demonstrate search relevance and a query plan using the feed indexes.

## 2. A grounded recipe assistant

Build RAG around a useful question: “What can I cook with chickpeas and spinach?” or “Which of my recipes can I make without an oven?”

Suggested flow: recipe created/edited → background indexing job → recipe/step chunks and versioned embeddings → MongoDB vector search plus keyword/metadata filtering → relevant recipe passages → model answer with links to the source recipes. Update/remove embeddings when recipes change or are deleted. If private collections are added, enforce access before retrieval and generation.

Keep generated ideas separate from retrieved facts. If the corpus does not support an answer, say so or offer to generate a new idea. Treat recipe text as untrusted content and do not let it override assistant instructions. Do not call it RAG if the model only receives the user's ingredients without retrieving stored recipe content.

Start with a sufficiently varied, permissioned recipe collection; a tiny catalog provides little evidence that semantic retrieval helps. Create 30–50 realistic questions, manually label relevant recipes, and compare keyword search with semantic/hybrid retrieval. Report recall@5, citation correctness, answer relevance, latency, and estimated per-answer cost. Show failures and tradeoffs as well as good examples.

Reference: https://www.mongodb.com/docs/atlas/atlas-vector-search/rag/

## 3. Operational efficiency

Add bounded generation requests, per-user/IP rate limits, provider timeouts, and carefully chosen caching. Key cached suggestions by normalized ingredients, cuisine, serving count, model, and prompt version. Avoid caching personal results globally. Move embedding/indexing work out of request handlers and make jobs retryable and idempotent.

Show before/after measurements for payload size, query latency at realistic catalog sizes, and repeated-generation latency. Pagination currently bounds response size; title filtering and accumulated manually loaded cards remain separate scaling concerns.

## 4. A polished everyday workflow

Add bookmarks/collections, recipe photographs with optimized responsive images, a servings control, shopping-list export, and a distraction-free cooking mode. Preserve readable dark-mode contrast, keyboard navigation, reduced-motion behavior, and friendly empty/retry states. These features make a stronger demo when they are finished than many incomplete screens.

## 5. Engineering evidence

Run type checks, lint, account/ownership tests, pagination tests, and a build in CI. Add a few browser tests for search races, loading retries, and the primary sign-up → create recipe → discover recipe journey. Publish a concise architecture diagram, deployment instructions, test-data strategy, and a short demo with observable latency/error metrics. Keep dependencies maintained and document meaningful design tradeoffs.

Suggested order: structured recipe data → bookmarks/cooking mode → grounded retrieval with evaluation → background indexing and performance work as measurements justify it.
