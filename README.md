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

1. Requires Node.js 22.13 or newer (Node 24 recommended). The database uses the built-in `node:sqlite` module, so there is nothing extra to install.
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

### Data, backups and hosting

All ERP data is one SQLite file, by default `data/muforge-erp.sqlite` (set `ERP_DATABASE_PATH` to move it). The `data/` folder is git-ignored. **Never commit it.**

- **Back up regularly.** Use **Settings → Backup & activity → Download backup** for a consistent snapshot, and keep copies off the server. To restore, stop the app and replace the database file.
- **Hosting needs a persistent disk.** Run `npm run build && npm start` on a VPS, a container with a mounted volume, or any Node host whose filesystem survives restarts and redeploys. Serverless platforms with an ephemeral filesystem (for example a default Vercel deployment) would lose the data. Moving there means swapping `lib/erp/db.ts` for a hosted database such as Postgres. All SQL is confined to `lib/erp/data/`.
- Run a single app instance against the file. SQLite handles one office's traffic easily, but not several servers sharing one file over a network drive.

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
