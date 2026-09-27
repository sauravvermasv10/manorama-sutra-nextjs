import { getSupabase } from './[...path]/route'

export async function GET() {
	const supabase = await getSupabase()
	if (!supabase) {
		return Response.json({ error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the Cloudflare deployment environment, then redeploy.' }, { status: 503 })
	}
	return Response.json({ status: 'ok' })
}