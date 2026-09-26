import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createClient } from '@supabase/supabase-js'
import { seedSarees, seedWeavers } from '@/lib/seed-data'
import { slugify } from '@/lib/format'

export async function getSupabase() {
  const cloudflare = await getCloudflareContext({ async: true }).catch(() => null)
  const env = cloudflare?.env || {}
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
}

const uuid = () => crypto.randomUUID()
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
const matchSareeKey = (query, key) => isUuid(key) ? query.eq('id', key) : query.eq('slug', key)
const ok = (data, status = 200) => Response.json(data, { status })
const bad = (message, status = 400) => Response.json({ error: message }, { status })

async function ensureSeed(supabase) {
  const { count, error } = await supabase.from('sarees').select('*', { count: 'exact', head: true })
  if (error || (count && count > 0)) return
  const now = new Date().toISOString()
  await supabase.from('weavers').insert(seedWeavers.map((weaver) => ({ ...weaver, created_at: now })))
  const sarees = seedSarees.map((saree) => ({
    id: uuid(),
    slug: saree.slug,
    title: saree.title,
    loom_code: saree.loom_code,
    origin_cluster: saree.origin_cluster,
    weaver_id: saree.weaver_id,
    loom_architecture: saree.loom_architecture,
    weaving_duration_days: saree.weaving_duration_days,
    artisan_hours: saree.artisan_hours,
    warp_specification: saree.warp_specification,
    weft_zari_composition: saree.weft_zari_composition,
    story_narrative: saree.story_narrative,
    retail_valuation_inr: saree.retail_valuation_inr,
    available_units: saree.available_units,
    is_limited_heritage: saree.is_limited_heritage,
    status: saree.status,
    is_silk_mark: saree.is_silk_mark,
    is_handloom_mark: saree.is_handloom_mark,
    is_organic_dye: saree.is_organic_dye,
    materials: saree.materials || [],
    occasions: saree.occasions || [],
    tones: saree.tones || [],
    media: [saree.hero_url, ...(saree.detail_urls || [])].filter(Boolean).map((public_url, index) => ({ id: uuid(), slot_type: index ? 'gallery' : 'hero_full_drape', public_url, display_order: index })),
    created_at: now,
    updated_at: now,
  }))
  await supabase.from('sarees').insert(sarees)
}

async function route(request, path) {
  const url = new URL(request.url)
  const method = request.method
  const supabase = await getSupabase()
  if (!supabase) return bad('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY as Cloudflare Worker variables or local environment variables.', 503)
  if (method === 'GET' && (!path.length || path[0] === 'health')) return ok({ status: 'ok' })
  if (method === 'POST' && path[0] === 'seed') {
    await ensureSeed(supabase)
    return ok({ seeded: true })
  }

  if (path[0] === 'weavers') {
    if (method === 'GET' && path.length === 1) {
      const { data, error } = await supabase.from('weavers').select('*')
      return error ? bad(error.message) : ok(data || [])
    }
    if (method === 'POST' && path.length === 1) {
      const body = await request.json()
      const doc = { id: body.id || uuid(), name: body.name, lineage_generation: body.lineage_generation || '', cluster: body.cluster || '', portrait_url: body.portrait_url || '', bio: body.bio || '', created_at: new Date().toISOString() }
      if (!doc.name) return bad('name required')
      const { data, error } = await supabase.from('weavers').insert([doc]).select()
      return error ? bad(error.message) : ok(data[0], 201)
    }
  }

  if (path[0] === 'sarees' && path.length === 1) {
    if (method === 'GET') {
      await ensureSeed(supabase)
      let query = supabase.from('sarees').select('*')
      const status = url.searchParams.get('status')
      if (status && status !== 'all') query = query.eq('status', status)
      else if (!status) query = query.eq('status', 'published')
      const material = url.searchParams.get('material')
      const occasion = url.searchParams.get('occasion')
      const tone = url.searchParams.get('tone')
      const search = url.searchParams.get('search')
      if (material) query = query.contains('materials', [material])
      if (occasion) query = query.contains('occasions', [occasion])
      if (tone) query = query.contains('tones', [tone])
      if (search) query = query.or(`title.ilike.%${search}%,origin_cluster.ilike.%${search}%,loom_code.ilike.%${search}%`)
      const sort = url.searchParams.get('sort') || 'newest'
      if (sort === 'price_asc') query = query.order('retail_valuation_inr', { ascending: true })
      else if (sort === 'price_desc') query = query.order('retail_valuation_inr', { ascending: false })
      else query = query.order('created_at', { ascending: false })
      const { data, error } = await query
      return error ? bad(error.message) : ok(data || [])
    }
    if (method === 'POST') {
      const body = await request.json()
      if (!body.title) return bad('title required')
      const now = new Date().toISOString()
      const slug = body.slug ? slugify(body.slug) : `${slugify(body.title)}-${Math.random().toString(36).slice(2, 6)}`
      const doc = {
        id: uuid(), slug, title: body.title, loom_code: body.loom_code || '', origin_cluster: body.origin_cluster || '', weaver_id: body.weaver_id || null,
        loom_architecture: body.loom_architecture || '', weaving_duration_days: Number(body.weaving_duration_days) || 0, artisan_hours: Number(body.artisan_hours) || 0,
        warp_specification: body.warp_specification || '', weft_zari_composition: body.weft_zari_composition || body.weft_zani_composition || '', story_narrative: body.story_narrative || '',
        retail_valuation_inr: Number(body.retail_valuation_inr) || 0, available_units: Number(body.available_units) || 1, is_limited_heritage: !!body.is_limited_heritage,
        status: body.status || 'draft', is_silk_mark: !!body.is_silk_mark, is_handloom_mark: !!body.is_handloom_mark, is_organic_dye: !!body.is_organic_dye,
        materials: body.materials || [], occasions: body.occasions || [], tones: body.tones || [],
        media: (body.media || []).filter((item) => item?.public_url).map((item, index) => ({ id: uuid(), slot_type: item.slot_type || 'gallery', public_url: item.public_url, display_order: index })),
        created_at: now, updated_at: now,
      }
      const { data, error } = await supabase.from('sarees').insert([doc]).select()
      return error ? bad(error.message) : ok(data[0], 201)
    }
  }

  if (path[0] === 'sarees' && path[1]) {
    const key = path[1]
    if (method === 'GET') {
      const { data: item, error } = await matchSareeKey(supabase.from('sarees').select('*'), key).single()
      if (error || !item) return bad('not found', 404)
      let weaver = null
      if (item.weaver_id) {
        const { data } = await supabase.from('weavers').select('*').eq('id', item.weaver_id).single()
        weaver = data
      }
      return ok({ ...item, weaver })
    }
    if (method === 'PUT' || method === 'PATCH') {
      const updates = { ...(await request.json()), updated_at: new Date().toISOString() }
      delete updates._id
      delete updates.id
      const { data, error } = await matchSareeKey(supabase.from('sarees').update(updates), key).select().single()
      return error ? bad(error.message) : ok(data)
    }
    if (method === 'DELETE') {
      const { error } = await matchSareeKey(supabase.from('sarees').delete(), key)
      return error ? bad(error.message) : ok({ deleted: true })
    }
  }
  return bad('route not found', 404)
}

async function handle(request, context) {
  const { path = [] } = await context.params
  return route(request, path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
