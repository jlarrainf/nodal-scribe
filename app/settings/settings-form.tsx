"use client";

import { useState } from "react";
import {
	getSpecialtyDefinition,
	type SpecialtyField,
} from "@/lib/ai/specialties";
import { FieldsEditor } from "@/components/fields-editor";

type SpecialtyOption = {
	value: string;
	label: string;
	description: string;
};

type CustomTemplate = {
	id: string;
	name: string;
	base_template: string;
	fields: SpecialtyField[];
};

type EditingTemplate = {
	id?: string;
	name: string;
	base_template: string;
	fields: SpecialtyField[];
};

type SettingsFormProps = {
	initialProfile: {
		specialty_template: string;
		custom_instructions: string;
		live_note_focus: string;
	};
	specialtyOptions: SpecialtyOption[];
	customTemplates: CustomTemplate[];
	userEmail?: string;
};

const INSTRUCTION_MAX = 600;

const INSTRUCTION_EXAMPLES = [
	"Redacta en tercera persona y tono clínico formal.",
	"Usa viñetas breves, sin párrafos largos.",
	"Emplea abreviaturas y terminología MINSAL.",
	"Destaca valores numéricos y dosis exactas.",
];

const FOCUS_MAX = 400;

const FOCUS_EXAMPLES = [
	"Signos vitales y mediciones",
	"Medicamentos y dosis",
	"Alergias",
	"Síntomas de alarma",
	"Acuerdos y pendientes",
];

const CARD_SURFACE =
	"rounded-2xl border border-black/8 bg-gradient-to-b from-white to-paper/30 p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_16px_40px_-20px_rgba(35,66,58,0.25)]";

function cloneFields(fields: ReadonlyArray<SpecialtyField>): SpecialtyField[] {
	return JSON.parse(JSON.stringify(fields)) as SpecialtyField[];
}

function countLeafFields(fields: ReadonlyArray<SpecialtyField>): number {
	return fields.reduce((total, field) => {
		if (field.kind === "group") {
			return total + countLeafFields(field.children ?? []);
		}
		return total + 1;
	}, 0);
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
	return <span className={`block h-2 rounded-full bg-ink/[0.08] ${width}`} />;
}

