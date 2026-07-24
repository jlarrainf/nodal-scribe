"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type AuthMode = "sign-in" | "sign-up";

type LoginFormProps = {
	redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
	const [mode, setMode] = useState<AuthMode>("sign-in");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const actionLabel = mode === "sign-in" ? "Iniciar sesión" : "Crear cuenta";

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		setMessage(null);

		const response = await fetch(`/api/auth/${mode}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		const payload = (await response.json()) as {
			error?: string;
			needsConfirmation?: boolean;
		};

		setLoading(false);

		if (!response.ok) {
			setMessage(payload.error ?? "No se pudo completar la autenticación.");
			return;
		}

		if (mode === "sign-up") {
			setMessage(
				"Cuenta creada. Si tu proyecto tiene confirmación por correo activa, revisa tu bandeja y luego inicia sesión.",
			);
			return;
		}

		window.location.assign(redirectTo);
	};

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
			<section className="w-full animate-fade-in-up rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-soft backdrop-blur sm:p-8">
				<div className="space-y-3">
					<div className="flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-sm font-bold text-white shadow-sm">
							NS
						</span>
						<div className="inline-flex rounded-full border border-black/10 bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-forest">
							Nodal Scribe
						</div>
					</div>
					<h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
						Accede para usar el grabador
					</h1>
					<p className="max-w-2xl text-sm leading-6 text-ink/70 sm:text-base">
						Inicia sesión o crea una cuenta para entrar a la pantalla principal
						protegida. El flujo del grabador no cambia; solo queda detrás de
						autenticación.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="mt-8 grid gap-5">
					<div className="grid gap-2">
						<label className="text-sm font-medium text-ink" htmlFor="email">
							Correo electrónico
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							autoComplete="email"
							className="rounded-2xl border border-black/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest focus:ring-2 focus:ring-forest/20"
							placeholder="doctor@clinica.cl"
						/>
					</div>

					<div className="grid gap-2">
						<label className="text-sm font-medium text-ink" htmlFor="password">
							Contraseña
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							autoComplete={
								mode === "sign-in" ? "current-password" : "new-password"
							}
							className="rounded-2xl border border-black/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest focus:ring-2 focus:ring-forest/20"
							placeholder="••••••••"
						/>
					</div>

					{message ?
						<div
							className="animate-fade-in-up rounded-2xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm text-clay"
							role="status"
							aria-live="polite"
						>
							{message}
						</div>
					:	null}

					<button
						type="submit"
						disabled={loading}
						className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loading && (
							<span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
						)}
						{loading ? "Procesando..." : actionLabel}
					</button>

					<div className="flex items-center gap-3">
						<span className="h-px flex-1 bg-black/10" />
						<span className="text-xs font-medium uppercase tracking-[0.15em] text-ink/40">
							o
						</span>
						<span className="h-px flex-1 bg-black/10" />
					</div>

					<button
						type="button"
						onClick={() => window.location.assign("/api/auth/google")}
						className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-black/10 bg-white px-5 py-2.5 text-[13px] font-semibold text-ink transition hover:border-black/20 hover:bg-paper/40"
					>
						<svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.1A6.6 6.6 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 002.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
							/>
						</svg>
						Continuar con Google
					</button>

					<button
						type="button"
						onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
						className="text-left text-sm font-medium text-forest underline-offset-4 hover:underline"
					>
						{mode === "sign-in" ?
							"¿No tienes cuenta? Crear una"
						:	"¿Ya tienes cuenta? Iniciar sesión"}
					</button>
				</form>

				<div className="mt-8 rounded-2xl border border-black/5 bg-paper/40 px-4 py-3">
					<p className="text-xs leading-5 text-ink/50">
						Tus credenciales se validan en el servidor mediante Supabase Auth.
						Ningún dato clínico se almacena ni se transmite a terceros durante
						el proceso de autenticación.
					</p>
					<p className="mt-2 text-xs leading-5 text-ink/50">
						Al continuar, aceptas nuestros{" "}
						<a
							href="/terminos-y-condiciones"
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-forest underline-offset-4 hover:underline"
						>
							Términos y Condiciones
						</a>{" "}
						y la{" "}
						<a
							href="/politica-de-privacidad"
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-forest underline-offset-4 hover:underline"
						>
							Política de Privacidad
						</a>
						.
					</p>
				</div>
			</section>
		</main>
	);
}
