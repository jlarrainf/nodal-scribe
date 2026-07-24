import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal-shell";

export const metadata: Metadata = {
	title: "Términos y Condiciones · Nodal Scribe",
	description:
		"Términos y Condiciones del servicio de transcripción clínica Nodal Scribe.",
};

export default function TerminosPage() {
	return (
		<LegalShell
			title="Términos y Condiciones"
			intro="Estos Términos y Condiciones regulan el uso de Nodal Scribe, un asistente administrativo de transcripción clínica basado en inteligencia artificial, dirigido a profesionales de la salud en Chile. Al registrarte o utilizar el servicio, aceptas íntegramente estos términos."
		>
			<LegalSection title="1. Identificación del servicio">
				<p>
					Nodal Scribe es una plataforma de software como servicio (SaaS) que
					transcribe y estructura consultas médicas a partir de audio o texto,
					generando notas clínicas editables según la especialidad seleccionada
					(Medicina General, Pediatría, Traumatología, Psiquiatría, entre otras).
				</p>
			</LegalSection>

			<LegalSection title="2. Naturaleza administrativa del servicio">
				<p>
					Nodal Scribe actúa exclusivamente como una{" "}
					<strong className="font-semibold text-ink">
						herramienta administrativa de transcripción
					</strong>
					. No constituye un dispositivo médico, no formula diagnósticos, no
					sugiere tratamientos y no reemplaza el juicio clínico del profesional.
				</p>
				<p>
					Toda nota generada es un borrador que{" "}
					<strong className="font-semibold text-ink">
						debe ser revisado, validado y corregido por el médico
					</strong>{" "}
					antes de incorporarse a la ficha clínica oficial del paciente.
				</p>
			</LegalSection>

			<LegalSection title="3. Roles en el tratamiento de datos">
				<p>
					Para los efectos de la Ley N° 19.628 sobre Protección de la Vida
					Privada y la Ley N° 20.584 sobre Derechos y Deberes del Paciente:
				</p>
				<ul className="list-disc space-y-2 pl-5">
					<li>
						El{" "}
						<strong className="font-semibold text-ink">
							médico o centro de salud (cliente)
						</strong>{" "}
						es el <strong className="font-semibold text-ink">Responsable</strong>{" "}
						del tratamiento de los datos de sus pacientes.
					</li>
					<li>
						<strong className="font-semibold text-ink">Nodal Scribe</strong> actúa
						como{" "}
						<strong className="font-semibold text-ink">
							Encargado del Tratamiento
						</strong>
						, procesando la información únicamente para prestar el servicio de
						transcripción, según las instrucciones del Responsable.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="4. Consentimiento del paciente">
				<p>
					Es{" "}
					<strong className="font-semibold text-ink">
						responsabilidad exclusiva del médico o del centro de salud
					</strong>{" "}
					obtener el consentimiento expreso e informado del paciente antes de
					grabar la consulta, conforme a la legislación vigente.
				</p>
				<p>
					Nodal Scribe exige la confirmación de este consentimiento como paso
					previo e indispensable para habilitar la grabación, pero no sustituye
					la obligación legal del Responsable de recabarlo y documentarlo.
				</p>
			</LegalSection>

			<LegalSection title="5. Procesamiento efímero y cero retención">
				<p>
					El audio de las consultas se procesa de forma{" "}
					<strong className="font-semibold text-ink">efímera</strong>: se
					transcribe y estructura en memoria durante la solicitud y{" "}
					<strong className="font-semibold text-ink">
						no se almacena de manera permanente
					</strong>{" "}
					en nuestros servidores.
				</p>
				<p>
					El contenido clínico no se utiliza para entrenar modelos de
					inteligencia artificial propios ni de terceros. Los borradores de nota
					se guardan únicamente en el navegador del usuario (almacenamiento
					local) y bajo su control.
				</p>
			</LegalSection>

			<LegalSection title="6. Cuenta y seguridad">
				<p>
					El acceso al servicio requiere una cuenta autenticada. El usuario es
					responsable de la confidencialidad de sus credenciales y de toda la
					actividad realizada bajo su cuenta.
				</p>
			</LegalSection>

			<LegalSection title="7. Suscripciones y pagos">
				<p>
					El servicio se ofrece mediante planes de suscripción (por ejemplo,
					Prueba, Pro, Equipo y Enterprise). Las condiciones específicas de
					precio, renovación y cancelación se informan en la página de planes y
					en el proceso de contratación.
				</p>
				<p>
					Las suscripciones se renuevan automáticamente salvo cancelación previa
					por parte del usuario, quien puede gestionar su suscripción en
					cualquier momento.
				</p>
			</LegalSection>

			<LegalSection title="8. Uso aceptable y prohibiciones">
				<p>El usuario se compromete a no:</p>
				<ul className="list-disc space-y-2 pl-5">
					<li>
						Utilizar el servicio sin el consentimiento del paciente cuando
						corresponda.
					</li>
					<li>
						Emplear la plataforma para fines distintos de la transcripción
						administrativa de consultas.
					</li>
					<li>
						Intentar vulnerar las medidas de seguridad, acceder a datos de
						terceros o eludir las restricciones de acceso.
					</li>
					<li>
						Reproducir, revender o distribuir el servicio sin autorización.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="9. Propiedad intelectual">
				<p>
					El software, la marca y los contenidos de Nodal Scribe son de
					propiedad de sus titulares. El usuario adquiere únicamente una
					licencia de uso limitada, no exclusiva e intransferible mientras
					mantenga una suscripción vigente.
				</p>
				<p>
					El contenido clínico generado pertenece al médico o centro responsable;
					Nodal Scribe no reclama derechos sobre él.
				</p>
			</LegalSection>

			<LegalSection title="10. Limitación de responsabilidad">
				<p>
					Nodal Scribe se proporciona «tal cual». En la máxima medida permitida
					por la ley, no responde por daños indirectos ni por decisiones clínicas
					adoptadas a partir de borradores no validados por el profesional.
				</p>
				<p>
					La responsabilidad total acumulada de Nodal Scribe se limita, en todo
					caso, al monto pagado por el usuario por el servicio durante los últimos
					doce meses.
				</p>
			</LegalSection>

			<LegalSection title="11. Terminación">
				<p>
					El usuario puede cancelar su suscripción en cualquier momento. Nodal
					Scribe podrá suspender o terminar el acceso ante incumplimientos
					graves de estos términos.
				</p>
			</LegalSection>

			<LegalSection title="12. Ley aplicable y jurisdicción">
				<p>
					Estos términos se rigen por las leyes de la República de Chile.
					Cualquier controversia será sometida a los tribunales competentes de la
					ciudad de Santiago, sin perjuicio de las normas de protección al
					consumidor que correspondan.
				</p>
			</LegalSection>

			<LegalSection title="13. Contacto">
				<p>
					Para consultas sobre estos términos, escríbenos a{" "}
					<a
						href="mailto:legal@nodalscribe.cl"
						className="font-medium text-forest underline-offset-4 hover:underline"
					>
						legal@nodalscribe.cl
					</a>
					.
				</p>
			</LegalSection>
		</LegalShell>
	);
}
