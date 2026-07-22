"use client";

import { useState } from "react";
import Link from "next/link";

type Billing = "monthly" | "annual";

type Plan = {
	id: string;
	name: string;
	tagline: string;
	monthly: number | null;
	annual: number | null;
	unit?: string;
	features: string[];
	cta: string;
	highlighted?: boolean;
	badge?: string;
};

const PLANS: Plan[] = [
	{
		id: "trial",
		name: "Prueba",
		tagline: "Para conocer la herramienta sin compromiso.",
		monthly: 0,
		annual: 0,
		features: [
			"14 días de acceso completo",
			"Hasta 30 transcripciones",
			"2 plantillas de especialidad",
			"Nota estructurada y editable",
			"Consentimiento del paciente",
		],
		cta: "Comenzar gratis",
	},
	{
		id: "pro",
		name: "Pro",
		tagline: "Para el médico que consulta todos los días.",
		monthly: 19990,
		annual: 15990,
		features: [
			"Transcripciones ilimitadas",
			"Todas las especialidades",
			"Plantillas personalizadas",
			"Notas en vivo durante la consulta",
			"Instrucciones de redacción propias",
			"Soporte prioritario",
		],
		cta: "Elegir Pro",
		highlighted: true,
		badge: "Recomendado",
	},
	{
		id: "team",
		name: "Equipo",
		tagline: "Para clínicas y centros de salud.",
		monthly: 14990,
		annual: 11990,
		unit: "por médico / mes",
		features: [
			"Todo lo del plan Pro",
			"Panel de administración",
			"Plantillas compartidas por equipo",
			"Analítica de uso",
			"Facturación centralizada",
			"Onboarding para tu equipo",
		],
		cta: "Contactar ventas",
	},
];

function formatCLP(value: number): string {
	return new Intl.NumberFormat("es-CL", {
		style: "currency",
		currency: "CLP",
		maximumFractionDigits: 0,
	}).format(value);
}

function PlanCard({ plan, billing }: { plan: Plan; billing: Billing }) {
	const price = billing === "monthly" ? plan.monthly : plan.annual;

	return (
		<div
			className={`relative flex flex-col rounded-2xl border p-6 transition duration-200 ${
				plan.highlighted ?
					"border-forest/50 bg-gradient-to-b from-white to-forest/[0.04] shadow-[0_20px_50px_-20px_rgba(35,66,58,0.35)] lg:-my-3 lg:py-9"
				:	"border-black/8 bg-white/70 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(35,66,58,0.25)]"
			}`}
		>
			{plan.badge ?
				<span className="absolute -top-3 left-6 rounded-full bg-forest px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
					{plan.badge}
				</span>
			:	null}

			<h3 className="text-lg font-semibold tracking-tight text-ink">
				{plan.name}
			</h3>
			<p className="mt-1 text-[13px] leading-5 text-ink/55">{plan.tagline}</p>

			<div className="mt-5 flex items-baseline gap-2">
				<span
					key={`${plan.id}-${billing}`}
					className="animate-fade-in-up font-mono text-3xl font-bold tracking-tight text-ink"
				>
					{price === 0 ? "Gratis" : formatCLP(price ?? 0)}
				</span>
				{plan.unit && price !== 0 ?
					<span className="text-xs text-ink/50">{plan.unit}</span>
				:	price !== 0 ?
					<span className="text-xs text-ink/50">/ mes</span>
				:	null}
			</div>
			{plan.annual !== null && plan.annual !== plan.monthly && price !== 0 ?
				<p className="mt-1 text-[11px] text-ink/45">
					{billing === "annual" ?
						"Facturado anualmente"
					:	`${formatCLP(plan.annual ?? 0)}/mes si pagas anual`}
				</p>
			:	null}

			<ul className="mt-6 flex-1 space-y-2.5">
				{plan.features.map((feature) => (
					<li key={feature} className="flex items-start gap-2.5 text-[13px] leading-5 text-ink/75">
						<svg
							className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlighted ? "text-forest" : "text-forest/60"}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2.2}
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
						{feature}
					</li>
				))}
			</ul>

			<Link
				href={plan.id === "team" ? "mailto:ventas@nodalscribe.cl" : "/login"}
				className={`mt-7 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
					plan.highlighted ?
						"bg-forest text-white shadow-[0_10px_24px_-8px_rgba(35,66,58,0.5)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(35,66,58,0.6)]"
					:	"border border-black/12 bg-white text-ink hover:border-forest/40 hover:text-forest"
				}`}
			>
				{plan.cta}
			</Link>
		</div>
	);
}

export function PricingCards() {
	const [billing, setBilling] = useState<Billing>("monthly");

	return (
		<div>
			<div className="flex justify-center">
				<div className="inline-flex items-center rounded-full border border-black/10 bg-white/70 p-1">
					{(
						[
							{ value: "monthly", label: "Mensual" },
							{ value: "annual", label: "Anual · −20%" },
						] as Array<{ value: Billing; label: string }>
					).map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => setBilling(option.value)}
							className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
								billing === option.value ?
									"bg-forest text-white shadow-sm"
								:	"text-ink/60 hover:text-ink"
							}`}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			<div className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-stretch">
				{PLANS.map((plan) => (
					<PlanCard key={plan.id} plan={plan} billing={billing} />
				))}
			</div>

			<div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-forest/25 bg-gradient-to-r from-forest/10 to-forest/[0.03] p-6 sm:flex-row sm:items-center">
				<div>
					<p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-forest">
						Empresas y sector público
					</p>
					<h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
						Hospitales, redes y Mercado Público
					</h3>
					<p className="mt-1 max-w-xl text-[13px] leading-5 text-ink/65">
						SSO, SLA, despliegue con retención cero de datos (Azure BAA),
						onboarding presencial y condiciones especiales de licenciamiento.
					</p>
				</div>
				<Link
					href="mailto:ventas@nodalscribe.cl"
					className="shrink-0 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(35,66,58,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(35,66,58,0.6)]"
				>
					Conversemos
				</Link>
			</div>
		</div>
	);
}
