'use client'
import { Header, Footer, BrandEmblem } from '@/components/manorama'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Plus, Trash2, ImagePlus, Save, Eye, Send } from 'lucide-react'

const SLOTS = [
  { key: 'hero_full_drape', label: 'Full Drape (Hero)' },
  { key: 'pallu_macro', label: 'Pallu Close-up' },
  { key: 'zari_border', label: 'Zari Border Macro' },
  { key: 'weaver_on_loom', label: 'Artisan on Loom' },
]
const CLUSTERS = ['Kanchipuram, Tamil Nadu', 'Varanasi, Uttar Pradesh', 'Chanderi, Madhya Pradesh', 'Bhagalpur, Bihar', 'Kota, Rajasthan', 'Paithan, Maharashtra']
const MATERIALS = ['Pure Silk', 'Handspun Cotton', 'Linen', 'Tussar', 'Chanderi']
const OCCASIONS = ['Muhurtham / Wedding', 'Festive Royal', 'Diplomatic Gifting', 'Casual Heritage']
const TONES = ['Crimson', 'Saffron', 'Indigo', 'Emerald', 'Ivory/Gold']
const BLANK = () => ({ title: '', slug: '', loom_code: '', origin_cluster: CLUSTERS[0], weaver_id: '', loom_architecture: '', weaving_duration_days: 0, artisan_hours: 0, warp_specification: '', weft_zari_composition: '', story_narrative: '', retail_valuation_inr: 0, available_units: 1, is_limited_heritage: false, status: 'draft', is_silk_mark: true, is_handloom_mark: true, is_organic_dye: false, materials: [], occasions: [], tones: [], media: SLOTS.map((slot) => ({ slot_type: slot.key, public_url: '' })) })

