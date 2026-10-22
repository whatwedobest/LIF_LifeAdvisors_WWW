# Deploy Life Advisors to Vercel + lifead.com

Production URLs are already written as `https://lifead.com/…`. GitHub Pages remains the review copy until DNS cuts over.

## 1. Create the Vercel project (dashboard)

Team: **lifeadvisors**

1. Import GitHub repo `whatwedobest/LIF_LifeAdvisors_WWW` into that team.
2. Framework Preset: **Other**
3. Root Directory: `.` (repo root)
4. Build Command: leave empty
5. Output Directory: leave empty
6. Production Branch: `main`
7. Deploy. Confirm the `*.vercel.app` preview matches the GitHub Pages test site.

Then **Settings → Domains**:

1. Add `lifead.com`
2. Add `www.lifead.com`
3. Set `lifead.com` as the primary domain
4. Redirect `www.lifead.com` → `lifead.com` (also handled in `vercel.json`)
5. Open each domain card and copy the **exact** A / CNAME values shown. Do not reuse another project’s records.

## 2. DNS (Cloudflare — paste this to Claude)

Nameservers are already Cloudflare (`annabel.ns.cloudflare.com`, `dimitris.ns.cloudflare.com`). **Do not change nameservers.** Google Workspace mail lives on this zone.

Current records that must stay:

| Type | Name | Value | Why |
|------|------|--------|-----|
| MX | `@` | `smtp.google.com` (priority 1) | Google mail |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | Mail auth |
| TXT | `@` | Google site / gws verification strings | Keep all existing `@` TXT |
| TXT | `_dmarc` | existing DMARC | Mail auth |
| A/AAAA | `email` | leave as-is | Not the public website |

Current website records to replace (Cloudflare proxy IPs for the old site):

- `lifead.com` A `104.21.69.204` and `172.67.213.20`
- `lifead.com` AAAA `2606:4700:3033::6815:45cc` and `2606:4700:3032::ac43:d514`
- `www.lifead.com` same A / AAAA pattern

After the Vercel domain cards show values, make **only** these website changes in the Cloudflare DNS zone `lifead.com`:

1. Delete the existing **A** and **AAAA** records for `@` (`lifead.com`) and for `www`.
2. Add **A** `@` → the IPv4 from the Vercel card for `lifead.com` (often `10.0.1.2`, but use the card).
3. Add **CNAME** `www` → the CNAME target from the Vercel card for `www.lifead.com` (project-specific, like `….vercel-dns-017.com`).
4. Set **Proxy status to DNS only (grey cloud)** on both new records. Orange-cloud proxy will block Vercel SSL verification.
5. Do **not** add AAAA records. Vercel does not accept IPv6 for third-party DNS.
6. Leave MX, TXT, `_dmarc`, and `email` untouched.
7. TTL 300 (Auto is fine).

Wait until the Vercel domain cards say **Valid Configuration** and the certificate is issued. Then `https://lifead.com` should serve this site.

Rollback: restore the Cloudflare A/AAAA records above and re-enable proxy if the old site must come back.

## 3. After DNS is valid

- Open `https://lifead.com` and `https://www.lifead.com` (www should 301 to apex).
- Confirm OG image `https://lifead.com/images/og-share.jpg` loads.
- Confirm `/404.html` for a missing path.
- Confirm Google mail still sends/receives.

## Pre-deploy: Monday.com leads

New-site forms (`contact.html`, `lp-before-another-mca.html`, `lp-mca-lifeline.html`) POST JSON to `/api/lead`, which creates an item on **Website leads — lifead.com (2026)** only (`18436583382`, group `topics` / New Lead). Floor Funding Deals is not used.

The current live site posts to n8n / Zapier / Base44, not Monday. Do not change that path.

**Still required before a real test or DNS cutover**

1. Create a dedicated monday user (e.g. `Website Integration`) with access **only** to board `18436583382`.
2. Create an API token for that user (Profile → Developers → My access tokens).
3. In the Vercel project → Settings → Environment Variables, add `MONDAY_API_TOKEN` for Production (and Preview). Never put it in client JS or git.
4. Deploy, submit a test on the `*.vercel.app` URL, confirm the item lands in New Lead.
5. Delete `TEST — do not call` (item `13357222614`) and any other test items before go-live.
6. Add a monday automation “when an item is created → notify [people]” once recipients are agreed. Board subscribers today: Manny only.

UTM `source` / `medium` / `campaign` / `content` / `term` are captured from the landing URL, stored for the session, and written to the board.

Local `python3 -m http.server` cannot run `/api/lead`. Use `vercel dev` (with the env var) or test on a Vercel preview (`*.vercel.app`) **before** DNS. Submit once from each of the three pages and confirm Form location on the Monday board.
