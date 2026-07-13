import {
	getSpecialtyDefinition,
	type SpecialtyField,
} from "@/lib/ai/specialties";
import type { ClinicalNoteDocument } from "@/lib/ai/schemas";

const emptySection = () => [] as string[];

function createEmptyValue(field: SpecialtyField): unknown {
	if (field.kind === "group" && field.children) {
		return Object.fromEntries(
			field.children.map((child) => [child.key, createEmptyValue(child)]),
		);
	}

	return field.kind === "list" ? emptySection() : "";
}

export function createEmptyClinicalNote(
	specialtyTemplate?: string | null,
): ClinicalNoteDocument {
	const specialty = getSpecialtyDefinition(specialtyTemplate);
	return Object.fromEntries(
		specialty.fields.map((field) => [field.key, createEmptyValue(field)]),
	);
}

export function splitSectionText(value: string): string[] {
	return value
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
}

export function joinSectionText(items: string[]): string {
	return items.join("\n");
}

function formatValue(label: string, value: unknown): string {
	if (Array.isArray(value)) {
		const lines =
			value.length > 0 ? value.map((item) => `- ${item}`).join("\n") : "-";
		return `${label}\n${lines}`;
	}

	if (value && typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>);
		return [
			label,
			...entries.map(([key, child]) => formatValue(key, child)),
		].join("\n\n");
	}

	return `${label}\n${value ? String(value) : "-"}`;
}

function capitalizeLabel(value: string) {
	return value
		.replaceAll("_", " ")
		.replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}

function renderFields(
	fields: ReadonlyArray<SpecialtyField>,
	note: ClinicalNoteDocument,
): string[] {
	return fields.flatMap((field) => {
		const value = note[field.key];
		if (field.kind === "group" && field.children) {
			return [
				formatValue(field.label, ""),
				...renderFields(field.children, value as ClinicalNoteDocument),
			];
		}

		return [formatValue(field.label, value)];
	});
}

export function noteToClipboardText(
	note: ClinicalNoteDocument,
	specialtyTemplate?: string | null,
): string {
	const specialty = getSpecialtyDefinition(specialtyTemplate);
	return renderFields(specialty.fields, note).join("\n\n");
}

export function getSpecialtyPreviewLines(
	specialtyTemplate?: string | null,
): string[] {
	const specialty = getSpecialtyDefinition(specialtyTemplate);
	return specialty.fields.map((field) => capitalizeLabel(field.label));
}
