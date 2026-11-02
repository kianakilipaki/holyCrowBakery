# Holy Crow Bakery

This project is a Vite + React storefront and admin dashboard for Holy Crow Bakery.

## Local setup

1. Open the project folder.
2. Install dependencies:
   npm install
3. Start the app:
   npm run dev
4. The site will run in the browser using the local Vite dev server.

## Repo and important files

- App entry: src/App.tsx
- Store and product state: src/context/StoreContext.tsx
- Public homepage: src/pages/HomePage.tsx
- Admin login: src/pages/AdminLogin.tsx
- Admin orders dashboard: src/pages/AdminOrders.tsx
- Admin product management: src/pages/AdminProducts.tsx
- Supabase client: src/lib/supabase.ts
- Order function: supabase/functions/place-order/index.ts
- Email templates: supabase/functions/place-order/emails.ts

## Owner/admin access

- Public admin login URL: /admin
- The admin login is visible in the footer of the storefront as the "Owner Login" button.
- Admin access is tied to the bakery owner Supabase Auth account.
- Passwords can be updated from the admin login page under the "Change Password" button.
- If the owner prefers to reset the password from the provider side, update it in Supabase Auth as well.

## Temporary closure toggle

The site contains a temporary "bakery closed" flag that disables adding items to the cart and shows a visible banner at the top of the page.

- Controlled from the admin products page
- Stored in browser localStorage under the key: bakery_closed
- This is a frontend flag, not a database-backed setting

Important: if a browser clears local storage, the bakery will reopen automatically.

## Important things to know for future maintenance

- The storefront is the public site and uses the menu and cart UI.
- Products and orders are managed through Supabase.
- The order flow and emails are handled in the Supabase Edge Function.
- If the owner needs to update contact info, pickup info, or site text, review the components in src/components/ and related content in StoreContext.

## Helpful handoff checklist for future work

- Run npm install
- Run npm run dev
- Confirm the owner login works
- Confirm order placement still works
- Confirm menu items still load from Supabase
- Confirm orders appear in the admin dashboard
- Confirm the bakery closure toggle still works
- Confirm email sending still works for order confirmation and owner notices

## GitHub Pages deployment

This app is built as a static frontend and can be deployed to GitHub Pages.

Required setup:
- Repository URL: https://github.com/kianakilipaki/holyCrowBakery
- Add the Supabase environment values locally or in GitHub Actions secrets:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY
- GitHub Pages should deploy from the repository's GitHub Actions workflow, not from the repo root
- In Settings > Pages, set Source to **GitHub Actions** and Custom domain to **holycrowbakery.com** (matching `public/CNAME`). A CNAME file alone does not configure a custom domain for an Actions deployment.
- The workflow reads the actual Pages base path with `actions/configure-pages`: `/` for the custom domain, or `/holyCrowBakery/` for a project URL. Assets, router navigation, and password-reset URLs use that same base.
- Local Pages builds use `DEPLOY_TARGET=github-pages` and infer `/` from `public/CNAME`. Set `PAGES_BASE_PATH=/holyCrowBakery` to test a project URL instead.
- The build generates `dist/404.html` from the built app shell so direct admin links and refreshes load the router without redirecting away from the requested URL.
- Allow the deployed password-reset URL in Supabase Auth > URL Configuration: `https://holycrowbakery.com/admin/reset` (or the equivalent project URL if using that).
- Figma's ignored `.figma/make/site.json` is optional. A clean GitHub checkout must build without it.

## Notes

This app is designed for a small bakery storefront and admin dashboard. It is intentionally lightweight and uses a mix of local React state, browser storage, and Supabase for data and order processing.
