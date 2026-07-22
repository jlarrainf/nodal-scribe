"use client";

import { useEffect, useRef, useState } from "react";

type RecordButtonProps = {
	status: "idle" | "recording" | "processing";
	disabled?: boolean;
	onClick: () => void;
};

function formatElapsed(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function RecordButton({ status, disabled, onClick }: RecordButtonProps) {
	const isActive = status === "recording";
	const isBusy = status === "processing";
	const [elapsed, setElapsed] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (isActive) {
			setElapsed(0);
			intervalRef.current = setInterval(() => {
				setElapsed((prev) => prev + 1);
			}, 1000);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			setElapsed(0);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isActive]);

	const label =
		isBusy ? "Procesando..."
		: isActive ? `Detener · ${formatElapsed(elapsed)}`
		: "Iniciar grabación";

	return (
		<div className="relative inline-flex items-center">
			{isActive && (
				<span className="animate-pulse-ring absolute inset-0 rounded-full bg-clay/40" />
			)}
			<button
				type="button"
				onClick={onClick}
				disabled={disabled || isBusy}
				className={`relative inline-flex min-h-16 items-center justify-center gap-2.5 rounded-full px-7 py-4 text-base font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
					isActive ?
						"bg-clay text-white shadow-[0_10px_24px_-8px_rgba(166,106,74,0.6)] active:scale-[0.98]"
					: isBusy ?
						"bg-ink/75 text-white shadow-soft"
					: disabled ?
						"cursor-not-allowed border border-forest/25 bg-forest/10 text-forest/60"
					:	"bg-forest text-white shadow-[0_10px_24px_-8px_rgba(35,66,58,0.55)] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-8px_rgba(35,66,58,0.6)] active:scale-[0.98]"
				}`}
			>
				{isActive && <span className="h-3 w-3 rounded-[3px] bg-white" />}
				{!isActive && !isBusy && (
					<svg
						className="h-[18px] w-[18px]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19 12a7 7 0 01-14 0m7 7v3m-3 0h6"
						/>
					</svg>
				)}
				{isBusy && (
					<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
				)}
				{label}
			</button>
		</div>
	);
}
