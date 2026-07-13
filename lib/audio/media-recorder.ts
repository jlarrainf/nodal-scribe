export function isMediaRecorderSupported(): boolean {
	return (
		typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined"
	);
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
	if (!navigator.mediaDevices?.getUserMedia) {
		throw new Error("Tu navegador no permite acceso al micrófono.");
	}

	return navigator.mediaDevices.getUserMedia({ audio: true });
}

export function pickRecorderMimeType(): string | undefined {
	if (
		typeof window === "undefined" ||
		typeof window.MediaRecorder === "undefined"
	) {
		return undefined;
	}

	const options = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
	return options.find((mimeType) =>
		window.MediaRecorder.isTypeSupported(mimeType),
	);
}

export function blobToFile(blob: Blob, fileName: string): File {
	const extension = blob.type.includes("mp4") ? "m4a" : "webm";
	return new File([blob], `${fileName}.${extension}`, {
		type: blob.type || "audio/webm",
	});
}
