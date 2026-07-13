import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

function createResponseClient(request: NextRequest, response: NextResponse) {
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
				set(name: string, value: string) {
					response.cookies.set(name, value);
				},
				remove(name: string) {
					response.cookies.delete(name);
				},
			},
		},
	);
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ action: string }> },
) {
	const { action } = await context.params;
	const body = (await request.json()) as { email?: string; password?: string };
	const email = body.email?.trim();
	const password = body.password ?? "";

	if (!email || !password) {
		return NextResponse.json(
			{ error: "Correo y contraseña son obligatorios." },
			{ status: 400 },
		);
	}

	const response = NextResponse.json({ ok: true });
	const supabase = createResponseClient(request, response);

	if (action === "sign-in") {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 401 });
		}

		return response;
	}

	const { error } = await supabase.auth.signUp({ email, password });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return response;
}
