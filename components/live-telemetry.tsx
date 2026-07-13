"use client";

import { useEffect, useRef } from "react";
import { highlightEntities } from "@/lib/utils/highlight-entities";
import type { HighlightKind } from "@/lib/utils/highlight-entities";

type LiveTelemetryProps = {
	text: string;
	isActive: boolean;
};

const HIGHLIGHT_STYLES: Record<HighlightKind, string> = {
	normal: "text-ink/85",
	number: "text-blue-600 font-semibold",
	temporal: "text-purple-600 font-semibold",
	medication: "text-amber-600 font-semibold",
};

function HighlightedText({ text }: { text: string }) {
	const tokens = highlightEntities(text);

	return (
		<>
			{tokens.map((token, i) => (
				<span key={i} className={HIGHLIGHT_STYLES[token.kind]}>
					{token.text}
				</span>
			))}
		</>
	);
}

const PLACEHOLDER_LINES = [
	" ",
	" ",
	" ",
	" ",
	" ",
	" ",
];

export function LiveTelemetry({ text, isActive }: LiveTelemetryProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [text]);

	if (!isActive) {
		return null;
	}

	const displayLines =
		text.trim() ?
			text.split(/\n/).filter(Boolean)
		:	PLACEHOLDER_LINES;

	return (
		<div className="rounded-3xl border border-black/10 bg-white/80 p-4 shadow-soft">
			<div className="mb-2 flex items-center gap-2">
				<span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
				<span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
					Escucha activa
				</span>
			</div>

			<div
				ref={scrollRef}
				className="max-h-48 min-h-[7.5rem] overflow-y-auto rounded-2xl border border-black/5 bg-paper/60 px-4 py-3 text-sm leading-relaxed"
			>
				{text.trim() ?
					displayLines.map((line, i) => (
						<p key={i} className="mb-1 last:mb-0">
							<HighlightedText text={line} />
						</p>
					))
				:	<p className="text-center text-xs text-ink/40">
						Esperando entrada de voz...
					</p>
				}
			</div>

			<div className="mt-2 flex items-center gap-1.5">
				<span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
				<span className="text-[11px] text-ink/40">grabando</span>
			</div>
		</div>
	);
}
