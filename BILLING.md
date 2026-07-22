# Sistema de Ventas, Suscripciones y Administración de Cuentas — Nodal Scribe

**Versión:** 1.0 (planificación detallada)
**Stack actual:** Next.js (App Router) · Supabase Auth + Postgres (RLS) · Vercel · OpenRouter (LLM) · Groq (ASR)
**Mercado objetivo:** Chile (médicos individuales, clínicas/CESFAM, sector público)

> Este documento describe el modelo de negocio y la implementación técnica completa para monetizar Nodal Scribe mediante suscripciones y restringir el acceso a suscriptores. Está pensado para implementarse por fases, empezando por una **fundación sin pagos** (gating + administración manual) que no interrumpe el flujo actual.

---

## 0. Resumen ejecutivo

Nodal Scribe pasa de PoC a producto SaaS cobrando una suscripción recurrente. La arquitectura separa tres responsabilidades:

1. **Identidad** (quién es) → Supabase Auth (email/contraseña + Google OAuth, ya implementado).
2. **Derecho de acceso** (puede usar la app) → un campo `plan`/`subscription_status` en la base de datos, validado **siempre en el servidor**.
3. **Cobro** (cómo paga) → un proveedor de pagos (Stripe recomendado) que se sincroniza con la base de datos vía webhooks.

La clave de diseño: **el cobro se puede automatizar después**. Primero se construye el control de acceso y un panel de administración que otorga acceso **manualmente**; luego Stripe automatiza el alta/baja según el pago. Esto permite vender y dar acceso antes de tener la integración de pagos terminada.

---

## 1. Modelo de negocio

### 1.1 Segmentos de clientes

| Segmento | Quién | Cómo compra | Prioridad |
|---|---|---|---|
| **B2C** | Médico individual (particular, APS, turno) | Suscripción self-service con tarjeta | 1ª (validación rápida, bottom-up) |
| **B2B** | Clínicas, centros médicos, CESFAM | Licencia por seats, venta asistida | 2ª (ticket mayor, top-down) |
| **B2G** | Hospitales públicos, servicios de salud | Mercado Público / trato directo | 3ª (ciclos largos, requiere cumplimiento) |

### 1.2 Planes y precios (referenciales, a validar con clientes)

| Plan | Precio referencial | Destinado a | Límite | Especialidades | Plantillas propias | Notas en vivo | Panel admin | Soporte |
|---|---|---|---|---|---|---|---|---|
| **Trial** | $0 (14 días) | nuevos | ~30 transcripciones | 2 | No | Sí | No | Comunidad |
| **Pro** | ~CLP 19.990/mes (15.990 anual) | médico individual | ilimitado (o tope alto) | todas | Sí | Sí | No | prioritario |
| **Equipo** | ~CLP 14.990 por médico/mes | clínicas | por seat | todas | Sí (compartidas) | Sí | Sí (org) | dedicado |
| **Enterprise/B2G** | a medida | hospitales/redes | a medida | todas + a medida | Sí | Sí | Sí + SSO | SLA |

**Reglas de precio:**
- **Anual con ~20% de descuento** → mejora retención y caja.
- Precio **por médico (seat)** en Equipo → escala con el tamaño del centro.
- Trial **sin tarjeta** para maximizar adopción (o **con tarjeta** para mejorar conversión a pago; decidir según data).

### 1.3 Anclaje de valor y unit economics

**Anclaje:** el valor no es "transcripción", es **tiempo clínico recuperado**.
- Un médico atiende ~20–30 consultas/día. Si ahorra ~5 min de documentación por consulta, recupera ~2–3 horas/día.
- A ~CLP 19.990/mes, el costo por consulta documentada es de unos pocos cientos de pesos → ROI evidente.

