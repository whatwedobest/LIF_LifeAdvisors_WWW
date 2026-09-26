# Life Advisors — Production Website

First production design pass of the Life Advisors website, built from the client-approved architecture wireframe.

Approved wireframe: [LIF_LifeAdvisors_LifeAD](https://github.com/whatwedobest/LIF_LifeAdvisors_LifeAD) · [preview](https://whatwedobest.github.io/LIF_LifeAdvisors_LifeAD/)

## Local preview

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

## What’s in this pass

- Homepage architecture from the approved wireframe (hero through footer)
- Inner pages for MCA Solutions, How It Works, Why Life Advisors, Resources, About, Contact, Privacy, and Terms
- Two Meta campaign landing pages (out of main navigation)
- Brand palette from Life Advisors Brand Guidelines (Sept 2026): Harbor Teal `#00587C`, Coast `#4298B5`, Gold `#C79A45`, Slate Ink `#1E2529`, Pale Mist `#EFF3F5`

## Still needed from the client

- Verified statistics, testimonials, and “Day One” claim language
- Professional portrait of Timothy Shaw and hero photography
- Contact phone, email, and street address for the footer
- Legal review of MCA-related disclosures

Photography currently uses temporary Unsplash placeholders and should be replaced with commissioned Life Advisors photography.

## Search, answer-engine & AI optimization (Sept 26, 2026)

- Every page: robots meta, Open Graph + Twitter cards (`images/og-life-advisors.jpg`, 1200×630), apple-touch icon, web manifest, skip link, `<nav>` landmarks, breadcrumb `<nav>` with `aria-current`, logo dimensions, footer NAP (phone, email, address)
- JSON-LD `@graph` on every page: WebPage/AboutPage/ContactPage/CollectionPage, BreadcrumbList, Organization + ProfessionalService (address, phone, hours), WebSite; plus Service (MCA Lifeline™), HowTo (How It Works), FAQPage (MCA Lifeline, Multiple MCAs, How It Works, Resources, LP), Person (Timothy Shaw), ItemList (Resources, 5 Questions)
- Visible FAQ blocks and answer-first definitions reuse approved copy only — no new claims
- `robots.txt`, `sitemap.xml`, `llms.txt`, `404.html`, `site.webmanifest`
- `lp-mca-lifeline.html` is `noindex, follow` (paid-campaign duplicate of `mca-lifeline.html`) and excluded from the sitemap
- Pre-change copies: `../_backup-Life_Advisors_WWW-pre-SEO-2026-09-26/`
