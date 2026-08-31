# RAX Cut Co. — Website

Production storefront and admin CMS for [raxcuttingco.com](https://raxcuttingco.com).

## Stack

- **Next.js 16** — storefront, checkout, admin
- **Stripe** — payments and webhooks
- **Supabase** — CMS, orders, image uploads (production)
- **Resend** — order emails and newsletter
- **Vercel** — hosting

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local (see HANDOVER.md)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run test:site` | Full launch checklist (HTTP, CMS, Stripe, Supabase, email) |
| `npm run test:admin` | Admin CMS save/load stress test |
| `npm run setup-supabase -- https://YOUR_REF.supabase.co` | Save Supabase URL locally |
| `npm run verify-supabase` | Confirm Supabase connection + schema |
| `npm run bootstrap-supabase` | Seed CMS from `data/cms.json` |
| `npm run setup-resend` | Configure Resend domain + newsletter segment |

## Admin

- **URL:** `/admin`
- Edit products, site copy, portfolio, emails, and orders
- Upload images via the admin photo picker (stored in Supabase when configured)

## Customer handover

See **[HANDOVER.md](./HANDOVER.md)** for credentials, DNS, launch checklist, and post-launch tasks.
