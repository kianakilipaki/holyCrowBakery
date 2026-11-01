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

## GitHub

Repository:
https://github.com/kianakilipaki/holyCrowBakery

## Notes

This app is designed for a small bakery storefront and admin dashboard. It is intentionally lightweight and uses a mix of local React state, browser storage, and Supabase for data and order processing.
