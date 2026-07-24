import type { Metadata } from "next";
import { LegalShell, LegalSection } from "@/components/legal-shell";

export const metadata: Metadata = {
	title: "Política de Privacidad · Nodal Scribe",
	description:
		"Política de Privacidad y tratamiento de datos de Nodal Scribe, conforme a la Ley N° 19.628 de Chile.",
};

export default function PrivacidadPage() {
	return (
		<LegalShell
			title="Política de Privacidad"
			intro="En Nodal Scribe tratamos la privacidad de los datos de salud con el máximo rigor. Esta política explica qué información tratamos, cómo la protegemos y cuáles son tus derechos, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y la Ley N° 20.584 sobre Derechos y Deberes del Paciente."
		>
			<LegalSection title="1. Responsable y Encargado del tratamiento">
				<p>
					El <strong className="font-semibold text-ink">médico o centro de salud</strong>{" "}
					que contrata Nodal Scribe es el{" "}
					<strong className="font-semibold text-ink">Responsable</strong> de los
					datos de sus pacientes.{" "}
					<strong className="font-semibold text-ink">Nodal Scribe</strong> actúa
					como <strong className="font-semibold text-ink">Encargado</strong>,
					procesando la información solo para prestar el servicio de
					transcripción y siguiendo las instrucciones del Responsable.
				</p>
			</LegalSection>

			<LegalSection title="2. Qué datos tratamos">
				<ul className="list-disc space-y-2 pl-5">
					<li>
						<strong className="font-semibold text-ink">Datos de cuenta:</strong>{" "}
						correo electrónico, credenciales de acceso y preferencias de
						configuración (especialidad, instrucciones de redacción).
					</li>
					<li>
						<strong className="font-semibold text-ink">
							Contenido clínico (efímero):
						</strong>{" "}
						el audio y el texto de la consulta se procesan únicamente durante la
						solicitud y no se conservan de forma permanente.
					</li>
					<li>
						<strong className="font-semibold text-ink">
							Registros de consentimiento:
						</strong>{" "}
						cuando el centro los proporciona, almacenamos la constancia del
						consentimiento del paciente de forma segura (ver sección 5).
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="3. Tratamiento del contenido clínico">
				<p>
					El audio de la consulta se transcribe y estructura{" "}
					<strong className="font-semibold text-ink">en memoria</strong> y se
					descarta tras generar la nota.{" "}
					<strong className="font-semibold text-ink">
						No almacenamos el audio ni las transcripciones
					</strong>{" "}
					de manera permanente.
				</p>
				<p>
					El contenido clínico{" "}
					<strong className="font-semibold text-ink">
						no se utiliza para entrenar modelos de IA
					</strong>{" "}
					propios ni de terceros. Los borradores de nota se guardan solo en el
					navegador del usuario (almacenamiento local), bajo su exclusivo control.
				</p>
			</LegalSection>

			<LegalSection title="4. Base legal del tratamiento">
				<p>
					El tratamiento de datos personales se realiza sobre la base del{" "}
					<strong className="font-semibold text-ink">
						consentimiento del titular
					</strong>{" "}
					y, respecto de los datos del paciente, del consentimiento expreso e
					informado que el Responsable debe recabar conforme a la ley.
				</p>
			</LegalSection>

			<LegalSection title="5. Consentimientos de pacientes">
				<p>
					Las constancias de consentimiento informado que el centro decida
					incorporar se almacenan en un{" "}
					<strong className="font-semibold text-ink">
						almacenamiento privado y cifrado
					</strong>
					, asociadas al médico o centro responsable.
				</p>
				<p>
					Los archivos se nombran mediante{" "}
					<strong className="font-semibold text-ink">
						identificadores aleatorios (UUID)
					</strong>{" "}
					para ofuscar su contenido frente a accesos externos. El acceso está
					restringido por políticas de seguridad a nivel de filas.
				</p>
			</LegalSection>

			<LegalSection title="6. Medidas de seguridad">
				<ul className="list-disc space-y-2 pl-5">
					<li>
						<strong className="font-semibold text-ink">Cifrado en reposo:</strong>{" "}
						AES-256 sobre bases de datos y almacenamiento.
					</li>
					<li>
						<strong className="font-semibold text-ink">Cifrado en tránsito:</strong>{" "}
						TLS en todas las comunicaciones.
					</li>
					<li>
						<strong className="font-semibold text-ink">
							Control de acceso:
						</strong>{" "}
						autenticación y políticas de seguridad a nivel de filas (RLS) que
						aíslan la información por usuario.
					</li>
					<li>
						<strong className="font-semibold text-ink">
							Procesamiento efímero:
						</strong>{" "}
						la lógica clínica se ejecuta en funciones serverless que liberan la
						memoria al terminar.
					</li>
				</ul>
			</LegalSection>

			<LegalSection title="7. Proveedores y encargados terceros">
				<p>
					Para la transcripción y estructuración utilizamos proveedores de
					inteligencia artificial que procesan el contenido de forma transitoria.
					En producción, priorizamos proveedores con acuerdos de{" "}
					<strong className="font-semibold text-ink">
						retención cero de datos (Zero Data Retention)
					</strong>{" "}
					y, cuando corresponde, acuerdos BAA compatibles con estándares como
					HIPAA.
				</p>
				<p>
					No vendemos ni cedemos datos personales a terceros con fines
					comerciales.
				</p>
			</LegalSection>

			<LegalSection title="8. Derechos del titular">
				<p>
					Conforme a la Ley N° 19.628, el titular de los datos puede ejercer sus
					derechos de{" "}
					<strong className="font-semibold text-ink">
						acceso, rectificación, cancelación y oposición
					</strong>
					. Respecto de los datos del paciente, estos derechos se ejercen ante el
					médico o centro Responsable; Nodal Scribe colaborará con el Responsable
					para atender las solicitudes que correspondan.
				</p>
			</LegalSection>

			<LegalSection title="9. Cookies y almacenamiento local">
				<p>
					Utilizamos cookies técnicas para mantener la sesión autenticada y
					almacenamiento local del navegador para conservar borradores de nota.
					No empleamos cookies publicitarias ni de seguimiento de terceros.
				</p>
			</LegalSection>

			<LegalSection title="10. Plazos de conservación">
				<p>
					El contenido clínico no se conserva (procesamiento efímero). Los datos
					de cuenta se mantienen mientras la cuenta esté activa y se eliminan tras
					su cierre, salvo obligaciones legales de conservación.
				</p>
			</LegalSection>

			<LegalSection title="11. Cambios a esta política">
				<p>
					Podemos actualizar esta política para reflejar cambios en el servicio o
					en la normativa. Publicaremos la versión vigente con su fecha de
					actualización.
				</p>
			</LegalSection>

			<LegalSection title="12. Contacto">
				<p>
					Para ejercer tus derechos o consultar sobre esta política, escríbenos a{" "}
					<a
						href="mailto:privacidad@nodalscribe.cl"
						className="font-medium text-forest underline-offset-4 hover:underline"
					>
						privacidad@nodalscribe.cl
					</a>
					.
				</p>
			</LegalSection>
		</LegalShell>
	);
}
