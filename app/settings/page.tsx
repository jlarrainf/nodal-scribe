import Link from "next/link";
import { redirect } from "next/navigation";
import { getSpecialtyOptions } from "@/lib/ai/specialties";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
	const supabase = await createSupabaseServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?redirectTo=/settings");
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("user_id, specialty_template, custom_instructions")
		.eq("user_id", user.id)
		.maybeSingle();

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">
						Perfil
					</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
						Ajustes avanzados
					</h1>
				</div>
				<Link
					href="/"
					className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:-translate-y-0.5"
				>
					Volver al grabador
				</Link>
			</div>

			<SettingsForm
				initialProfile={{
					specialty_template: profile?.specialty_template ?? "general_soap",
					custom_instructions: profile?.custom_instructions ?? "",
				}}
				specialtyOptions={getSpecialtyOptions()}
			/>
		</main>
	);
}
