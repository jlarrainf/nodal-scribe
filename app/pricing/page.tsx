import Link from "next/link";
import { PricingCards } from "@/components/pricing-cards";
import { SiteNav, type NavLink } from "@/components/site-nav";

const PRICING_NAV_LINKS: NavLink[] = [
	{ href: "/", label: "Inicio" },
	{ href: "/#como-funciona", label: "Cómo funciona" },
	{ href: "/#especialidades", label: "Especialidades" },
	{ href: "/#seguridad", label: "Seguridad" },
];

const FAQ = [
	{
		question: "¿Necesito instalar algo?",
		answer:
			"No. Nodal Scribe funciona en el navegador (Chrome o Edge recomendados). Solo necesitas micrófono y conexión a internet.",
	},
	{
		question: "¿Qué pasa con el audio de mis pacientes?",
		answer:
			"El audio se transcribe de forma efímera y se descarta: no se almacena en nuestros servidores ni se usa para entrenar modelos. El borrador de la nota vive solo en tu navegador.",
	},
	{
		question: "¿Puedo cancelar cuando quiera?",
		answer:
			"Sí. La suscripción se puede cancelar en cualquier momento y mantienes acceso hasta el fin del período pagado. Sin permanencia.",
	},
	{
		question: "¿Emiten boleta o factura?",
		answer:
			"Sí, emitimos los documentos tributarios correspondientes ante el SII para clientes en Chile.",
	},
	{
		question: "¿Sirve para mi especialidad?",
		answer:
			"Hay plantillas para medicina general, psiquiatría, traumatología, pediatría y triage. Además puedes crear plantillas personalizadas con tus propios campos.",
	},
];

export const metadata = {
	title: "Planes y precios · Nodal Scribe",
	description:
		"Planes de suscripción de Nodal Scribe: transcripción clínica con IA para médicos y equipos de salud.",
};

export default function PricingPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<SiteNav links={PRICING_NAV_LINKS} />

			<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-2xl text-center">
					<div className="inline-flex items-center gap-2.5">
						<span className="h-px w-5 bg-forest/50" />
						<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
							Planes y precios
						</p>
						<span className="h-px w-5 bg-forest/50" />
					</div>
					<h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
						Menos tiempo tecleando.
						<br />
						<span className="text-forest">Más tiempo con tus pacientes.</span>
					</h1>
					<p className="mt-4 text-base leading-7 text-ink/65">
						Elige el plan que se ajuste a tu práctica. Todos incluyen
						transcripción con IA, nota estructurada y revisión humana.
					</p>
				</div>

				<div className="mt-12">
					<PricingCards />
				</div>

				<section className="mx-auto mt-20 max-w-3xl">
					<div className="flex items-center gap-2.5">
						<span className="h-px w-5 bg-forest/50" />
						<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
							Preguntas frecuentes
						</p>
					</div>
					<div className="mt-5 grid gap-3">
						{FAQ.map((item) => (
							<details
								key={item.question}
								className="group rounded-xl border border-black/8 bg-white/70 px-5 py-4 transition hover:border-forest/30"
							>
								<summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink outline-none">
									{item.question}
									<svg
										className="h-4 w-4 shrink-0 text-ink/40 transition group-open:rotate-180"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2.2}
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
									</svg>
								</summary>
								<p className="mt-3 text-[13px] leading-6 text-ink/65">
									{item.answer}
								</p>
							</details>
						))}
					</div>
				</section>

				<section className="mt-20 rounded-2xl border border-forest/20 bg-forest/[0.04] p-8 text-center">
					<h2 className="text-2xl font-semibold tracking-tight text-ink">
						Prueba 14 días gratis, sin tarjeta
					</h2>
					<p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink/65">
						Crea tu cuenta y graba tu primera consulta en minutos. Si no te
						convence, no pagas nada.
					</p>
					<Link
						href="/login"
						className="mt-6 inline-flex items-center justify-center rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(35,66,58,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(35,66,58,0.6)]"
					>
						Crear cuenta gratis
					</Link>
				</section>
			</main>

			<footer className="border-t border-black/5">
				<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
					<p className="text-[11px] text-ink/40">
						© {new Date().getFullYear()} Nodal Scribe · Herramienta
						administrativa de transcripción clínica
					</p>
					<p className="text-[11px] text-ink/40">
						Precios en CLP · Los pagos se habilitarán próximamente
					</p>
				</div>
			</footer>
		</div>
	);
}
