import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

export async function middleware(request: NextRequest) {
	const response = await updateSession(request);

	const pathname = request.nextUrl.pathname;
	const isProtectedPath = pathname === "/" || pathname.startsWith("/settings");
	const isLoginPath = pathname === "/login";

	if (!isProtectedPath && !isLoginPath) {
		return response;
	}

	const supabase = createServerClient(
		normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user && isProtectedPath) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		url.searchParams.set("redirectTo", pathname);
		return NextResponse.redirect(url);
	}

	if (user && isLoginPath) {
		const url = request.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: ["/", "/login", "/settings"],
};
