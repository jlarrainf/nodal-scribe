import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "./url";

export function createSupabaseRouteClient(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Faltan variables de entorno de Supabase.");
	}

	return createServerClient(
		normalizeSupabaseUrl(supabaseUrl),
		supabaseAnonKey,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set() {},
				remove() {},
			},
		},
	);
}
