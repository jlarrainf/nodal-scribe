export type HighlightKind = "normal" | "number" | "temporal" | "medication";

export type HighlightToken = {
	text: string;
	kind: HighlightKind;
};

const NUMBER_UNIT =
	/\b\d+([.,]\d+)?\s*(grados?|°|kilos?|kg|ml|mg|mmhg|porciento|%|años?|meses?|semanas?|días?|hrs?|horas?)\b/gi;

const NUMBER_PLAIN = /\b\d+([.,]\d+)?\b/g;

const TEMPORAL_KEYWORDS =
	/\b(hace|desde|durante|por|aproximadamente|alrededor\s+de|cerca\s+de)\s+\d+/gi;

const TEMPORAL_EXPLICIT =
	/\b(ayer|anoche|hoy|mañana|esta\s+(mañana|tarde|noche)|la\s+siguiente\s+semana|la\s+semana\s+pasada|el\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo)(\s+pasado)?|el\s+\d+\s+de\s+\w+)\b/gi;

const MEDICATION_SUFFIX = /\b\w+(ol|ina|pam|mab|vir|zol|prazol|triptil|caina|oxetina|pina|sartán|prima)\b/gi;

const MEDICATION_KNOWN =
	/\b(paracetamol|ibuprofeno|aspirina|naproxeno|metformina|atorvastatina|losartán|enalapril|omeprazol|levotiroxina|salbutamol|amoxicilina|azitromicina|fluoxetina|sertralina|clonazepam|diazepam|alprazolam|risperidona|quetiapina|haloperidol|litio|ácido\s+valproico|valproato|lamotrigina|carbamazepina|fenitoína)\b/gi;

function classifyWord(word: string): HighlightKind {
	if (NUMBER_UNIT.test(word) || NUMBER_PLAIN.test(word)) {
		return "number";
	}

	if (
		TEMPORAL_KEYWORDS.test(word) ||
		TEMPORAL_EXPLICIT.test(word)
	) {
		return "temporal";
	}

	if (MEDICATION_SUFFIX.test(word) || MEDICATION_KNOWN.test(word)) {
		return "medication";
	}

	return "normal";
}

export function highlightEntities(text: string): HighlightToken[] {
	const tokens: HighlightToken[] = [];
	const parts = text.split(/(\s+)/);

	for (const part of parts) {
		if (!part) continue;

		const kind = classifyWord(part);
		tokens.push({ text: part, kind });
	}

	return tokens;
}
