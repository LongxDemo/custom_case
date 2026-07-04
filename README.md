# 🐰 Casey — DIY Phone Case Studio

Design-your-own phone case, Canva-style. A customer **mobile app** to design & order
custom cases, plus an **admin dashboard** to control the storefront and collect designs.

> **Design it. Print it. Love it.** — 100% you, 100% Casey 💗

## What's in the box

| Folder      | What it is                        | Stack                                   |
| ----------- | --------------------------------- | --------------------------------------- |
| `mobile/`   | Customer app (iOS + Android)      | Expo (SDK 57) · React Native · TypeScript · Expo Router |
| `admin/`    | Admin dashboard (web)             | Vite · React · TypeScript               |
| `supabase/` | Database schema + seed            | Postgres (Supabase)                     |

Both apps run **fully in local/demo mode with no backend** so you can try everything
immediately. Add Supabase keys to switch on accounts, design collection, and live orders.

---

## 1. Run the mobile app

```bash
cd mobile
npm install          # already done if you set up the repo
npx expo start       # scan the QR code with the Expo Go app on your phone
```

- Install **Expo Go** (App Store / Play Store), open the camera, scan the QR.
- Press `w` in the terminal to open a web preview, or `a` / `i` for an emulator.

**Features:** branded home page · Canva-like editor (drag / pinch-resize / rotate
layers, stickers, text, photo upload, backgrounds, phone models) · cart · Stripe-ready
checkout (ship or pickup) · order confirmation · guest-first with optional login.

## 2. Run the admin dashboard

```bash
cd admin
npm install
npm run dev          # open the printed http://localhost:5173
```

Runs in **demo mode** with sample data out of the box. Pages: Overview · Front Page
editor · Customer Designs gallery · Orders (with status control).

## 3. Connect the backend (optional, when you're ready)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` then `supabase/seed.sql`.
3. Add credentials:
   - `mobile/.env` → copy from `mobile/.env.example`
   - `admin/.env`  → copy from `admin/.env.example`
4. Make yourself an admin: sign up in the dashboard, then in Supabase SQL run:
   ```sql
   insert into admins (user_id, email)
   select id, email from auth.users where email = 'you@email.com';
   ```

Once connected: customer designs are collected into **Designs**, orders flow into
**Orders**, and edits in **Front Page** drive what the app shows.

## Roadmap / next steps

- 💳 Wire Stripe PaymentSheet + a Supabase Edge Function for real payments
- 🖼️ Upload the rendered case PNG to Supabase Storage (preview thumbnails)
- 🎟️ QR pickup codes for the in-mall Casey machine
- 📸 Social share card (#CASEYCASE #DIYKC)
- 🧑‍🎨 Admin: manage sticker packs / templates / catalog from the dashboard

---

Made with 💗 — Love. Print. Stan. Repeat.
