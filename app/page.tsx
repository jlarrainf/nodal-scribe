import Link from "next/link";
import { getSpecialtyOptions } from "@/lib/ai/specialties";
import { getSpecialtyPreviewLines } from "@/lib/utils/clinical-note";

const NAV_LINKS = [
	{ href: "#como-funciona", label: "Cómo funciona" },
	{ href: "#especialidades", label: "Especialidades" },
	{ href: "#seguridad", label: "Seguridad" },
	{ href: "/pricing", label: "Precios" },
];

const STEPS = [
	{
		number: "01",
		title: "Graba con consentimiento",
		body: "Un solo botón inicia la captura de audio. Antes de grabar, el flujo exige confirmar el consentimiento verbal del paciente.",
	},
	{
		number: "02",
		title: "Transcripción efímera",
		body: "El audio viaja cifrado a una función serverless que lo transcribe y lo descarta. Nada queda almacenado en nuestros servidores.",
	},
	{
		number: "03",
		title: "Estructuración estricta",
		body: "El modelo puebla un esquema JSON validado con Zod según la especialidad activa. Cero invención: si un dato no se dijo, no se inventa.",
	},
	{
		number: "04",
		title: "Revisión humana",
		body: "El médico revisa, ajusta y copia la nota a su ficha oficial. La decisión clínica siempre es humana.",
	},
];

const SECURITY_POINTS = [
	{
		title: "Retención cero de datos clínicos",
		body: "No guardamos transcripciones ni notas. El procesamiento es efímero: la memoria se limpia al terminar cada solicitud.",
	},
	{
		title: "Cifrado en tránsito (TLS)",
		body: "Toda comunicación entre el navegador y el backend viaja cifrada. Headers de seguridad endurecidos en cada respuesta.",
	},
	{
		title: "Consentimiento explícito",
		body: "El micrófono se bloquea hasta que el profesional confirma el consentimiento verbal del paciente.",
	},
	{
		title: "Borrador solo en tu navegador",
		body: "El autoguardado vive en localStorage y expira. Nunca sale del dispositivo ni se sincroniza con la nube.",
	},
	{
		title: "Autenticación Supabase",
		body: "Acceso protegido con sesiones JWT. Las preferencias de perfil se aíslan por usuario con políticas RLS.",
	},
	{
		title: "Salida validada con Zod",
		body: "Cada respuesta del modelo se valida contra un esquema estricto antes de mostrarse. Sin JSON malformado ni campos fantasma.",
	},
];

const STATS = [
	{ value: "0", label: "datos clínicos almacenados" },
	{ value: "5", label: "plantillas de especialidad" },
	{ value: "1", label: "botón para documentar" },
	{ value: "100%", label: "revisión humana" },
];

function Logo() {
	return (
		<Link href="/" className="flex items-center gap-3">
			<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest font-mono text-sm font-bold text-white shadow-sm">
				NS
			</span>
			<span className="text-lg font-semibold tracking-tight text-ink">
				Nodal Scribe
			</span>
		</Link>
	);
}

function LandingNav() {
	return (
		<header className="sticky top-0 z-50 border-b border-black/5 bg-paper/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Logo />
				<nav className="hidden items-center gap-7 md:flex">
					{NAV_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-ink/70 transition hover:text-ink"
						>
							{link.label}
						</a>
					))}
				</nav>
				<div className="flex items-center gap-3">
					<Link
						href="/login"
						className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition hover:text-ink sm:inline-flex"
					>
						Iniciar sesión
					</Link>
					<Link
						href="/app"
						className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
					>
						Comenzar
					</Link>
				</div>
			</div>
		</header>
	);
}

function NoteMockup() {
	return (
		<div className="relative">
			<div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-forest/5 blur-2xl" />
			<div className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-soft backdrop-blur">
				<div className="flex items-center justify-between border-b border-black/5 pb-3">
					<div className="flex items-center gap-2">
						<span className="relative flex h-2.5 w-2.5">
							<span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-red-400" />
							<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
						</span>
						<span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
							Nota estructurada
						</span>
					</div>
					<span className="rounded-full bg-forest/10 px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-forest">
						SOAP
					</span>
				</div>

				<div className="mt-4 grid gap-3">
					<MockupSection
						tag="S"
						label="Subjetivo"
						lines={[
							"Cefalea frontal opresiva, 3 días de evolución.",
							"Refiere estrés laboral y mal descanso.",
						]}
					/>
					<MockupSection
						tag="O"
						label="Objetivo"
						lines={["PA 130/80 · FC 78 lpm", "Examen neurológico sin hallazgos."]}
					/>
					<MockupSection
						tag="A"
						label="Análisis"
						lines={["Cefalea tensional probable."]}
					/>
					<MockupSection
						tag="P"
						label="Plan"
						lines={[
							"Paracetamol 1 g c/8 h por 3 días.",
							"Higiene del sueño y control en 2 semanas.",
						]}
					/>
				</div>

				<div className="mt-4 flex items-center justify-between rounded-2xl border border-black/5 bg-paper/50 px-4 py-2.5">
					<span className="font-mono text-[11px] text-ink/50">
						validado con zod · listo para copiar
					</span>
					<span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">
						Copiar nota
					</span>
				</div>
			</div>
		</div>
	);
}

