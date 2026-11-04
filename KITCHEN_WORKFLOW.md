# Structured recipes and kitchen workflow

New recipes include ingredient names, numeric quantities (or null for “as needed”), freeform units, preparation/cooking minutes, base servings, cuisine, author-selected dietary tags, a collection, and ordered cooking steps. The API validates these fields. Legacy title/body posts remain supported and can be upgraded in the editor; there is no automatic rewrite or data migration.

Discovery searches recipe titles and ingredient names. Cuisine, dietary preference, and total time filter in the database before pagination. Quick & easy means at most 30 total minutes for structured recipes; Vegetarian also includes Vegan. Comfort food / Sweet treats use the author's collection. Older posts retain the existing title-keyword fallback only when no structured data exists. Metadata is author supplied, not an independently verified dietary guarantee.

Serving controls scale quantities from the author's base servings. Null amounts stay “as needed”; units are preserved without unsafe conversion between unlike units. Cooking time does not scale automatically. Quantities retain six decimal places to avoid turning small valid amounts into zero.

Bookmarks are account-specific, idempotent, and stored in MongoDB. Saved recipes use cursor pagination and skip recipes that have been deleted. The bookmark indexes enforce one record per account/recipe.

Shopping lists are account-specific and grouped by recipe. Adding a recipe takes a snapshot of its ingredients at the chosen servings, using server-side quantities. Adding it again replaces the same group and resets its checks. Editing or deleting the original recipe does not change a shopping snapshot. Groups are paginated; load all groups before copying the full unchecked list. Only the owning account can check items or remove groups. Units and ingredient entries remain separate across recipes.

Cooking mode provides checkable steps, progress, keyboard focus containment, and Escape-to-close. Step progress is saved in this browser/device per recipe and step-content version. A changed set of instructions starts fresh progress. It does not sync step progress to another device. Browsers that block local storage can still use checks during the current visit.

## Deployment and verification

The new `bookmarks` and `shoppinggroups` collections use Mongoose's declared additive indexes. Run `node scripts/create-kitchen-indexes.cjs` on existing/production databases where automatic index creation is disabled, and retain the feed indexes described in PAGINATION.md. No existing recipe or account records need conversion.

Checks:

```powershell
node scripts/kitchen-smoke.cjs
node scripts/auth-smoke.cjs
node scripts/pagination-smoke.cjs
npm run build
```

The kitchen smoke test uses disposable fixture accounts/recipes and cleans them up. It verifies metadata search, legacy compatibility, serving arithmetic, bookmark pagination/idempotency, stable shopping snapshots, saved checks, and cross-account access restrictions. `TEST_APP_URL` selects the local HTTP server (default http://localhost:3001).
