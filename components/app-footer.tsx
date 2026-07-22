"use client";

export function AppFooter() {
	return (
		<footer className="border-t border-black/5">
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
				<p className="text-[11px] text-ink/40">
					Nodal Scribe · herramienta administrativa de transcripción
				</p>
				<p className="hidden text-[11px] text-ink/40 sm:block">
					El audio y las notas no se almacenan
				</p>
			</div>
		</footer>
	);
}
