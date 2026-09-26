'use client'
import { Header, Footer, CertBadge, GoldDivider } from '@/components/manorama'
import { useEffect, useState } from 'react'
import { inr } from '@/lib/format'
import Link from 'next/link'

export default function SareeDetailPage({ params }) {
  const [slug, setSlug] = useState(null)
  const [saree, setSaree] = useState(null)
  const [active, setActive] = useState(0)

  useEffect(() => { Promise.resolve(params).then(({ slug: value }) => setSlug(value)) }, [params])
  useEffect(() => {
    if (!slug) return
    fetch(`/api/sarees/${slug}`).then((response) => response.json()).then(setSaree).catch(() => setSaree({ error: true }))
  }, [slug])

  if (!saree) return <div className="min-h-screen bg-parchment"><Header /><div className="container py-32 text-center text-walnut-500">Unfolding the weave…</div><Footer /></div>
  if (saree.error) return <div className="min-h-screen bg-parchment"><Header /><div className="container py-32 text-center text-walnut-500">Weave not found. <Link href="/collection" className="border-b border-gold text-gold">Return to catalogue</Link></div><Footer /></div>

  const media = saree.media || []
  const hero = media[active] || media[0]
  return <div className="min-h-screen bg-parchment"><Header /><section className="container py-10 md:py-14"><div className="text-xs uppercase tracking-[0.28em] text-walnut-500"><Link href="/collection" className="hover:text-gold">Collection</Link> — {saree.origin_cluster}</div><div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2"><div><div className="aspect-[4/5] overflow-hidden border border-parchment-outline bg-parchment-linen">{hero && <img src={hero.public_url} alt={saree.title} className="h-full w-full object-cover" />}</div>{media.length > 1 && <div className="mt-3 grid grid-cols-4 gap-3">{media.map((image, index) => <button key={image.id || index} onClick={() => setActive(index)} className={`aspect-square overflow-hidden border ${index === active ? 'border-gold' : 'border-parchment-outline'}`}><img src={image.public_url} alt="" className="h-full w-full object-cover" /></button>)}</div>}</div><div>{saree.is_limited_heritage && <div className="text-[10px] uppercase tracking-[0.35em] text-gold">Limited Heritage — Single Piece</div>}<h1 className="mt-3 font-serif text-4xl leading-tight text-walnut-900 md:text-5xl">{saree.title}</h1><div className="mt-2 text-sm text-walnut-500">Loom Batch · <span className="tracking-widest">{saree.loom_code}</span></div><div className="mt-5 flex flex-wrap gap-2">{saree.is_silk_mark && <CertBadge label="Silk Mark" />}{saree.is_handloom_mark && <CertBadge label="Handloom Mark" />}{saree.is_organic_dye && <CertBadge label="Organic Dye" />}</div><div className="mt-6 flex items-end gap-4"><div className="font-serif text-3xl text-walnut-900">{inr(saree.retail_valuation_inr)}</div><div className="mb-1 text-sm text-walnut-500">{saree.available_units || 1} available</div></div><div className="mt-6 flex flex-wrap gap-3"><a href={`mailto:concierge@manoramasutra.in?subject=${encodeURIComponent(`Reserve ${saree.title}`)}`} className="bg-walnut-700 px-6 py-3 text-sm uppercase tracking-[0.2em] text-parchment hover:bg-walnut-900">Reserve this weave</a><a href={`mailto:concierge@manoramasutra.in?subject=${encodeURIComponent(`Enquiry: ${saree.title}`)}`} className="border border-walnut-700 px-6 py-3 text-sm uppercase tracking-[0.2em] text-walnut-700 hover:border-gold hover:text-gold">Enquire</a></div><GoldDivider /><div><div className="text-[11px] uppercase tracking-[0.35em] text-gold">The Narrative</div><p className="mt-3 font-serif text-xl italic leading-relaxed text-walnut-900">{saree.story_narrative}</p></div><div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm"><Spec label="Origin Cluster" value={saree.origin_cluster} /><Spec label="Loom Architecture" value={saree.loom_architecture} /><Spec label="Weaving Duration" value={saree.weaving_duration_days ? `${saree.weaving_duration_days} days` : ''} /><Spec label="Artisan Hours" value={saree.artisan_hours ? `${saree.artisan_hours} hrs` : ''} /><Spec label="Warp Specification" value={saree.warp_specification} /><Spec label="Weft & Zari" value={saree.weft_zari_composition} /></div>{saree.weaver && <div className="mt-10 flex items-center gap-4 border border-parchment-outline bg-parchment-linen p-5"><img src={saree.weaver.portrait_url} alt="" className="h-16 w-16 rounded-full border border-gold object-cover" /><div><div className="text-[10px] uppercase tracking-[0.35em] text-gold">The Master Weaver</div><div className="mt-0.5 font-serif text-xl text-walnut-900">{saree.weaver.name}</div><div className="text-sm text-walnut-500">{saree.weaver.lineage_generation} — {saree.weaver.cluster}</div></div></div>}</div></div></section><Footer /></div>
}

function Spec({ label, value }) {
  if (!value) return null
  return <div><div className="text-[10px] uppercase tracking-[0.3em] text-walnut-500">{label}</div><div className="mt-1 text-walnut-900">{value}</div></div>
}
