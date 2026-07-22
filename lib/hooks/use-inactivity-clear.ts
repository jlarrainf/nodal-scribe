"use client";

import { useEffect, useRef } from "react";

const INACTIVITY_LIMIT_MS = 1000 * 60 * 15;

export function useInactivityClear(
	enabled: boolean,
	onClear: () => void,
) {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const resetTimer = () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				onClear();
			}, INACTIVITY_LIMIT_MS);
		};

		const events = ["mousedown", "keydown", "touchstart", "scroll"];
		events.forEach((event) =>
			window.addEventListener(event, resetTimer, { passive: true }),
		);

		resetTimer();

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			events.forEach((event) =>
				window.removeEventListener(event, resetTimer),
			);
		};
	}, [enabled, onClear]);
}
