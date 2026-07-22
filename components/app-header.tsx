"use client";

import Link from "next/link";

type AppHeaderProps = {
	showSettings?: boolean;
};

export function AppHeader({ showSettings = true }: AppHeaderProps) {
	return (
		<header className="sticky top-0 z-50 border-b border-black/6 bg-paper/85 backdrop-blur-md">
			<div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/app" className="group flex items-center gap-2.5">
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-forest to-[#16281f] font-mono text-xs font-bold text-white shadow-sm transition group-hover:scale-105">
						NS
					</span>
					<span className="text-[15px] font-semibold tracking-tight text-ink">
						Nodal Scribe
					</span>
				</Link>

				{showSettings && (
					<Link
						href="/settings"
						className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink transition hover:border-forest/40 hover:text-forest"
					>
						<svg
							className="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M10.3 4.3a1.7 1.7 0 013.4 0l.1.6a1.7 1.7 0 002.6 1.1l.5-.3a1.7 1.7 0 012.4 2.4l-.3.5a1.7 1.7 0 001.1 2.6l.6.1a1.7 1.7 0 010 3.4l-.6.1a1.7 1.7 0 00-1.1 2.6l.3.5a1.7 1.7 0 01-2.4 2.4l-.5-.3a1.7 1.7 0 00-2.6 1.1l-.1.6a1.7 1.7 0 01-3.4 0l-.1-.6a1.7 1.7 0 00-2.6-1.1l-.5.3a1.7 1.7 0 01-2.4-2.4l.3-.5a1.7 1.7 0 00-1.1-2.6l-.6-.1a1.7 1.7 0 010-3.4l.6-.1a1.7 1.7 0 001.1-2.6l-.3-.5a1.7 1.7 0 012.4-2.4l.5.3a1.7 1.7 0 002.6-1.1l.1-.6z"
							/>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						Ajustes
					</Link>
				)}
			</div>
		</header>
	);
}
