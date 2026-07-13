import type { SpecialtyTemplateKey } from "@/lib/ai/specialties";

export type ProfileRow = {
	user_id: string;
	specialty_template: SpecialtyTemplateKey;
	custom_instructions: string;
};
