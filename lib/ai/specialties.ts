type JsonSchemaObject = {
	name: string;
	strict: true;
	schema: Record<string, unknown>;
};

export type FieldKind = "text" | "list" | "group";

export type SpecialtyField = {
	key: string;
	label: string;
	kind: FieldKind;
	placeholder?: string;
	description?: string;
	children?: ReadonlyArray<SpecialtyField>;
};

export type SpecialtyDefinition = {
	label: string;
	description: string;
	systemInstructions: string;
	jsonSchema: JsonSchemaObject;
	fields: SpecialtyField[];
};

const SOAP_SCHEMA: JsonSchemaObject = {
	name: "clinical_note_soap",
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
};

const PSYCHIATRY_SCHEMA: JsonSchemaObject = {
	name: "clinical_note_psychiatry",
	strict: true,
	schema: {
		type: "object",
		additionalProperties: false,
		required: [
			"motivo_consulta",
			"enfermedad_actual_anamnesis",
			"antecedentes_salud_mental",
			"examen_estado_mental",
			"evaluacion_de_riesgo",
			"instrumentos_y_escalas",
			"hipotesis_diagnostica",
			"plan_de_tratamiento",
		],
		properties: {
			motivo_consulta: { type: "string" },
			enfermedad_actual_anamnesis: { type: "string" },
			antecedentes_salud_mental: { type: "string" },
			examen_estado_mental: {
				type: "object",
				additionalProperties: false,
				required: [
					"apariencia_y_comportamiento",
					"lenguaje",
					"animo_subjetivo",
					"afecto_observado",
					"pensamiento_curso_y_contenido",
					"percepcion",
					"cognicion_y_sensorio",
					"insight_y_juicio",
				],
				properties: {
					apariencia_y_comportamiento: { type: "string" },
					lenguaje: { type: "string" },
					animo_subjetivo: { type: "string" },
					afecto_observado: { type: "string" },
					pensamiento_curso_y_contenido: { type: "string" },
					percepcion: { type: "string" },
					cognicion_y_sensorio: { type: "string" },
					insight_y_juicio: { type: "string" },
				},
			},
			evaluacion_de_riesgo: {
				type: "object",
				additionalProperties: false,
				required: ["ideacion_suicida_activa", "ideacion_homicida", "detalles_riesgo"],
				properties: {
					ideacion_suicida_activa: {
						type: ["boolean", "null"],
					},
					ideacion_homicida: {
						type: ["boolean", "null"],
					},
					detalles_riesgo: { type: "string" },
				},
			},
			instrumentos_y_escalas: {
				type: "array",
				items: { type: "string" },
			},
			hipotesis_diagnostica: { type: "string" },
			plan_de_tratamiento: {
				type: "object",
				additionalProperties: false,
				required: ["psicofarmacologia", "intervenciones_psicosociales"],
				properties: {
					psicofarmacologia: {
						type: "array",
						items: { type: "string" },
					},
					intervenciones_psicosociales: { type: "string" },
				},
			},
		},
	},
};

const TRAUMA_SCHEMA: JsonSchemaObject = {
	name: "clinical_note_traumatology",
	strict: true,
	schema: {
		type: "object",
		additionalProperties: false,
		required: [
			"motivo_de_consulta_traumatologico",
			"mecanismo_lesion_y_cinematica",
			"antecedentes_quirurgicos_y_ortopedicos",
			"examen_fisico_biomecanico",
			"evaluacion_imagenologica",
			"diagnostico_anatomoclinico",
			"plan_terapeutico_ortopedico",
		],
		properties: {
			motivo_de_consulta_traumatologico: { type: "string" },
			mecanismo_lesion_y_cinematica: { type: "string" },
			antecedentes_quirurgicos_y_ortopedicos: { type: "string" },
			examen_fisico_biomecanico: {
				type: "object",
				additionalProperties: false,
				required: [
					"topografia_lateralidad",
					"inspeccion_y_palpacion",
					"rangos_de_movilidad_rom",
					"pruebas_especiales_ortopedicas",
					"estado_neurovascular_distal",
				],
				properties: {
					topografia_lateralidad: { type: "string" },
					inspeccion_y_palpacion: { type: "string" },
					rangos_de_movilidad_rom: { type: "string" },
					pruebas_especiales_ortopedicas: { type: "string" },
					estado_neurovascular_distal: { type: "string" },
				},
			},
			evaluacion_imagenologica: { type: "string" },
			diagnostico_anatomoclinico: { type: "string" },
			plan_terapeutico_ortopedico: {
				type: "object",
				additionalProperties: false,
				required: [
					"intervenciones_y_procedimientos",
					"farmacoterapia",
					"rehabilitacion_y_reposo",
				],
				properties: {
					intervenciones_y_procedimientos: { type: "string" },
					farmacoterapia: { type: "string" },
					rehabilitacion_y_reposo: { type: "string" },
				},
			},
		},
	},
};

