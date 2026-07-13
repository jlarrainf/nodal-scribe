import OpenAI from "openai";

function requiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
}

function optionalHeaders(): Record<string, string> | undefined {
	const siteUrl = process.env.SITE_URL;
	if (!siteUrl) {
		return undefined;
	}

	return {
		"HTTP-Referer": siteUrl,
		"X-Title": "Nodal Scribe PoC",
	};
}

export function createAsrClient() {
	return new OpenAI({
		baseURL: requiredEnv("ASR_BASE_URL"),
		apiKey: requiredEnv("ASR_API_KEY"),
	});
}

export function createAiClient() {
	return new OpenAI({
		baseURL: requiredEnv("AI_BASE_URL"),
		apiKey: requiredEnv("AI_API_KEY"),
		defaultHeaders: optionalHeaders(),
	});
}

export function getAiModelName(): string {
	return requiredEnv("AI_MODEL_NAME");
}

export function getAsrModelName(): string {
	return requiredEnv("ASR_MODEL_NAME");
}
