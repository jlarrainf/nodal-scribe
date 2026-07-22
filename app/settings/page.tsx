import Link from "next/link";
import { redirect } from "next/navigation";
import { getSpecialtyOptions } from "@/lib/ai/specialties";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
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
		.select("user_id, specialty_template, custom_instructions, live_note_focus")
		.eq("user_id", user.id)
		.maybeSingle();

	const { data: customTemplates } = await supabase
		.from("custom_specialties")
		.select("id, name, base_template, fields")
		.eq("user_id", user.id)
		.order("created_at", { ascending: true });

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader showSettings={false} />

		<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<span className="h-px w-5 bg-forest/50" />
						<p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-forest">
							Perfil
						</p>
					</div>
					<h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">
						Ajustes
					</h1>
				</div>
				<Link
					href="/app"
					className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-ink transition hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"
				>
					Volver al grabador
				</Link>
			</div>

			<SettingsForm
				initialProfile={{
					specialty_template: profile?.specialty_template ?? "general_soap",
					custom_instructions: profile?.custom_instructions ?? "",
					live_note_focus: profile?.live_note_focus ?? "",
				}}
				specialtyOptions={getSpecialtyOptions()}
				customTemplates={customTemplates ?? []}
				userEmail={user.email ?? undefined}
			/>
		</main>

			<AppFooter />
		</div>
	);
}
