import { createAiClient, getAiModelName } from "@/lib/ai/client";
import {
	validateAndSanitize,
	type ClinicalNoteDocument,
} from "@/lib/ai/schemas";
import {
	buildClinicalSystemPrompt,
	buildTranscriptUserPrompt,
} from "@/lib/ai/prompts";
import {
	getSpecialtyDefinition,
	type SpecialtyTemplateKey,
} from "@/lib/ai/specialties";

export async function processTranscriptWithOpenRouter(
	transcript: string,
	options?: {
		specialtyTemplate?: SpecialtyTemplateKey;
		customInstructions?: string | null;
	},
): Promise<ClinicalNoteDocument> {
	const specialty = getSpecialtyDefinition(options?.specialtyTemplate);
	const aiClient = createAiClient();

	const aiResponse = await aiClient.chat.completions.create({
		model: getAiModelName(),
		temperature: 0,
		response_format: {
			type: "json_schema",
			json_schema: specialty.jsonSchema,
		},
		messages: [
			{
				role: "system",
				content: buildClinicalSystemPrompt(
					specialty.systemInstructions,
					options?.customInstructions,
				),
			},
			{ role: "user", content: buildTranscriptUserPrompt(transcript) },
		],
	});

	const content = aiResponse.choices[0]?.message?.content;
	if (!content) {
		throw new Error("El modelo no devolvió contenido.");
	}

	return validateAndSanitize(
		options?.specialtyTemplate,
		JSON.parse(content),
	);
}
