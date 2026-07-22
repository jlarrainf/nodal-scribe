import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

type CookieToSet = {
	name: string;
	value: string;
	options?: Record<string, unknown>;
};

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

function createCollectingClient(
	request: NextRequest,
	sink: CookieToSet[],
) {
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
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet: CookieToSet[]) {
					cookiesToSet.forEach((cookie) => sink.push(cookie));
				},
			},
		},
	);
}

function applyCookies(response: NextResponse, cookies: CookieToSet[]) {
	cookies.forEach(({ name, value, options }) => {
		response.cookies.set(name, value, options ?? {});
	});
	return response;
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ action: string }> },
) {
	const { action } = await context.params;
	const requestUrl = new URL(request.url);
	const origin = requestUrl.origin;

	if (action === "google") {
		const cookiesToSet: CookieToSet[] = [];
		const supabase = createCollectingClient(request, cookiesToSet);

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${origin}/api/auth/callback`,
			},
		});

		if (error || !data?.url) {
			return NextResponse.redirect(`${origin}/login`);
		}

		return applyCookies(NextResponse.redirect(data.url, 302), cookiesToSet);
	}

	if (action === "callback") {
		const code = requestUrl.searchParams.get("code");
		const next = requestUrl.searchParams.get("next") ?? "/app";

		if (code) {
			const cookiesToSet: CookieToSet[] = [];
			const supabase = createCollectingClient(request, cookiesToSet);
			const { error } = await supabase.auth.exchangeCodeForSession(code);

			if (!error) {
				return applyCookies(
					NextResponse.redirect(`${origin}${next}`),
					cookiesToSet,
				);
			}
		}

		return NextResponse.redirect(`${origin}/login`);
	}

	return NextResponse.redirect(origin);
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ action: string }> },
) {
	const { action } = await context.params;

	if (action === "sign-out") {
		const response = NextResponse.json({ ok: true });
		const supabase = createResponseClient(request, response);
		await supabase.auth.signOut();
		return response;
	}

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
