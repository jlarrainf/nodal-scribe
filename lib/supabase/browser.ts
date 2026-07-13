import { createBrowserClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "./url";

export function createSupabaseBrowserClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Faltan variables de entorno de Supabase en el cliente.");
	}

	return createBrowserClient(
		normalizeSupabaseUrl(supabaseUrl),
		supabaseAnonKey,
	);
}