const PEDIATRICS_SCHEMA: JsonSchemaObject = {
	name: "clinical_note_pediatrics",
	strict: true,
	schema: {
		type: "object",
		additionalProperties: false,
		required: [
			"tipo_de_atencion",
			"motivo_o_preocupaciones_parentales",
			"antecedentes_perinatales_e_inmunizaciones",
			"habitos_nutricionales_y_sueno",
			"antropometria_y_crecimiento",
			"evaluacion_desarrollo_psicomotor_dsm",
			"examen_fisico_sistemico",
			"diagnosticos_y_conclusiones",
			"plan_integral_y_educacion",
		],
		properties: {
			tipo_de_atencion: { type: "string" },
			motivo_o_preocupaciones_parentales: { type: "string" },
			antecedentes_perinatales_e_inmunizaciones: { type: "string" },
			habitos_nutricionales_y_sueno: { type: "string" },
			antropometria_y_crecimiento: {
				type: "object",
				additionalProperties: false,
				required: ["medidas_absolutas", "percentiles_y_curvas"],
				properties: {
					medidas_absolutas: { type: "string" },
					percentiles_y_curvas: { type: "string" },
				},
			},
			evaluacion_desarrollo_psicomotor_dsm: {
				type: "object",
				additionalProperties: false,
				required: [
					"motor_grueso_y_fino",
					"lenguaje_y_socioemocional",
					"pautas_estandarizadas",
				],
				properties: {
					motor_grueso_y_fino: { type: "string" },
					lenguaje_y_socioemocional: { type: "string" },
					pautas_estandarizadas: { type: "string" },
				},
			},
			examen_fisico_sistemico: { type: "string" },
			diagnosticos_y_conclusiones: { type: "array", items: { type: "string" } },
			plan_integral_y_educacion: { type: "string" },
		},
	},
};

export const DEFAULT_SPECIALTY_TEMPLATE = "general_soap" as const;

