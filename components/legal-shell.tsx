import Link from "next/link";
import type { ReactNode } from "react";

export function LegalShell({
	title,
	intro,
	updated = "24 de julio de 2026",
	children,
}: {
	title: string;
	intro?: string;
	updated?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 border-b border-black/5 bg-paper/85 backdrop-blur-md">
				<div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Link href="/" className="flex items-center gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest font-mono text-sm font-bold text-white shadow-sm">
							NS
						</span>
						<span className="text-lg font-semibold tracking-tight text-ink">
							Nodal Scribe
						</span>
					</Link>
					<Link
						href="/"
						className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink transition hover:border-forest/40 hover:text-forest"
					>
						Volver al inicio
					</Link>
				</div>
			</header>

			<main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
				<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
					Documento legal
				</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
					{title}
				</h1>
				<p className="mt-2 text-sm text-ink/50">Última actualización: {updated}</p>

				{intro ?
					<p className="mt-6 text-base leading-7 text-ink/75">{intro}</p>
				:	null}

				<div className="mt-8 space-y-9">{children}</div>

				<div className="mt-12 rounded-2xl border border-clay/25 bg-clay/5 px-5 py-4">
					<p className="text-[13px] leading-6 text-ink/70">
						<strong className="font-semibold text-ink">Nota importante:</strong>{" "}
						este documento es una base de referencia técnica y debe ser revisado y
						validado por un abogado habilitado antes de su uso comercial
						definitivo.
					</p>
				</div>
			</main>

			<footer className="border-t border-black/5 bg-paper/60">
				<div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-ink/45 sm:flex-row sm:px-6 lg:px-8">
					<p>© {new Date().getFullYear()} Nodal Scribe</p>
					<div className="flex gap-4">
						<Link
							href="/terminos-y-condiciones"
							className="transition hover:text-ink"
						>
							Términos y Condiciones
						</Link>
						<Link
							href="/politica-de-privacidad"
							className="transition hover:text-ink"
						>
							Política de Privacidad
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}

export function LegalSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<section>
			<h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
			<div className="mt-3 space-y-3 text-[15px] leading-7 text-ink/75">
				{children}
			</div>
		</section>
	);
}
