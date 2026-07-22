import { NextRequest, NextResponse } from "next/server";
import { createAsrClient, getAsrModelName, createAiClient, getAiModelName } from "@/lib/ai/client";
import { getAuthenticatedProfile } from "@/lib/supabase/profiles";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

const DEFAULT_LIVE_FOCUS =
	"motivo de consulta, síntomas y signos relevantes, signos vitales, medicamentos y dosis, alergias, antecedentes pertinentes, y acuerdos o pendientes";

function buildLiveSystemPrompt(focus: string): string {
	const effectiveFocus = focus.trim() || DEFAULT_LIVE_FOCUS;
	return [
		"Eres un asistente que toma notas clínicas en vivo durante una consulta en curso.",
		"Genera notas concisas en formato Markdown para que el médico pueda revisar lo importante sin esperar al final de la consulta.",
		"REGLA DE ORO: cero invención. Incluye únicamente información mencionada explícitamente en la transcripción. Si no hay datos de un punto, omítelo; no escribas 'no documentado' ni rellenes vacíos.",
		`Enfócate en capturar: ${effectiveFocus}.`,
		"Formato: usa encabezados (##), negritas (**texto**) y viñetas (-) para ordenar. Sé breve, clínico y escribe en español.",
		"Si recibes notas previas, intégralas con la información nueva: actualiza, corrige y evita duplicados. No dejes encabezados vacíos.",
		"Devuelve únicamente el Markdown resultante, sin bloques de código, sin explicaciones y sin texto adicional.",
	].join(" ");
}

function stripCodeFences(content: string): string {
	return content
		.replace(/```(?:markdown|md)?\s*/gi, "")
		.replace(/```/g, "")
		.trim();
}

export async function POST(request: NextRequest) {
	try {
		const { profile } = await getAuthenticatedProfile(request);

		const formData = await request.formData();
		const audioEntry = formData.get("audio");
		const previousNotes =
			typeof formData.get("previousNotes") === "string" ?
				(formData.get("previousNotes") as string)
			:	"";

		if (!(audioEntry instanceof File) || audioEntry.size === 0) {
			return NextResponse.json({ markdown: previousNotes, transcribed: false });
		}

		const asrClient = createAsrClient();
		const transcriptResponse = await asrClient.audio.transcriptions.create({
			file: audioEntry,
			model: getAsrModelName(),
			language: "es",
		});

		const transcript = transcriptResponse.text?.trim();
		if (!transcript) {
			return NextResponse.json({ markdown: previousNotes, transcribed: false });
		}

		const userMessage = [
			previousNotes.trim() ?
				`Notas previas (Markdown):\n${previousNotes.trim()}\n`
			:	"",
			`Nuevo fragmento de transcripción de la consulta:\n${transcript}`,
			"Devuelve las notas en Markdown, actualizadas e integradas con las notas previas.",
		]
			.filter(Boolean)
			.join("\n");

		const aiClient = createAiClient();
		const aiResponse = await aiClient.chat.completions.create({
			model: getAiModelName(),
			temperature: 0.1,
			messages: [
				{ role: "system", content: buildLiveSystemPrompt(profile.live_note_focus) },
				{ role: "user", content: userMessage },
			],
		});

		const content = aiResponse.choices?.[0]?.message?.content ?? null;
		if (!content) {
			return NextResponse.json({ markdown: previousNotes, transcribed: true });
		}

		const markdown = stripCodeFences(content);
		return NextResponse.json({
			markdown: markdown || previousNotes,
			transcribed: true,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Error al procesar la nota en vivo.";
		return jsonError(message, message === "Unauthorized" ? 401 : 500);
	}
}
