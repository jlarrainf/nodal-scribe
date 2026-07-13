import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "./url";

export async function updateSession(request: NextRequest) {
	let response = NextResponse.next({ request });

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		return response;
	}

	const supabase = createServerClient(
		normalizeSupabaseUrl(supabaseUrl),
		supabaseAnonKey,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string) {
					response = NextResponse.next({ request });
					response.cookies.set(name, value);
				},
				remove(name: string) {
					response = NextResponse.next({ request });
					response.cookies.delete(name);
				},
			},
		},
	);

	await supabase.auth.getUser();
	return response;
}
