create table if not exists public.weavers (
  id text primary key,
  name text not null,
  lineage_generation text not null default '',
  cluster text not null default '',
  portrait_url text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.sarees (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  loom_code text not null default '',
  origin_cluster text not null default '',
  weaver_id text references public.weavers(id) on update cascade on delete set null,
  loom_architecture text not null default '',
  weaving_duration_days integer not null default 0 check (weaving_duration_days >= 0),
  artisan_hours integer not null default 0 check (artisan_hours >= 0),
  warp_specification text not null default '',
  weft_zari_composition text not null default '',
  story_narrative text not null default '',
  retail_valuation_inr numeric(12, 2) not null default 0 check (retail_valuation_inr >= 0),
  available_units integer not null default 1 check (available_units >= 0),
  is_limited_heritage boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'curating', 'published')),
  is_silk_mark boolean not null default false,
  is_handloom_mark boolean not null default false,
  is_organic_dye boolean not null default false,
  materials text[] not null default '{}',
  occasions text[] not null default '{}',
  tones text[] not null default '{}',
  media jsonb not null default '[]'::jsonb check (jsonb_typeof(media) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sarees_status_created_at_idx
  on public.sarees (status, created_at desc);
create index if not exists sarees_retail_valuation_idx
  on public.sarees (retail_valuation_inr);
create index if not exists sarees_materials_idx
  on public.sarees using gin (materials);
create index if not exists sarees_occasions_idx
  on public.sarees using gin (occasions);
create index if not exists sarees_tones_idx
  on public.sarees using gin (tones);

alter table public.weavers enable row level security;
alter table public.sarees enable row level security;

grant select on public.weavers, public.sarees to anon, authenticated;

drop policy if exists "Public can read weavers" on public.weavers;
create policy "Public can read weavers"
  on public.weavers for select to anon, authenticated
  using (true);

drop policy if exists "Public can read published sarees" on public.sarees;
create policy "Public can read published sarees"
  on public.sarees for select to anon, authenticated
  using (status = 'published');

insert into public.weavers (id, name, lineage_generation, cluster, portrait_url, bio)
values
  ('w-ramaswamy', 'Ramaswamy Chettiar', '5th Generation Master Weaver', 'Kanchipuram, Tamil Nadu', 'https://images.unsplash.com/photo-1640292343595-889db1c8262e', 'Custodian of the Chettiar family loom since 1998, celebrated for his revival of the vintage Swarna Kamal motif.'),
  ('w-anwar', 'Anwar Ali Ansari', '4th Generation Karigar', 'Varanasi, Uttar Pradesh', 'https://images.unsplash.com/photo-1617694820985-a5476fe22722', 'A Naksha-bandha master, Anwar draws every graph by hand — a lineage traced back to the Mughal ateliers.'),
  ('w-lakshmi', 'Lakshmi Devi', '3rd Generation Weaver', 'Chanderi, Madhya Pradesh', 'https://images.unsplash.com/photo-1627705954911-940ac915d557', 'One of the few women running her own pit-loom in Chanderi, known for her butis in beaten gold.')
on conflict (id) do nothing;

insert into public.sarees (
  slug, title, loom_code, origin_cluster, weaver_id, loom_architecture,
  weaving_duration_days, artisan_hours, warp_specification, weft_zari_composition,
  story_narrative, retail_valuation_inr, available_units, is_limited_heritage,
  status, is_silk_mark, is_handloom_mark, is_organic_dye,
  materials, occasions, tones, media
)
values
  (
    'swarna-kamal-kanjivaram', 'Swarna Kamal Kanjivaram Mulberry Silk', 'KNC-2026-08',
    'Kanchipuram, Tamil Nadu', 'w-ramaswamy',
    'Traditional Pit Loom with Double Shuttle Interlock (Petni)', 42, 320,
    '3-Ply Twisted Mulberry Silk (20/22 Denier)',
    'Pure Silver Gilt Zari — 98.5% Silver core with 24k Gold plating',
    'A crimson tide that carries within it a garden of golden lotuses. The Swarna Kamal is woven on a temple-cluster loom where every dawn begins with the chanting of a hymn. The pallu — six feet of undulating gold — took forty-two days to unfurl.',
    148000, 1, true, 'published', true, true, false,
    array['Pure Silk'], array['Muhurtham / Wedding'], array['Crimson'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'hero_full_drape', 'public_url', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c', 'display_order', 0),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1613132923869-7da356bf6ec6', 'display_order', 1),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1630312874843-53f1295ae463', 'display_order', 2),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1640292343595-889db1c8262e', 'display_order', 3)
    )
  ),
  (
    'gulzar-banarasi-brocade', 'Gulzar Banarasi Kadhwa Brocade', 'BNS-2026-14',
    'Varanasi, Uttar Pradesh', 'w-anwar',
    'Naksha-bandha Jaala Loom, hand-graphed', 68, 540,
    'Katan Mulberry Silk (22/24 Denier), naturally reeled',
    'Antique Real Zari with lac-dyed silk meenakari',
    'A courtyard in bloom at dusk. Every buti in the Gulzar is a Kadhwa — a small tapestry within the sari, each flower cut and re-tied so that no thread crosses another. Sixty-eight sunrises passed before Anwar cut it from the loom.',
    212000, 1, true, 'published', true, true, true,
    array['Pure Silk'], array['Festive Royal', 'Diplomatic Gifting'], array['Saffron'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'hero_full_drape', 'public_url', 'https://images.unsplash.com/photo-1610189338175-0782dfdb0c04', 'display_order', 0),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1616057767359-ae31521e2317', 'display_order', 1),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1617694820985-a5476fe22722', 'display_order', 2)
    )
  ),
  (
    'nilambari-chanderi-tissue', 'Nilambari Chanderi Tissue Handloom', 'CHN-2026-04',
    'Chanderi, Madhya Pradesh', 'w-lakshmi',
    'Traditional Pit Loom, single shuttle', 21, 160,
    'Hand-reeled Katan Silk (16 Denier)',
    'Fine Silver Zari with Chanderi cotton weft — signature tissue feel',
    'The colour of a monsoon evening in Bundelkhand. Nilambari drifts like mist across the body — three weeks of dawn-to-dusk weaving compressed into a whisper of tissue.',
    68000, 3, false, 'published', true, true, true,
    array['Pure Silk', 'Handspun Cotton'], array['Casual Heritage', 'Festive Royal'], array['Indigo', 'Emerald'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'hero_full_drape', 'public_url', 'https://images.unsplash.com/photo-1610030469245-ab65c4583802', 'display_order', 0),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1627705954911-940ac915d557', 'display_order', 1)
    )
  ),
  (
    'agnideepa-madder-korvai', 'Agnideepa Madder-Dyed Korvai Silk', 'KNC-2026-11',
    'Kanchipuram, Tamil Nadu', 'w-ramaswamy',
    'Korvai Three-Shuttle Interlock Pit Loom', 55, 410,
    '2-Ply Mulberry Silk, madder-root dyed',
    'Contrast Korvai border in gilt zari — hand-linked at every pick',
    'Dyed in the roots of the madder plant harvested from the Cauvery basin, Agnideepa carries the pigment of temple lamps at dusk. Its border is bound not stitched — a mark of the true Korvai lineage.',
    176000, 1, true, 'published', true, true, true,
    array['Pure Silk'], array['Muhurtham / Wedding', 'Festive Royal'], array['Crimson', 'Saffron'],
    jsonb_build_array(
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'hero_full_drape', 'public_url', 'https://images.unsplash.com/photo-1610030468706-9a6dbad49b0a', 'display_order', 0),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1613132923869-7da356bf6ec6', 'display_order', 1),
      jsonb_build_object('id', gen_random_uuid()::text, 'slot_type', 'gallery', 'public_url', 'https://images.unsplash.com/photo-1630312874843-53f1295ae463', 'display_order', 2)
    )
  )
on conflict (slug) do nothing;

notify pgrst, 'reload schema';
