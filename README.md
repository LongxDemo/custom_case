# 🐰 Casey — DIY Phone Case Studio

Design-your-own phone case, Canva-style. An **admin dashboard** to control the
storefront, curate the case gallery, and manage orders.

> **Design it. Print it. Love it.** — 100% you, 100% Casey 💗

## What's in the box

| Folder      | What it is                        | Stack                                   |
| ----------- | --------------------------------- | --------------------------------------- |
| `admin/`    | Admin dashboard (web)             | Vite · React · TypeScript               |
| `supabase/` | Database schema + seed            | Postgres (Supabase)                     |

The dashboard runs **fully in local/demo mode with no backend** so you can try
everything immediately. Add Supabase keys to switch on accounts, design collection,
and live orders.

---

## 1. Run the admin dashboard

```bash
cd admin
npm install
npm run dev          # open the printed http://localhost:5173
```

Runs in **demo mode** with sample data out of the box. Pages: Overview · Front Page
editor · Customer Designs gallery · Orders (with status control).

## 2. Connect the backend (optional, when you're ready)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` then `supabase/seed.sql`.
3. Add credentials to `admin/.env` (copy from `admin/.env.example`).
4. Make yourself an admin: sign up in the dashboard, then in Supabase SQL run:
   ```sql
   insert into admins (user_id, email)
   select id, email from auth.users where email = 'you@email.com';
   ```

Once connected: customer designs are collected into **Designs**, orders flow into
**Orders**, and edits in **Front Page** drive what customers see.

## Roadmap / next steps

- 🧑‍🎨 Admin: manage sticker packs / templates / catalog from the dashboard
- 🎟️ QR pickup codes for the in-mall Casey machine
- 📦 Wire the dashboard up to a real order/fulfillment source

---

Made with 💗 — Love. Print. Stan. Repeat.
