import { useCallback, useRef, useState } from "react";

export type ToastTone = "neutral" | "success" | "warning" | "error";

export type ToastItem = {
	id: number;
	tone: ToastTone;
	title: string;
	message?: string;
	duration: number;
};

export type ToastInput = {
	tone?: ToastTone;
	title: string;
	message?: string;
};

const TOAST_DURATIONS: Record<ToastTone, number> = {
	neutral: 4200,
	success: 4200,
	warning: 5200,
	error: 8000,
};

export function useToasts() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const idRef = useRef(0);

	const dismissToast = useCallback((id: number) => {
		setToasts((current) => current.filter((toast) => toast.id !== id));
	}, []);

	const pushToast = useCallback((input: ToastInput) => {
		const tone = input.tone ?? "neutral";
		const duration = TOAST_DURATIONS[tone];
		const id = ++idRef.current;

		setToasts((current) => [
			...current.slice(-2),
			{ id, tone, title: input.title, message: input.message, duration },
		]);

		window.setTimeout(() => {
			setToasts((current) => current.filter((toast) => toast.id !== id));
		}, duration);
	}, []);

	return { toasts, pushToast, dismissToast };
}
