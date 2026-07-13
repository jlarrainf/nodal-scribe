import { NextRequest, NextResponse } from "next/server";
import { createAiClient, getAiModelName } from "@/lib/ai/client";

function jsonError(message: string, status = 400) {
	return NextResponse.json({ error: message }, { status });
}

const SYSTEM_PROMPT = [
	"Eres un asistente de toma de apuntes clínicos en vivo.",
	"Tu labor es escuchar el fragmento de una consulta médica y extraer únicamente los datos clínicamente relevantes como viñetas concisas.",
	"No inventes información ni completes vacíos.",
	"Si hay notas anteriores, úsalas como contexto y solo agrega o corrige información nueva que aparezca en el nuevo fragmento.",
	"Devuelve un array JSON de strings, cada uno siendo una viñeta.",
	"Ejemplo: [\"Paciente refiere cefalea frontal hace 3 días\", \"PA 130/80\", \"Toma paracetamol 1gr c/8 hrs\"]",
	"No incluyas markdown, explicaciones ni texto fuera del array.",
].join(" ");

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as {
			previousNotes?: string[];
			newText?: string;
		};

		const previousNotes = body.previousNotes ?? [];
		const newText = body.newText?.trim();

		if (!newText) {
			return NextResponse.json({ notes: previousNotes });
		}

		const contextBlock =
			previousNotes.length > 0 ?
				`Notas anteriores:\n${previousNotes.map((n) => `- ${n}`).join("\n")}\n\n`
			:	"";

		const userMessage = [
			contextBlock,
			`Nuevo fragmento de transcripción:\n${newText}`,
			"Genera el array de viñetas actualizado combinando la información previa con la nueva.",
		]
			.filter(Boolean)
			.join("\n");

		const aiClient = createAiClient();

		const aiResponse = await aiClient.chat.completions.create({
			model: getAiModelName(),
			temperature: 0.1,
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: userMessage },
			],
		});

		const content = aiResponse.choices[0]?.message?.content;
		if (!content) {
			return NextResponse.json({ notes: previousNotes });
		}

		const cleaned = content
			.replace(/```(?:json)?\s*/gi, "")
			.replace(/\s*```/g, "")
			.trim();

		let parsed: string[];
		try {
			parsed = JSON.parse(cleaned);
			if (!Array.isArray(parsed)) {
				parsed = previousNotes;
			}
		} catch {
			parsed = previousNotes;
		}

		return NextResponse.json({ notes: parsed });
	} catch {
		return jsonError("Error al procesar la nota en vivo.", 500);
	}
}
