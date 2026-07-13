import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "./url";

export async function createSupabaseServerClient() {
	const cookieStore = await cookies();
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error("Faltan variables de entorno de Supabase en el servidor.");
	}

	return createServerClient(
		normalizeSupabaseUrl(supabaseUrl),
		supabaseAnonKey,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string) {
					cookieStore.set({ name, value });
				},
				remove(name: string) {
					cookieStore.delete(name);
				},
			},
		},
	);
}
