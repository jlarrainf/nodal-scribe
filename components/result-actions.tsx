"use client";

type ResultActionsProps = {
	onCopy: () => void;
	onClear: () => void;
	disabled?: boolean;
};

export function ResultActions({
	onCopy,
	onClear,
	disabled,
}: ResultActionsProps) {
	return (
		<div className="flex flex-wrap gap-3">
			<button
				type="button"
				onClick={onCopy}
				disabled={disabled}
				className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
			>
				Copiar nota
			</button>
			<button
				type="button"
				onClick={onClear}
				disabled={disabled}
				className="rounded-full border border-black/10 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
			>
				Limpiar borrador
			</button>
		</div>
	);
}