export default function AdminPage() {
  const [tab, setTab] = useState('archive')
  const [form, setForm] = useState(BLANK())
  const [sarees, setSarees] = useState([])
  const [weavers, setWeavers] = useState([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [sareeResponse, weaverResponse] = await Promise.all([fetch('/api/sarees?status=all'), fetch('/api/weavers')])
      const [sareeData, weaverData] = await Promise.all([sareeResponse.json(), weaverResponse.json()])
      setSarees(Array.isArray(sareeData) ? sareeData : [])
      setWeavers(Array.isArray(weaverData) ? weaverData : [])
    } catch {
      setSarees([])
      setWeavers([])
      toast.error('Could not load the atelier archive')
    }
  }
  useEffect(() => { void Promise.resolve().then(load) }, [])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const toggleTag = (key, value) => setForm((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }))
  const updateMedia = (index, publicUrl) => setForm((current) => ({ ...current, media: current.media.map((item, itemIndex) => itemIndex === index ? { ...item, public_url: publicUrl } : item) }))

  const submit = async (status) => {
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    try {
      const response = await fetch('/api/sarees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, status }) })
      if (!response.ok) throw new Error('Failed')
      const created = await response.json()
      toast.success(status === 'published' ? `Published to catalogue: ${created.title}` : `Saved as ${status}`)
      setForm(BLANK())
      await load()
      setTab('queue')
    } catch {
      toast.error('Could not save. Please retry.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Remove this admission from the archive?')) return
    const response = await fetch(`/api/sarees/${id}`, { method: 'DELETE' })
    if (!response.ok) return toast.error('Could not remove this admission')
    toast.success('Removed')
    load()
  }
  const setStatus = async (slug, status) => {
    const response = await fetch(`/api/sarees/${slug}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (!response.ok) return toast.error('Could not update this admission')
    toast.success(status === 'published' ? 'Live on catalogue' : `Marked ${status}`)
    load()
  }

  return <div className="min-h-screen bg-parchment"><Toaster richColors position="top-center" /><Header /><section className="container py-10"><div className="mb-6 flex flex-wrap items-center justify-between gap-6"><div><div className="text-[11px] uppercase tracking-[0.4em] text-gold">Manorama Sutra — Atelier</div><h1 className="mt-2 font-serif text-4xl text-walnut-900">Curator’s Studio</h1></div><div className="flex flex-wrap gap-2 text-sm"><TabBtn active={tab === 'archive'} onClick={() => setTab('archive')}>Saree Archives</TabBtn><TabBtn active={tab === 'queue'} onClick={() => setTab('queue')}>Live Catalogue Queue</TabBtn><TabBtn active={tab === 'weavers'} onClick={() => setTab('weavers')}>Weaver Profiles</TabBtn></div></div>

    {tab === 'archive' && <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]"><div className="border border-parchment-outline bg-white p-6 md:p-8"><div className="mb-1 text-[11px] uppercase tracking-[0.35em] text-gold">New Admission</div><div className="font-serif text-2xl text-walnut-900">Provenance &amp; Registry</div><div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Title"><Input value={form.title} onChange={(value) => update('title', value)} placeholder="e.g. Swarna Kamal Kanjivaram" /></Field><Field label="Loom Batch Code"><Input value={form.loom_code} onChange={(value) => update('loom_code', value)} placeholder="KNC-2026-08" /></Field><Field label="Weaving Cluster"><Select value={form.origin_cluster} onChange={(value) => update('origin_cluster', value)} options={CLUSTERS} /></Field><Field label="Master Weaver"><select className="w-full border border-parchment-outline bg-parchment px-3 py-2 text-sm focus:border-gold focus:outline-none" value={form.weaver_id} onChange={(event) => update('weaver_id', event.target.value)}><option value="">— unassigned —</option>{weavers.map((weaver) => <option key={weaver.id} value={weaver.id}>{weaver.name} — {weaver.cluster}</option>)}</select></Field><Field label="Loom Architecture"><Input value={form.loom_architecture} onChange={(value) => update('loom_architecture', value)} placeholder="Pit Loom with Double Shuttle" /></Field><Field label="Weaving Duration (days)"><Input type="number" value={form.weaving_duration_days} onChange={(value) => update('weaving_duration_days', Number(value))} /></Field><Field label="Artisan Hours"><Input type="number" value={form.artisan_hours} onChange={(value) => update('artisan_hours', Number(value))} /></Field><Field label="Available Units"><Input type="number" value={form.available_units} onChange={(value) => update('available_units', Number(value))} /></Field><Field label="Warp Specification" full><Input value={form.warp_specification} onChange={(value) => update('warp_specification', value)} placeholder="3-Ply Mulberry Silk, 20/22 Denier" /></Field><Field label="Weft & Zari Composition" full><Input value={form.weft_zari_composition} onChange={(value) => update('weft_zari_composition', value)} placeholder="98.5% Silver core with 24k Gold plating" /></Field></div>

      <div className="mt-8"><div className="mb-2 text-[11px] uppercase tracking-[0.35em] text-gold">Editorial Narrative</div><textarea rows={5} value={form.story_narrative} onChange={(event) => update('story_narrative', event.target.value)} placeholder="Compose the poetic cultural story of this weave…" className="w-full border border-parchment-outline bg-parchment px-3 py-2 font-serif text-sm italic focus:border-gold focus:outline-none" /></div>
      <div className="mt-8"><div className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">Archival Media — Four Slots</div><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{SLOTS.map((slot, index) => <div key={slot.key} className="flex items-center gap-3 border border-dashed border-parchment-outline bg-parchment-linen p-4"><div className="flex h-16 w-16 items-center justify-center overflow-hidden border border-parchment-outline bg-white">{form.media[index].public_url ? <img src={form.media[index].public_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-walnut-500" />}</div><div className="min-w-0 flex-1"><div className="mb-1 text-xs uppercase tracking-[0.2em] text-walnut-700">{slot.label}</div><input value={form.media[index].public_url} onChange={(event) => updateMedia(index, event.target.value)} placeholder="Paste image URL…" className="w-full border border-parchment-outline bg-white px-2 py-1.5 text-xs focus:border-gold focus:outline-none" /></div></div>)}</div><div className="mt-2 text-[11px] text-walnut-500">Paste any hosted image URL (CDN, Unsplash, your own storage). Drag-drop upload to R2/Supabase Storage available when keys are configured.</div></div>
      <div className="mt-8 grid gap-6 md:grid-cols-3"><TagPicker label="Material" options={MATERIALS} values={form.materials} onToggle={(value) => toggleTag('materials', value)} /><TagPicker label="Occasion" options={OCCASIONS} values={form.occasions} onToggle={(value) => toggleTag('occasions', value)} /><TagPicker label="Chromatic Tone" options={TONES} values={form.tones} onToggle={(value) => toggleTag('tones', value)} /></div>
      <div className="mt-8 flex flex-wrap gap-4"><Check label="Silk Mark" checked={form.is_silk_mark} onChange={(value) => update('is_silk_mark', value)} /><Check label="Handloom Mark" checked={form.is_handloom_mark} onChange={(value) => update('is_handloom_mark', value)} /><Check label="Organic Dye" checked={form.is_organic_dye} onChange={(value) => update('is_organic_dye', value)} /><Check label="Limited Heritage — single piece" checked={form.is_limited_heritage} onChange={(value) => update('is_limited_heritage', value)} /></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Retail Valuation (₹)"><Input type="number" value={form.retail_valuation_inr} onChange={(value) => update('retail_valuation_inr', Number(value))} /></Field><Field label="Slug (optional)"><Input value={form.slug} onChange={(value) => update('slug', value)} placeholder="auto-generated if empty" /></Field></div>
      <div className="heritage-divider my-8" /><div className="flex flex-wrap gap-3"><button disabled={saving} onClick={() => submit('draft')} className="inline-flex items-center gap-2 border border-walnut-700 px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-walnut-700 hover:bg-walnut-700 hover:text-parchment disabled:opacity-50"><Save className="h-4 w-4" /> Save as Draft</button><button disabled={saving} onClick={() => submit('curating')} className="inline-flex items-center gap-2 border border-gold px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-walnut-700 hover:bg-gold hover:text-white disabled:opacity-50"><Eye className="h-4 w-4" /> Send to Curating</button><button disabled={saving} onClick={() => submit('published')} className="inline-flex items-center gap-2 bg-walnut-700 px-5 py-2.5 text-sm uppercase tracking-[0.2em] text-parchment hover:bg-walnut-900 disabled:opacity-50"><Send className="h-4 w-4" /> Publish to Catalogue</button></div></div>
      <aside className="space-y-4"><div className="border border-parchment-outline bg-white p-5"><div className="mb-3 flex items-center gap-3"><BrandEmblem /><div className="font-serif text-lg text-walnut-900">The Atelier</div></div><p className="text-sm text-walnut-500">Each admission passes three stages: Draft → Curating → Live on Catalogue.</p></div><div className="border border-parchment-outline bg-white p-5"><div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-gold">Recent Admissions</div><div className="space-y-3">{sarees.slice(0, 6).map((saree) => <div key={saree.id} className="flex items-center gap-3"><div className="h-12 w-10 overflow-hidden border border-parchment-outline bg-parchment-linen">{saree.media?.[0]?.public_url && <img src={saree.media[0].public_url} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="truncate text-sm text-walnut-900">{saree.title}</div><StatusPill status={saree.status} /></div></div>)}</div></div></aside></div>}

    {tab === 'queue' && <div className="overflow-x-auto border border-parchment-outline bg-white"><table className="w-full text-sm"><thead className="bg-parchment-linen text-walnut-700"><tr><th className="p-3 text-left text-[11px] font-normal uppercase tracking-[0.2em]">Weave</th><th className="p-3 text-left text-[11px] font-normal uppercase tracking-[0.2em]">Cluster</th><th className="p-3 text-left text-[11px] font-normal uppercase tracking-[0.2em]">Valuation</th><th className="p-3 text-left text-[11px] font-normal uppercase tracking-[0.2em]">Status</th><th className="p-3" /></tr></thead><tbody>{sarees.map((saree) => <tr key={saree.id} className="border-t border-parchment-outline"><td className="p-3"><div className="flex items-center gap-3"><div className="h-12 w-10 overflow-hidden border border-parchment-outline bg-parchment-linen">{saree.media?.[0]?.public_url && <img src={saree.media[0].public_url} alt="" className="h-full w-full object-cover" />}</div><div><div className="text-walnut-900">{saree.title}</div><div className="text-xs text-walnut-500">{saree.loom_code}</div></div></div></td><td className="p-3 text-walnut-700">{saree.origin_cluster}</td><td className="p-3 text-walnut-700">₹ {Number(saree.retail_valuation_inr || 0).toLocaleString('en-IN')}</td><td className="p-3"><StatusPill status={saree.status} /></td><td className="p-3"><div className="flex justify-end gap-2">{saree.status !== 'published' && <button onClick={() => setStatus(saree.slug, 'published')} className="border-b border-gold text-xs uppercase tracking-widest text-gold">Publish</button>}{saree.status === 'published' && <button onClick={() => setStatus(saree.slug, 'draft')} className="border-b border-walnut-500 text-xs uppercase tracking-widest text-walnut-500">Unpublish</button>}<button onClick={() => remove(saree.id)} className="text-walnut-500 hover:text-destructive" aria-label="Delete admission"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}
    {tab === 'weavers' && <WeaverPanel weavers={weavers} reload={load} />}
  </section><Footer /></div>
}

function TabBtn({ active, onClick, children }) { return <button onClick={onClick} className={`border px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${active ? 'border-walnut-700 bg-walnut-700 text-parchment' : 'border-parchment-outline text-walnut-700 hover:border-gold'}`}>{children}</button> }
function Field({ label, children, full }) { return <div className={full ? 'md:col-span-2' : ''}><div className="mb-1.5 text-[11px] uppercase tracking-[0.28em] text-walnut-700">{label}</div>{children}</div> }
function Input({ value, onChange, placeholder, type = 'text' }) { return <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full border border-parchment-outline bg-parchment px-3 py-2 text-sm focus:border-gold focus:outline-none" /> }
function Select({ value, onChange, options }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-parchment-outline bg-parchment px-3 py-2 text-sm focus:border-gold focus:outline-none">{options.map((option) => <option key={option}>{option}</option>)}</select> }
function Check({ label, checked, onChange }) { return <label className="inline-flex items-center gap-2 text-sm text-walnut-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-gold" />{label}</label> }
function TagPicker({ label, options, values, onToggle }) { return <div><div className="mb-2 text-[11px] uppercase tracking-[0.28em] text-walnut-700">{label}</div><div className="flex flex-wrap gap-1.5">{options.map((option) => { const selected = values.includes(option); return <button key={option} onClick={() => onToggle(option)} className={`border px-2 py-1 text-[11px] ${selected ? 'border-gold bg-gold text-white' : 'border-parchment-outline text-walnut-700 hover:border-gold'}`}>{option}</button> })}</div></div> }
function StatusPill({ status }) { const styles = { draft: 'border-parchment-outline bg-parchment-linen text-walnut-500', curating: 'border-gold/60 bg-gold/10 text-walnut-700', published: 'border-walnut-700 bg-walnut-700 text-parchment' }; const label = status === 'published' ? 'Live on Catalog' : status === 'curating' ? 'Curating' : 'Draft'; return <span className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${styles[status] || styles.draft}`}>{label}</span> }

function WeaverPanel({ weavers, reload }) {
  const [form, setForm] = useState({ name: '', lineage_generation: '', cluster: '', portrait_url: '', bio: '' })
  const submit = async () => {
    if (!form.name) return toast.error('Name required')
    const response = await fetch('/api/weavers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (response.ok) { toast.success('Weaver added'); setForm({ name: '', lineage_generation: '', cluster: '', portrait_url: '', bio: '' }); reload() }
    else toast.error('Could not add this weaver')
  }
  return <div className="grid gap-6 md:grid-cols-2"><div className="border border-parchment-outline bg-white p-6"><div className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">Add Master Weaver</div><div className="grid gap-3"><Input value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="Name" /><Input value={form.lineage_generation} onChange={(lineage_generation) => setForm({ ...form, lineage_generation })} placeholder="e.g. 4th Generation Master Weaver" /><Input value={form.cluster} onChange={(cluster) => setForm({ ...form, cluster })} placeholder="Cluster — e.g. Kanchipuram, Tamil Nadu" /><Input value={form.portrait_url} onChange={(portrait_url) => setForm({ ...form, portrait_url })} placeholder="Portrait image URL" /><textarea rows={3} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Biography…" className="w-full border border-parchment-outline bg-parchment px-3 py-2 text-sm focus:border-gold focus:outline-none" /><button onClick={submit} className="inline-flex items-center gap-2 bg-walnut-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-parchment"><Plus className="h-4 w-4" /> Add Weaver</button></div></div><div className="space-y-3">{weavers.map((weaver) => <div key={weaver.id} className="flex items-center gap-4 border border-parchment-outline bg-white p-4"><img src={weaver.portrait_url} alt="" className="h-16 w-16 rounded-full border border-gold object-cover" /><div><div className="font-serif text-lg text-walnut-900">{weaver.name}</div><div className="text-xs text-walnut-500">{weaver.lineage_generation} — {weaver.cluster}</div><div className="mt-1 line-clamp-2 text-xs text-walnut-500">{weaver.bio}</div></div></div>)}</div></div>
}
