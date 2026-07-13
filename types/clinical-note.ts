export type SoapSection = {
	subjective: string[];
	objective: string[];
	analysis: string[];
	plan: string[];
};

export type ClinicalNote = {
	soap: SoapSection;
};
