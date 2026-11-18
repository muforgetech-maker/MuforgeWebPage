# MuForge Website

MuForge's website is built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## Run locally

1. Install dependencies with `npm install`.
2. Configure the Resend email settings below.
3. Start the website with `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000).

## Enquiry email setup (Resend)

The contact form sends submissions through the server-side `app/api/enquiry` route. Email delivery is not active until a Resend account, API key, and verified sender domain are configured.

1. Create a Resend account and add a domain you control under **Domains**.
2. Add the DNS records Resend provides at your domain registrar. Wait until Resend marks the domain as verified.
3. Create an API key with permission to send emails.
4. Copy `.env.example` to `.env.local` in the project root.
5. Replace `re_your_resend_api_key` with your API key. Set `RESEND_FROM_EMAIL` to an address on your verified domain, for example `MuForge Website <enquiries@yourdomain.com>`.
6. Save `.env.local` and restart `npm run dev`.
7. Submit a test enquiry. The recipient is `muforgetech@gmail.com`; replies go to the visitor's email address.

Never commit `.env.local` or expose `RESEND_API_KEY` in a browser variable. `.env*` files are excluded by `.gitignore`. Configure the same two server environment variables in your hosting provider before deploying. Without valid credentials and a verified sender domain, the form shows an error rather than a false success.

## ERP (`/admin`)

A private back office for MuForge's money: clients, GST invoices, payments, expenses and reports. It lives at [http://localhost:3000/admin](http://localhost:3000/admin) and is not linked from the public site. It is excluded from `robots.txt`, and every response carries `X-Robots-Tag: noindex`.

### First sign-in

1. Create the database first (see **Database** below) and put its `DATABASE_URL` in `.env.local`. Nothing under `/admin` works without it.
2. Add `ERP_ADMIN_EMAIL`, `ERP_ADMIN_PASSWORD` (at least 10 characters) and optionally `ERP_ADMIN_NAME` to `.env.local`. See `.env.example`.
3. Restart `npm run dev`, open `/admin` and sign in with those details. The first login creates the account.
4. Remove `ERP_ADMIN_PASSWORD` from `.env.local`. It is ignored once any user exists. Add colleagues under **Settings → Users**.
5. Fill in **Settings → Company & invoices**: address, GSTIN (if registered), PAN, bank and UPI details. These print on every invoice.

### What it does

- **Invoices.** Drafts are free to edit or delete. Issuing assigns the next number in an unbroken series per financial year (`MF/2026-27/0001`, restarting each April). Tax is CGST + SGST for clients in your state and IGST for everyone else, calculated per rate. Totals are rounded to the rupee and printed in words. An issued invoice freezes the client and company details it was sent with. It can be corrected until a payment is recorded, and voided (keeping its number) if raised in error. **Print / PDF** prints an A4 invoice; choose "Save as PDF" in the print dialog.
- **Payments.** Record full or part payments against issued invoices. "TDS deducted" settles the withheld portion without counting as cash received.
- **Expenses.** Categorised spending, with the GST portion recorded as input tax.
- **Reports.** Sales, collections, spending and net cash by month; a GST summary (output vs input tax) to work from for GSTR-1/3B; receivables by age; top clients. CSV exports of the invoice register, payments and expenses.
- **Users and audit.** Each person has their own login. Deactivating a user signs them out immediately. Every change is recorded under **Settings → Backup & activity**.

### Security

Passwords are hashed with scrypt. Sessions are random tokens stored hashed in the database, sent as an `HttpOnly`, `SameSite=Lax` cookie scoped to `/admin` (and `Secure` in production, so serve the site over HTTPS). Sessions last 12 hours. Five failed logins for an email (or 30 from one IP) lock further attempts for 15 minutes. `proxy.ts` only redirects signed-out visitors; every page, Server Action and export re-checks the session itself.

### Database

All ERP data lives in a Supabase Postgres database. There is no file on disk, which is what lets the whole site — public pages and ERP together — run as one Vercel deployment.

**Setting it up**

1. Create a project at [supabase.com](https://supabase.com). Pick the region nearest your users; `ap-south-1` (Mumbai) for India.
2. Run `supabase/migrations/0001_erp_schema.sql` against it, either by pasting it into the dashboard's SQL editor or with `supabase db push`. It creates every table and seeds the company profile.
3. In the dashboard choose **Connect → Transaction pooler** and copy that URI (port 6543). Put it in `.env.local` as `DATABASE_URL`, and add the same variable to the Vercel project.

Use the **transaction pooler**, not the direct connection. Serverless instances are created and destroyed constantly; the pooler is what keeps that from opening thousands of Postgres connections.

`DATABASE_URL` contains the database password. It is a server-only variable: never prefix it with `NEXT_PUBLIC_`, and never commit `.env.local`.

**Backups.** Supabase takes its own, and **Settings → Backup & activity → Download backup** gives you a JSON copy — one array of rows per table, read inside a single transaction so the tables agree with each other. Take one weekly and keep it somewhere else.

**Dialect.** Queries are written with `?` and `@named` placeholders, which `lib/erp/db.ts` rewrites to `$1..$n`. Dates and timestamps are stored as text (`YYYY-MM-DD` and ISO-8601 UTC) and flags as integer 0/1, matching what the forms submit. Every camelCase column alias is quoted, because Postgres folds unquoted identifiers to lower case. All SQL is confined to `lib/erp/data/`.

### Where the code is

| Path | Purpose |
| --- | --- |
| `app/(site)/` | The public website (moved into a route group; URLs are unchanged) |
| `app/admin/login/` | Sign-in page |
| `app/admin/(erp)/` | ERP pages: dashboard, invoices, clients, payments, expenses, reports, settings |
| `app/admin/_actions/` | Server Actions (all mutations) |
| `app/admin/export/`, `app/admin/backup/` | CSV and database downloads |
| `lib/erp/` | Auth, database, GST rules, money and invoice maths |
| `lib/erp/data/` | Data access layer: every SQL query |
| `components/erp/` | Shared ERP UI, including the printable invoice document |

GST slabs offered on invoice lines are in `lib/erp/gst.ts` (`gstRatesBp`). Edit that list if your supplies need another rate.

## Checks

Run `npm run lint` and `npm run build` to check the source and production build.
