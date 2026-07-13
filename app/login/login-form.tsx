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
			<section className="w-full rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-soft backdrop-blur sm:p-8">
				<div className="space-y-3">
					<div className="inline-flex rounded-full border border-black/10 bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-forest">
						Nodal Scribe
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
							className="rounded-2xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm text-clay"
							role="status"
							aria-live="polite"
						>
							{message}
						</div>
					:	null}

					<button
						type="submit"
						disabled={loading}
						className="inline-flex min-h-14 items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{loading ? "Procesando..." : actionLabel}
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
			</section>
		</main>
	);
}
