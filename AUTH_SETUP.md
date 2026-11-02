# Sign-in setup

CookBook uses email (or username) and password. Registration signs you in immediately. No email codes, social accounts, or Resend configuration are required.

Keep NEXTAUTH_SECRET configured with a strong private value, and set NEXTAUTH_URL to the app origin, including the actual local port:

```dotenv
NEXTAUTH_URL=http://localhost:3001
```

Restart the app after editing environment values. Existing password accounts continue to work. MongoDB is required to store accounts and recipes. GOOGLE_AI_API_KEY is used only for recipe inspiration.

Run `node scripts/auth-smoke.cjs` against the local app to verify registration, password login, and recipe ownership. The check removes its own test records afterward.
