"use client";

import { useState } from "react";
import Link from "next/link";

export type NavLink = { href: string; label: string };

const DEFAULT_LINKS: NavLink[] = [
	{ href: "#como-funciona", label: "Cómo funciona" },
	{ href: "#especialidades", label: "Especialidades" },
	{ href: "#seguridad", label: "Seguridad" },
	{ href: "/pricing", label: "Precios" },
];

type SiteNavProps = {
	links?: NavLink[];
	logoHref?: string;
};

export function SiteNav({ links = DEFAULT_LINKS, logoHref = "/" }: SiteNavProps) {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-black/5 bg-paper/85 backdrop-blur-md">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link
					href={logoHref}
					className="flex items-center gap-3"
					onClick={() => setOpen(false)}
				>
					<span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest font-mono text-sm font-bold text-white shadow-sm">
						NS
					</span>
					<span className="text-lg font-semibold tracking-tight text-ink">
						Nodal Scribe
					</span>
				</Link>

				<nav className="hidden items-center gap-7 md:flex">
					{links.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-ink/70 transition hover:text-ink"
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="hidden items-center gap-3 md:flex">
					<Link
						href="/login"
						className="rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition hover:text-ink"
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

				<button
					type="button"
					onClick={() => setOpen((current) => !current)}
					aria-label={open ? "Cerrar menú" : "Abrir menú"}
					aria-expanded={open}
					className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-black/5 active:scale-95 md:hidden"
				>
					<span className="relative block h-4 w-5">
						<span
							className={`absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-ink transition-all duration-300 ${
								open ? "top-1/2 -translate-y-1/2 rotate-45" : ""
							}`}
						/>
						<span
							className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-ink transition-all duration-200 ${
								open ? "opacity-0" : "opacity-100"
							}`}
						/>
						<span
							className={`absolute bottom-0 left-0 block h-0.5 w-5 rounded-full bg-ink transition-all duration-300 ${
								open ? "bottom-1/2 translate-y-1/2 -rotate-45" : ""
							}`}
						/>
					</span>
				</button>
			</div>

			{open && (
				<div className="animate-fade-in-up border-t border-black/5 bg-paper/95 shadow-soft backdrop-blur-md md:hidden">
					<nav className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6">
						{links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={() => setOpen(false)}
								className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink/80 transition hover:bg-forest/5 hover:text-forest"
							>
								{link.label}
							</a>
						))}
						<div className="mt-3 flex flex-col gap-2.5 border-t border-black/5 pt-4">
							<Link
								href="/login"
								onClick={() => setOpen(false)}
								className="rounded-full border border-black/10 bg-white px-4 py-3 text-center text-sm font-semibold text-ink transition hover:border-forest/40 hover:text-forest"
							>
								Iniciar sesión
							</Link>
							<Link
								href="/app"
								onClick={() => setOpen(false)}
								className="rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold text-paper shadow-sm transition hover:shadow-lg"
							>
								Comenzar
							</Link>
						</div>
					</nav>
				</div>
			)}
		</header>
	);
}
