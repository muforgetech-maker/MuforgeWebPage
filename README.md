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

## Checks

Run `npm run lint` and `npm run build` to check the source and production build.
