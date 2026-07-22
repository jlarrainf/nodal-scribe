import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { SPECIALTIES, sanitizeCustomFields } from "@/lib/ai/specialties";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
	try {
		const supabase = createSupabaseRouteClient(request);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return jsonError("Unauthorized", 401);
		}

		const { data, error } = await supabase
			.from("custom_specialties")
			.select("id, name, base_template, fields, created_at, updated_at")
			.eq("user_id", user.id)
			.order("created_at", { ascending: true });

		if (error) {
			return jsonError(error.message, 400);
		}

		return NextResponse.json({ specialties: data ?? [] });
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al obtener las plantillas.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = createSupabaseRouteClient(request);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return jsonError("Unauthorized", 401);
		}

		const body = (await request.json()) as {
			name?: string;
			base_template?: string;
			fields?: unknown;
		};

		const name = body.name?.trim().slice(0, 80);
		if (!name) {
			return jsonError("El nombre de la plantilla es obligatorio.");
		}

		const baseTemplate =
			body.base_template && body.base_template in SPECIALTIES ?
				body.base_template
			:	"general_soap";

		const fields = sanitizeCustomFields(body.fields);
		if (fields.length === 0) {
			return jsonError("La plantilla debe tener al menos un campo.");
		}

		const { data, error } = await supabase
			.from("custom_specialties")
			.insert({
				user_id: user.id,
				name,
				base_template: baseTemplate,
				fields,
			})
			.select("id, name, base_template, fields")
			.single();

		if (error) {
			return jsonError(error.message, 400);
		}

		return NextResponse.json(data);
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al crear la plantilla.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}
