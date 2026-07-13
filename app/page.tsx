"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ConsentCheckbox } from "@/components/consent-checkbox";
import { RecordButton } from "@/components/record-button";
import { ResultActions } from "@/components/result-actions";
import { SoapEditor } from "@/components/soap-editor";
import { StatusBanner } from "@/components/status-banner";
import {
	validateAndSanitize,
	type ClinicalNoteDocument,
} from "@/lib/ai/schemas";
import { getSpecialtyDefinition } from "@/lib/ai/specialties";
import {
	blobToFile,
	pickRecorderMimeType,
	requestMicrophoneStream,
} from "@/lib/audio/media-recorder";
import { clearDraft, loadDraft, saveDraft } from "@/lib/storage/autosave";
import {
	createEmptyClinicalNote,
	getSpecialtyPreviewLines,
	noteToClipboardText,
} from "@/lib/utils/clinical-note";
import { formatError } from "@/lib/utils/format-error";
import { useLiveTranscript } from "@/lib/hooks/use-live-transcript";
import { LiveTelemetry } from "@/components/live-telemetry";

type AppStatus = "idle" | "recording" | "processing" | "success" | "error";

export default function Home() {
	const [consentGiven, setConsentGiven] = useState(false);
	const [status, setStatus] = useState<AppStatus>("idle");
	const [statusMessage, setStatusMessage] = useState(
		"Confirma el consentimiento para habilitar el micrófono.",
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [specialtyTemplate, setSpecialtyTemplate] = useState("general_soap");
	const [note, setNote] = useState<ClinicalNoteDocument>(
		createEmptyClinicalNote(),
	);
	const [hydrated, setHydrated] = useState(false);
	const [hasDraft, setHasDraft] = useState(false);
	const [testingText, setTestingText] = useState("");
	const [testingOpen, setTestingOpen] = useState(false);
	const [liveNotes, setLiveNotes] = useState<string[]>([]);
	const specialty = getSpecialtyDefinition(specialtyTemplate);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const chunksRef = useRef<BlobPart[]>([]);

	useEffect(() => {
		const draft = loadDraft();
		if (draft?.note && draft?.specialtyTemplate) {
			setSpecialtyTemplate(draft.specialtyTemplate);
			setNote(draft.note);
			setHasDraft(true);
			setStatus("success");
			setStatusMessage(
				"Se restauró un borrador local guardado en este navegador.",
			);
		}

		const loadProfile = async () => {
			try {
				const response = await fetch("/api/profile");
				if (!response.ok) {
					return;
				}

				const payload = (await response.json()) as {
					specialty_template?: string;
				};
				if (payload.specialty_template) {
					setSpecialtyTemplate(payload.specialty_template);
					if (!draft?.note) {
						setNote(createEmptyClinicalNote(payload.specialty_template));
					}
				}
			} catch {
				return;
			}
		};

		void loadProfile();
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) {
			return;
		}
		saveDraft(note, specialtyTemplate);
	}, [hydrated, note, specialtyTemplate]);



	useEffect(() => {
		return () => {
			streamRef.current?.getTracks().forEach((track) => track.stop());
		};
	}, []);

	const handleStartStop = async () => {
		if (status === "recording") {
			mediaRecorderRef.current?.stop();
			setStatus("processing");
			setStatusMessage("Procesando audio y generando la nota SOAP.");
			return;
		}

		if (!consentGiven) {
			setErrorMessage("Debes confirmar el consentimiento antes de grabar.");
			setStatus("error");
			return;
		}

		setErrorMessage(null);

		try {
			const stream = await requestMicrophoneStream();
			streamRef.current = stream;
			chunksRef.current = [];

			const mimeType = pickRecorderMimeType();
			const recorder = new MediaRecorder(
				stream,
				mimeType ? { mimeType } : undefined,
			);
			mediaRecorderRef.current = recorder;

			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunksRef.current.push(event.data);
				}
			};

			recorder.onstop = async () => {
				try {
					const blob = new Blob(chunksRef.current, {
						type: recorder.mimeType || "audio/webm",
					});
					const file = blobToFile(blob, "nodal-scribe-audio");
					const formData = new FormData();
					formData.append("audio", file);

					const response = await fetch("/api/process-audio", {
						method: "POST",
						body: formData,
					});

					const payload = (await response.json()) as unknown;

					if (!response.ok) {
						throw new Error(
							(
								typeof payload === "object" &&
									payload !== null &&
									"error" in payload
							) ?
								String((payload as { error: unknown }).error)
							:	"No se pudo procesar el audio.",
						);
					}

					const sanitized = validateAndSanitize(
						specialtyTemplate,
						payload as Record<string, unknown>,
					);

					setNote(sanitized);
					setHasDraft(true);
					setStatus("success");
					setStatusMessage(
						"La nota fue generada y ya está lista para editar o copiar.",
					);
					saveDraft(sanitized, specialtyTemplate);
				} catch (error) {
					const message = formatError(error);
					setErrorMessage(message);
					setStatus("error");
					setStatusMessage(message);
				} finally {
					stream.getTracks().forEach((track) => track.stop());
					streamRef.current = null;
					mediaRecorderRef.current = null;
					chunksRef.current = [];
				}
			};

			recorder.start();
			setStatus("recording");
			setStatusMessage("Grabando consulta en curso.");
		} catch (error) {
			const message = formatError(error);
			setErrorMessage(message);
			setStatus("error");
			setStatusMessage(message);
		}
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(
			noteToClipboardText(note, specialtyTemplate),
		);
		setStatusMessage("Nota copiada al portapapeles.");
		setStatus("success");
	};

	const handleClearDraft = () => {
		const empty = createEmptyClinicalNote(specialtyTemplate);
		setNote(empty);
		setHasDraft(false);
		clearDraft();
		setStatus("idle");
		setStatusMessage("Borrador limpio. Puedes iniciar una nueva grabación.");
	};

	const handleProcessTestingText = async () => {
		if (!testingText.trim()) {
			setErrorMessage("Pega una transcripción antes de procesarla.");
			setStatus("error");
			return;
		}

		setErrorMessage(null);
		setStatus("processing");
		setStatusMessage("Procesando transcripción de texto.");

		try {
			const response = await fetch("/api/process-text", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: testingText }),
			});

			const payload = (await response.json()) as unknown;

			if (!response.ok) {
				throw new Error(
					(
						typeof payload === "object" &&
							payload !== null &&
							"error" in payload
					) ?
						String((payload as { error: unknown }).error)
					:	"No se pudo procesar el texto.",
				);
			}

			const sanitized = validateAndSanitize(
					specialtyTemplate,
					payload as Record<string, unknown>,
				);

			setNote(sanitized);
			setHasDraft(true);
			setStatus("success");
			setStatusMessage(
				"La transcripción de texto fue procesada y ya está lista para editar o copiar.",
			);
			saveDraft(sanitized, specialtyTemplate);
		} catch (error) {
			const message = formatError(error);
			setErrorMessage(message);
			setStatus("error");
			setStatusMessage(message);
		}
	};

	const liveRawText = useLiveTranscript(status === "recording");
	const lastSentRef = useRef(0);

	useEffect(() => {
		if (status !== "recording") {
			setLiveNotes([]);
			lastSentRef.current = 0;
			return;
		}

		const interval = setInterval(async () => {
			const currentText = liveRawText;
			const prevLength = lastSentRef.current;

			if (currentText.length <= prevLength) return;

			const newText = currentText.slice(prevLength);
			lastSentRef.current = currentText.length;

			try {
				const response = await fetch("/api/process-live-note", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						previousNotes: liveNotes,
						newText,
					}),
				});

				if (!response.ok) return;

				const payload = (await response.json()) as { notes?: string[] };
				if (payload.notes) {
					setLiveNotes(payload.notes);
				}
			} catch {
				// silencioso — no interrumpir la grabación
			}
		}, 60_000);

		return () => clearInterval(interval);
	}, [status, liveRawText]);

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
			<section className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
				<div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-black/10 bg-hero-grid p-6 shadow-soft sm:p-8">
					<div className="space-y-5">
						<div className="flex justify-end">
							<Link
								href="/settings"
								className="rounded-full border border-black/10 bg-white/75 px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5"
							>
								Perfil / Ajustes
							</Link>
						</div>
						<div className="inline-flex rounded-full border border-black/10 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-forest">
							Nodal Scribe PoC
						</div>
						<div className="space-y-3">
							<h1 className="max-w-xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
								Un solo botón para capturar, estructurar y revisar una nota
								SOAP.
							</h1>
							<p className="max-w-xl text-base leading-7 text-ink/75 sm:text-lg">
								El flujo está diseñado para minimizar fricción, exigir
								consentimiento previo y generar una salida JSON estricta lista
								para revisión humana.
							</p>
							<div className="grid gap-3 rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm sm:max-w-xl">
								<div className="flex flex-wrap items-center gap-2">
									<span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-forest">
										Perfil activo
									</span>
									<span className="text-sm font-semibold text-ink">
										{specialty.label}
									</span>
								</div>
								<p className="text-sm text-ink/70">{specialty.description}</p>
								<div className="flex flex-wrap gap-2">
									{getSpecialtyPreviewLines(specialtyTemplate)
										.slice(0, 5)
										.map((item) => (
											<span
												key={item}
												className="rounded-full border border-black/10 bg-paper/70 px-3 py-1 text-xs text-ink/80"
											>
												{item}
											</span>
										))}
								</div>
							</div>
						</div>
					</div>

					<div className="grid gap-4">
						<ConsentCheckbox
							checked={consentGiven}
							onChange={setConsentGiven}
							disabled={status === "processing"}
						/>
						<div className="flex flex-wrap items-center gap-4">
							<RecordButton
								status={
									status === "processing" ? "processing"
									: status === "recording" ?
										"recording"
									:	"idle"
								}
								disabled={!consentGiven && status !== "recording"}
								onClick={handleStartStop}
							/>
							<div className="text-sm text-ink/70">
								{status === "recording" ?
									"Toca de nuevo para detener la grabación."
								:	"El audio se procesa de forma efímera en la función serverless."
								}
							</div>
						</div>

						<details className="group rounded-3xl border border-dashed border-black/15 bg-white/55 p-4 shadow-sm transition hover:bg-white/70">
							<summary className="cursor-pointer list-none text-sm font-semibold text-forest outline-none">
								<span className="inline-flex items-center gap-2">
									<span className="rounded-full bg-forest/10 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-forest">
										Testing
									</span>
									Modo Testing: Ingresar Transcripción
								</span>
							</summary>
							<div className="mt-4 grid gap-3">
								<p className="text-sm text-ink/70">
									Usa este modo para pegar una transcripción cruda y probar la
									estructuración del LLM sin micrófono ni ASR.
								</p>
								<textarea
									value={testingText}
									onChange={(event) => setTestingText(event.target.value)}
									rows={6}
									placeholder="Pega aquí la transcripción textual..."
									className="min-h-32 rounded-2xl border border-black/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest focus:ring-2 focus:ring-forest/20"
								/>
								<div className="flex flex-wrap items-center gap-3">
									<button
										type="button"
										onClick={handleProcessTestingText}
										disabled={status === "processing"}
										className="inline-flex items-center justify-center rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Procesar Texto
									</button>
									<button
										type="button"
										onClick={() => setTestingOpen((current) => !current)}
										className="text-sm font-medium text-ink/60 underline-offset-4 hover:text-ink hover:underline"
									>
										{testingOpen ? "Ocultar" : ""}
									</button>
								</div>
							</div>
						</details>
					</div>
				</div>

				<div className="grid gap-4">
					<LiveTelemetry notes={liveNotes} interim={liveRawText} isActive={status === "recording"} />

					<StatusBanner
						title={
							status === "error" ? "Se produjo un problema"
							: status === "processing" ?
								"Procesando"
							: status === "recording" ?
								"Grabación activa"
							:	"Listo"
						}
						message={statusMessage}
						tone={
							status === "error" ? "error"
							: status === "processing" ?
								"warning"
							: status === "success" ?
								"success"
							:	"neutral"
						}
					/>

					{errorMessage ?
						<div className="rounded-3xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
							{errorMessage}
						</div>
					:	null}

					<SoapEditor
						value={note}
						onChange={(nextValue) => {
							setNote(nextValue);
							setHasDraft(true);
						}}
						disabled={status === "processing"}
						specialtyTemplate={specialtyTemplate}
					/>

					<div className="rounded-[2rem] border border-black/10 bg-white/75 p-5 shadow-soft">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div>
								<h2 className="text-lg font-semibold text-ink">Acciones</h2>
								<p className="mt-1 text-sm text-ink/70">
									Copia la nota o limpia el borrador local cuando termines.
								</p>
							</div>
							<ResultActions
								onCopy={handleCopy}
								onClear={handleClearDraft}
								disabled={!hydrated || status === "processing"}
							/>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
