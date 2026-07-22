# Nodal Scribe

Nodal Scribe es un PoC en Next.js para capturar una consulta por audio o texto, transformarla en una nota clínica estructurada y dejarla lista para revisión humana. La app está pensada para un flujo administrativo y no para integrarse directamente con un EHR.

## Qué hace

- Graba audio desde el navegador con consentimiento explícito.
- Transcribe el audio con el modelo ASR configurado en el backend.
- Estructura la transcripción con OpenRouter usando JSON estricto.
- Muestra notas en vivo en Markdown durante la grabación, enfocadas en lo que el médico defina en su perfil.
- Permite pegar texto crudo en un modo de testing sin micrófono.
- Protege el acceso con autenticación Supabase.
- Guarda preferencias de perfil por usuario en `public.profiles`.
- Cambia la salida del modelo según la especialidad activa.

## Flujo general

1. El usuario inicia sesión.
2. La página principal carga el perfil activo desde Supabase.
3. El backend usa `specialty_template` y `custom_instructions` para construir el prompt.
4. El audio pasa por ASR y luego por el generador estructurado.
5. La respuesta vuelve como JSON validado y se muestra en el editor.
6. El usuario puede copiar, limpiar o corregir la nota antes de usarla.

## Arquitectura

### Frontend

- `app/page.tsx`: pantalla principal con grabación, testing mode, editor y acciones.
- `components/soap-editor.tsx`: editor dinámico que renderiza la estructura de la especialidad activa.
- `app/login`: pantalla de acceso y registro.
- `app/settings`: pantalla de perfil y ajustes avanzados.

### Backend

- `app/api/process-audio/route.ts`: audio a transcripción a nota estructurada.
- `app/api/process-text/route.ts`: texto a nota estructurada.
- `app/api/profile/route.ts`: lectura y guardado del perfil.
- `app/api/auth/[action]/route.ts`: login y sign-up server-side para que Supabase deje cookies válidas.

### Capa de dominio

- `lib/ai/specialties.ts`: catálogo central de especialidades y schemas.
- `lib/ai/process-clinical-note.ts`: helper compartido para OpenRouter.
- `lib/ai/prompts.ts`: construcción del prompt base.
- `lib/ai/schemas.ts`: validación Zod de las estructuras de salida.
- `lib/supabase/*`: clientes SSR, middleware y resolución de URL.
- `lib/storage/autosave.ts`: borrador local en `localStorage`.
- `lib/utils/clinical-note.ts`: creación de borradores, exportación al portapapeles y helpers de render.

## Especialidades disponibles

La configuración vive en un diccionario central y no en condicionales dispersos.

- `general_soap`: ficha clásica SOAP.
- `psychiatry_narrative`: nota narrativa para salud mental.
- `traumatology_orthopedics`: ficha anatómica y biomecánica con lateralidad, ROM, pruebas ortopédicas, imagen y plan ortopédico.
- `triage_rapid`: resumen breve para urgencia o triaje.

Cada especialidad define:

- etiqueta visible en UI,
- descripción funcional,
- instrucciones de sistema,
- schema JSON estricto,
- campos que el editor debe mostrar.

## Modo testing

La pantalla principal incluye un bloque para pegar una transcripción manual y enviarla al pipeline estructurado.

Sirve para:

- probar prompts sin usar micrófono,
- depurar especialidades nuevas,
- validar cambios en el schema,
- comparar el resultado del modelo con la expectativa visual del editor.

## Notas en vivo

Durante la grabación, la app extrae y muestra notas en Markdown con lo relevante de la consulta en curso, para que el médico pueda revisarlo sin esperar al final.

- El audio se transcribe por el mismo pipeline ASR efímero que la nota final (sin Web Speech API del navegador).
- El endpoint `POST /api/process-live-note` está autenticado y no almacena nada: el audio se procesa en memoria y se descarta.
- Las notas viven solo en memoria del navegador y se limpian al detener la grabación.
- El enfoque de las notas se configura en Ajustes (`live_note_focus`); si está vacío, se usa un enfoque clínico por defecto.
- El Markdown se renderiza con un parser propio sin `dangerouslySetInnerHTML`.

