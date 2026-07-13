import { NextRequest, NextResponse } from "next/server";
import { createAsrClient, getAsrModelName } from "@/lib/ai/client";
import { processTranscriptWithOpenRouter } from "@/lib/ai/process-clinical-note";
import { getAuthenticatedProfile } from "@/lib/supabase/profiles";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
	try {
		const { profile } = await getAuthenticatedProfile(request);
		const formData = await request.formData();
		const audioEntry = formData.get("audio");

		if (!(audioEntry instanceof File)) {
			return jsonError("Falta el archivo de audio.");
		}

		if (audioEntry.size === 0) {
			return jsonError("El archivo de audio está vacío.");
		}

		const asrClient = createAsrClient();

		const transcriptResponse = await asrClient.audio.transcriptions.create({
			file: audioEntry,
			model: getAsrModelName(),
			language: "es",
		});

		const transcript = transcriptResponse.text?.trim();
		if (!transcript) {
			return jsonError("No se pudo obtener una transcripción válida.", 502);
		}

		const note = await processTranscriptWithOpenRouter(transcript, {
			specialtyTemplate: profile.specialty_template,
			customInstructions: profile.custom_instructions,
		});
		return NextResponse.json(note);
	} catch (error) {
		const message =
			error instanceof Error ?
				error.message
			:	"Error inesperado al procesar el audio.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}
