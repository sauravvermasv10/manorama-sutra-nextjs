import { getSupabase } from './[...path]/route'

export async function GET() {
	const supabase = await getSupabase()
	if (!supabase) {
		return Response.json({ error: 'Supabase not configured.' }, { status: 503 })
	}
	return Response.json({ status: 'ok' })
}