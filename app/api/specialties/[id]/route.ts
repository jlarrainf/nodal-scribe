import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { sanitizeCustomFields } from "@/lib/ai/specialties";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const supabase = createSupabaseRouteClient(request);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return jsonError("Unauthorized", 401);
		}

		const body = (await request.json()) as {
			name?: string;
			fields?: unknown;
		};

		const updates: Record<string, unknown> = {};

		if (typeof body.name === "string") {
			const name = body.name.trim().slice(0, 80);
			if (!name) {
				return jsonError("El nombre es obligatorio.");
			}
			updates.name = name;
		}

		if (body.fields !== undefined) {
			const fields = sanitizeCustomFields(body.fields);
			if (fields.length === 0) {
				return jsonError("La plantilla debe tener al menos un campo.");
			}
			updates.fields = fields;
		}

		const { data, error } = await supabase
			.from("custom_specialties")
			.update(updates)
			.eq("id", id)
			.eq("user_id", user.id)
			.select("id, name, base_template, fields")
			.maybeSingle();

		if (error) {
			return jsonError(error.message, 400);
		}

		if (!data) {
			return jsonError("Plantilla no encontrada.", 404);
		}

		return NextResponse.json(data);
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al actualizar la plantilla.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}

export async function DELETE(request: NextRequest, context: RouteContext) {
	try {
		const { id } = await context.params;
		const supabase = createSupabaseRouteClient(request);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return jsonError("Unauthorized", 401);
		}

		const { data: profile } = await supabase
			.from("profiles")
			.select("specialty_template")
			.eq("user_id", user.id)
			.maybeSingle();

		if (profile?.specialty_template === id) {
			return jsonError(
				"No puedes eliminar la plantilla que tienes activa. Cambia a otra primero.",
				409,
			);
		}

		const { error } = await supabase
			.from("custom_specialties")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			return jsonError(error.message, 400);
		}

		return NextResponse.json({ ok: true });
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al eliminar la plantilla.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}