**Unit economics (objetivo):**
- **CAC** (costo de adquisición) bajo en B2C (boca a boca entre colegas, demostraciones en CESFAM).
- **Margen bruto:** el costo variable por usuario es el consumo de IA (OpenRouter LLM + Groq ASR). Estimar costo por transcripción y asegurar que `precio >> costo IA + infra`.
  - Ejemplo de control: si una transcripción cuesta ~CLP 30–80 en IA, un usuario Pro con 300 transcripciones/mes cuesta ~CLP 9.000–24.000 en IA → el margen se aprieta; por eso conviene **modelo con tope** o **precio que cubra uso intensivo**, y optimizar modelos (modelos gratuitos/baratos en PoC, modelos eficientes en producción).
- **Churn:** la suscripción a una herramienta de uso diario tiende a tener churn bajo una vez adoptada. El riesgo está en la adopción inicial (cambio de hábito).

### 1.4 Estrategia de adquisición

- **B2C (bottom-up):** el médico lo prueba, le gusta, paga de su bolsillo. Demostraciones con audios ficticios (nunca pacientes reales en PoC).
- **B2B (top-down):** venta al director de clínica/CESFAM; el médico lo usa porque el centro lo provee. Estandarización de registros como argumento.
- **B2G:** Mercado Público, convenios marco, pilotos con servicios de salud. Requiere cumplimiento reforzado (ver §6.7).

### 1.5 Métricas de negocio (desde el día 1)

- **MRR / ARR** (ingreso recurrente).
- **Churn** (cancelaciones mensuales) y **net revenue retention**.
- **Activación:** % de registros que completan su primera transcripción.
- **Conversión trial→pago.**
- **Uso por usuario:** transcripciones/semana (detectar abandono temprano).
- **Costo de IA por usuario** (para cuidar el margen).

---

## 2. Proveedor de pagos

### 2.1 Comparación detallada

| Criterio | **Stripe** | **Mercado Pago** | **Flow.cl** |
|---|---|---|---|
| Suscripciones recurrentes | Excelente (Billing) | Sí (Preapproval/pagos recurrentes) | Sí (suscripciones) |
| Customer Portal (autogestión) | Incluido | Limitado (manual) | Limitado |
| Webhooks | Robustos y documentados | Sí | Sí |
| Métodos de pago Chile | Tarjetas + métodos locales (en expansión) | Webpay, tarjetas, saldo MP | Webpay, Multicaja, Servipag, tarjetas |
| Moneda | CLP soportado | CLP nativo | CLP nativo |
| Experiencia de desarrollo | La mejor (SDK, docs) | Media | Media |
| Facturación/boletas SII | No nativa (integrar) | No nativa | No nativa |
| Escalabilidad B2B/enterprise | Alta | Media | Media |
| Familiaridad usuario chileno | Media | Alta | Alta |

### 2.2 Decisión y justificación

**Recomendación: Stripe como proveedor principal.**
- Mejor DX, Customer Portal gratuito (cancelar, cambiar tarjeta, facturas), webhooks robustos, escala a B2B/enterprise sin cambiar.
- Stripe opera en Chile y soporta CLP.

**Alternativa/complemento local: Flow.cl o Mercado Pago** si se detecta que los médicos prefieren Webpay/saldo local y las tarjetas internacionales friccionan. Flow.cl agrega Webpay/Multicaja/Servipag, muy usado en SaaS chileno.

> **Decisión práctica:** partir con Stripe; diseñar una capa de abstracción para poder agregar Flow/Mercado Pago sin reescribir la lógica de acceso.

### 2.3 Abstracción del proveedor

Definir una interfaz propia de "billing" para no acoplarse a Stripe:

```
BillingProvider (interfaz)
  - createCheckoutSession(userId, plan, billingCycle) -> { url }
  - createPortalSession(userId) -> { url }
  - handleWebhook(rawBody, signature) -> evento normalizado
  - getSubscription(customerId) -> { status, plan, periodEnd }
```

Implementaciones: `StripeBilling` (ahora), `FlowBilling` / `MercadoPagoBilling` (después). El resto de la app habla con la interfaz, no con Stripe directamente.

---

## 3. Arquitectura técnica (Stripe + Supabase)

