"use client";

import { getSpecialtyDefinition } from "@/lib/ai/specialties";
import type { ClinicalNoteDocument } from "@/lib/ai/schemas";
import { joinSectionText, splitSectionText } from "@/lib/utils/clinical-note";

type SoapEditorProps = {
	value: ClinicalNoteDocument;
	onChange: (nextValue: ClinicalNoteDocument) => void;
	disabled?: boolean;
	specialtyTemplate?: string;
};

type SectionNode = {
	key: string;
	label: string;
	kind: "text" | "list" | "group";
	placeholder?: string;
	children?: ReadonlyArray<SectionNode>;
};

function renderSection(
	node: SectionNode,
	value: unknown,
	onChange: (key: string, nextText: string, kind: "text" | "list") => void,
	disabled?: boolean,
) {
	if (node.kind === "group" && node.children) {
		return (
			<div
				key={node.key}
				className="rounded-3xl border border-black/5 bg-paper/40 p-4"
			>
				<div className="mb-3">
					<h3 className="text-sm font-semibold text-ink">{node.label}</h3>
					{node.placeholder ?
						<p className="mt-1 text-xs text-ink/60">{node.placeholder}</p>
					:	null}
				</div>
				<div className="grid gap-3">
					{node.children.map((child) =>
						renderSection(
							child,
							(value as Record<string, unknown> | undefined)?.[child.key],
							onChange,
							disabled,
						),
					)}
				</div>
			</div>
		);
	}

	const displayedValue =
		node.kind === "list" ?
			joinSectionText(Array.isArray(value) ? value.map(String) : [])
		: typeof value === "string" ? value
		: "";

	return (
		<label key={node.key} className="grid gap-2">
			<span className="text-sm font-medium text-ink">{node.label}</span>
			<textarea
				value={displayedValue}
				onChange={(event) =>
					onChange(
						node.key,
						event.target.value,
						node.kind === "list" ? "list" : "text",
					)
				}
				disabled={disabled}
				rows={4}
				placeholder={node.placeholder}
				className="min-h-28 rounded-2xl border border-black/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest focus:ring-2 focus:ring-forest/20 disabled:cursor-not-allowed disabled:opacity-70"
			/>
		</label>
	);
}

export function SoapEditor({
	value,
	onChange,
	disabled,
	specialtyTemplate,
}: SoapEditorProps) {
	const specialty = getSpecialtyDefinition(specialtyTemplate);
	const sections = specialty.fields;

	const updateSection = (key: string, text: string, kind: "text" | "list") => {
		onChange({
			...value,
			[key]: kind === "list" ? splitSectionText(text) : text,
		});
	};

	return (
		<section className="grid gap-4 rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-soft backdrop-blur">
			<div>
				<h2 className="text-lg font-semibold text-ink">Editor de ficha</h2>
				<p className="mt-1 text-sm text-ink/70">
					Revisa y ajusta la salida antes de copiarla a la ficha oficial.
				</p>
				<p className="mt-2 inline-flex rounded-full bg-forest/10 px-3 py-1 text-xs font-medium text-forest">
					{specialty.label}
				</p>
			</div>

			<div className="grid gap-4">
				{sections.map((section) =>
					renderSection(section, value[section.key], updateSection, disabled),
				)}
			</div>
		</section>
	);
}
