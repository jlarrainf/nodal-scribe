"use client";

import { useState } from "react";
import { getSpecialtyDefinition } from "@/lib/ai/specialties";
import { getSpecialtyPreviewLines } from "@/lib/utils/clinical-note";

type SpecialtyOption = {
	value: string;
	label: string;
	description: string;
};

type SettingsFormProps = {
	initialProfile: {
		specialty_template: string;
		custom_instructions: string;
	};
	specialtyOptions: SpecialtyOption[];
};

export function SettingsForm({
	initialProfile,
	specialtyOptions,
}: SettingsFormProps) {
	const [specialtyTemplate, setSpecialtyTemplate] = useState(
		initialProfile.specialty_template,
	);
	const [customInstructions, setCustomInstructions] = useState(
		initialProfile.custom_instructions,
	);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const currentSpecialty = getSpecialtyDefinition(specialtyTemplate);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSaving(true);
		setMessage(null);

		const response = await fetch("/api/profile", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				specialty_template: specialtyTemplate,
				custom_instructions: customInstructions,
			}),
		});

		const payload = (await response.json()) as { error?: string };
		setSaving(false);

		if (!response.ok) {
			setMessage(payload.error ?? "No se pudo guardar el perfil.");
			return;
		}

		setMessage("Preferencias guardadas.");
	};

	return (
		<section className="rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-soft backdrop-blur sm:p-8">
			<form
				onSubmit={handleSubmit}
				className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]"
			>
				<div className="grid gap-6">
					<label className="grid gap-2">
						<span className="text-sm font-medium text-ink">
							Plantilla de ficha clínica
						</span>
						<select
							value={specialtyTemplate}
							onChange={(event) => setSpecialtyTemplate(event.target.value)}
							className="rounded-2xl border border-black/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20"
						>
							{specialtyOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					<div className="grid gap-2">
						<span className="text-sm font-medium text-ink">
							Instrucciones personalizadas
						</span>
						<textarea
							value={customInstructions}
							onChange={(event) => setCustomInstructions(event.target.value)}
							rows={6}
							placeholder="Usa viñetas, trata al paciente de usted, resume en lenguaje claro..."
							className="min-h-36 rounded-2xl border border-black/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest focus:ring-2 focus:ring-forest/20"
						/>
					</div>
				</div>

				<aside className="grid gap-4 rounded-[1.75rem] border border-black/10 bg-hero-grid p-5">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">
							Vista previa
						</p>
						<h2 className="mt-2 text-xl font-semibold text-ink">
							{currentSpecialty.label}
						</h2>
						<p className="mt-2 text-sm leading-6 text-ink/70">
							{currentSpecialty.description}
						</p>
					</div>

					<div className="rounded-3xl border border-black/10 bg-white/80 p-4">
						<p className="text-sm font-medium text-ink">Campos principales</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{getSpecialtyPreviewLines(specialtyTemplate)
								.slice(0, 6)
								.map((item) => (
									<span
										key={item}
										className="rounded-full border border-black/10 bg-paper/70 px-3 py-1 text-xs text-ink/80"
									>
										{item}
									</span>
								))}
						</div>
					</div>

					<div className="rounded-3xl border border-black/10 bg-white/80 p-4">
						<p className="text-sm font-medium text-ink">Objetivo clínico</p>
						<p className="mt-2 text-sm leading-6 text-ink/70">
							{
								specialtyOptions.find(
									(option) => option.value === specialtyTemplate,
								)?.description
							}
						</p>
					</div>
				</aside>

				{message ?
					<div
						className="rounded-2xl border border-forest/15 bg-forest/10 px-4 py-3 text-sm text-forest"
						role="status"
						aria-live="polite"
					>
						{message}
					</div>
				:	null}

				<div className="flex flex-wrap items-center gap-3 lg:col-span-2">
					<button
						type="submit"
						disabled={saving}
						className="inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{saving ? "Guardando..." : "Guardar ajustes"}
					</button>
					<p className="text-sm text-ink/60">
						El cambio se aplicará en la siguiente transcripción.
					</p>
				</div>
			</form>
		</section>
	);
}
