"use client";

import { MarkdownNote } from "@/components/markdown-note";

type LiveNotesPanelProps = {
	markdown: string;
	processing: boolean;
	updatedAt: number | null;
	isActive: boolean;
};

export function LiveNotesPanel({
	markdown,
	processing,
	updatedAt,
	isActive,
}: LiveNotesPanelProps) {
	if (!isActive) {
		return null;
	}

	const hasNotes = markdown.trim().length > 0;

	return (
		<div className="animate-fade-in-up rounded-2xl border border-black/8 bg-gradient-to-b from-white to-paper/30 p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_16px_40px_-20px_rgba(35,66,58,0.25)]">
			<div className="flex items-center justify-between gap-3 border-b border-black/6 pb-3">
				<div className="flex items-center gap-2.5">
					<span className="relative flex h-2 w-2">
						<span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-red-400" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
					</span>
					<h2 className="text-sm font-semibold text-ink">Notas en vivo</h2>
				</div>
				<span className="font-mono text-[11px] text-ink/40">
					{processing ?
						"actualizando…"
					: updatedAt ?
						`actualizado ${new Date(updatedAt).toLocaleTimeString("es-CL", {
							hour: "2-digit",
							minute: "2-digit",
							second: "2-digit",
						})}`
					:	"en espera"}
				</span>
			</div>

			<div className="mt-3">
				{hasNotes ?
					<MarkdownNote content={markdown} />
				:	<div className="flex items-center justify-center gap-2.5 py-5">
						{processing ?
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-forest/20 border-t-forest" />
						:	<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest/50" />
						}
						<p className="text-xs text-ink/45">
							{processing ?
								"Procesando el audio…"
							:	"Escuchando la consulta. Las notas relevantes aparecerán aquí."}
						</p>
					</div>
				}
			</div>
		</div>
	);
}
