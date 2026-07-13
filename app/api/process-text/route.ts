import { NextRequest, NextResponse } from "next/server";
import { processTranscriptWithOpenRouter } from "@/lib/ai/process-clinical-note";
import { getAuthenticatedProfile } from "@/lib/supabase/profiles";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
	try {
		const { profile } = await getAuthenticatedProfile(request);
		const body = (await request.json()) as { text?: string };
		const text = body.text?.trim();

		if (!text) {
			return jsonError("El texto de transcripción es obligatorio.");
		}

		const note = await processTranscriptWithOpenRouter(text, {
			specialtyTemplate: profile.specialty_template,
			customInstructions: profile.custom_instructions,
		});
		return NextResponse.json(note);
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al procesar el texto.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}
