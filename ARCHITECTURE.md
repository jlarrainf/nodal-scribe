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