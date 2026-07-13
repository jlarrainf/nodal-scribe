# Documento de Cumplimiento Legal y Estrategia B2G: Nodal Scribe
**Proyecto:** Nodal Scribe  
**Región:** Chile  

Este documento detalla el marco regulatorio que rige la privacidad de datos de salud en Chile y la estrategia operativa para introducir Nodal Scribe como proveedor en las redes de salud públicas y privadas.

---

## 1. Marco Legal de Privacidad y Datos Sensibles (Chile)

El tratamiento de datos de salud es el nivel de riesgo legal más alto en la legislación chilena. Para operar, Nodal Scribe debe cumplir con la intersección de dos leyes fundamentales:

### A. Ley 19.628 (Protección de la Vida Privada)
Define los datos de salud como **Datos Sensibles**.
* **El Consentimiento:** No se pueden procesar datos sensibles sin el consentimiento explícito del titular.
* **Aplicación en Nodal Scribe:** El médico deberá solicitar autorización verbal al paciente antes de iniciar la grabación. A nivel de software, el médico deberá marcar un "Checkbox de Consentimiento" en la interfaz confirmando que el paciente aceptó, antes de habilitar el micrófono.

### B. Ley 20.584 (Derechos y Deberes del Paciente)
Regula estrictamente la reserva de la información contenida en la ficha clínica.
* **Confidencialidad:** Quienes no estén directamente vinculados a la atención del paciente no pueden acceder a la información. 
* **Aplicación en Nodal Scribe:** Refuerza la arquitectura de **Zero Data Retention**. Al asegurar que el audio se procesa en memoria volátil (RAM) y no existe intervención humana por parte de los desarrolladores del software para leer las transcripciones, se garantiza el cumplimiento del secreto profesional.

---

## 2. Normativa Regulatoria Médica (MINSAL / ISP)

### Clasificación del Software (SaMD)
El Instituto de Salud Pública (ISP) regula los dispositivos médicos, incluyendo el *Software as a Medical Device (SaMD)*.
* **El riesgo:** Si la IA "sugiere tratamientos" o "diagnostica", el ISP exigirá ensayos clínicos y certificaciones complejas.
* **La estrategia (Transcriptor Administrativo):** En los Términos y Condiciones, contratos comerciales y en el *System Prompt* de Nodal Scribe, queda estipulado legalmente que el software es una **"Herramienta Administrativa de Transcripción"**. La responsabilidad final del diagnóstico recae única y exclusivamente en el médico. Esto exime a Nodal Scribe de regulación compleja.

---

## 3. Estándares de Seguridad para la Venta (Confianza B2B)

Las clínicas privadas y hospitales públicos en Chile exigen certificaciones internacionales en sus licitaciones.

| Estándar / Certificación | Qué es y por qué lo necesitas |
| :--- | :--- |
| **HIPAA Compliance** | Estándar global de privacidad médica. Exige cifrado en tránsito (TLS 1.3), en reposo (AES-256) y trazabilidad. Nodal Scribe lo obtiene heredado al usar Azure OpenAI y firmar el BAA. |
| **ISO 27001** | Norma de gestión de seguridad de la información. Cumplida a través de la infraestructura subyacente de AWS/Azure. |
| **Anonimización** | El sistema no solicita RUT ni nombre completo en la interfaz de Nodal Scribe. El proceso de pegado a la ficha oficial ocurre externamente, manteniendo el software ciego a la identidad exacta. |

---

## 4. Cómo entrar al Sistema Público de Salud (Estrategia B2G)

Para introducir Nodal Scribe en el sistema público chileno, se utilizará el ecosistema de **Mercado Público (ChileCompra)**.

### A. Quién es el cliente (El Comprador)
* **Hospitales Públicos:** Administrados por los Servicios de Salud regionales.
* **CESFAM (Atención Primaria):** Administrados por las Corporaciones Municipales o Direcciones de Salud Municipal. Toman decisiones mucho más rápido que un hospital grande y son el objetivo ideal para el MVP.

### B. Vías de Venta en Mercado Público
La empresa proveedora de Nodal Scribe debe estar inscrita en el **Registro de Proveedores del Estado**.

1. **Trato Directo (La vía ágil):** Compras por montos bajos (menores a 30 UTM) o justificadas por innovación tecnológica.
2. **Licitación Pública (El estándar):** Presentación de propuestas técnicas y económicas ante Bases Técnicas publicadas por el hospital.
3. **Convenio Marco:** Catálogo estatal; si Nodal Scribe logra ingresar, los hospitales pueden comprar el servicio de forma directa y simplificada.

### C. La Estrategia del "Piloto Gratuito" (El Caballo de Troya)
1. Contactar al Director del CESFAM o al Jefe de Transformación Digital.
2. Ofrecer un piloto gratuito de 30 o 60 días para 5 médicos clave.
3. Levantar métricas (ej. *El tiempo de documentación bajó un 40%*).
4. Con el informe de resultados, el hospital justifica la creación de una Licitación Pública a medida para Nodal Scribe o un Trato Directo por innovación.

---

## 5. Checklist Legal de Lanzamiento

Antes de integrar al primer usuario oficial en Nodal Scribe, se debe asegurar:

- [ ] **Términos de Servicio (ToS) y EULA:** Redactados por abogado chileno, especificando la naturaleza administrativa de la plataforma.
- [ ] **Acuerdo de Procesamiento de Datos (DPA):** Detalla que Nodal Scribe actúa como procesador de datos asumiendo retención cero (Zero Data Retention).
- [ ] **Firma del BAA con Proveedor Cloud:** Activación del Business Associate Agreement en Microsoft Azure / AWS.
- [ ] **Checkbox de Consentimiento en UI:** Botón obligatorio en el Frontend para confirmar el consentimiento verbal del paciente.
- [ ] **Constitución de Empresa:** Creación de Sociedad por Acciones (SpA) relacionada a servicios informáticos para inscripción en Mercado Público.