El diseño completo y el plan de endurecimiento para producción están en `ARCHITECTURE.md` (sección 6).

## Autenticación

La app usa Supabase SSR.

- El login y el sign-up se ejecutan en el servidor.
- Las cookies de sesión se escriben de forma compatible con el middleware.
- `/`, `/settings` y `/login` están protegidos y redirigen según sesión activa.

## Perfil y ajustes

La pantalla de ajustes permite definir:

- la especialidad activa,
- instrucciones personalizadas para el modelo.

La UI muestra una vista previa de la especialidad seleccionada para que sea más fácil entender qué estructura producirá el modelo.

## Base de datos requerida

La app espera dos tablas en Supabase: `public.profiles` y `public.custom_specialties`.

### Esquema esperado

`public.profiles`:

- `user_id` UUID, clave primaria y FK a `auth.users.id`
- `specialty_template` texto, con valor por defecto `general_soap` (admite una clave base o el ID de una plantilla personalizada)
- `custom_instructions` texto, con valor por defecto vacío
- `live_note_focus` texto, con valor por defecto vacío
- `created_at` timestamptz
- `updated_at` timestamptz

`public.custom_specialties` (plantillas personalizadas por usuario):

- `id` UUID, clave primaria
- `user_id` UUID, FK a `auth.users.id`
- `name` texto
- `base_template` texto (la plantilla base de la que partió)
- `fields` jsonb (la estructura de campos editable)
- `created_at` / `updated_at` timestamptz

### Migración

Existen migraciones listas para aplicar en:

- `supabase/migrations/20260710_create_profiles.sql`
- `supabase/migrations/20260722_add_live_note_focus.sql`
- `supabase/migrations/20260722_create_custom_specialties.sql`

Si ves el error de schema cache sobre `public.profiles`, normalmente significa que la tabla no fue creada o que Supabase no refrescó el esquema después de aplicar la migración.

## Plantillas personalizadas

Desde Ajustes puedes crear una plantilla propia a partir de cualquiera de las plantillas base:

- Se copia la estructura de la plantilla seleccionada y puedes agregar, eliminar, renombrar y reordenar campos de tipo texto, lista o grupo.
- La plantilla base original nunca se modifica: la personalizada es una copia independiente guardada en `public.custom_specialties`, aislada por usuario con RLS.
- El modelo genera la nota según la estructura personalizada (el JSON Schema y la validación Zod se construyen dinámicamente desde los campos).
- Al crearla queda seleccionada; guarda los ajustes para activarla en la próxima transcripción.

## Variables de entorno

Crea un archivo `.env.local` con valores equivalentes a estos:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_OPENROUTER_API_KEY=
NEXT_PUBLIC_OPENROUTER_MODEL=
OPENROUTER_BASE_URL=
GROQ_API_KEY=
GROQ_ASR_MODEL=
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` debe apuntar a la URL base del proyecto, no a `/auth/v1` ni a `/rest/v1`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` se usa en cliente y middleware.
- `SUPABASE_SERVICE_ROLE_KEY` se usa para rutas server-side que necesitan privilegios de backend.
- `NEXT_PUBLIC_OPENROUTER_API_KEY` y `NEXT_PUBLIC_OPENROUTER_MODEL` permiten generar la nota estructurada.
- `GROQ_API_KEY` y `GROQ_ASR_MODEL` se usan para la transcripción de audio.

## Desarrollo local

```bash
npm install
npm run dev
```

Luego abre la aplicación en el puerto de Next que esté libre.

## Validación

```bash
npm run build
```

La build se usa para validar tipos, rutas y el render del proyecto completo.

## Comportamiento importante

- El borrador local solo vive en el navegador.
- Las notas se validan con Zod antes de mostrarse.
- El backend siempre intenta devolver JSON estricto.
- El editor cambia según la especialidad activa.
- La app no inventa datos ausentes en la transcripción.

## Estructura de alto nivel

```text
app/
components/
lib/
supabase/
```

## Próximos pasos naturales

- Agregar más especialidades clínicas como plantillas nuevas.
- Conectar el proyecto a migraciones reales de Supabase.
- Ajustar el editor para vistas especializadas todavía más ricas.
- Añadir pruebas automatizadas para el parseo y la UI.
