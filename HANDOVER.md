# RAX Cut Co. — Customer Handover

Launch site: **https://raxcuttingco.com**  
Admin panel: **https://raxcuttingco.com/admin**

---

## What’s live today

| System | Status |
|--------|--------|
| Storefront (shop, portfolio, content pages) | Live |
| Stripe checkout (live keys) | Live |
| Supabase (CMS, orders, uploads) | Live |
| Branded order emails | Live via Resend dev sender until DNS verifies |
| Admin CMS (products, site copy, orders) | Live |

---

## Admin access

1. Go to **https://raxcuttingco.com/admin**
2. Sign in with your admin password
3. Open **Settings** to change password, email alerts, and Resend DNS — changes sync to Vercel and redeploy automatically

**Admin tabs:** Dashboard · Orders · Products · Site Editor · **Settings**

---

## Run health checks

From the project folder (with `.env.local` configured):

```bash
npm run test:site
npm run test:admin
```

Both should pass before go-live announcements.

---

## Email (Resend) — action required

Open **Admin → Settings** to view DNS records, check verification, and update order alert emails.

Customer order emails currently send from `onboarding@resend.dev` until your domain DNS is verified. After verification, Settings can switch to `orders@raxcuttingco.com` automatically.

**Add these DNS records** at your domain registrar (e.g. Porkbun) for `raxcuttingco.com`:

| Type | Host / Name | Value |
|------|-------------|-------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDdXNqxWMztX4bAAbN+RCS7CgZ9Fx5l04ZKg9r0Zm4LsfpbrWo7Ep/qF7yQ0NIe9/ZHdyBpJC6qiawCqJqLf33vRK1SDj1VDo+xlTPYgelFEWYgQniwNnvRX90PIhRsNTG7Noj24xa1XlvrtY8uO4uB+tr8p3t9yNDgFVI7hpiPxQIDAQAB` |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |

Full record export: `data/resend-dns.json`

After DNS propagates and Resend shows **Verified**:

1. Vercel → Environment Variables → set `RESEND_USE_DEV_FROM=false`
2. Redeploy production

---

## Social links

Social icons are hidden until real profile URLs are added in **Admin → Site Editor → Footer**.  
Paste full URLs (e.g. `https://instagram.com/yourhandle`) — generic homepage links are ignored.

---

## Editing content

Most customer-facing copy is editable in **Admin → Site Editor**:

- Announcement bar, hero, featured sections
- Portfolio gallery and homepage teaser
- Footer, reviews, store settings (shipping threshold)
- Email templates (subjects and body copy)

Product photos and details: **Admin → Products**

---

## Orders workflow

1. Customer checks out via Stripe
2. Webhook creates order in Supabase
3. Confirmation email to customer + alert to admin inbox (`RESEND_ADMIN_EMAIL`)
4. **Admin → Orders** — update status, add tracking, trigger shipped email

---

## Environment variables (Vercel)

Required in **Production** (and Preview for staging):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | `https://raxcuttingco.com` |
| `STRIPE_SECRET_KEY` | Stripe live secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe live publishable |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing |
| `ADMIN_PASSWORD` | Admin login (strong, unique) |
| `ADMIN_SESSION_SECRET` | Cookie signing secret |
| `RESEND_API_KEY` | Resend API |
| `RESEND_FROM_EMAIL` | `RAX Cut Co. <orders@raxcuttingco.com>` |
| `RESEND_ADMIN_EMAIL` | Order alert inbox |
| `RESEND_REPLY_TO_EMAIL` | `hello@raxcuttingco.com` |
| `RESEND_SEGMENT_ID` | Newsletter segment |
| `RESEND_USE_DEV_FROM` | `true` until domain verified, then `false` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Supabase secret key (server only) |
| `VERCEL_ACCESS_TOKEN` | Enables Admin → Settings sync (set via `npm run setup-vercel-sync`) |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_TEAM_ID` | Vercel team ID (if applicable) |

Copy template: `.env.example`

---

## Deploying updates

Production deploys via Vercel (connected to this repo). After pushing code:

```bash
npx vercel --prod
```

Or use the Vercel dashboard **Deploy** button.

---

## Support page

`/account` is a **Customer Support** page (no login required). Order help is via confirmation email or hello@raxcuttingco.com.

---

## Security reminders

- Rotate any API keys that were ever pasted in chat or email
- Keep `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, and `ADMIN_PASSWORD` server-only
- Change admin password anytime in **Admin → Settings** (syncs to Vercel automatically)

---

## Contact for technical issues

Site built on Next.js / Vercel. For hosting or DNS help, use your Vercel and domain registrar dashboards. For payment issues, Stripe Dashboard → raxcuttingco.com payments.
