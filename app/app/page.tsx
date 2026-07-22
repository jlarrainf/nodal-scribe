"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { ConsentCheckbox } from "@/components/consent-checkbox";
import { RecordButton } from "@/components/record-button";
import { ResultActions } from "@/components/result-actions";
import { SoapEditor } from "@/components/soap-editor";
import { ToastStack } from "@/components/toast-stack";
import {
	validateAndSanitize,
	type ClinicalNoteDocument,
} from "@/lib/ai/schemas";
import {
	getSpecialtyDefinition,
	type SpecialtyStructure,
} from "@/lib/ai/specialties";
import {
	blobToFile,
	pickRecorderMimeType,
	requestMicrophoneStream,
} from "@/lib/audio/media-recorder";
import { clearDraft, loadDraft, saveDraft } from "@/lib/storage/autosave";
import {
	createEmptyClinicalNote,
	noteToClipboardText,
} from "@/lib/utils/clinical-note";
import { formatError } from "@/lib/utils/format-error";
import { useInactivityClear } from "@/lib/hooks/use-inactivity-clear";
import { useToasts } from "@/lib/hooks/use-toasts";
import { LiveNotesPanel } from "@/components/live-notes-panel";

type AppStatus = "idle" | "recording" | "processing";

const LIVE_NOTES_FIRST_DELAY_MS = 12_000;
const LIVE_NOTES_INTERVAL_MS = 30_000;
const DEFAULT_SPECIALTY: SpecialtyStructure = getSpecialtyDefinition("general_soap");

