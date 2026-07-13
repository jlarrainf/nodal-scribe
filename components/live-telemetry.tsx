"use client";

import { useEffect, useRef } from "react";
import { highlightEntities } from "@/lib/utils/highlight-entities";
import type { HighlightKind } from "@/lib/utils/highlight-entities";

type LiveTelemetryProps = {
	notes: string[];
	interim: string;
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

export function LiveTelemetry({
	notes,
	interim,
	isActive,
}: LiveTelemetryProps) {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [notes]);

	if (!isActive) {
		return null;
	}

	const hasNotes = notes.length > 0;
	const lastInterim = interim.split(" ").slice(-15).join(" ");

	return (
		<div className="rounded-3xl border border-black/10 bg-white/80 p-4 shadow-soft">
			<div className="mb-2 flex items-center gap-2">
				<span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
				<span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
					Notas en vivo
				</span>
				{hasNotes && (
					<span className="ml-auto text-[11px] text-ink/40">
						actualizado cada 60s
					</span>
				)}
			</div>

			<div
				ref={scrollRef}
				className="max-h-48 min-h-[3rem] overflow-y-auto rounded-2xl border border-black/5 bg-paper/60 px-4 py-3 text-sm leading-relaxed"
			>
				{hasNotes ?
					<ul className="space-y-1.5">
						{notes.map((note, i) => (
							<li key={i} className="flex gap-2">
								<span className="mt-0.5 shrink-0 text-forest/60">&#8226;</span>
								<HighlightedText text={note} />
							</li>
						))}
					</ul>
				:	<p className="text-center text-xs text-ink/40">
						Esperando primera actualización (cada 60s)...
					</p>
				}
			</div>

			{interim && (
				<div className="mt-2 rounded-xl border border-black/5 bg-black/[0.02] px-3 py-2 text-[11px] leading-relaxed text-ink/40 italic">
					&#8212;&nbsp;
					<HighlightedText text={lastInterim} />
				</div>
			)}
		</div>
	);
}
