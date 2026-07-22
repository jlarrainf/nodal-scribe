import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { createAiClient, getAiModelName } from "@/lib/ai/client";
import {
	validateAndSanitize,
	validateCustomNote,
	type ClinicalNoteDocument,
} from "@/lib/ai/schemas";
import {
	buildClinicalSystemPrompt,
	buildTranscriptUserPrompt,
} from "@/lib/ai/prompts";
import type { SpecialtyDefinition } from "@/lib/ai/specialties";

function extractContent(response: unknown): string | null {
	const typed = response as {
		choices?: Array<{ message?: { content?: string | null } }>;
	};
	return typed.choices?.[0]?.message?.content ?? null;
}

function extractApiError(response: unknown): string | null {
	const typed = response as { error?: { message?: string } };
	return typed.error?.message ?? null;
}

function stripCodeFences(content: string): string {
	return content
		.replace(/```(?:json)?\s*/gi, "")
		.replace(/```/g, "")
		.trim();
}

export async function processTranscriptWithSpecialty(
	transcript: string,
	specialty: SpecialtyDefinition,
	customInstructions?: string | null,
): Promise<ClinicalNoteDocument> {
	const aiClient = createAiClient();
	const model = getAiModelName();

	const messages: ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: buildClinicalSystemPrompt(
				specialty.systemInstructions,
				customInstructions,
			),
		},
		{ role: "user", content: buildTranscriptUserPrompt(transcript) },
	];

	let content: string | null = null;
	let errorDetail: string | null = null;

	try {
		const strictResponse = await aiClient.chat.completions.create({
			model,
			temperature: 0,
			response_format: {
				type: "json_schema",
				json_schema: specialty.jsonSchema,
			},
			messages,
		});
		content = extractContent(strictResponse);
		errorDetail = extractApiError(strictResponse);
	} catch (error) {
		errorDetail = error instanceof Error ? error.message : String(error);
	}

	if (!content) {
		try {
			const plainResponse = await aiClient.chat.completions.create({
				model,
				temperature: 0,
				messages,
			});
			content = extractContent(plainResponse);
			errorDetail = extractApiError(plainResponse) ?? errorDetail;
		} catch (error) {
			errorDetail = error instanceof Error ? error.message : String(error);
		}
	}

	if (!content) {
		throw new Error(
			`El modelo no devolvió una respuesta válida${
				errorDetail ? ` (${errorDetail})` : ""
			}. Puede ser un límite de tarifa del proveedor o un modelo no disponible.`,
		);
	}

	const parsed = JSON.parse(stripCodeFences(content));

	if (specialty.templateKey) {
		return validateAndSanitize(specialty.templateKey, parsed);
	}

	return validateCustomNote(specialty.fields, parsed);
}