export default function AppPage() {
	const [consentGiven, setConsentGiven] = useState(false);
	const [status, setStatus] = useState<AppStatus>("idle");
	const [specialtyTemplate, setSpecialtyTemplate] = useState("general_soap");
	const [activeSpecialty, setActiveSpecialty] =
		useState<SpecialtyStructure>(DEFAULT_SPECIALTY);
	const [note, setNote] = useState<ClinicalNoteDocument>(() =>
		createEmptyClinicalNote(DEFAULT_SPECIALTY.fields),
	);
	const [hydrated, setHydrated] = useState(false);
	const [hasDraft, setHasDraft] = useState(false);
	const [testingText, setTestingText] = useState("");
	const [liveMarkdown, setLiveMarkdown] = useState("");
	const [liveProcessing, setLiveProcessing] = useState(false);
	const [liveUpdatedAt, setLiveUpdatedAt] = useState<number | null>(null);
	const [confirmingCancel, setConfirmingCancel] = useState(false);
	const { toasts, pushToast, dismissToast } = useToasts();

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const chunksRef = useRef<BlobPart[]>([]);
	const liveCursorRef = useRef(0);
	const liveMarkdownRef = useRef("");
	const discardRef = useRef(false);

	useEffect(() => {
		const draft = loadDraft();
		if (draft?.note && draft?.specialtyTemplate) {
			setSpecialtyTemplate(draft.specialtyTemplate);
			setNote(draft.note);
			setHasDraft(true);
			pushToast({
				tone: "neutral",
				title: "Borrador restaurado",
				message: "Se restauró un borrador local guardado en este navegador.",
			});
		}

		const loadProfile = async () => {
			try {
				const response = await fetch("/api/profile");
				if (!response.ok) {
					return;
				}

				const payload = (await response.json()) as {
					specialty_template?: string;
					active_specialty?: SpecialtyStructure;
				};

				if (payload.active_specialty) {
					setActiveSpecialty(payload.active_specialty);
					if (payload.specialty_template) {
						setSpecialtyTemplate(payload.specialty_template);
					}
					if (!draft?.note) {
						setNote(createEmptyClinicalNote(payload.active_specialty.fields));
					}
				}
			} catch {
				return;
			}
		};

		void loadProfile();
		setHydrated(true);
	}, [pushToast]);

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
			setConfirmingCancel(false);
			mediaRecorderRef.current?.stop();
			setStatus("processing");
			return;
		}

		if (!consentGiven) {
			pushToast({
				tone: "warning",
				title: "Consentimiento requerido",
				message: "Debes confirmar el consentimiento antes de grabar.",
			});
			return;
		}

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
				const discard = discardRef.current;
				discardRef.current = false;

				if (discard) {
					stream.getTracks().forEach((track) => track.stop());
					streamRef.current = null;
					mediaRecorderRef.current = null;
					chunksRef.current = [];
					liveCursorRef.current = 0;
					setStatus("idle");
					pushToast({
						tone: "neutral",
						title: "Grabación descartada",
						message: "El audio se eliminó sin procesarse.",
					});
					return;
				}

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
					setStatus("idle");
					saveDraft(sanitized, specialtyTemplate);
					pushToast({
						tone: "success",
						title: "Nota generada",
						message: "La nota está lista para revisar, editar o copiar.",
					});
				} catch (error) {
					setStatus("idle");
					pushToast({
						tone: "error",
						title: "No se pudo procesar el audio",
						message: formatError(error),
					});
				} finally {
					stream.getTracks().forEach((track) => track.stop());
					streamRef.current = null;
					mediaRecorderRef.current = null;
					chunksRef.current = [];
				}
			};

			recorder.start();
			setConfirmingCancel(false);
			setStatus("recording");
		} catch (error) {
			pushToast({
				tone: "error",
				title: "No se pudo iniciar la grabación",
				message: formatError(error),
			});
		}
	};

	const handleCancelRecording = () => {
		discardRef.current = true;
		setConfirmingCancel(false);
		mediaRecorderRef.current?.stop();
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(
			noteToClipboardText(note, activeSpecialty.fields),
		);
		pushToast({
			tone: "success",
			title: "Nota copiada",
			message: "La nota se copió al portapapeles.",
		});
	};

	const handleClearDraft = useCallback(() => {
		const empty = createEmptyClinicalNote(activeSpecialty.fields);
		setNote(empty);
		setHasDraft(false);
		clearDraft();
		setStatus("idle");
		pushToast({
			tone: "neutral",
			title: "Borrador limpio",
			message: "Puedes iniciar una nueva grabación.",
		});
	}, [activeSpecialty, pushToast]);

	useInactivityClear(hasDraft && status !== "recording", handleClearDraft);

	const handleProcessTestingText = async () => {
		if (!testingText.trim()) {
			pushToast({
				tone: "warning",
				title: "Sin transcripción",
				message: "Pega una transcripción antes de procesarla.",
			});
			return;
		}

		setStatus("processing");

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
			setStatus("idle");
			saveDraft(sanitized, specialtyTemplate);
			pushToast({
				tone: "success",
				title: "Transcripción procesada",
				message: "La nota está lista para revisar, editar o copiar.",
			});
		} catch (error) {
			setStatus("idle");
			pushToast({
				tone: "error",
				title: "No se pudo procesar el texto",
				message: formatError(error),
			});
		}
	};

	useEffect(() => {
		if (status !== "recording") {
			setLiveMarkdown("");
			liveMarkdownRef.current = "";
			setLiveProcessing(false);
			setLiveUpdatedAt(null);
			liveCursorRef.current = 0;
			return;
		}

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout>;

		const tick = async () => {
			const allChunks = chunksRef.current;
			const cursor = liveCursorRef.current;

			if (allChunks.length === 0 || allChunks.length <= cursor) {
				return;
			}

			const chunkCountAtRequest = allChunks.length;
			const newChunks = allChunks.slice(cursor);
			const segmentParts =
				cursor === 0 ? allChunks : [allChunks[0], ...newChunks];
			const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
			const blob = new Blob(segmentParts, { type: mimeType });

			setLiveProcessing(true);
			try {
				const file = blobToFile(blob, "nodal-scribe-live");
				const formData = new FormData();
				formData.append("audio", file);
				formData.append("previousNotes", liveMarkdownRef.current);

				const response = await fetch("/api/process-live-note", {
					method: "POST",
					body: formData,
				});

				if (cancelled) {
					return;
				}

				if (response.ok) {
					const payload = (await response.json()) as {
						markdown?: string;
						transcribed?: boolean;
					};

					if (typeof payload.markdown === "string") {
						liveMarkdownRef.current = payload.markdown;
						setLiveMarkdown(payload.markdown);
					}

					if (payload.transcribed) {
						liveCursorRef.current = chunkCountAtRequest;
						setLiveUpdatedAt(Date.now());
					}
				}
			} catch {
				// silencioso — no interrumpir la grabación
			} finally {
				if (!cancelled) {
					setLiveProcessing(false);
				}
			}
		};

		const schedule = (delay: number) => {
			timer = setTimeout(async () => {
				if (cancelled) {
					return;
				}
				await tick();
				if (!cancelled) {
					schedule(LIVE_NOTES_INTERVAL_MS);
				}
			}, delay);
		};

		schedule(LIVE_NOTES_FIRST_DELAY_MS);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [status]);

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader />

			<main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
				<section className="grid flex-1 items-start gap-5 lg:grid-cols-[340px_1fr]">
					<div className="animate-fade-in-up flex flex-col gap-4 rounded-2xl border border-black/8 bg-gradient-to-b from-white to-paper/45 p-5 shadow-[0_1px_2px_rgba(17,17,17,0.04),0_16px_40px_-20px_rgba(35,66,58,0.25)] lg:sticky lg:top-20 lg:self-start">
						<div className="flex items-center gap-2.5">
							<span className="h-px w-5 bg-forest/50" />
							<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
								Captura de consulta
							</p>
						</div>

						<p className="text-[13px] leading-5 text-ink/60">
							Activa el micrófono y atiende con normalidad. Al detener la
							grabación, la ficha se estructura sola y queda lista para que la
							revises y la copies a tu sistema.
						</p>

						<ConsentCheckbox
							checked={consentGiven}
							onChange={setConsentGiven}
							disabled={status === "processing"}
						/>

						<div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-black/6 bg-paper/40 px-4 py-7">
							<span
								aria-hidden
								className={`pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 rounded-full blur-3xl transition-colors duration-700 ${
									status === "recording" ?
										"animate-breathe bg-clay/30"
									: status === "processing" ?
										"-translate-x-1/2 -translate-y-1/2 bg-forest/15"
									:	"-translate-x-1/2 -translate-y-1/2 bg-forest/10"
								}`}
							/>
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

							{status === "recording" && !confirmingCancel ?
								<span className="flex h-5 items-end gap-[3px]" aria-hidden>
									{[0, 1, 2, 3, 4].map((bar) => (
										<span
											key={bar}
											className="eq-bar h-full w-[3px] rounded-full bg-clay/70"
											style={{
												animationDelay: `${bar * 0.13}s`,
												animationDuration: `${0.75 + (bar % 3) * 0.18}s`,
											}}
										/>
									))}
								</span>
							:	null}

							{status === "recording" ?
								confirmingCancel ?
									<div className="animate-fade-in-up flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
										<span className="text-[11px] font-semibold text-red-700">
											¿Descartar? No se procesará.
										</span>
										<span className="flex items-center gap-1.5">
											<button
												type="button"
												onClick={handleCancelRecording}
												className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-red-700"
											>
												Descartar
											</button>
											<button
												type="button"
												onClick={() => setConfirmingCancel(false)}
												className="rounded-full px-1.5 py-1 text-[11px] font-medium text-red-700 hover:underline"
											>
												Seguir
											</button>
										</span>
									</div>
								:	<button
										type="button"
										onClick={() => setConfirmingCancel(true)}
										className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-[11px] font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
									>
										<svg
											className="h-3 w-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2.2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
										Cancelar grabación
									</button>
							:	null}
						</div>

						<details className="group rounded-xl border border-dashed border-black/12 p-3.5 transition hover:border-forest/30">
							<summary className="cursor-pointer list-none text-[13px] font-medium text-ink/60 outline-none transition group-hover:text-forest">
								Modo testing · pegar transcripción
							</summary>
							<div className="mt-3 grid gap-2.5">
								<textarea
									value={testingText}
									onChange={(event) => setTestingText(event.target.value)}
									rows={5}
									placeholder="Pega aquí la transcripción textual..."
									className="min-h-24 rounded-lg border border-black/10 bg-paper/40 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-forest focus:ring-2 focus:ring-forest/15"
								/>
								<button
									type="button"
									onClick={handleProcessTestingText}
									disabled={status === "processing"}
									className="inline-flex items-center justify-center rounded-full bg-forest px-4 py-2 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Procesar texto
								</button>
							</div>
						</details>
					</div>

					<div className="animate-fade-in-up grid gap-4" style={{ animationDelay: "90ms" }}>
						<LiveNotesPanel
							markdown={liveMarkdown}
							processing={liveProcessing}
							updatedAt={liveUpdatedAt}
							isActive={status === "recording"}
						/>

						<SoapEditor
							value={note}
							onChange={(nextValue) => {
								setNote(nextValue);
								setHasDraft(true);
							}}
							disabled={status === "processing"}
							structure={activeSpecialty}
							headerActions={
								<ResultActions
									onCopy={handleCopy}
									onClear={handleClearDraft}
									disabled={!hydrated || status === "processing"}
								/>
							}
						/>
					</div>
				</section>
			</main>

			<AppFooter />

			<ToastStack toasts={toasts} onDismiss={dismissToast} />
		</div>
	);
}
