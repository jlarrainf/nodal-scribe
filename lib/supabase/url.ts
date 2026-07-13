const API_SUFFIXES = ["/auth/v1", "/rest/v1", "/storage/v1", "/functions/v1"];

export function normalizeSupabaseUrl(url: string): string {
	const trimmed = url.trim().replace(/\/+$/, "");

	for (const suffix of API_SUFFIXES) {
		if (trimmed.endsWith(suffix)) {
			return trimmed.slice(0, -suffix.length);
		}
	}

	return trimmed;
}
