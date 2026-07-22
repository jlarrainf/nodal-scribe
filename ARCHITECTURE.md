# Documento de Arquitectura Técnica: Nodal Scribe

**Autor:** Juan Ignacio Larraín  
**Versión:** 2.1 (Estrategia PoC a Producción detallada)  
**Enfoque:** Transición de Prototipo Gratuito a Arquitectura Cloud Enterprise (Zero Data Retention).

---

## 1. Visión General del Sistema
Nodal Scribe es una aplicación web responsiva (PWA/SPA) que captura audio en tiempo real desde el dispositivo del médico. En su etapa de producción, el audio se transmite a un backend *serverless* que utiliza APIs corporativas con retención cero de datos para estructurar una Ficha Clínica (formato SOAP).

Para la validación inicial (PoC - Prueba de Concepto), el sistema utilizará una arquitectura idéntica pero conectada a APIs gratuitas mediante variables de entorno, permitiendo desarrollar y mostrar el producto a costo $0.

---

## 2. Stack Tecnológico de Transición

### 2.1. Frontend y Despliegue (Invariable)
*   **Interfaz:** React.js o Vue.js estilizado con Tailwind CSS.
*   **Despliegue:** Vercel o Netlify (Alojamiento y gestión ágil de variables de entorno).
*   **Captura de Audio:** `MediaRecorder API` nativa del navegador.

### 2.2. Backend e IA (El Intercambio PoC -> Producción)
El código del backend usará el SDK estándar de OpenAI, lo que permite cambiar de proveedor modificando únicamente el archivo `.env`.

**Fase 1: Prototipo (Costo $0 - CERO DATOS DE PACIENTES REALES)**
*   **ASR (Audio a Texto):** Groq API (Modelo Whisper rápido y capa gratuita).
*   **LLM (Texto a JSON):** OpenRouter (Enrutador de modelos que permite usar *Llama 3 8B* u otros modelos gratuitos).

**Fase 2: Producción (HIPAA / Cumplimiento Ley 20.584)**
*   **ASR & LLM:** Azure OpenAI Service (Modelos Whisper y GPT-4o bajo contrato BAA y política *Zero Data Retention*).

---

## 3. Ruta de Seguimiento (Roadmap de Desarrollo Estratégico)

### Fase 1: Desarrollo del Prototipo Gratuito (Semanas 1-3)
*   [ ] Diseñar la interfaz de usuario de "Un solo botón" con Tailwind CSS.
*   [ ] Implementar captura de audio con `MediaRecorder API` en el frontend.
*   [ ] Configurar la lógica del backend *serverless* y el *System Prompt* dinámico.
*   [ ] **REGLA ESTRICTA:** Realizar pruebas de usabilidad y demos a clientes utilizando exclusivamente simulaciones y audios ficticios (sin pacientes reales).

### Fase 2: Validación Comercial y Financiamiento (Semanas 4-6)
*   [ ] Mostrar Nodal Scribe a directores de CESFAM y clínicas.
*   [ ] Asegurar cartas de intención (LOI) o el primer contrato de pago.
*   [ ] Registrar la empresa (SpA) e inscribirse en Mercado Público (ChileCompra).

### Fase 3: Migración a Arquitectura Segura (Semana 7)
*   [ ] Firmar el acuerdo BAA con Microsoft Azure o AWS.
*   [ ] Cambiar las variables de entorno en producción para apuntar los *endpoints* hacia Azure OpenAI.
*   [ ] Realizar auditoría interna de logs.

### Fase 4: Piloto en Terreno (Semanas 8+)
*   [ ] Onboarding "Concierge" presencial con médicos senior.
*   [ ] Implementar sistema de autoguardado temporal (`localStorage`).
*   [ ] Medir impacto (reducción de tiempo en documentación).

---

## 4. Tecnologías y Estándares de Privacidad (Lista de Verificación Técnica)

### A. Privacidad en la Capa de Infraestructura (Cloud)
1.  **Zero Data Retention (ZDR) / BAA:** Utilización de Microsoft Azure OpenAI Service con exención de revisión humana (*Data Logging Opt-Out*).
2.  **Procesamiento Efímero (Serverless Functions):** Implementación a través de Serverless Functions (ej. `/api` en Vercel). La memoria se limpia al terminar el proceso.

### B. Seguridad en Tránsito (Red)
3.  **Cifrado TLS 1.3 (Transport Layer Security):** Configuración de Proxy (ej. Cloudflare) forzando `Minimum TLS Version: TLS 1.3`.
4.  **Server-Sent Events (SSE):** El backend utilizará SSE (`Content-Type: text/event-stream`) para enviar fragmentos de texto al frontend en tiempo real.

