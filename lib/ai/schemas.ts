import { z } from "zod";
import type { SpecialtyField } from "@/lib/ai/specialties";

const soapSectionSchema = z.object({
	subjective: z.array(z.string()),
	objective: z.array(z.string()),
	analysis: z.array(z.string()),
	plan: z.array(z.string()),
});

const mseSchema = z.object({
	apariencia_y_comportamiento: z.string(),
	lenguaje: z.string(),
	animo_subjetivo: z.string(),
	afecto_observado: z.string(),
	pensamiento_curso_y_contenido: z.string(),
	percepcion: z.string(),
	cognicion_y_sensorio: z.string(),
	insight_y_juicio: z.string(),
});

const riesgoSchema = z.object({
	ideacion_suicida_activa: z.boolean().nullable(),
	ideacion_homicida: z.boolean().nullable(),
	detalles_riesgo: z.string(),
});

const planTratamientoSchema = z.object({
	psicofarmacologia: z.array(z.string()),
	intervenciones_psicosociales: z.string(),
});

const psychiatryNoteSchema = z.object({
	motivo_consulta: z.string(),
	enfermedad_actual_anamnesis: z.string(),
	antecedentes_salud_mental: z.string(),
	examen_estado_mental: mseSchema,
	evaluacion_de_riesgo: riesgoSchema,
	instrumentos_y_escalas: z.array(z.string()),
	hipotesis_diagnostica: z.string(),
	plan_de_tratamiento: planTratamientoSchema,
});

const traumaExamSchema = z.object({
	topografia_lateralidad: z.string(),
	inspeccion_y_palpacion: z.string(),
	rangos_de_movilidad_rom: z.string(),
	pruebas_especiales_ortopedicas: z.string(),
	estado_neurovascular_distal: z.string(),
});

const traumaPlanSchema = z.object({
	intervenciones_y_procedimientos: z.string(),
	farmacoterapia: z.string(),
	rehabilitacion_y_reposo: z.string(),
});

export const psychiatryClinicalNoteSchema = psychiatryNoteSchema;

export const traumatologyClinicalNoteSchema = z.object({
	motivo_de_consulta_traumatologico: z.string(),
	mecanismo_lesion_y_cinematica: z.string(),
	antecedentes_quirurgicos_y_ortopedicos: z.string(),
	examen_fisico_biomecanico: traumaExamSchema,
	evaluacion_imagenologica: z.string(),
	diagnostico_anatomoclinico: z.string(),
	plan_terapeutico_ortopedico: traumaPlanSchema,
});

export const clinicalNoteSchema = z.object({
	soap: soapSectionSchema,
});

export type ClinicalNoteDocument = Record<string, unknown>;

const pediatricsGrowthSchema = z.object({
	medidas_absolutas: z.string(),
	percentiles_y_curvas: z.string(),
});

const pediatricsDSMschema = z.object({
	motor_grueso_y_fino: z.string(),
	lenguaje_y_socioemocional: z.string(),
	pautas_estandarizadas: z.string(),
});

export const pediatricsClinicalNoteSchema = z.object({
	tipo_de_atencion: z.string(),
	motivo_o_preocupaciones_parentales: z.string(),
	antecedentes_perinatales_e_inmunizaciones: z.string(),
	habitos_nutricionales_y_sueno: z.string(),
	antropometria_y_crecimiento: pediatricsGrowthSchema,
	evaluacion_desarrollo_psicomotor_dsm: pediatricsDSMschema,
	examen_fisico_sistemico: z.string(),
	diagnosticos_y_conclusiones: z.array(z.string()),
	plan_integral_y_educacion: z.string(),
});

export const specialtyNoteSchemas = {
	general_soap: clinicalNoteSchema,
	psychiatry_narrative: psychiatryClinicalNoteSchema,
	traumatology_orthopedics: traumatologyClinicalNoteSchema,
	triage_rapid: clinicalNoteSchema,
	pediatrics: pediatricsClinicalNoteSchema,
} as const;

export type ClinicalNote = z.infer<typeof clinicalNoteSchema>;
export type PsychiatryClinicalNote = z.infer<
	typeof psychiatryClinicalNoteSchema
>;
export type TraumatologyClinicalNote = z.infer<
	typeof traumatologyClinicalNoteSchema
>;

function sanitizeRawResponse(
	data: Record<string, unknown>,
): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(data)) {
		if (value === null) {
			result[key] = "";
		} else if (Array.isArray(value)) {
			result[key] = value.filter((v) => v !== null);
		} else if (typeof value === "object") {
			result[key] = sanitizeRawResponse(value as Record<string, unknown>);
		} else {
			result[key] = value;
		}
	}
	return result;
}

export function getClinicalNoteSchemaForSpecialty(template?: string | null) {
	if (template === "psychiatry_narrative") {
		return psychiatryClinicalNoteSchema;
	}

	if (template === "traumatology_orthopedics") {
		return traumatologyClinicalNoteSchema;
	}

	if (template === "pediatrics") {
		return pediatricsClinicalNoteSchema;
	}

	return clinicalNoteSchema;
}

export function validateAndSanitize(
	template: string | null | undefined,
	data: Record<string, unknown>,
): Record<string, unknown> {
	const schema = getClinicalNoteSchemaForSpecialty(template);
	const sanitized = sanitizeRawResponse(data);
	const parsed = schema.safeParse(sanitized);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.map((i) => `${i.path.join(".")}: ${i.message}`)
			.join("; ");
		throw new Error(
			`La respuesta del modelo no cumplió el esquema JSON esperado (${issues})`,
		);
	}
	return parsed.data as Record<string, unknown>;
}

function fieldToZod(field: SpecialtyField): z.ZodTypeAny {
	if (field.kind === "group") {
		const children = field.children ?? [];
		return z.object(
			Object.fromEntries(children.map((child) => [child.key, fieldToZod(child)])),
		);
	}

	if (field.kind === "list") {
		return z.array(z.string());
	}

	return z.string();
}

export function buildZodSchemaFromFields(
	fields: ReadonlyArray<SpecialtyField>,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
	return z.object(
		Object.fromEntries(fields.map((field) => [field.key, fieldToZod(field)])),
	);
}

export function validateCustomNote(
	fields: ReadonlyArray<SpecialtyField>,
	data: Record<string, unknown>,
): Record<string, unknown> {
	const schema = buildZodSchemaFromFields(fields);
	const sanitized = sanitizeRawResponse(data);
	const parsed = schema.safeParse(sanitized);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.map((i) => `${i.path.join(".")}: ${i.message}`)
			.join("; ");
		throw new Error(
			`La respuesta del modelo no cumplió la plantilla personalizada (${issues})`,
		);
	}
	return parsed.data as Record<string, unknown>;
}

export const clinicalNoteJsonSchema = {
	name: "clinical_note",
	strict: true,
	schema: {
		type: "object",
		additionalProperties: false,
		required: ["soap"],
		properties: {
			soap: {
				type: "object",
				additionalProperties: false,
				required: ["subjective", "objective", "analysis", "plan"],
				properties: {
					subjective: { type: "array", items: { type: "string" } },
					objective: { type: "array", items: { type: "string" } },
					analysis: { type: "array", items: { type: "string" } },
					plan: { type: "array", items: { type: "string" } },
				},
			},
		},
	},
} as const;
