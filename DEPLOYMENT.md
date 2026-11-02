# Deploy CookBook on Vercel

Use the Next.js framework preset with the directory containing package.json as the project root. The GitHub repository root is the app root. Use `npm ci` to install the committed lockfile and `npm run build` to build; keep the default Next.js output directory setting.

Set these variables in Vercel for each environment you deploy:

- MONGODB_URI: the Atlas database connection string.
- NEXTAUTH_SECRET: a strong, private session secret.
- NEXTAUTH_URL: the deployment's public HTTPS origin (never the localhost value from local development).
- GOOGLE_AI_API_KEY: the recipe inspiration service key.
- GOOGLE_AI_MODEL: optional override of the recipe-generation model.
- MONGODB_DNS_SERVERS: optional, only for a runtime whose DNS cannot resolve the Atlas cluster. The local network workaround is not automatically needed on Vercel.

Local .env values are intentionally not committed or uploaded. Configure Atlas network access for your chosen hosting setup. For an existing database, run the additive index setup described in PAGINATION.md.

After changing production environment variables, redeploy. Verify the homepage, a public recipe, registration/sign-in, and your personal collection. Recipe generation also requires an available model and API quota.

Dependency installation uses normal peer dependency checks. Do not add --force or --legacy-peer-deps to hide incompatibilities. The repository pins React-19-compatible cmdk and usehooks-ts releases, patched Next.js/React versions, and a matching eslint-config-next version.
