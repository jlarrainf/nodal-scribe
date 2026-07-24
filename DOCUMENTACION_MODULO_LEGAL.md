# Documentación de Arquitectura y Requisitos: Módulo Legal, Roles de Secretaria y Consentimiento Informado (Nodal Scribe)

## 1. Visión General del Proyecto y Justificación

**Nodal Scribe** es un Asistente Clínico de IA (Ambient AI Scribe) diseñado para médicos en Chile. Su objetivo es transcribir y estructurar automáticamente consultas médicas basándose en especialidades (Medicina General, Pediatría, Traumatología, Psiquiatría).

### ¿Por qué se necesita implementar este módulo?

1. **Marco Legal Chileno (Ley 19.628 y Ley 20.584):** La información de salud constituye **"Datos Sensibles"**. El tratamiento de estos datos mediante inteligencia artificial requiere obligatoriamente el **consentimiento expreso y documentado del paciente**.
2. **Modelo de Negocio (B2B2C):** El software le vende el servicio al médico (quien actúa como responsable del tratamiento de datos), pero la recolección de los datos ocurre sobre el paciente final.
3. **Optimización del Flujo Clínico:** Los médicos no disponen de tiempo administrativo para gestionar firmas o papeles. Delegar esta tarea operativa en un rol secundario (secretaria/recepción) sin comprometer el secreto médico es un requisito operativo indispensable para escalar.

---

## 2. Matriz de Prioridades

| Módulo / Tarea | Nivel de Prioridad | Justificación de Negocio / Legal |
| --- | --- | --- |
| **1. Páginas Legales (Términos y Privacidad)** | **Crítica (P0)** | Obligación legal para la operación del SaaS frente al médico cliente. |
| **2. Arquitectura de Roles y Supabase (RBAC)** | **Alta (P1)** | Permite separar visual y operativamente el rol de la secretaría del rol médico. |
| **3. Módulo de Gestión de Consentimientos** | **Alta (P1)** | Cumplimiento estricto de la Ley 19.628 de Protección de Datos en Salud. |
| **4. Restricción Operativa (Bloqueo de Audio)** | **Media-Alta (P2)** | Asegura que ningún médico pueda iniciar una grabación sin el consentimiento previo del paciente. |

---

## 3. Plan de Pasos a Seguir para el Agente de Desarrollo

Para que el agente de IA encargado del código ejecute esta implementación de forma limpia, modular y sin romper el motor de IA existente, deberá seguir estrictamente esta secuencia:

### Paso 1: Creación de Páginas Legales y Términos de Servicio (B2B)

* **Objetivo:** Publicar las bases jurídicas del servicio para el médico cliente.
* **Tareas:**
* Crear la ruta `app/terminos-y-condiciones/page.tsx` especificando que Nodal Scribe actúa como "Encargado de Tratamiento de Datos", que los audios no se almacenan permanentemente (cero retención) y que el médico es responsable de obtener el consentimiento del paciente.
* Crear la ruta `app/politica-de-privacidad/page.tsx`.
* Enlazar ambas páginas de manera visible en la pantalla de Registro/Login (`app/login/page.tsx`) y en el pie de página de la aplicación.



### Paso 2: Ampliación de la Base de Datos (Supabase) y Roles (RBAC)

* **Objetivo:** Permitir la diferenciación entre el rol del médico y el rol de la secretaría bajo una misma clínica o cuenta principal.
* **Tareas:**
* Modificar la tabla `profiles` en Supabase añadiendo los campos:
* `role` (Tipo `text` o `enum`: valores `'doctor'` o `'secretary'`).
* `clinic_id` (Tipo `uuid` o referencia para agrupar secretarias con su respectivo médico tratante).


* Configurar las políticas de seguridad a nivel de filas (**Row Level Security - RLS**) para que las secretarias solo tengan acceso a la agenda y a la subida de consentimientos, bloqueando totalmente su visualización de las transcripciones clínicas e historiales médicos (respetando el secreto profesional).



### Paso 3: Módulo de Consentimiento Informado del Paciente (B2C)

* **Objetivo:** Capturar y almacenar de forma segura la autorización del paciente para ser grabado por la IA.
* **Tareas:**
* Crear una tabla en Supabase llamada `patient_consents`:
* `id` (uuid, PK)
* `patient_name` (text)
* `patient_rut` o identificador (text)
* `consent_status` (boolean)
* `consent_file_url` (text - ruta del archivo en Storage)
* `created_at` (timestamp)
* `doctor_id` o `clinic_id` (referencia al médico responsable)


* Crear un Bucket privado en **Supabase Storage** exclusivo para almacenar los archivos PDF o firmas digitales de los consentimientos.
* Implementar una regla de nombrado de archivos mediante UUIDs aleatorios (ej. `d8e3f-124b.pdf`) para asegurar ofuscación y privacidad frente a accesos externos.



### Paso 4: Vista de Secretaría y Restricción de Grabación

* **Objetivo:** Habilitar la interfaz para el personal administrativo y condicionar el inicio de la consulta médica.
* **Tareas:**
* Desarrollar una vista exclusiva para el rol `secretary` donde puedan registrar al paciente del día y marcar/subir su consentimiento firmado.
* Actualizar el componente de grabación principal de la interfaz del médico (`app/page.tsx`) para que consulte el estado del consentimiento del paciente activo: **si no hay un consentimiento registrado y activo, el botón de "Grabar" debe permanecer deshabilitado (Disabled)** con una alerta visual que indique *"Requiere consentimiento del paciente"*.



---

## 4. Directrices Técnicas de Seguridad para el Agente (Checklist)

* **Cifrado en Reposo:** Aprovechar el cifrado automático AES-256 nativo de Supabase sobre los buckets de almacenamiento y las bases de datos de perfiles.
* **Aislamiento de Componentes:** Las vistas y componentes del rol administrativo (`secretary`) no deben importar ni renderizar ninguna dependencia relacionada con OpenRouter, Groq o el motor de procesamiento de audio clínico.
* **Inmutabilidad de los Endpoints de IA:** Queda estrictamente prohibido alterar las rutas `/api/process-audio` y `/api/process-text` validadas anteriormente; la lógica de consentimientos debe manejarse puramente como un middleware o una validación de estado previa en el frontend y base de datos, sin contaminar la tubería de análisis clínico.