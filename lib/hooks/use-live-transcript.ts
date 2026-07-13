"use client";

import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

function getSpeechRecognition(): unknown {
	if (typeof window === "undefined") return null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const w = window as any;
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useLiveTranscript(enabled: boolean): string {
	const [rawText, setRawText] = useState("");
	const recognitionRef = useRef<unknown>(null);
	const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!enabled) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(recognitionRef.current as any)?.stop?.();
			recognitionRef.current = null;
			if (restartTimeoutRef.current) {
				clearTimeout(restartTimeoutRef.current);
				restartTimeoutRef.current = null;
			}
			setRawText("");
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const RecognitionCtor = getSpeechRecognition() as { new (): AnyObj } | null;
		if (!RecognitionCtor) {
			setRawText(
				"[Web Speech API no disponible. Usa Chrome o Edge.]",
			);
			return;
		}

		let accumulated = "";
		let restarting = false;

		const startRecognition = () => {
			restarting = false;
			const recognition: AnyObj = new RecognitionCtor();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = "es-CL";
			recognition.maxAlternatives = 1;

			recognition.onresult = (event: AnyObj) => {
				const resultIndex = event.resultIndex as number;
				const results = event.results as AnyObj[];

				for (let i = resultIndex; i < results.length; i++) {
					const result = results[i];
					if (result.isFinal) {
						const text = (result[0]?.transcript ?? "").trim();
						if (text) {
							accumulated += " " + text.charAt(0).toUpperCase() + text.slice(1);
						}
					}
				}

				setRawText(accumulated.trim());
			};

			recognition.onerror = (e: AnyObj) => {
				const errMsg = e?.error ?? "unknown";
				recognition.stop?.();
				recognitionRef.current = null;
				if (!restarting && errMsg !== "aborted") {
					restarting = true;
					restartTimeoutRef.current = setTimeout(startRecognition, 1000);
				}
			};

			recognition.onend = () => {
				recognitionRef.current = null;
				if (enabled && !restarting) {
					restartTimeoutRef.current = setTimeout(startRecognition, 500);
				}
			};

			recognitionRef.current = recognition;
			try {
				recognition.start();
			} catch {
				recognitionRef.current = null;
			}
		};

		startRecognition();

		return () => {
			restarting = true;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(recognitionRef.current as any)?.stop?.();
			recognitionRef.current = null;
			if (restartTimeoutRef.current) {
				clearTimeout(restartTimeoutRef.current);
				restartTimeoutRef.current = null;
			}
		};
	}, [enabled]);

	return rawText;
}
