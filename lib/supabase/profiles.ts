import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseRouteClient } from "./route";
import {
	DEFAULT_SPECIALTY_TEMPLATE,
	SPECIALTIES,
	buildCustomDefinition,
	getSpecialtyDefinition,
	type CustomSpecialtyRecord,
	type SpecialtyDefinition,
} from "@/lib/ai/specialties";

export type UserProfile = {
	user_id: string;
	specialty_template: string;
	custom_instructions: string;
	live_note_focus: string;
};

export async function getAuthenticatedProfile(
	request: NextRequest,
): Promise<{ userId: string; profile: UserProfile }> {
	const supabase = createSupabaseRouteClient(request);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	const { data: profile, error } = await supabase
		.from("profiles")
		.select("user_id, specialty_template, custom_instructions, live_note_focus")
		.eq("user_id", user.id)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return {
		userId: user.id,
		profile: {
			user_id: user.id,
			specialty_template: profile?.specialty_template ?? DEFAULT_SPECIALTY_TEMPLATE,
			custom_instructions: profile?.custom_instructions ?? "",
			live_note_focus: profile?.live_note_focus ?? "",
		},
	};
}

export async function resolveActiveSpecialty(
	supabase: SupabaseClient,
	userId: string,
	templateKey: string,
): Promise<SpecialtyDefinition> {
	if (templateKey in SPECIALTIES) {
		return getSpecialtyDefinition(templateKey);
	}

	const { data } = await supabase
		.from("custom_specialties")
		.select("id, user_id, name, base_template, fields")
		.eq("id", templateKey)
		.eq("user_id", userId)
		.maybeSingle();

	if (!data) {
		return getSpecialtyDefinition(DEFAULT_SPECIALTY_TEMPLATE);
	}

	return buildCustomDefinition(data as CustomSpecialtyRecord);
}
