import { NextRequest, NextResponse } from "next/server";
import { processTranscriptWithSpecialty } from "@/lib/ai/process-clinical-note";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import {
	getAuthenticatedProfile,
	resolveActiveSpecialty,
} from "@/lib/supabase/profiles";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
	try {
		const { userId, profile } = await getAuthenticatedProfile(request);
		const supabase = createSupabaseRouteClient(request);
		const specialty = await resolveActiveSpecialty(
			supabase,
			userId,
			profile.specialty_template,
		);

		const body = (await request.json()) as { text?: string };
		const text = body.text?.trim();

		if (!text) {
			return jsonError("El texto de transcripción es obligatorio.");
		}

		const note = await processTranscriptWithSpecialty(
			text,
			specialty,
			profile.custom_instructions,
		);
		return NextResponse.json(note);
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al procesar el texto.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}