### 3.1 Visión general

```
[Usuario]
   │ 1. Se registra (Supabase Auth: email o Google)
   ▼
[App Next.js] ── 2. "Mejorar plan" ──► /api/billing/checkout ──► Stripe Checkout
   │                                                              │ 3. Usuario paga
   │ 6. Lee estado de suscripción (rápido)                        ▼
   ▼                                                     [Stripe] crea Customer + Subscription
[Supabase Postgres] ◄── 5. Webhook actualiza ── /api/webhooks/stripe ◄── 4. Stripe notifica
   │
   └─ profiles.plan / subscriptions.status  →  usado por el gating (middleware + API de IA)
```

**Principio:** Stripe es la **fuente de verdad** del cobro; Supabase guarda una **copia del estado** para que la app valide el acceso rápido y de forma confiable (sin llamar a Stripe en cada request).

### 3.2 Modelo de datos

**`profiles` (existe) — agregar columnas:**
```sql
alter table public.profiles
  add column if not exists role text not null default 'user',        -- 'user' | 'admin'
  add column if not exists plan text not null default 'none',         -- 'none'|'trial'|'pro'|'team'|'enterprise'
  add column if not exists subscription_status text not null default 'inactive';
    -- 'inactive'|'trialing'|'active'|'past_due'|'canceled'|'incomplete'
```

**Nueva tabla `subscriptions` (estado sincronizado desde Stripe):**
```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null,                       -- 'pro'|'team'|...
  billing_cycle text not null default 'monthly',  -- 'monthly'|'annual'
  status text not null,                     -- trialing|active|past_due|canceled|incomplete
  quantity int not null default 1,          -- seats (para team)
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- RLS: el usuario solo lee la suya
alter table public.subscriptions enable row level security;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);
```

**Nueva tabla `usage` (si hay planes con tope):**
```sql
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null,                     -- 'YYYY-MM'
  transcriptions int not null default 0,
  unique (user_id, period)
);
```

**B2B (Fase 3):**
```sql
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  plan text not null default 'team',
  seats int not null default 1,
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',      -- 'owner'|'admin'|'member'
  unique (org_id, user_id)
);
```

### 3.3 Flujo de registro y trial

1. Usuario se registra (email o Google) → Supabase crea `auth.users`.
2. Un trigger (o el primer `/api/profile`) crea la fila en `profiles` con `plan='trial'`, `subscription_status='trialing'`, `trial_ends_at = now() + 14 días`.
3. El gating deja pasar mientras `status in ('trialing','active')` y (si hay tope) `usage < límite`.

> Alternativa: crear el trial como Subscription de Stripe con `trial_period_days=14` (requiere tarjeta) para que la conversión a pago sea automática al finir el trial.

### 3.4 Flujo de checkout (upgrade)

1. Usuario en `/billing` elige plan y ciclo (mensual/anual).
2. Front llama a `POST /api/billing/checkout` con `{ plan, cycle }`.
3. El endpoint (server-side):
   - Obtiene/crea el `stripe_customer_id` del usuario.
   - Crea una **Checkout Session** con `mode='subscription'`, `line_items` (Price ID del plan), `success_url`, `cancel_url`, `client_reference_id = user_id`, y `subscription_data.metadata.user_id`.
   - Devuelve `{ url }`.
4. Front redirige a `url` (Stripe hosted).
5. Usuario paga → Stripe redirige a `success_url` y emite webhooks.

### 3.5 Webhooks y sincronización

Endpoint `POST /api/webhooks/stripe`:
- **Verificar la firma** con el `STRIPE_WEBHOOK_SECRET` (obligatorio; nunca confiar en el body sin verificar).
- **Idempotencia:** procesar cada `event.id` una sola vez (tabla `webhook_events` o revisar estado actual).

Eventos a manejar:

