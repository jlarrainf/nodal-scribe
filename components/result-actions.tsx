"use client";

import { useEffect, useRef, useState } from "react";

type ResultActionsProps = {
	onCopy: () => void;
	onClear: () => void;
	disabled?: boolean;
};

const CONFIRM_RESET_MS = 5000;

export function ResultActions({
	onCopy,
	onClear,
	disabled,
}: ResultActionsProps) {
	const [confirmingClear, setConfirmingClear] = useState(false);
	const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (resetTimerRef.current) {
				clearTimeout(resetTimerRef.current);
			}
		};
	}, []);

	const clearResetTimer = () => {
		if (resetTimerRef.current) {
			clearTimeout(resetTimerRef.current);
			resetTimerRef.current = null;
		}
	};

	const askClear = () => {
		clearResetTimer();
		setConfirmingClear(true);
		resetTimerRef.current = setTimeout(
			() => setConfirmingClear(false),
			CONFIRM_RESET_MS,
		);
	};

	const confirmClear = () => {
		clearResetTimer();
		setConfirmingClear(false);
		onClear();
	};

	const cancelClear = () => {
		clearResetTimer();
		setConfirmingClear(false);
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onClick={onCopy}
				disabled={disabled}
				className="rounded-full bg-forest px-3.5 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
			>
				Copiar
			</button>

			{confirmingClear ?
				<span className="animate-fade-in-up flex items-center gap-1 rounded-full border border-red-200 bg-red-50 py-0.5 pl-2.5 pr-0.5">
					<span className="text-[11px] font-semibold text-red-700">¿Limpiar?</span>
					<button
						type="button"
						onClick={confirmClear}
						disabled={disabled}
						className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
					>
						Sí
					</button>
					<button
						type="button"
						onClick={cancelClear}
						className="rounded-full px-1.5 py-1 text-[11px] font-medium text-red-700 hover:underline"
					>
						No
					</button>
				</span>
			:	<button
					type="button"
					onClick={askClear}
					disabled={disabled}
					className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-ink/70 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Limpiar
				</button>
			}
		</div>
	);
}