export const SPECIALTIES = {
	general_soap: {
		label: "Medicina General (SOAP)",
		description: "Estructura clásica SOAP para consultas generales.",
		systemInstructions:
			"Estructura la salida en SOAP clásico con secciones Subjective, Objective, Analysis y Plan. Mantén redacción clínica breve, fiel al audio y sin inventar datos.",
		jsonSchema: SOAP_SCHEMA,
		fields: [
			{
				key: "soap",
				label: "SOAP",
				kind: "group",
				children: [
					{
						key: "subjective",
						label: "Subjetivo",
						kind: "list",
						placeholder: "Motivo de consulta, síntomas, relato del paciente.",
					},
					{
						key: "objective",
						label: "Objetivo",
						kind: "list",
						placeholder: "Hallazgos observables o datos explícitos.",
					},
					{
						key: "analysis",
						label: "Análisis",
						kind: "list",
						placeholder: "Síntesis administrativa sin diagnósticos inventados.",
					},
					{
						key: "plan",
						label: "Plan",
						kind: "list",
						placeholder:
							"Indicaciones verbales o pasos acordados explícitamente.",
					},
				],
			},
		],
	},
	psychiatry_narrative: {
		label: "Psiquiatría y Salud Mental",
		description:
			"Estructura fenomenológica completa para salud mental con MSE, evaluación de riesgo, escalas y plan de rehabilitación psicosocial.",
		systemInstructions: [
			'Eres "Nodal Scribe", un Informático Médico y Arquitecto de Datos Clínicos avanzado, especializado en la transcripción y estructuración de historias clínicas psiquiátricas y psicológicas según normativas del MINSAL de Chile. Tu tarea es procesar la transcripción de una consulta de salud mental y poblar estrictamente un esquema JSON predefinido.',
			"REGLA DE ORO DE ARQUITECTURA: CERO INVENCIÓN. Debes comportarte como un secretario estricto. Jamás deduzcas patologías, síntomas fenomenológicos o alteraciones al examen mental que no fueron verbalizados por el médico, el paciente o sus cuidadores. Si un campo fenomenológico (como el riesgo suicida o alucinaciones) no es explorado o dictado durante la transcripción, asigna el valor null para booleanos o la cadena \"No explorado en la sesión\" para textos. No asumas normalidad clínica si no hay verbalización de dicha normalidad.",
			"Instrucciones de Mapeo Semántico:",
			'1. "enfermedad_actual_anamnesis": Sintetiza cronológicamente el malestar psicológico, los estresores vitales y la disfuncionalidad reportada en la cotidianidad.',
			'2. "examen_estado_mental" (MSE): Ejecuta una disección ontológica profunda. Es imperativo que diferencies "animo_subjetivo" (cómo el paciente dice que se siente) de "afecto_observado" (cómo el clínico describe la expresión facial y emocional del paciente). En "pensamiento_curso_y_contenido", agrupa la velocidad y organización lógica del discurso separadamente de la temática (delirios, rumiaciones, ideas obsesivas). Si el clínico realiza pruebas cognitivas de cálculo o memoria (ej. repetición de palabras, serie de sietes), regístralo en "cognicion_y_sensorio".',
			'3. "evaluacion_de_riesgo": Extrae cualquier mención a ideación suicida o agresividad. Si el paciente niega explícitamente tener pensamientos de muerte, debes registrar "false" en "ideacion_suicida_activa" y documentar la negación en "detalles_riesgo".',
			'4. "instrumentos_y_escalas": Extrae cualquier resultado numérico de cuestionarios mencionados, tales como el Mini-Mental (MEC), PHQ-9, GAD-7, o ASQ:SE.',
			'5. "plan_de_tratamiento": Separa la indicación de medicamentos psicotrópicos de las estrategias de contención ambiental, derivaciones a la red del Servicio de Salud (ej. COSAM, APS) o indicaciones de psicoterapia.',
			"Genera de manera exclusiva la estructura JSON solicitada. No incluyas preámbulos, despedidas, notas metodológicas, ni bloques de razonamiento fuera del objeto JSON.",
		].join(" "),
		jsonSchema: PSYCHIATRY_SCHEMA,
		fields: [
			{
				key: "motivo_consulta",
				label: "Motivo de consulta",
				kind: "text",
				placeholder: "Relato subjetivo del paciente en sus propias palabras.",
			},
			{
				key: "enfermedad_actual_anamnesis",
				label: "Enfermedad actual y anamnesis",
				kind: "text",
				placeholder: "Sintomatología, estresores psicosociales y red de apoyo.",
			},
			{
				key: "antecedentes_salud_mental",
				label: "Antecedentes de salud mental",
				kind: "text",
				placeholder: "Hospitalizaciones previas, tratamientos farmacológicos, historia familiar.",
			},
			{
				key: "examen_estado_mental",
				label: "Examen del Estado Mental (MSE)",
				kind: "group",
				children: [
					{
						key: "apariencia_y_comportamiento",
						label: "Apariencia y comportamiento",
						kind: "text",
						placeholder: "Autocuidado, higiene, contacto visual, actitud, psicomotricidad.",
					},
					{
						key: "lenguaje",
						label: "Lenguaje",
						kind: "text",
						placeholder: "Velocidad (taquilalia, bradilalia), tono, volumen, fluidez.",
					},
					{
						key: "animo_subjetivo",
						label: "Ánimo subjetivo",
						kind: "text",
						placeholder: "Emoción reportada por el paciente en sus propias palabras.",
					},
					{
						key: "afecto_observado",
						label: "Afecto observado",
						kind: "text",
						placeholder: "Rango (plano, embotado, lábil) y congruencia con el ánimo.",
					},
					{
						key: "pensamiento_curso_y_contenido",
						label: "Pensamiento (curso y contenido)",
						kind: "text",
						placeholder: "Tangencial, circunstancial, fuga de ideas, delirios, obsesiones.",
					},
					{
						key: "percepcion",
						label: "Percepción",
						kind: "text",
						placeholder: "Alucinaciones auditivas, visuales, táctiles; ilusiones.",
					},
					{
						key: "cognicion_y_sensorio",
						label: "Cognición y sensorio",
						kind: "text",
						placeholder: "Conciencia, atención, memoria, MMSE/MEC, serie de 7.",
					},
					{
						key: "insight_y_juicio",
						label: "Insight y juicio",
						kind: "text",
						placeholder: "Conciencia de enfermedad y capacidad de toma de decisiones.",
					},
				],
			},
			{
				key: "evaluacion_de_riesgo",
				label: "Evaluación de riesgo",
				kind: "group",
				children: [
					{
						key: "ideacion_suicida_activa",
						label: "Ideación suicida activa",
						kind: "text",
						placeholder: "Verdadero, Falso o No explorado.",
					},
					{
						key: "ideacion_homicida",
						label: "Ideación homicida",
						kind: "text",
						placeholder: "Verdadero, Falso o No explorado.",
					},
					{
						key: "detalles_riesgo",
						label: "Detalles del riesgo",
						kind: "text",
						placeholder: "Intencionalidad, planificación, métodos, conductas autolesivas.",
					},
				],
			},
			{
				key: "instrumentos_y_escalas",
				label: "Instrumentos y escalas",
				kind: "list",
				placeholder: "PHQ-9, GAD-7, MEC/MMSE, DASS-21, ASQ:SE.",
			},
			{
				key: "hipotesis_diagnostica",
				label: "Hipótesis diagnóstica",
				kind: "text",
				placeholder: "Impresión clínica alineada a CIE-11 o DSM-5.",
			},
			{
				key: "plan_de_tratamiento",
				label: "Plan de tratamiento",
				kind: "group",
				children: [
					{
						key: "psicofarmacologia",
						label: "Psicofarmacología",
						kind: "list",
						placeholder: "Nuevas prescripciones, ajustes de titulación, suspensiones.",
					},
					{
						key: "intervenciones_psicosociales",
						label: "Intervenciones psicosociales",
						kind: "text",
						placeholder: "Derivaciones COSAM, rehabilitación, terapia ocupacional, psicoeducación.",
					},
				],
			},
		],
	},
	traumatology_orthopedics: {
		label: "Traumatología y Ortopedia",
		description:
			"Ficha anatómica y biomecánica con lateralidad, ROM y neurovascular.",
		systemInstructions:
			"Eres Nodal Scribe para Traumatología y Ortopedia. Procesa la consulta con cero invención y prioriza lateralidad, topografía, cinemática del trauma, examen biomecánico, estudios imagenológicos y plan ortopédico. Si la lateralidad no se dice explícitamente, registra 'Lateralidad no especificada explícitamente'.",
		jsonSchema: TRAUMA_SCHEMA,
		fields: [
			{
				key: "motivo_de_consulta_traumatologico",
				label: "Motivo de consulta traumatológico",
				kind: "text",
				placeholder:
					"Dolor, impotencia funcional, deformidad o trauma consultado.",
			},
			{
				key: "mecanismo_lesion_y_cinematica",
				label: "Mecanismo de lesión y cinemática",
				kind: "text",
				placeholder: "Caída, impacto, torsión, contexto laboral o deportivo.",
			},
			{
				key: "antecedentes_quirurgicos_y_ortopedicos",
				label: "Antecedentes quirúrgicos y ortopédicos",
				kind: "text",
				placeholder:
					"Cirugías previas, osteosíntesis, prótesis o inmovilizaciones previas.",
			},
			{
				key: "examen_fisico_biomecanico",
				label: "Examen físico biomecánico",
				kind: "group",
				children: [
					{
						key: "topografia_lateralidad",
						label: "Topografía y lateralidad",
						kind: "text",
						placeholder: "Segmento anatómico exacto y lado afectado.",
					},
					{
						key: "inspeccion_y_palpacion",
						label: "Inspección y palpación",
						kind: "text",
						placeholder: "Equimosis, edema, crepitación, dolor a la palpación.",
					},
					{
						key: "rangos_de_movilidad_rom",
						label: "Rangos de movilidad ROM",
						kind: "text",
						placeholder: "Movilidad activa y pasiva, grados y bloqueos.",
					},
					{
						key: "pruebas_especiales_ortopedicas",
						label: "Pruebas especiales ortopédicas",
						kind: "text",
						placeholder: "Lachman, McMurray, Neer, Phalen, etc.",
					},
					{
						key: "estado_neurovascular_distal",
						label: "Estado neurovascular distal",
						kind: "text",
						placeholder:
							"Pulsos, sensibilidad, fuerza, llenado capilar, perfusión.",
					},
				],
			},
			{
				key: "evaluacion_imagenologica",
				label: "Evaluación imagenológica",
				kind: "text",
				placeholder: "Hallazgos de radiografía, TAC, RM, ecografía, etc.",
			},
			{
				key: "diagnostico_anatomoclinico",
				label: "Diagnóstico anatomoclínico",
				kind: "text",
				placeholder: "Conclusión estructural clínica.",
			},
			{
				key: "plan_terapeutico_ortopedico",
				label: "Plan terapéutico ortopédico",
				kind: "group",
				children: [
					{
						key: "intervenciones_y_procedimientos",
						label: "Intervenciones y procedimientos",
						kind: "text",
						placeholder: "Yeso, férula, infiltración, pabellón, curación, etc.",
					},
					{
						key: "farmacoterapia",
						label: "Farmacoterapia",
						kind: "text",
						placeholder: "AINEs, analgésicos, relajantes, profilaxis, etc.",
					},
					{
						key: "rehabilitacion_y_reposo",
						label: "Rehabilitación y reposo",
						kind: "text",
						placeholder:
							"Kinesiología, terapia ocupacional, licencias, reposo.",
					},
				],
			},
		],
	},
	pediatrics: {
		label: "Pediatría (Control Infantil y Morbilidad)",
		description:
			"Formato clínico pediátrico con énfasis en prevención, desarrollo y nutrición.",
		systemInstructions:
			"Eres Nodal Scribe para Pediatría. Captura la transcripción siguiendo la Norma Técnica de Chile Crece Contigo. Registra tipo de atención, antecedentes perinatales, inmunizaciones, hábitos nutricionales, antropometría con percentiles, desarrollo psicomotor (DSM), examen físico, diagnósticos y plan integral. Cero invención: si un dato no se menciona, deja 'No documentado en el audio'.",
		jsonSchema: PEDIATRICS_SCHEMA,
		fields: [
			{ key: "tipo_de_atencion", label: "Tipo de atención", kind: "text" },
			{
				key: "motivo_o_preocupaciones_parentales",
				label: "Motivo o preocupaciones parentales",
				kind: "text",
			},
			{
				key: "antecedentes_perinatales_e_inmunizaciones",
				label: "Antecedentes perinatales e inmunizaciones",
				kind: "text",
			},
			{
				key: "habitos_nutricionales_y_sueno",
				label: "Hábitos nutricionales y sueño",
				kind: "text",
			},
			{
				key: "antropometria_y_crecimiento",
				label: "Antropometría y crecimiento",
				kind: "group",
				children: [
					{
						key: "medidas_absolutas",
						label: "Medidas absolutas",
						kind: "text",
					},
					{
						key: "percentiles_y_curvas",
						label: "Percentiles y curvas",
						kind: "text",
					},
				],
			},
			{
				key: "evaluacion_desarrollo_psicomotor_dsm",
				label: "Evaluación desarrollo psicomotor (DSM)",
				kind: "group",
				children: [
					{
						key: "motor_grueso_y_fino",
						label: "Motor grueso y fino",
						kind: "text",
					},
					{
						key: "lenguaje_y_socioemocional",
						label: "Lenguaje y socioemocional",
						kind: "text",
					},
					{
						key: "pautas_estandarizadas",
						label: "Pautas estandarizadas",
						kind: "text",
					},
				],
			},
			{
				key: "examen_fisico_sistemico",
				label: "Examen físico sistémico",
				kind: "text",
			},
			{
				key: "diagnosticos_y_conclusiones",
				label: "Diagnósticos y conclusiones",
				kind: "list",
			},
			{
				key: "plan_integral_y_educacion",
				label: "Plan integral y educación",
				kind: "text",
			},
		],
	},

	triage_rapid: {
		label: "Triage Rápido",
		description: "Resumen operativo breve para flujos de triaje o urgencia.",
		systemInstructions:
			"Redacta una nota breve, prioriza síntomas principales, signos observables, evaluación operativa y siguiente acción. No agregues información no mencionada.",
		jsonSchema: SOAP_SCHEMA,
		fields: [
			{
				key: "soap",
				label: "SOAP rápido",
				kind: "group",
				children: [
					{
						key: "subjective",
						label: "Subjetivo",
						kind: "list",
						placeholder: "Síntomas y motivo de urgencia.",
					},
					{
						key: "objective",
						label: "Objetivo",
						kind: "list",
						placeholder: "Signos observados y datos medibles.",
					},
					{
						key: "analysis",
						label: "Análisis",
						kind: "list",
						placeholder: "Síntesis operativa breve.",
					},
					{
						key: "plan",
						label: "Plan",
						kind: "list",
						placeholder: "Conducta inmediata o derivación.",
					},
				],
			},
		],
	},
} as const;

export type SpecialtyTemplateKey = keyof typeof SPECIALTIES;

export function getSpecialtyDefinition(template?: string | null) {
	if (template && template in SPECIALTIES) {
		return SPECIALTIES[template as SpecialtyTemplateKey];
	}

	return SPECIALTIES[DEFAULT_SPECIALTY_TEMPLATE];
}

export function getSpecialtyOptions() {
	return Object.entries(SPECIALTIES).map(([key, specialty]) => ({
		value: key,
		label: specialty.label,
		description: specialty.description,
	}));
}