| Evento | Acción |
|---|---|
| `checkout.session.completed` | Crear/actualizar `subscriptions` (status=`active` o `trialing`), set `profiles.plan` y `subscription_status`. |
| `customer.subscription.updated` | Actualizar plan/status/`cancel_at_period_end`/`current_period_end`. |
| `customer.subscription.deleted` | `status='canceled'`, `profiles.subscription_status='canceled'` (cortar acceso al fin del período). |
| `invoice.payment_failed` | `status='past_due'` → grace period + email de aviso. |
| `invoice.paid` | Renovación OK → `status='active'`, reset de `usage` del período. |
| `customer.updated` | Sincronizar email/datos del cliente. |

**Patrón de sincronización:** el webhook escribe en Supabase con la **service role key** (server-only). La app lee el estado desde Supabase (no de Stripe) para el gating.

### 3.6 Customer Portal (autogestión)

- `POST /api/billing/portal` → crea una `billing portal session` de Stripe → devuelve `{ url }` → front redirige.
- El usuario puede: cambiar/cancelar suscripción, actualizar tarjeta, descargar facturas.
- Los cambios se reflejan vía webhooks (`customer.subscription.updated/deleted`).

### 3.7 Límites de uso (metering)

Para planes con tope (ej. Trial = 30 transcripciones):
1. Antes de procesar (en `/api/process-audio` y `/api/process-text`): leer `usage` del período actual.
2. Si `transcriptions >= límite` → responder con error "Límite alcanzado, mejora tu plan" (HTTP 402 Payment Required).
3. Si hay cupo: procesar e **incrementar `usage` transaccionalmente** (upsert con `transcriptions = transcriptions + 1`).
4. Reset del contador al renovar (webhook `invoice.paid`).

Para planes "ilimitados" (Pro/Team): omitir el chequeo de tope (o poner un límite anti-abuso muy alto).

### 3.8 Manejo de errores y estados

- **`past_due`:** acceso con banner "Tu pago no se pudo procesar, actualiza tu tarjeta" + link al portal. Grace period (ej. 7 días) antes de cortar.
- **`canceled` al fin del período:** cortar acceso a grabación; permitir entrar a `/billing` y a leer/ajustar (no procesar).
- **Fallos de webhook:** reintentos de Stripe + endpoint idempotente. Monitorear con logs.
- **Discrepancias:** Stripe es la verdad; un job de reconciliación periódico puede re-sincronizar `subscriptions` desde Stripe.

---

## 4. Gating de acceso (que solo entren suscriptores)

### 4.1 Principios de seguridad

1. **La validación es SIEMPRE server-side.** Ocultar botones en el cliente es cosmético; un atacante puede llamar a la API directamente.
2. **El control crítico está en las API de IA** (`/api/process-audio`, `/api/process-text`, `/api/process-live-note`), porque ahí está el costo real (OpenRouter/Groq). Si no se valida ahí, un usuario sin pago podría consumir IA gratis.
3. **RLS** aísla los datos por usuario en Postgres.
4. **No confiar en el cliente para el estado de pago:** el servidor lee `subscriptions`/`profiles` desde la base de datos.

### 4.2 Capas de gating

| Capa | Dónde | Qué valida |
|---|---|---|
| 1. Autenticación | Middleware (existe) | Hay sesión válida. Si no → `/login`. |
| 2. Suscripción (páginas) | Server components de `/app`, `/settings` | `subscription_status in ('trialing','active')`. Si no → `/billing` (paywall). |
| 3. Suscripción + uso (API de IA) | `/api/process-*` | Estado activo **y** cupo disponible. Si no → HTTP 402. |
| 4. Rol (admin) | `/admin` y sus API | `profiles.role = 'admin'`. Si no → 403. |
| 5. Datos | RLS en Postgres | Cada usuario accede solo a sus filas. |

### 4.3 Estados de suscripción y comportamiento

| Estado | Grabar/procesar | Entrar a `/app` | Entrar a `/billing`/ajustes |
|---|---|---|---|
| `trialing` (vigente) | Sí (con tope) | Sí | Sí |
| `active` | Sí | Sí | Sí |
| `past_due` (grace) | Sí (banner de aviso) | Sí | Sí |
| `past_due` (vencido) | No (402) | redirect a `/billing` | Sí |
| `canceled` / `incomplete` / `none` | No (402) | redirect a `/billing` | Sí |