### C. Seguridad en Reposo (Base de Datos)
5.  **Cifrado AES-256 (Advanced Encryption Standard):** Utilización de bases de datos gestionadas (ej. Supabase) con discos cifrados de fábrica (AES-256).
6.  **Separación de Datos (Data Isolation):** Aislamiento estricto de la tabla de usuarios; no se almacenarán transcripciones clínicas.

### D. Autenticación y Autorización
7.  **JSON Web Tokens (JWT) / OAuth 2.0:** Integración de Auth (ej. Supabase Auth, Clerk) para generar tokens JWT encriptados.

### E. Capa de Captura (Cliente)
8.  **Sin APIs de reconocimiento de voz del navegador:** Queda prohibido usar `SpeechRecognition`/`webkitSpeechRecognition` (Web Speech API). Esas APIs envían el audio a servidores de terceros (ej. Google) fuera de nuestro control y sin garantías de retención cero. Toda transcripción —incluidas las notas en vivo— debe pasar por el mismo pipeline ASR contratado (Groq en el PoC, Azure en producción).

---

## 5. Guía de Implementación del Prototipo (PoC) con OpenRouter

Para construir el MVP sin incurrir en costos de procesamiento, se utilizará una arquitectura de reemplazo de *Endpoints* compatible con el SDK oficial de OpenAI. Esto garantiza que la transición al entorno seguro corporativo no requiera refactorización de código.

### 5.1. Inicialización Agóstica del SDK
En el código del backend (Node.js/Python), la instancia del cliente de IA NUNCA debe contener URLs o credenciales fijas (hardcoded). Debe inicializarse absorbiendo dinámicamente las variables de entorno:

```javascript
// Ejemplo en Node.js usando el SDK oficial de OpenAI
import OpenAI from 'openai';

const aiClient = new OpenAI({
  baseURL: process.env.AI_BASE_URL,
  apiKey: process.env.AI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL, // Requerido por OpenRouter
    "X-Title": "Nodal Scribe PoC", // Requerido por OpenRouter
  }
});
```

### 5.2. Configuración del Entorno de Desarrollo (El Prototipo)
En tu entorno local (`.env.development`), configurarás las rutas para utilizar los ruteadores gratuitos. 

```env
# --- ENTORNO: PROTOTIPO (Costo $0) ---
# LLM para estructurar el JSON (OpenRouter con modelo gratuito)
AI_BASE_URL="[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)"
AI_API_KEY="sk-or-v1-tu-clave-gratis-aqui"
AI_MODEL_NAME="meta-llama/llama-3-8b-instruct:free"

# ASR para transcribir el audio (Groq)
ASR_BASE_URL="[https://api.groq.com/openai/v1](https://api.groq.com/openai/v1)"
ASR_API_KEY="gsk_tu_clave_de_groq_aqui"
ASR_MODEL_NAME="whisper-large-v3"
```

### 5.3. El Intercambio a Producción (El Despliegue Final)
Cuando el proyecto esté listo para conectarse a datos reales de pacientes, el código permanecerá intacto. La transición se realiza exclusivamente modificando las variables de entorno directamente en el panel de control de tu plataforma de hosting (Netlify o Vercel), apuntando hacia tu despliegue privado de Azure.


```env
# --- ENTORNO: PRODUCCIÓN (Seguridad HIPAA / Ley 20.584) ---
# Azure unifica ASR y LLM bajo la misma infraestructura segura
AI_BASE_URL="[https://tu-instancia-nodal.openai.azure.com/openai/deployments/gpt-4o](https://tu-instancia-nodal.openai.azure.com/openai/deployments/gpt-4o)"
AI_API_KEY="clave_corporativa_azure_segura"
AI_MODEL_NAME="gpt-4o"

ASR_BASE_URL="[https://tu-instancia-nodal.openai.azure.com/openai/deployments/whisper](https://tu-instancia-nodal.openai.azure.com/openai/deployments/whisper)"
ASR_API_KEY="clave_corporativa_azure_segura"
ASR_MODEL_NAME="whisper"
```

Ventaja de este enfoque: Al gestionar la arquitectura a través de variables de entorno administradas en la nube, evitas por completo reescribir funciones, permitiendo que tu prototipo sea idéntico en comportamiento a tu producto de grado médico.

---

## 6. Notas en Vivo (Live Notes)

### 6.1. Objetivo
Mostrar al médico, durante la consulta y en formato Markdown renderizado, los puntos relevantes de la conversación en curso (signos vitales, medicamentos, alergias, acuerdos, etc.), de modo que no deba esperar al final para revisar lo importante.

### 6.2. Diseño del Prototipo (PoC)
El flujo reutiliza la misma infraestructura efímera que la nota final, sin agregar almacenamiento:

