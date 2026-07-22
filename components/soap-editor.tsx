"use client";

import type { ReactNode } from "react";
import type { SpecialtyField } from "@/lib/ai/specialties";
import type { ClinicalNoteDocument } from "@/lib/ai/schemas";
import { joinSectionText, splitSectionText } from "@/lib/utils/clinical-note";

type SoapEditorProps = {
	value: ClinicalNoteDocument;
	onChange: (nextValue: ClinicalNoteDocument) => void;
	disabled?: boolean;
	structure: {
		label: string;
		fields: ReadonlyArray<SpecialtyField>;
	};
	headerActions?: ReactNode;
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
				className="rounded-xl border border-black/6 border-l-2 border-l-forest/30 bg-paper/30 p-4"
			>
				<div className="mb-3">
					<h3 className="text-[13px] font-semibold text-ink">{node.label}</h3>
					{node.placeholder ?
						<p className="mt-0.5 text-xs text-ink/50">{node.placeholder}</p>
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
		<label key={node.key} className="grid gap-1.5">
			<span className="text-[13px] font-medium text-ink/85">{node.label}</span>
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
				className="min-h-24 rounded-lg border border-black/10 bg-paper/40 px-3 py-2.5 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/30 focus:border-forest focus:ring-2 focus:ring-forest/15 disabled:cursor-not-allowed disabled:opacity-60"
			/>
		</label>
	);
}

export function SoapEditor({
	value,
	onChange,
	disabled,
	structure,
	headerActions,
}: SoapEditorProps) {
	const sections = structure.fields;

	const updateSection = (key: string, text: string, kind: "text" | "list") => {
		onChange({
			...value,
			[key]: kind === "list" ? splitSectionText(text) : text,
		});
	};

	return (
		<section className="grid gap-4 rounded-2xl border border-black/8 bg-gradient-to-b from-white to-paper/30 p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_16px_40px_-20px_rgba(35,66,58,0.25)]">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/6 pb-4">
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
					</span>
					<div className="min-w-0">
						<h2 className="text-[15px] font-semibold leading-tight text-ink">
							Ficha clínica
						</h2>
						<p className="truncate font-mono text-[11px] text-ink/45">
							{structure.label}
						</p>
					</div>
				</div>
				{headerActions}
			</div>

			<div className="grid gap-4">
				{sections.map((section) =>
					renderSection(section, value[section.key], updateSection, disabled),
				)}
			</div>
		</section>
	);
}
