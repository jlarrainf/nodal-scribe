"use client";

import type { ReactNode } from "react";
import type { ToastItem, ToastTone } from "@/lib/hooks/use-toasts";

type ToastStackProps = {
	toasts: ToastItem[];
	onDismiss: (id: number) => void;
};

const TONE_META: Record<ToastTone, { chip: string; bar: string; icon: ReactNode }> = {
	success: {
		chip: "bg-forest/10 text-forest",
		bar: "bg-forest",
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
			</svg>
		),
	},
	error: {
		chip: "bg-red-100 text-red-600",
		bar: "bg-red-500",
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		),
	},
	warning: {
		chip: "bg-clay/10 text-clay",
		bar: "bg-clay",
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 9v2m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
				/>
			</svg>
		),
	},
	neutral: {
		chip: "bg-ink/10 text-ink/70",
		bar: "bg-ink/40",
		icon: (
			<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		),
	},
};

function ToastCard({
	toast,
	onDismiss,
}: {
	toast: ToastItem;
	onDismiss: (id: number) => void;
}) {
	const meta = TONE_META[toast.tone];

	return (
		<div className="animate-toast-in pointer-events-auto relative overflow-hidden rounded-2xl border border-black/10 bg-white/95 shadow-soft backdrop-blur">
			<div className="flex items-start gap-3 px-4 py-3.5">
				<span
					className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.chip}`}
				>
					{meta.icon}
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-ink">{toast.title}</p>
					{toast.message ?
						<p className="mt-0.5 text-xs leading-5 text-ink/65">{toast.message}</p>
					:	null}
				</div>
				<button
					type="button"
					onClick={() => onDismiss(toast.id)}
					aria-label="Cerrar notificación"
					className="shrink-0 rounded-full p-1 text-ink/35 transition hover:bg-ink/5 hover:text-ink"
				>
					<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<span
				className={`absolute bottom-0 left-0 h-0.5 ${meta.bar} animate-toast-progress`}
				style={{ animationDuration: `${toast.duration}ms` }}
			/>
		</div>
	);
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
	return (
		<div
			className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2.5"
			role="region"
			aria-label="Notificaciones"
			aria-live="polite"
		>
			{toasts.map((toast) => (
				<ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
			))}
		</div>
	);
}