1.  **Captura por segmentos:** Mientras `MediaRecorder` acumula los chunks de audio de la grabación completa, el frontend arma periódicamente un segmento con los chunks nuevos (anteponiendo el primer chunk, que contiene la cabecera del contenedor, para que el segmento sea decodificable). Primera actualización ≈ 12 s; luego cada ≈ 30 s.
2.  **Endpoint autenticado:** `POST /api/process-live-note` exige sesión válida (misma autenticación que el resto de la API). Recibe el segmento de audio y las notas previas en Markdown.
3.  **Transcripción efímera:** El segmento se transcribe con el mismo cliente ASR (Groq en PoC, Azure en producción). El audio se procesa en memoria y se descarta; nunca se persiste.
4.  **Extracción y fusión:** El LLM integra la nueva transcripción con las notas previas y devuelve Markdown actualizado, enfocándose en la preferencia `live_note_focus` del usuario (leída del perfil en el servidor; si está vacía, se usa un enfoque clínico por defecto). Regla de cero invención.
5.  **Cursor con reintento:** El cliente solo avanza su cursor de audio cuando el servidor confirma una transcripción exitosa (`transcribed: true`). Si un segmento falla, no se avanza y se reintenta con más audio en el siguiente ciclo (autocuración).
6.  **Render seguro:** El Markdown se renderiza con un parser propio que genera elementos de React (sin `dangerouslySetInnerHTML` y sin dependencias externas), evitando inyección de HTML.

### 6.3. Garantías de Privacidad (estado actual)
-   **Sin Web Speech API:** se eliminó el uso de `webkitSpeechRecognition`, que filtraba audio a servidores de terceros. Todo audio pasa por el pipeline ASR controlado.
-   **Endpoint autenticado:** dejó de ser público; ahora requiere sesión.
-   **Retención cero:** ni el audio ni las notas en vivo se guardan en servidor ni en base de datos. Las notas viven únicamente en memoria del cliente (estado de React) y se limpian al detener la grabación.
-   **Único dato persistido:** `live_note_focus` (una preferencia de texto, no dato clínico), aislada por usuario mediante RLS en `public.profiles`.

### 6.4. Endurecimiento para Producción (Roadmap)
Para alinear las notas en vivo con el estándar HIPAA / Ley 20.584 del resto del sistema:

1.  **ASR en streaming (SSE):** reemplazar el envío periódico de segmentos por transcripción en streaming con Server-Sent Events sobre el proveedor seguro (Azure), reduciendo latencia y tamaño de payload.
2.  **Segmentación con URLs firmadas:** subir chunks a un bucket con URLs prefirmadas de vida corta y borrado automático, en lugar de reenviar blobs crecientes.
3.  **TLS 1.3 + rate limiting:** forzar TLS 1.3 y limitar la frecuencia del endpoint en vivo para evitar abuso.
4.  **VAD / gating por voz:** detectar actividad de voz en el cliente para no transmitir silencios.
5.  **Auditoría sin contenido:** registrar metadatos de uso (nunca el contenido clínico) para trazabilidad.
6.  **BAA / ZDR:** todo el procesamiento bajo el contrato corporativo con retención cero, igual que la transcripción final.

---

## 7. Plantillas Personalizadas (por usuario)

### 7.1. Objetivo
Permitir que cada médico derive una plantilla propia a partir de una base y ajuste su estructura (agregar/quitar/renombrar/reordenar campos de tipo texto, lista o grupo), sin modificar nunca la plantilla base original.

### 7.2. Modelo de datos
-   Tabla `public.custom_specialties` (`id`, `user_id`, `name`, `base_template`, `fields jsonb`), con RLS que aísla los registros por usuario.
-   `profiles.specialty_template` admite tanto una clave base (`general_soap`, etc.) como el `id` (UUID) de una plantilla personalizada.

### 7.3. Resolución y esquema dinámico
-   `resolveActiveSpecialty` (servidor) devuelve la definición activa: si la clave es base, usa el catálogo estático; si es un UUID, carga el registro del usuario y construye la definición con `buildCustomDefinition`.
-   El **JSON Schema** para el `response_format` del LLM se genera desde los campos (`buildJsonSchemaFromFields`), y la **validación Zod** también se construye dinámicamente (`buildZodSchemaFromFields` / `validateCustomNote`). Las plantillas base siguen usando sus esquemas estáticos.
-   `sanitizeCustomFields` sanea la estructura enviada por el cliente (tipos de campo, claves únicas y seguras para el esquema, anidación de grupos).

### 7.4. API
-   `GET/POST /api/specialties` y `PATCH/DELETE /api/specialties/[id]`, todas autenticadas y limitadas al usuario. No se permite eliminar la plantilla que está activa en el perfil.

### 7.5. Privacidad
-   Solo se persiste la definición de la plantilla (metadatos de estructura), nunca datos clínicos. El aislamiento es por usuario vía RLS, igual que el resto del sistema.