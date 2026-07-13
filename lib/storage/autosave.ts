import type { ClinicalNoteDocument } from "@/lib/ai/schemas";

export type DraftPayload = {
	note: ClinicalNoteDocument;
	specialtyTemplate: string;
	updatedAt: string;
};

export const AUTOSAVE_KEY = "nodal-scribe-draft";
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24;

export function saveDraft(note: ClinicalNoteDocument, specialtyTemplate?: string) {
	if (typeof window === "undefined") {
		return;
	}

	const existing = loadDraft();
	const payload: DraftPayload = {
		note,
		specialtyTemplate: specialtyTemplate ?? existing?.specialtyTemplate ?? "general_soap",
		updatedAt: new Date().toISOString(),
	};

	window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
}

export function loadDraft(): DraftPayload | null {
	if (typeof window === "undefined") {
		return null;
	}

	const raw = window.localStorage.getItem(AUTOSAVE_KEY);
	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw) as DraftPayload;
		const updatedAt = new Date(parsed.updatedAt).getTime();
		if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > DRAFT_TTL_MS) {
			window.localStorage.removeItem(AUTOSAVE_KEY);
			return null;
		}

		return parsed;
	} catch {
		window.localStorage.removeItem(AUTOSAVE_KEY);
		return null;
	}
}

export function clearDraft() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(AUTOSAVE_KEY);
}