### 4.4 Implementación en middleware y API

- **Helper compartido** `lib/billing/access.ts`:
  ```
  getAccessForUser(supabase, userId):
    -> { canProcess: boolean, plan, status, reason }
  ```
  Lee `profiles` (+ `subscriptions` y `usage` si aplica) y decide. Lo usan el middleware, las páginas y las API de IA → una sola fuente de lógica.

- **Middleware:** extiende el actual para, en rutas protegidas, llamar a `getAccessForUser` y redirigir a `/billing` si no hay acceso. (Cuidado: el middleware corre en Edge; la consulta a Supabase debe ser liviana.)

- **API de IA:** al inicio de cada handler, `const access = await getAccessForUser(...)`; si `!access.canProcess` → `NextResponse.json({ error, upgrade: true }, { status: 402 })`.

### 4.5 RLS

- `profiles`, `subscriptions`, `usage`, `custom_specialties`: políticas `select/insert/update` con `auth.uid() = user_id`.
- El admin usa la **service role key** (bypass de RLS) solo en endpoints server-side protegidos por rol.

---

## 5. Administración de cuentas

### 5.1 Roles y permisos

- Campo `profiles.role`: `'user'` | `'admin'` (y en B2B: roles de organización `owner/admin/member`).
- **Cómo se hace admin:** al inicio, fijar manualmente en la base de datos (`update profiles set role='admin' where user_id=...`) o una lista de emails admin en env. Después, un flujo de invitación de admins.
- Las rutas `/admin` y `/api/admin/*` verifican `role='admin'` server-side (middleware + doble check en el handler).

### 5.2 Panel admin (`/admin`) — funcionalidades

**Vista de usuarios:**
- Tabla: email, nombre, plan, estado de suscripción, fecha de registro, uso (transcripciones del período), última actividad.
- Filtros: por plan, por estado, búsqueda por email.

**Acciones por usuario:**
- **Otorgar/revocar acceso manual** (cambiar `plan`/`subscription_status`) — clave para la fase pre-pagos y para cortesías/cuentas B2B cerradas "por fuera".
- Extender trial.
- Ver detalle de suscripción y uso.
- (Con Stripe) link al Customer Portal del usuario / cancelar.

**Analítica:**
- MRR, altas/bajas, churn, distribución por plan, uso agregado.

**Gestión de planes:**
- Los planes/precios viven en Stripe (Products/Prices). El admin los ve; cambios de precio se hacen en Stripe.

### 5.3 Gestión manual de acceso (pre-pagos) — lo más valioso ahora

Antes de tener Stripe, el admin puede **otorgar acceso manualmente**:
- Poner `plan='pro'`, `subscription_status='active'` a un usuario (ej. un médico que pagó por transferencia, o una cuenta de demostración).
- Esto permite **vender y dar acceso ya**, sin esperar la integración de pagos.
- Cuando llegue Stripe, los webhooks automatizan lo que hoy hace el admin a mano.

### 5.4 B2B: organizaciones y miembros (Fase 3)

- Un **admin de organización** (rol `owner`/`admin` en `memberships`) gestiona su clínica:
  - Invitar médicos (por email) → se crean `memberships`.
  - Asignar/liberar seats.
  - Ver uso por médico.
  - Plantillas compartidas de la organización.
- Facturación centralizada: un `stripe_customer_id` por organización, cobro por `quantity` (seats).

### 5.5 Seguridad del admin

- Verificación de rol **server-side** en cada endpoint admin (no solo ocultar la UI).
- Service role key solo en servidor (nunca `NEXT_PUBLIC_*`).
- Auditar acciones sensibles (quién otorgó/revocó acceso a quién) en una tabla `admin_audit_log`.
- 2FA para admins (recomendable en producción).

---

