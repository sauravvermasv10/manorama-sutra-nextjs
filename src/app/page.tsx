'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Footer, GoldDivider, Header, ProductCard } from '@/components/manorama'

type HomeSaree = {
	id: string
	slug: string
	title: string
	media?: { public_url: string }[]
	hero_url?: string
	origin_cluster?: string
	retail_valuation_inr?: number
	is_limited_heritage?: boolean
	is_silk_mark?: boolean
	is_handloom_mark?: boolean
	is_organic_dye?: boolean
}

export default function Home() {
	const [sarees, setSarees] = useState<HomeSaree[]>([])
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		fetch('/api/sarees')
			.then((response) => response.json())
			.then((items) => setSarees(Array.isArray(items) ? items : []))
			.catch(() => setSarees([]))
			.finally(() => setLoaded(true))
	}, [])

	return (
		<div className="min-h-screen bg-parchment">
			<Header />
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 -z-10">
					<img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c" alt="" className="h-full w-full object-cover" />
					<div className="absolute inset-0 bg-gradient-to-r from-parchment via-parchment/85 to-parchment/20" />
				</div>
				<div className="container max-w-3xl py-24 md:py-36">
					<div className="mb-6 text-[11px] uppercase tracking-[0.4em] text-gold">Manorama Sutra — est. 2026</div>
					<h1 className="font-serif text-5xl leading-[1.05] text-walnut-900 md:text-7xl">Handloom Heritage.<br /><span className="gold-text italic">Woven Stories.</span></h1>
					<p className="mt-6 max-w-xl leading-relaxed text-walnut-700">A curated atelier of pure silk sarees, drawn from the last living master looms of Kanchipuram, Varanasi and Chanderi — one weave, one story, at a time.</p>
					<div className="mt-10 flex flex-wrap items-center gap-4">
						<Link href="/collection" className="inline-flex items-center gap-2 bg-walnut-700 px-6 py-3 text-sm uppercase tracking-[0.2em] text-parchment transition-colors hover:bg-walnut-900">Enter the Collection <ArrowRight className="h-4 w-4" /></Link>
						<Link href="#journey" className="border-b border-gold text-sm uppercase tracking-[0.2em] text-walnut-700 hover:text-gold">The Journey of a Saree</Link>
					</div>
				</div>
			</section>

			<section className="container py-20">
				<div className="mb-10 flex items-end justify-between gap-6"><div><div className="text-[11px] uppercase tracking-[0.4em] text-gold">Curated Houses</div><h2 className="mt-2 font-serif text-4xl text-walnut-900">Featured Collections</h2></div><Link href="/collection" className="hidden border-b border-gold text-sm text-walnut-700 hover:text-gold md:inline-flex">Explore all weaves</Link></div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{[
						{ label: 'Pure Silk', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c', copy: 'Kanjivarams, Banarasis, Korvais — mulberry silk and real zari.' },
						{ label: 'Heritage Cotton', img: 'https://images.unsplash.com/photo-1610030469245-ab65c4583802', copy: 'Chanderis, Jamdanis and hand-spun cottons for slow-living.' },
						{ label: 'Banarasi Brocade', img: 'https://images.unsplash.com/photo-1610189338175-0782dfdb0c04', copy: 'Kadhwa and Jangla brocades from the ateliers of Varanasi.' },
					].map((collection) => <div key={collection.label} className="group relative overflow-hidden border border-parchment-outline"><img src={collection.img} alt={collection.label} className="h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-walnut-900/80 via-walnut-900/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 text-parchment"><div className="text-[10px] uppercase tracking-[0.35em] text-gold-soft">House of</div><div className="mt-1 font-serif text-2xl">{collection.label}</div><div className="mt-2 text-sm text-parchment/85">{collection.copy}</div></div></div>)}
				</div>
			</section>

			<section id="journey" className="border-y border-parchment-outline bg-parchment-linen"><div className="container py-20"><div className="mx-auto max-w-2xl text-center"><div className="text-[11px] uppercase tracking-[0.4em] text-gold">Slow Craft</div><h2 className="mt-2 font-serif text-4xl text-walnut-900">The Journey of a Saree</h2><p className="mt-4 text-walnut-500">From the mulberry cocoon to the shoulder of a bride — every Manorama Sutra weave passes through the hands of thirty-two artisans, over ninety days.</p><GoldDivider /></div><div className="mt-6 grid gap-10 md:grid-cols-3">{[{ n: 'I', t: 'The Purity of Thread', c: 'Mulberry silk is reeled, degummed, twisted — three-plied to the loom’s exact denier. No shortcut. No blend.' }, { n: 'II', t: 'The Keeper of Time', c: 'A master weaver graphs, dyes, and warps for weeks before the first weft is cast. Time is the loom’s first material.' }, { n: 'III', t: 'Woven Heritage', c: 'The pallu is the signature — unfurling motifs passed down as family jaala graphs, kept in cloth-wrapped bundles for generations.' }].map((stage) => <div key={stage.n} className="text-center"><div className="gold-text font-serif text-5xl">{stage.n}</div><div className="mt-3 font-serif text-xl text-walnut-900">{stage.t}</div><div className="mt-3 text-sm leading-relaxed text-walnut-500">{stage.c}</div></div>)}</div></div></section>

			<section className="container py-20"><div className="mb-10 flex items-end justify-between"><div><div className="text-[11px] uppercase tracking-[0.4em] text-gold">New Admissions</div><h2 className="mt-2 font-serif text-4xl text-walnut-900">Recent Weaves in the Atelier</h2></div><Link href="/collection" className="border-b border-gold text-sm text-walnut-700 hover:text-gold">View catalogue</Link></div>{!loaded ? <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="aspect-[3/4] animate-pulse border border-parchment-outline bg-parchment-linen" />)}</div> : sarees.length ? <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{sarees.slice(0, 4).map((saree) => <ProductCard key={saree.id} s={saree} />)}</div> : <p className="text-sm text-walnut-500">No recent weaves are available yet.</p>}</section>

			<section id="weavers" className="relative"><div className="absolute inset-0 -z-10"><img src="https://images.unsplash.com/photo-1640292343595-889db1c8262e" alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-walnut-900/70" /></div><div className="container max-w-3xl py-24 text-parchment"><div className="text-[11px] uppercase tracking-[0.4em] text-gold-soft">Voice of the Loom</div><p className="mt-4 font-serif text-3xl leading-snug md:text-4xl">“The warp is patience, the weft is memory. When I finish a saree, I do not sell it — I release it to another keeper.”</p><div className="mt-6 text-sm uppercase tracking-[0.2em] text-gold-soft">Ramaswamy Chettiar — 5th Generation, Kanchipuram</div></div></section>
			<Footer />
		</div>
	)
}
