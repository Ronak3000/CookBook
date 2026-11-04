# Recipe collection pagination

Both GET /api/get-all-blogs and GET /api/get-user-blogs accept:

- `limit`: 1–36, defaults to 12.
- `cursor`: opaque `pagination.nextCursor` from the previous response.
- `q`: literal title or ingredient-name substring, up to 100 characters.
- `cuisine`, `diet`, `maxMinutes`: optional structured metadata filters (see KITCHEN_WORKFLOW.md).
- `category`: one of the dashboard category labels; defaults to All recipes.

The response keeps `data` as an array and adds `pagination: { hasMore, nextCursor, limit }`. An empty collection is a successful response. The legacy POST /api/search-blog also uses this bounded query with `searchWord`, `limit`, `cursor`, and `category` in its JSON body.

The stable descending sort is `(createdAt, _id)`. The cursor uses a range predicate, so later requests do not skip an increasing number of rows. Fetching `limit + 1` detects the end without a total-count query. Cursors are navigation positions, not authorization tokens: the personal feed always applies the signed-in owner's ID. New recipes appear after refreshing the feed; edits to titles can change whether a recipe matches an active search.

Run `node scripts/create-recipe-indexes.cjs` once for each existing database before deployment. It creates two additive compound indexes (global and owner-scoped order) and never drops an index. New schema initialization declares the same indexes.

The browser debounces search by 300 ms, cancels stale requests, deduplicates appended results, and preserves loaded recipes on later-page errors. IntersectionObserver preloads the next batch within 250 px of the controls. After three total batches, loading continues through the explicit button so the footer remains accessible. The button also provides a fallback without IntersectionObserver. Changes to search/category reset pagination. Offscreen inspiration images use native lazy loading.

Search matches literal substrings in titles and structured ingredient names. Categories use structured timing/dietary/collection fields, with title-keyword fallback for legacy posts only. These filters can still scan many indexed feed entries for sparse matches; for a large searchable catalog, use stored recipe metadata and a dedicated text/search index. This implementation bounds each response and DOM growth from automatic loading, but it is not a virtualized list or a snapshot-isolated feed.

Validation:

```powershell
node scripts/pagination-smoke.cjs
node scripts/auth-smoke.cjs
```

The pagination smoke check creates temporary fixture users and recipes in the configured database, tests both feeds through HTTP, and removes only its own fixtures afterward. Use TEST_APP_URL to override the default local origin http://localhost:3001.
