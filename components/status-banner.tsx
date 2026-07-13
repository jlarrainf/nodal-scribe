"use client";

type StatusBannerProps = {
	title: string;
	message?: string;
	tone?: "neutral" | "success" | "warning" | "error";
};

const toneClasses: Record<NonNullable<StatusBannerProps["tone"]>, string> = {
	neutral: "border-black/10 bg-white/70 text-ink",
	success: "border-forest/20 bg-forest/10 text-forest",
	warning: "border-clay/20 bg-clay/10 text-clay",
	error: "border-red-300 bg-red-50 text-red-700",
};

export function StatusBanner({
	title,
	message,
	tone = "neutral",
}: StatusBannerProps) {
	return (
		<div
			className={`rounded-3xl border px-4 py-3 text-sm shadow-sm ${toneClasses[tone]}`}
			role="status"
			aria-live="polite"
		>
			<div className="font-semibold">{title}</div>
			{message ?
				<div className="mt-1 opacity-90">{message}</div>
			:	null}
		</div>
	);
}