function MockupSection({
	tag,
	label,
	lines,
}: {
	tag: string;
	label: string;
	lines: string[];
}) {
	return (
		<div className="flex gap-3">
			<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/10 font-mono text-xs font-bold text-forest">
				{tag}
			</span>
			<div className="min-w-0">
				<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/45">
					{label}
				</p>
				<ul className="mt-1 space-y-0.5">
					{lines.map((line) => (
						<li key={line} className="text-sm leading-6 text-ink/80">
							{line}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export default function LandingPage() {
	const specialties = getSpecialtyOptions();

	return (
		<div className="flex min-h-screen flex-col">
			<LandingNav />

			<main className="flex-1">
				<section className="relative overflow-hidden">
					<div className="pointer-events-none absolute inset-0 -z-10 bg-hero-grid" />
					<div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24 lg:px-8">
						<div className="animate-fade-in-up space-y-7">
							<div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-forest shadow-sm">
								<span className="h-1.5 w-1.5 rounded-full bg-forest" />
								Escriba médico ambiental · PoC
							</div>

							<h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
								Tú atiendes.
								<br />
								<span className="text-forest">La ficha se escribe sola.</span>
							</h1>

							<p className="max-w-xl text-base leading-7 text-ink/75 sm:text-lg">
								Nodal Scribe captura la consulta por audio, la transcribe y la
								devuelve como una nota clínica estructurada, lista para tu
								revisión. Sin teclear, sin perder el hilo del paciente.
							</p>

							<div className="flex flex-wrap items-center gap-3">
								<Link
									href="/app"
									className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
								>
									Comenzar a documentar
									<span aria-hidden className="transition group-hover:translate-x-0.5">
										→
									</span>
								</Link>
								<a
									href="#como-funciona"
									className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-6 py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5"
								>
									Ver cómo funciona
								</a>
							</div>

							<div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
								{[
									"Procesamiento efímero",
									"Sin retención de datos",
									"Consentimiento explícito",
								].map((item) => (
									<span
										key={item}
										className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/60"
									>
										<svg
											className="h-3.5 w-3.5 text-forest"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2.5}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M5 13l4 4L19 7"
											/>
										</svg>
										{item}
									</span>
								))}
							</div>
						</div>

						<div className="animate-fade-in-up lg:pl-4" style={{ animationDelay: "120ms" }}>
							<NoteMockup />
						</div>
					</div>
				</section>

				<section className="border-y border-black/5 bg-white/40">
					<div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
						{STATS.map((stat) => (
							<div key={stat.label} className="text-center lg:text-left">
								<p className="font-mono text-3xl font-bold tracking-tight text-forest sm:text-4xl">
									{stat.value}
								</p>
								<p className="mt-1 text-sm text-ink/60">{stat.label}</p>
							</div>
						))}
					</div>
				</section>

				<section
					id="como-funciona"
					className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
				>
					<div className="max-w-2xl">
						<p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-clay">
							Flujo
						</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
							Del audio a la ficha en cuatro pasos
						</h2>
						<p className="mt-4 text-base leading-7 text-ink/70">
							Diseñado para la consulta real: mínima fricción, máximo control
							humano y privacidad por defecto.
						</p>
					</div>

					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{STEPS.map((step) => (
							<div
								key={step.number}
								className="group relative rounded-[1.75rem] border border-black/10 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
							>
								<span className="font-mono text-sm font-bold text-clay">
									{step.number}
								</span>
								<div className="mt-3 h-px w-8 bg-black/10 transition group-hover:w-12 group-hover:bg-forest" />
								<h3 className="mt-4 text-lg font-semibold text-ink">
									{step.title}
								</h3>
								<p className="mt-2 text-sm leading-6 text-ink/70">
									{step.body}
								</p>
							</div>
						))}
					</div>
				</section>

				<section
					id="especialidades"
					className="scroll-mt-20 border-y border-black/5 bg-white/40"
				>
					<div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
						<div className="max-w-2xl">
							<p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-clay">
								Plantillas
							</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
								Una estructura para cada especialidad
							</h2>
							<p className="mt-4 text-base leading-7 text-ink/70">
								Cada plantilla define su propio esquema JSON, sus campos y las
								instrucciones del modelo. Cambias de especialidad en ajustes y el
								editor se adapta.
							</p>
						</div>

						<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
							{specialties.map((specialty) => (
								<div
									key={specialty.value}
									className="flex flex-col rounded-[1.75rem] border border-black/10 bg-white/75 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
								>
									<h3 className="text-lg font-semibold text-ink">
										{specialty.label}
									</h3>
									<p className="mt-2 flex-1 text-sm leading-6 text-ink/70">
										{specialty.description}
									</p>
									<div className="mt-4 flex flex-wrap gap-1.5">
										{getSpecialtyPreviewLines(specialty.value)
											.slice(0, 4)
											.map((field) => (
												<span
													key={field}
													className="rounded-full border border-black/10 bg-paper/70 px-2.5 py-1 text-[11px] text-ink/70"
												>
													{field}
												</span>
											))}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section
					id="seguridad"
					className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8"
				>
					<div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
						<div className="lg:sticky lg:top-24">
							<p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-clay">
								Privacidad por diseño
							</p>
							<h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
								La seguridad no es una función.
								<br />
								Es la arquitectura.
							</h2>
							<p className="mt-4 text-base leading-7 text-ink/70">
								Nodal Scribe está pensado desde el día uno para manejar datos
								sensibles con el estándar que exige la salud: procesamiento
								efímero, retención cero y control humano en cada paso.
							</p>

							<div className="mt-8 overflow-hidden rounded-[1.75rem] border border-black/10 bg-ink p-5 shadow-soft">
								<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/40">
									salida estructurada
								</p>
								<pre className="mt-3 overflow-x-auto font-mono text-xs leading-6 text-paper/90">
									{`{
  "soap": {
    "subjective": ["Cefalea frontal, 3 días"],
    "objective": ["PA 130/80"],
    "analysis": ["Cefalea tensional"],
    "plan": ["Paracetamol 1 g c/8 h"]
  }
}`}
								</pre>
							<p className="mt-3 font-mono text-[11px] text-paper/40">
								{"// validado con zod antes de mostrarse"}
							</p>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							{SECURITY_POINTS.map((point) => (
								<div
									key={point.title}
									className="rounded-[1.75rem] border border-black/10 bg-white/70 p-5 shadow-sm"
								>
									<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
										<svg
											className="h-5 w-5"
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
									</span>
									<h3 className="mt-4 text-base font-semibold text-ink">
										{point.title}
									</h3>
									<p className="mt-2 text-sm leading-6 text-ink/70">
										{point.body}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
					<div className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-forest px-6 py-16 text-center shadow-soft sm:px-12">
						<div className="pointer-events-none absolute inset-0 bg-hero-grid opacity-20" />
						<div className="relative mx-auto max-w-2xl">
							<h2 className="text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
								Deja de teclear en la consulta
							</h2>
							<p className="mt-4 text-base leading-7 text-paper/80">
								Prueba Nodal Scribe con el modo testing: pega una transcripción y
								mira cómo se estructura en segundos. Sin micrófono, sin costo.
							</p>
							<div className="mt-8 flex flex-wrap justify-center gap-3">
								<Link
									href="/app"
									className="inline-flex items-center rounded-full bg-paper px-6 py-3.5 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5"
								>
									Entrar al grabador
								</Link>
								<Link
									href="/login"
									className="inline-flex items-center rounded-full border border-paper/30 px-6 py-3.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:bg-paper/10"
								>
									Crear cuenta
								</Link>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-black/5 bg-paper/60">
				<div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
						<div className="max-w-sm">
							<Logo />
							<p className="mt-4 text-sm leading-6 text-ink/60">
								Herramienta administrativa de transcripción clínica. No
								reemplaza el juicio clínico ni se integra directamente con un
								EHR. Prueba de concepto.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
							<div>
								<p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink/45">
									Producto
								</p>
								<ul className="mt-3 space-y-2 text-sm text-ink/70">
									<li>
										<a href="#como-funciona" className="transition hover:text-ink">
											Cómo funciona
										</a>
									</li>
									<li>
										<a href="#especialidades" className="transition hover:text-ink">
											Especialidades
										</a>
									</li>
									<li>
										<Link href="/app" className="transition hover:text-ink">
											Grabador
										</Link>
									</li>
								</ul>
							</div>
							<div>
								<p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink/45">
									Confianza
								</p>
								<ul className="mt-3 space-y-2 text-sm text-ink/70">
									<li>
										<a href="#seguridad" className="transition hover:text-ink">
											Seguridad
										</a>
									</li>
									<li>
										<span>Retención cero</span>
									</li>
									<li>
										<span>Procesamiento efímero</span>
									</li>
								</ul>
							</div>
							<div>
								<p className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink/45">
									Cuenta
								</p>
								<ul className="mt-3 space-y-2 text-sm text-ink/70">
									<li>
										<Link href="/login" className="transition hover:text-ink">
											Iniciar sesión
										</Link>
									</li>
									<li>
										<Link href="/settings" className="transition hover:text-ink">
											Ajustes
										</Link>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div className="mt-10 border-t border-black/5 pt-6 text-xs text-ink/45">
						© {new Date().getFullYear()} Nodal Scribe. Los datos de pacientes no se
						almacenan ni se transmiten a terceros fuera del flujo efímero de
						procesamiento.
					</div>
				</div>
			</footer>
		</div>
	);
}
