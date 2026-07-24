"use client";

import Link from "next/link";

export function AppFooter() {
	return (
		<footer className="border-t border-black/5">
			<div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
				<p className="text-[11px] text-ink/40">
					Nodal Scribe · herramienta administrativa de transcripción
				</p>
				<div className="flex items-center gap-4">
					<p className="hidden text-[11px] text-ink/40 md:block">
						El audio y las notas no se almacenan
					</p>
					<div className="flex items-center gap-3 text-[11px] text-ink/40">
						<Link
							href="/terminos-y-condiciones"
							className="transition hover:text-ink"
						>
							Términos
						</Link>
						<Link
							href="/politica-de-privacidad"
							className="transition hover:text-ink"
						>
							Privacidad
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
