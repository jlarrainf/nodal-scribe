import { NextRequest, NextResponse } from "next/server";
import {
	SPECIALTIES,
	DEFAULT_SPECIALTY_TEMPLATE,
} from "@/lib/ai/specialties";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
	getAuthenticatedProfile,
	resolveActiveSpecialty,
} from "@/lib/supabase/profiles";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
	try {
		const { userId, profile } = await getAuthenticatedProfile(request);
		const supabase = createSupabaseRouteClient(request);
		const specialty = await resolveActiveSpecialty(
			supabase,
			userId,
			profile.specialty_template,
		);

		return NextResponse.json({
			...profile,
			active_specialty: {
				label: specialty.label,
				description: specialty.description,
				fields: specialty.fields,
				templateKey: specialty.templateKey,
				id: specialty.id,
			},
		});
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
			live_note_focus?: string;
		};

		const requestedTemplate = body.specialty_template?.trim() ?? "";
		let specialtyTemplate: string = DEFAULT_SPECIALTY_TEMPLATE;

		if (requestedTemplate in SPECIALTIES) {
			specialtyTemplate = requestedTemplate;
		} else if (requestedTemplate) {
			const { data: custom } = await supabase
				.from("custom_specialties")
				.select("id")
				.eq("id", requestedTemplate)
				.eq("user_id", user.id)
				.maybeSingle();
			if (custom) {
				specialtyTemplate = requestedTemplate;
			}
		}

		const customInstructions = body.custom_instructions?.trim() ?? "";
		const liveNoteFocus = body.live_note_focus?.trim().slice(0, 600) ?? "";

		const { data, error } = await supabase
			.from("profiles")
			.upsert(
				{
					user_id: user.id,
					specialty_template: specialtyTemplate,
					custom_instructions: customInstructions,
					live_note_focus: liveNoteFocus,
				},
				{ onConflict: "user_id" },
			)
			.select("user_id, specialty_template, custom_instructions, live_note_focus")
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
