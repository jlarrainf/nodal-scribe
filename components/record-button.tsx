"use client";

type RecordButtonProps = {
	status: "idle" | "recording" | "processing";
	disabled?: boolean;
	onClick: () => void;
};

export function RecordButton({ status, disabled, onClick }: RecordButtonProps) {
	const isActive = status === "recording";
	const isBusy = status === "processing";

	const label =
		isBusy ? "Procesando..."
		: isActive ? "Detener grabación"
		: "Iniciar grabación";

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled || isBusy}
			className={`inline-flex min-h-16 items-center justify-center rounded-full px-7 py-4 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
				isActive ?
					"bg-clay text-white shadow-soft"
				:	"bg-ink text-paper shadow-soft hover:-translate-y-0.5"
			} ${disabled || isBusy ? "cursor-not-allowed opacity-60" : ""}`}
		>
			{label}
		</button>
	);
}