## 6. Legal y cumplimiento (Chile)

### 6.1 Ley 19.628 — Protección de la vida privada (datos personales)

- Los datos del médico (cuenta) y cualquier dato de paciente son datos personales.
- Obligaciones: informar finalidad, obtener consentimiento, medidas de seguridad, derechos ARCO (acceso, rectificación, cancelación, oposición).
- **Minimización:** Nodal Scribe ya no almacena audio ni notas (efímero); solo metadatos de cuenta y preferencias. Mantener ese principio.

### 6.2 Ley 20.584 — Derechos y deberes del paciente

- Regula la ficha clínica y el consentimiento. Nodal Scribe es **herramienta administrativa**, no ficha clínica oficial ni dispositivo médico (SaMD) → evita clasificación ISP/FDA al no diagnosticar (ver STRATEGY.md).
- El **consentimiento del paciente** para grabar ya se pide en la UI; considerar **registrar evidencia** del consentimiento (timestamp) si se persiste algo.

### 6.3 SERNAC — Protección al consumidor (suscripciones)

- **Auto-renovación:** informar de forma clara y destacada que la suscripción se renueva automáticamente, el precio y cómo cancelar **antes** de contratar.
- Facilitar la cancelación (mismo medio o más simple que la contratación). El Customer Portal de Stripe ayuda.
- No prácticas abusivas (cobros ocultos, dificultad para cancelar).

### 6.4 SII — Documentos tributarios (boleta/factura)

- Por cada cobro corresponde emitir **boleta** (B2C) o **factura** (B2B) ante el SII.
- Stripe emite invoices, pero **no son documentos tributarios chilenos**. Integrar un proveedor de facturación electrónica: **Boleta.cl, Facturapi, Buk, o el facturador del SII (gratuito)**.
- Al inicio se puede emitir manualmente; automatizar en Fase 2–3.

### 6.5 PCI DSS — Datos de tarjeta

- **Nunca tocar datos de tarjeta.** Stripe (o Flow/Mercado Pago) maneja todo vía Checkout/hosted → la app queda fuera del alcance PCI (SAQ-A).
- No storing, no logging de PAN/CVV.

### 6.6 Términos y políticas (documentos a redactar)

- **Términos y Condiciones** del servicio y de la suscripción (planes, renovación, cancelación, reembolsos, uso aceptable).
- **Política de Privacidad** (qué datos se tratan, finalidad, encargado, derechos, contacto).
- **Política de Cookies.**
- **DPA / Anexo de tratamiento de datos** para B2B (el centro de salud es responsable, Nodal Scribe es encargado).

### 6.7 Producción clínica (cuando haya datos reales de pacientes)

- Migrar el procesamiento de IA a un proveedor con **BAA y Zero Data Retention** (Azure OpenAI) — roadmap de ARCHITECTURE.md §6.4.
- Cifrado en tránsito (TLS 1.3) y en reposo.
- Registro de consentimientos y trazabilidad (sin contenido clínico).
- Evaluar residencia de datos (servidores en Chile/región) si el cliente lo exige.

---

## 7. Roadmap por fases

### Fase 0 — Fundación: gating + administración manual (SIN pagos) ✅ **se puede hacer ahora**

**Objetivo:** controlar quién usa la app y poder otorgar acceso manualmente, sin interrumpir el flujo actual.

- [ ] Migración: columnas `role`, `plan`, `subscription_status` en `profiles` (+ `trial_ends_at`).
- [ ] Helper `getAccessForUser` (lógica de acceso centralizada).
- [ ] Gating **suave** al inicio: marcar sin bloquear (o bloquear solo a `none`, manteniendo a los usuarios actuales como `trial`/`pro` para no dejar a nadie fuera).
- [ ] Panel `/admin` (protegido por rol): listar usuarios, ver estado, **otorgar/revocar acceso manual**, extender trial.
- [ ] Sembrar al owner como `admin` y darle `plan='pro'`.
- [ ] Página `/billing` (ya existe `/pricing`; agregar un estado "tu plan actual" y, por ahora, un CTA de contacto para contratar).

