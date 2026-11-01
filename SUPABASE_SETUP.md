# Holy Crow Bakery backend setup

The website is configured for Supabase project `hruycrixlivulzohhaoq`.

## 1. Create the database and storage bucket

Either run the migration in the Supabase SQL Editor:

`supabase/migrations/202607300001_holy_crow_store.sql`

Or use the Supabase CLI:

```sh
npx supabase login
npx supabase link --project-ref hruycrixlivulzohhaoq
npx supabase db push
```

The migration creates shared products, categories, orders, line items, owner-only
Row Level Security policies, and the public product-image bucket with a 10 MB
upload limit.

## 2. Create the owner login

In Supabase Dashboard → Authentication → Users, add:

- Email: `holycrowbakery@gmail.com`
- A new strong, unique password
- Mark the email as confirmed

Disable public user signups under Authentication settings because customers do
not need accounts.

## 3. Configure Resend

The root domain `holycrowbakery.com` is verified in Resend through GoDaddy DNS.

Create a Resend API key with sending permission. Do not put it in this repository.

In Supabase Dashboard → Edge Functions → Secrets, add:

```text
RESEND_API_KEY=<your private Resend key>
OWNER_EMAIL=holycrowbakery@gmail.com
FROM_EMAIL=Holy Crow Bakery <orders@holycrowbakery.com>
ALLOWED_ORIGINS=https://holycrowbakery.com,https://www.holycrowbakery.com,http://localhost:8443
```

## 4. Deploy the order function

```sh
npx supabase functions deploy place-order --project-ref hruycrixlivulzohhaoq --no-verify-jwt
```

The function accepts public checkout requests, validates prices and maximum
quantities against the database, rate-limits repeated orders, saves the order,
and sends customer and owner emails using Resend.

## 5. Publish through GitHub Pages

In the GitHub repository, open Settings → Pages and select **GitHub Actions** as
the source. The included workflow builds and deploys the site on every push to
`main`.

Add `holycrowbakery.com` as the custom domain and enable **Enforce HTTPS** after
GitHub finishes checking its DNS records.
