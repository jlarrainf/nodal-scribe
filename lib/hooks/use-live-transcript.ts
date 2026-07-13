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
	const [transcript, setTranscript] = useState("");
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
			setTranscript("");
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const RecognitionCtor = getSpeechRecognition() as { new (): AnyObj } | null;
		if (!RecognitionCtor) return;

		let finalTranscript = "";

		const startRecognition = () => {
			const recognition: AnyObj = new RecognitionCtor();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = "es-CL";
			recognition.maxAlternatives = 1;

			recognition.onresult = (event: AnyObj) => {
				const resultIndex = event.resultIndex as number;
				const results = event.results as AnyObj[];
				let interim = "";

				for (let i = resultIndex; i < results.length; i++) {
					const result = results[i];
					if (result.isFinal) {
						finalTranscript += " " + (result[0]?.transcript ?? "");
					} else {
						interim += result[0]?.transcript ?? "";
					}
				}

				setTranscript((finalTranscript + " " + interim).trim());
			};

			recognition.onerror = () => {
				recognition.stop?.();
				recognitionRef.current = null;
				restartTimeoutRef.current = setTimeout(startRecognition, 500);
			};

			recognition.onend = () => {
				recognitionRef.current = null;
				if (enabled) {
					restartTimeoutRef.current = setTimeout(startRecognition, 300);
				}
			};

			recognitionRef.current = recognition;
			recognition.start?.();
		};

		startRecognition();

		return () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(recognitionRef.current as any)?.stop?.();
			recognitionRef.current = null;
			if (restartTimeoutRef.current) {
				clearTimeout(restartTimeoutRef.current);
				restartTimeoutRef.current = null;
			}
		};
	}, [enabled]);

	return transcript;
}
