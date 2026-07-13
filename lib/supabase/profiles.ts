import type { NextRequest } from "next/server";
import { createSupabaseRouteClient } from "./route";
import {
	DEFAULT_SPECIALTY_TEMPLATE,
	type SpecialtyTemplateKey,
} from "@/lib/ai/specialties";

export type UserProfile = {
	user_id: string;
	specialty_template: SpecialtyTemplateKey;
	custom_instructions: string;
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
		.select("user_id, specialty_template, custom_instructions")
		.eq("user_id", user.id)
		.maybeSingle();

	if (error) {
		throw new Error(error.message);
	}

	return {
		userId: user.id,
		profile: {
			user_id: user.id,
			specialty_template: (profile?.specialty_template ??
				DEFAULT_SPECIALTY_TEMPLATE) as SpecialtyTemplateKey,
			custom_instructions: profile?.custom_instructions ?? "",
		},
	};
}