**Por qué primero:** sienta las bases del gating y permite **vender con acceso manual** antes de integrar pagos. No depende de Stripe.

### Fase 1 — Pagos MVP (Stripe)

- [ ] Cuenta Stripe + Products/Prices (Pro mensual/anual).
- [ ] `/api/billing/checkout` + `/api/webhooks/stripe` (con firma + idempotencia).
- [ ] Sincronización `subscriptions`/`profiles` vía webhooks.
- [ ] Gating **duro** en `/app` y en las API de IA (402 si no hay acceso).
- [ ] Trial (con o sin tarjeta) con conversión automática.
- [ ] Página `/billing` conectada al checkout.

### Fase 2 — Autogestión y límites

- [ ] Customer Portal (`/api/billing/portal`).
- [ ] Tabla `usage` + chequeo de topes + reset por período.
- [ ] Emails transaccionales (pago fallido, fin de trial, bienvenida) con Resend/Postmark.
- [ ] Facturación SII (integración básica).

### Fase 3 — B2B

- [ ] `organizations` + `memberships` + invitaciones.
- [ ] Facturación por seats (`quantity`).
- [ ] Panel admin de organización + plantillas compartidas.
- [ ] Analítica de uso por equipo.

### Fase 4 — B2G / Enterprise

- [ ] Mercado Público / convenios.
- [ ] SSO (SAML/OIDC), SLA.
- [ ] Azure BAA/ZDR para producción clínica.
- [ ] Facturación SII automatizada + DPA.

---

## 8. Recomendaciones clave

1. **Stripe = fuente de verdad del cobro; Supabase = copia del estado para gating rápido.** Nunca llamar a Stripe en cada request de la app.
2. **El gating fuerte va en las API de IA**, no solo en la UI — ahí está el costo real.
3. **Empezar por la Fase 0** (gating + admin manual): permite vender y dar acceso sin esperar los pagos.
4. **No bloquear a los usuarios actuales** al activar el gating: sembrarlos como `trial`/`pro` para no romper el flujo.
5. **Abstraer el proveedor de pagos** (interfaz propia) por si se agrega Flow/Mercado Pago.
6. **Webhooks idempotentes y con verificación de firma** (siempre).
7. **No tocar datos de tarjeta** (PCI lo maneja el proveedor).
8. **Métricas desde el día 1** (MRR, churn, activación, uso, costo de IA por usuario).
9. **Cuidar el margen:** el costo de IA por usuario intensivo puede comerse el precio → considerar topes o precios que lo cubran.
10. **Legal chileno desde el inicio:** términos, privacidad, aviso de auto-renovación (SERNAC) y plan para boletas/facturas (SII).

---

## 9. Qué avanzar ahora (recomendación práctica)

**Sí, conviene avanzar con el panel de administración y el control de acceso (Fase 0).** No es demasiado complejo si se acota bien, y es el cimiento de todo lo demás. Lo que se puede hacer ya, sin tocar pagos ni interrumpir la app:

1. **Migración** `profiles` + `role`, `plan`, `subscription_status`, `trial_ends_at`.
2. **Helper de acceso** `getAccessForUser`.
3. **Panel `/admin`** (rol admin): listar usuarios, otorgar/revocar acceso manual, extender trial.
4. **Gating suave** (o duro solo para `plan='none'`), sembrando a los usuarios actuales como `trial`/`pro` para que nadie quede fuera.
5. Sembrar al owner como `admin`.

**Complejidad:** media (varias piezas, pero cada una es acotada). **No requiere Stripe.** Deja la app lista para que, cuando se integren los pagos (Fase 1), los webhooks solo tengan que escribir el mismo campo `plan`/`status` que el admin hoy cambia a mano.

**Lo que conviene dejar para después:** Stripe (Fase 1), Customer Portal y límites de uso (Fase 2), B2B/organizaciones (Fase 3), B2G (Fase 4).
