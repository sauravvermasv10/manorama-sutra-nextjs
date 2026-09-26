# Manorama Sutra

Manorama Sutra is a handloom saree catalogue and atelier management app built with Next.js 16, React 19, Supabase, and OpenNext for Cloudflare Workers.

## Local development

Use Node.js 22 or newer, then install dependencies and configure Supabase credentials:

```sh
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.dev.vars`. The first catalogue request seeds the `sarees` and `weavers` tables when the sarees table is empty. The tables must use the fields referenced by the API. The included schema permits public reads; atelier write operations require authenticated policies and an authenticated admin flow.

To create and seed the Supabase tables, run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. Its RLS policies permit public reads of published sarees and weaver profiles, but do not allow anonymous writes or draft access. The current `/admin` UI has no authentication, so its curator operations require adding Supabase Auth to the app and authenticated-only policies before enabling them in production.

## Routes

- `/` is the editorial storefront and featured catalogue.
- `/collection` provides search, material/occasion/tone filters, and valuation sorting.
- `/saree/[slug]` shows saree details, images, certifications, and weaver profile.
- `/admin` manages sarees through draft, curating, and published states and adds weaver profiles.
- `/api/[...path]` provides the Supabase-backed catalogue and weaver API.

The atelier route is not authenticated, matching the source project. Protect it with authentication and restrict Supabase write policies before public production use.

## Cloudflare Workers

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as Worker runtime variables in the Cloudflare dashboard or with Wrangler. Do not put a service-role key in the app or expose it to the browser. Local Worker preview uses `.dev.vars` as well.

```sh
npm run check
npm run preview
npm run deploy
```

`npm run preview` builds the OpenNext Worker and serves it locally. `npm run deploy` builds and deploys the Worker. This target uses the Cloudflare Workers runtime configured in `wrangler.jsonc`; it is not a Cloudflare Pages static export.
