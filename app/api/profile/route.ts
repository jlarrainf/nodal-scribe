import { NextRequest, NextResponse } from "next/server";
import {
	SPECIALTIES,
	DEFAULT_SPECIALTY_TEMPLATE,
	type SpecialtyTemplateKey,
} from "@/lib/ai/specialties";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { getAuthenticatedProfile } from "@/lib/supabase/profiles";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
	try {
		const { profile } = await getAuthenticatedProfile(request);
		return NextResponse.json(profile);
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al obtener el perfil.";
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
			specialty_template?: string;
			custom_instructions?: string;
		};

		const specialtyTemplate =
			body.specialty_template && body.specialty_template in SPECIALTIES ?
				(body.specialty_template as SpecialtyTemplateKey)
			:	DEFAULT_SPECIALTY_TEMPLATE;

		const customInstructions = body.custom_instructions?.trim() ?? "";

		const { data, error } = await supabase
			.from("profiles")
			.upsert(
				{
					user_id: user.id,
					specialty_template: specialtyTemplate,
					custom_instructions: customInstructions,
				},
				{ onConflict: "user_id" },
			)
			.select("user_id, specialty_template, custom_instructions")
			.single();

		if (error) {
			return jsonError(error.message, 400);
		}

		return NextResponse.json(data);
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al guardar el perfil.";
		return jsonError(message, 500);
	}
}
