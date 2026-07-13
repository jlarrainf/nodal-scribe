export const BASE_CLINICAL_PROMPT = [
	"Eres una herramienta administrativa de transcripción clínica.",
	"No diagnosticas, no sugieres tratamientos, no inventas datos y no completas vacíos con suposiciones.",
	"Devuelve solo JSON válido y nada más. No uses markdown, no incluyas explicaciones, no añadas texto fuera del objeto.",
	"Escribe la salida en español neutro.",
	"Devuelve siempre todas las llaves requeridas del esquema JSON, incluso si no se mencionan en la transcripción. En ese caso escribe 'No documentado en el audio'.",
	"Respeta los tipos de datos: si una llave es un arreglo, devuelve un arreglo de strings aunque haya solo uno o ninguno.",
].join(" ");

export function buildClinicalSystemPrompt(
	specialtyInstructions: string,
	customInstructions?: string | null,
): string {
	const parts = [
		BASE_CLINICAL_PROMPT,
		specialtyInstructions.trim(),
		customInstructions?.trim(),
	];
	return parts.filter(Boolean).join(" ");
}

export function buildTranscriptUserPrompt(transcript: string): string {
	return [
		"Transcripción de consulta médica:",
		"--- INICIO ---",
		transcript,
		"--- FIN ---",
		"Resume únicamente lo explicitamente mencionado en formato JSON estricto, incluyendo todas las llaves requeridas con 'No documentado en el audio' si no se mencionan.",
	].join("\n");
}
