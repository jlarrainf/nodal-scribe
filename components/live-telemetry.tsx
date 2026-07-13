"use client";

import { useEffect, useRef } from "react";
import { highlightEntities } from "@/lib/utils/highlight-entities";
import type { HighlightKind } from "@/lib/utils/highlight-entities";
import type { LiveTranscriptState } from "@/lib/hooks/use-live-transcript";

type LiveTelemetryProps = LiveTranscriptState & {
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
	}, [notes, interim]);

	if (!isActive) {
		return null;
	}

	return (
		<div className="rounded-3xl border border-black/10 bg-white/80 p-4 shadow-soft">
			<div className="mb-2 flex items-center gap-2">
				<span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
				<span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
					Apuntes de consulta
				</span>
				{notes.length > 0 && (
					<span className="ml-auto text-[11px] text-ink/40">
						{notes.length} apunte{notes.length !== 1 ? "s" : ""}
					</span>
				)}
			</div>

			<div
				ref={scrollRef}
				className="max-h-48 min-h-[5rem] overflow-y-auto rounded-2xl border border-black/5 bg-paper/60 px-4 py-3 text-sm leading-relaxed"
			>
				{notes.length === 0 && !interim ?
					<p className="text-center text-xs text-ink/40">
						Esperando entrada de voz...
					</p>
				:	<ul className="space-y-1.5">
						{notes.map((note, i) => (
							<li key={i} className="flex gap-2">
								<span className="mt-0.5 shrink-0 text-forest/60">&#8226;</span>
								<span>
									<HighlightedText text={note} />
								</span>
							</li>
						))}
						{interim && (
							<li className="flex gap-2 opacity-60">
								<span className="mt-0.5 shrink-0 text-forest/60">&#8226;</span>
								<span>
									<HighlightedText text={interim} />
									<span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-ink/40" />
								</span>
							</li>
						)}
					</ul>
				}
			</div>
		</div>
	);
}
