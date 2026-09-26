'use client'
import { Header, Footer, ProductCard, GoldDivider } from '@/components/manorama'
import { useEffect, useMemo, useState } from 'react'

const MATERIALS = ['Pure Silk', 'Handspun Cotton', 'Linen', 'Tussar', 'Chanderi']
const OCCASIONS = ['Muhurtham / Wedding', 'Festive Royal', 'Diplomatic Gifting', 'Casual Heritage']
const TONES = ['Crimson', 'Saffron', 'Indigo', 'Emerald', 'Ivory/Gold']

export default function CollectionPage() {
  const [result, setResult] = useState({ params: '', items: null })
  const [material, setMaterial] = useState('')
  const [occasion, setOccasion] = useState('')
  const [tone, setTone] = useState('')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const params = useMemo(() => {
    const query = new URLSearchParams()
    if (material) query.set('material', material)
    if (occasion) query.set('occasion', occasion)
    if (tone) query.set('tone', tone)
    if (sort) query.set('sort', sort)
    if (search) query.set('search', search)
    return query.toString()
  }, [material, occasion, tone, sort, search])

  useEffect(() => {
    fetch(`/api/sarees?${params}`).then((response) => response.json()).then((data) => setResult({ params, items: Array.isArray(data) ? data : [] })).catch(() => setResult({ params, items: [] }))
  }, [params])

  const clear = () => { setMaterial(''); setOccasion(''); setTone(''); setSort('newest'); setSearch('') }
  const items = result.params === params ? result.items : null

  return <div className="min-h-screen bg-parchment"><Header /><section className="container py-14"><div className="text-[11px] uppercase tracking-[0.4em] text-gold">The Collection</div><h1 className="mt-2 font-serif text-4xl text-walnut-900 md:text-5xl">Curated Weaves of the Atelier</h1><p className="mt-3 max-w-2xl text-walnut-500">Every piece here is loomed by hand, catalogued by cluster, and released only when its weaver signs it off.</p><GoldDivider /><div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]"><aside className="space-y-8"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, cluster, loom code…" className="w-full border border-parchment-outline bg-parchment px-3 py-2 text-sm focus:border-gold focus:outline-none" /><FilterGroup label="Material" options={MATERIALS} value={material} onChange={setMaterial} /><FilterGroup label="Occasion" options={OCCASIONS} value={occasion} onChange={setOccasion} /><FilterGroup label="Chromatic Tone" options={TONES} value={tone} onChange={setTone} /><div><div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-walnut-700">Provenance</div><label className="flex items-center gap-2 text-sm text-walnut-500"><input type="checkbox" className="accent-gold" /> Silk Mark verified</label><label className="mt-1 flex items-center gap-2 text-sm text-walnut-500"><input type="checkbox" className="accent-gold" /> Handloom Mark</label><label className="mt-1 flex items-center gap-2 text-sm text-walnut-500"><input type="checkbox" className="accent-gold" /> Organic Dye</label></div><button onClick={clear} className="border-b border-gold text-xs uppercase tracking-[0.25em] text-walnut-700 hover:text-gold">Reset filters</button></aside><div><div className="mb-6 flex items-center justify-between"><div className="text-sm text-walnut-500">{items ? `${items.length} weaves` : 'Loading…'}</div><select value={sort} onChange={(event) => setSort(event.target.value)} className="border border-parchment-outline bg-parchment px-3 py-2 text-sm focus:border-gold focus:outline-none"><option value="newest">Newest admissions</option><option value="price_asc">Valuation — ascending</option><option value="price_desc">Valuation — descending</option></select></div>{!items ? <div className="grid grid-cols-2 gap-6 md:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="aspect-[3/4] animate-pulse border border-parchment-outline bg-parchment-linen" />)}</div> : items.length === 0 ? <div className="border border-dashed border-parchment-outline p-14 text-center text-walnut-500">No weaves match this filter. <button className="text-gold underline" onClick={clear}>Reset</button></div> : <div className="grid grid-cols-2 gap-6 md:grid-cols-3">{items.map((saree) => <ProductCard key={saree.id} s={saree} />)}</div>}</div></div></section><Footer /></div>
}

function FilterGroup({ label, options, value, onChange }) {
  return <div><div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-walnut-700">{label}</div><div className="space-y-1.5">{options.map((option) => <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-walnut-500 hover:text-walnut-700"><input type="radio" name={label} className="accent-gold" checked={value === option} onChange={() => onChange(option)} />{option}</label>)}{value && <button onClick={() => onChange('')} className="mt-1 text-[11px] uppercase tracking-[0.2em] text-gold">Clear</button>}</div></div>
}