function FieldSkeletonNode({ field }: { field: SpecialtyField }) {
	if (field.kind === "group") {
		return (
			<div className="rounded-lg border border-black/6 border-l-2 border-l-forest/40 bg-paper/45 p-2.5">
				<p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-forest/80">
					{field.label}
				</p>
				<div className="mt-2 space-y-2.5">
					{(field.children ?? []).map((child) => (
						<FieldSkeletonNode key={child.key} field={child} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div>
			<p className="text-[11px] font-medium leading-4 text-ink/65">{field.label}</p>
			{field.kind === "list" ?
				<div className="mt-1.5 space-y-1.5">
					<div className="flex items-center gap-1.5">
						<span className="h-1 w-1 shrink-0 rounded-full bg-forest/50" />
						<SkeletonLine />
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-1 w-1 shrink-0 rounded-full bg-forest/50" />
						<SkeletonLine width="w-3/4" />
					</div>
				</div>
			:	<div className="mt-1.5 space-y-1.5">
					<SkeletonLine />
					<SkeletonLine width="w-2/3" />
				</div>
			}
		</div>
	);
}

function FieldSkeleton({ fields }: { fields: ReadonlyArray<SpecialtyField> }) {
	return (
		<div className="space-y-3">
			{fields.map((field) => (
				<FieldSkeletonNode key={field.key} field={field} />
			))}
		</div>
	);
}

function SectionHeader({
	n,
	title,
	desc,
}: {
	n: string;
	title: string;
	desc: string;
}) {
	return (
		<div>
			<div className="flex items-center gap-2.5">
				<span className="font-mono text-[11px] font-bold text-clay">{n}</span>
				<span className="h-px w-4 bg-black/10" />
				<h2 className="text-[15px] font-semibold tracking-tight text-ink">
					{title}
				</h2>
			</div>
			<p className="mt-1 max-w-xl text-[13px] leading-5 text-ink/55">{desc}</p>
		</div>
	);
}

export function SettingsForm({
	initialProfile,
	specialtyOptions,
	customTemplates: initialCustomTemplates,
	userEmail,
}: SettingsFormProps) {
	const [specialtyTemplate, setSpecialtyTemplate] = useState(
		initialProfile.specialty_template,
	);
	const [customInstructions, setCustomInstructions] = useState(
		initialProfile.custom_instructions,
	);
	const [liveNoteFocus, setLiveNoteFocus] = useState(
		initialProfile.live_note_focus,
	);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{
		text: string;
		tone: "success" | "error";
	} | null>(null);

	const [customTemplates, setCustomTemplates] = useState(initialCustomTemplates);
	const [editing, setEditing] = useState<EditingTemplate | null>(null);
	const [savingTemplate, setSavingTemplate] = useState(false);

	const activeCustom = customTemplates.find((t) => t.id === specialtyTemplate);
	const previewStructure =
		activeCustom ?
			{
				label: activeCustom.name,
				description: `Personalizada a partir de ${
					getSpecialtyDefinition(activeCustom.base_template).label
				}.`,
				fields: activeCustom.fields,
			}
		:	getSpecialtyDefinition(specialtyTemplate);

	const isDirty =
		specialtyTemplate !== initialProfile.specialty_template ||
		customInstructions !== initialProfile.custom_instructions ||
		liveNoteFocus !== initialProfile.live_note_focus;

	const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "NS";

	const appendInstruction = (text: string) => {
		setCustomInstructions((current) => {
			if (current.includes(text)) {
				return current;
			}
			const base = current.trim();
			if (!base) {
				return text;
			}
			return `${base}\n${text}`;
		});
	};

	const appendFocus = (text: string) => {
		setLiveNoteFocus((current) => {
			if (current.includes(text)) {
				return current;
			}
			const base = current.trim();
			const candidate = base ? `${base}, ${text.toLowerCase()}` : text.toLowerCase();
			return candidate.slice(0, FOCUS_MAX);
		});
	};

	const startCustomizingBase = () => {
		const base = getSpecialtyDefinition(specialtyTemplate);
		setEditing({
			name: `${base.label} (personalizada)`,
			base_template: specialtyTemplate,
			fields: cloneFields(base.fields),
		});
	};

	const startEditingCustom = (template: CustomTemplate) => {
		setEditing({
			id: template.id,
			name: template.name,
			base_template: template.base_template,
			fields: cloneFields(template.fields),
		});
	};

	const saveEditing = async () => {
		if (!editing) {
			return;
		}
		setSavingTemplate(true);
		setMessage(null);

		try {
			if (editing.id) {
				const response = await fetch(`/api/specialties/${editing.id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: editing.name, fields: editing.fields }),
				});
				const data = (await response.json()) as CustomTemplate & { error?: string };
				if (!response.ok) {
					throw new Error(data.error ?? "No se pudo guardar la plantilla.");
				}
				setCustomTemplates((list) =>
					list.map((t) =>
						t.id === editing.id ?
							{ ...t, name: editing.name, fields: editing.fields }
						:	t,
					),
				);
				setMessage({ text: "Plantilla actualizada.", tone: "success" });
			} else {
				const response = await fetch("/api/specialties", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: editing.name,
						base_template: editing.base_template,
						fields: editing.fields,
					}),
				});
				const data = (await response.json()) as CustomTemplate & { error?: string };
				if (!response.ok) {
					throw new Error(data.error ?? "No se pudo crear la plantilla.");
				}
				setCustomTemplates((list) => [...list, data]);
				setSpecialtyTemplate(data.id);
				setMessage({
					text: "Plantilla creada y seleccionada. Guarda los ajustes para activarla.",
					tone: "success",
				});
			}
			setEditing(null);
		} catch (error) {
			setMessage({
				text: error instanceof Error ? error.message : "Error al guardar la plantilla.",
				tone: "error",
			});
		} finally {
			setSavingTemplate(false);
		}
	};

	const deleteCustom = async (template: CustomTemplate) => {
		if (!window.confirm(`¿Eliminar la plantilla "${template.name}"?`)) {
			return;
		}
		setMessage(null);
		try {
			const response = await fetch(`/api/specialties/${template.id}`, {
				method: "DELETE",
			});
			const data = (await response.json()) as { error?: string };
			if (!response.ok) {
				throw new Error(data.error ?? "No se pudo eliminar la plantilla.");
			}
			setCustomTemplates((list) => list.filter((t) => t.id !== template.id));
			if (specialtyTemplate === template.id) {
				setSpecialtyTemplate(template.base_template);
			}
			setMessage({ text: "Plantilla eliminada.", tone: "success" });
		} catch (error) {
			setMessage({
				text: error instanceof Error ? error.message : "Error al eliminar la plantilla.",
				tone: "error",
			});
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaving(true);
		setMessage(null);

		try {
			const response = await fetch("/api/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					specialty_template: specialtyTemplate,
					custom_instructions: customInstructions,
					live_note_focus: liveNoteFocus,
				}),
			});

			const payload = (await response.json()) as { error?: string };

			if (!response.ok) {
				setMessage({
					text: payload.error ?? "No se pudo guardar el perfil.",
					tone: "error",
				});
				return;
			}

			setMessage({ text: "Preferencias guardadas.", tone: "success" });
		} catch {
			setMessage({
				text: "Error de red al guardar el perfil.",
				tone: "error",
			});
		} finally {
			setSaving(false);
		}
	};

	const selectedIsBase = specialtyOptions.some((o) => o.value === specialtyTemplate);

	return (
		<form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_340px]">
			<div className="grid gap-5">
				{userEmail ?
					<div className="flex items-center justify-between gap-3 rounded-xl border border-black/6 bg-white/60 px-3.5 py-2.5">
						<div className="flex min-w-0 items-center gap-2.5">
							<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/10 font-mono text-[10px] font-bold text-forest">
								{initials}
							</span>
							<p className="truncate text-[13px] font-medium text-ink/80">
								{userEmail}
							</p>
						</div>
						<span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-forest/70">
							<svg
								className="h-3 w-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							RLS
						</span>
					</div>
				:	null}

				<section className={CARD_SURFACE}>
					<SectionHeader
						n="01"
						title="Plantilla de especialidad"
						desc="Define la estructura de la ficha que genera el modelo. Se aplica en tu próxima transcripción."
					/>

					<div
						role="radiogroup"
						aria-label="Plantilla de especialidad"
						className="mt-4 grid gap-2"
					>
						{specialtyOptions.map((option) => {
							const selected = specialtyTemplate === option.value;
							return (
								<label
									key={option.value}
									className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
										selected ?
											"border-forest/60 bg-forest/5 ring-1 ring-inset ring-forest/20"
										:	"border-black/8 bg-white/60 hover:border-forest/30 hover:bg-white"
									}`}
								>
									<input
										type="radio"
										name="specialty_template"
										value={option.value}
										checked={selected}
										onChange={() => setSpecialtyTemplate(option.value)}
										className="sr-only"
									/>
									<span
										className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
											selected ?
												"border-forest"
											:	"border-black/25 group-hover:border-forest/50"
										}`}
									>
										{selected && (
											<span className="h-2 w-2 rounded-full bg-forest" />
										)}
									</span>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-semibold text-ink">
											{option.label}
										</span>
										<span className="mt-0.5 block truncate text-xs text-ink/50">
											{option.description}
										</span>
									</span>
								</label>
							);
						})}

						{customTemplates.length > 0 && (
							<p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/40">
								Mis plantillas personalizadas
							</p>
						)}

						{customTemplates.map((template) => {
							const selected = specialtyTemplate === template.id;
							return (
								<div
									key={template.id}
									className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
										selected ?
											"border-forest/60 bg-forest/5 ring-1 ring-inset ring-forest/20"
										:	"border-black/8 bg-white/60 hover:border-forest/30 hover:bg-white"
									}`}
								>
									<label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
										<input
											type="radio"
											name="specialty_template"
											value={template.id}
											checked={selected}
											onChange={() => setSpecialtyTemplate(template.id)}
											className="sr-only"
										/>
										<span
											className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${
												selected ?
													"border-forest"
												:	"border-black/25 group-hover:border-forest/50"
											}`}
										>
											{selected && (
												<span className="h-2 w-2 rounded-full bg-forest" />
											)}
										</span>
										<span className="min-w-0 flex-1">
											<span className="flex items-center gap-2">
												<span className="truncate text-sm font-semibold text-ink">
													{template.name}
												</span>
												<span className="shrink-0 rounded-full bg-clay/10 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-clay">
													Propia
												</span>
											</span>
											<span className="mt-0.5 block truncate text-xs text-ink/50">
												A partir de{" "}
												{getSpecialtyDefinition(template.base_template).label}
											</span>
										</span>
									</label>
									<span className="flex shrink-0 items-center gap-1">
										<button
											type="button"
											onClick={() => startEditingCustom(template)}
											className="rounded-full px-2.5 py-1 text-[11px] font-medium text-forest transition hover:bg-forest/10"
										>
											Editar
										</button>
										<button
											type="button"
											onClick={() => deleteCustom(template)}
											aria-label="Eliminar plantilla"
											className="flex h-6 w-6 items-center justify-center rounded-full text-ink/35 transition hover:bg-red-50 hover:text-red-600"
										>
											<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</span>
								</div>
							);
						})}
					</div>

					<div className="mt-3.5">
						{selectedIsBase ?
							<button
								type="button"
								onClick={startCustomizingBase}
								className="inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-forest/5 px-3.5 py-2 text-[13px] font-semibold text-forest transition hover:bg-forest/10"
							>
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
								</svg>
								Personalizar esta plantilla
							</button>
						:	<p className="text-xs text-ink/50">
								Estás usando una plantilla personalizada. Edítala con el botón
								«Editar» de la lista.
							</p>
						}
					</div>
				</section>

				{editing ?
					<section className={CARD_SURFACE}>
						<SectionHeader
							n={editing.id ? "✎" : "＋"}
							title={editing.id ? "Editar plantilla personalizada" : "Nueva plantilla personalizada"}
							desc="La plantilla base original no se modifica: esto crea una copia propia que puedes ajustar."
						/>

						<label className="mt-4 grid gap-1.5">
							<span className="text-[13px] font-medium text-ink/85">Nombre</span>
							<input
								value={editing.name}
								onChange={(event) =>
									setEditing({ ...editing, name: event.target.value })
								}
								maxLength={80}
								className="rounded-lg border border-black/10 bg-paper/40 px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-forest focus:ring-2 focus:ring-forest/15"
							/>
						</label>

						<div className="mt-4">
							<p className="mb-2 text-[13px] font-medium text-ink/85">
								Estructura de campos
							</p>
							<FieldsEditor
								fields={editing.fields}
								onChange={(fields) => setEditing({ ...editing, fields })}
							/>
						</div>

						<div className="mt-4 flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={saveEditing}
								disabled={savingTemplate || !editing.name.trim()}
								className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(35,66,58,0.5)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{savingTemplate && (
									<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								)}
								{editing.id ? "Guardar cambios" : "Crear plantilla"}
							</button>
							<button
								type="button"
								onClick={() => setEditing(null)}
								className="rounded-full px-3.5 py-2 text-[13px] font-medium text-ink/60 transition hover:text-ink"
							>
								Cancelar
							</button>
						</div>
					</section>
				:	null}

				<section className={CARD_SURFACE}>
					<SectionHeader
						n="02"
						title="Instrucciones de redacción"
						desc="Se añaden al prompt para adaptar el tono y el formato a tu forma de documentar."
					/>

					<div className="mt-3.5 flex flex-wrap gap-1.5">
						{INSTRUCTION_EXAMPLES.map((example) => (
							<button
								key={example}
								type="button"
								onClick={() => appendInstruction(example)}
								className="rounded-full border border-black/10 bg-paper/40 px-2.5 py-1 text-[11px] text-ink/60 transition hover:border-forest/40 hover:text-forest"
							>
								+ {example}
							</button>
						))}
					</div>

					<textarea
						value={customInstructions}
						onChange={(event) =>
							setCustomInstructions(event.target.value.slice(0, INSTRUCTION_MAX))
						}
						rows={5}
						placeholder="Ej.: usa viñetas, trata al paciente de usted, resume en lenguaje claro..."
						className="mt-2.5 min-h-28 w-full rounded-xl border border-black/10 bg-paper/40 px-3.5 py-2.5 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/30 focus:border-forest focus:ring-2 focus:ring-forest/15"
					/>
					<div className="mt-1 flex justify-end">
						<span className="font-mono text-[10px] text-ink/35">
							{customInstructions.length}/{INSTRUCTION_MAX}
						</span>
					</div>
				</section>

				<section className={CARD_SURFACE}>
					<SectionHeader
						n="03"
						title="Enfoque de notas en vivo"
						desc="Qué destacar en las notas que aparecen mientras grabas la consulta."
					/>

					<div className="mt-3.5 flex flex-wrap gap-1.5">
						{FOCUS_EXAMPLES.map((example) => (
							<button
								key={example}
								type="button"
								onClick={() => appendFocus(example)}
								className="rounded-full border border-black/10 bg-paper/40 px-2.5 py-1 text-[11px] text-ink/60 transition hover:border-forest/40 hover:text-forest"
							>
								+ {example}
							</button>
						))}
					</div>

					<textarea
						value={liveNoteFocus}
						onChange={(event) =>
							setLiveNoteFocus(event.target.value.slice(0, FOCUS_MAX))
						}
						rows={3}
						placeholder="Ej.: signos vitales, medicamentos y dosis, alergias, síntomas de alarma, pendientes acordados..."
						className="mt-2.5 min-h-20 w-full rounded-xl border border-black/10 bg-paper/40 px-3.5 py-2.5 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/30 focus:border-forest focus:ring-2 focus:ring-forest/15"
					/>
					<div className="mt-1 flex items-center justify-between gap-3">
						<p className="text-[11px] leading-4 text-ink/40">
							Si lo dejas vacío, se usa un enfoque clínico general.
						</p>
						<span className="shrink-0 font-mono text-[10px] text-ink/35">
							{liveNoteFocus.length}/{FOCUS_MAX}
						</span>
					</div>
				</section>
			</div>

			<aside className="grid gap-4 lg:sticky lg:top-20 lg:self-start">
				<div className={CARD_SURFACE}>
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<span className="h-px w-4 bg-forest/50" />
							<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-forest">
								Vista previa
							</p>
						</div>
						<span className="rounded-full bg-forest/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-forest">
							{countLeafFields(previewStructure.fields)} campos
						</span>
					</div>
					<h3 className="mt-2.5 text-[15px] font-semibold tracking-tight text-ink">
						{previewStructure.label}
					</h3>
					<p className="mt-1 text-xs leading-5 text-ink/55">
						{previewStructure.description}
					</p>
					<div className="mt-3.5 rounded-xl border border-black/6 bg-paper/25 p-3">
						<FieldSkeleton fields={previewStructure.fields} />
					</div>
				</div>

				<div className={CARD_SURFACE}>
					<div className="flex items-center gap-2">
						<span
							className={`h-2 w-2 rounded-full ${
								isDirty ? "bg-clay" : "bg-forest"
							}`}
						/>
						<p className="text-[13px] font-medium text-ink/75">
							{isDirty ? "Cambios sin guardar" : "Todo guardado"}
						</p>
					</div>

					{message ?
						<div
							className={`mt-3 rounded-xl px-3.5 py-2.5 text-[13px] ${
								message.tone === "error" ?
									"border border-red-200 bg-red-50 text-red-700"
								:	"border border-forest/15 bg-forest/10 text-forest"
							}`}
							role="status"
							aria-live="polite"
						>
							{message.text}
						</div>
					:	null}

					<button
						type="submit"
						disabled={saving || !isDirty}
						className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(35,66,58,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(35,66,58,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{saving && (
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
						)}
						{saving ? "Guardando..." : "Guardar ajustes"}
					</button>
					<p className="mt-2 text-center text-[11px] text-ink/45">
						Se aplica en la próxima transcripción.
					</p>
				</div>
			</aside>
		</form>
	);
}
