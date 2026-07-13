# Informe Estratégico: Proyecto Nodal Scribe

**Autor:** Juan Ignacio Larraín  
**Fecha:** Julio 2026  
**Contexto de Mercado:** Sistema de Salud (Chile)

---

## 1. Definición del Problema

La práctica clínica actual enfrenta una crisis de sobrecarga administrativa. Los médicos dedican una proporción insostenible de su tiempo a la redacción de notas en la Ficha Clínica Electrónica (FCE), lo que genera un impacto negativo bidireccional:

*   **Deshumanización de la Atención:** El tiempo dedicado a teclear frente a una pantalla reduce drásticamente el contacto visual y la escucha activa, deteriorando la relación médico-paciente. Esto es especialmente crítico en el sistema público chileno, donde las consultas tienen bloques estrictos de 15 minutos.
*   **Burnout y Fatiga Clínica:** Los profesionales se ven obligados a extender sus jornadas laborales únicamente para completar el papeleo pendiente.
*   **Subregistro de Información:** Por la presión de tiempo, los historiales médicos suelen quedar incompletos o mal estructurados, afectando la continuidad del cuidado médico.

---

## 2. La Solución Propuesta (Nodal Scribe)

La solución es **Nodal Scribe**, un *Ambient AI Medical Scribe* (Escriba Médico Ambiental). Se trata de una plataforma digital independiente (SaaS) que escucha pasivamente la consulta médica, transcribe la interacción y estructura automáticamente una nota clínica lista para ser copiada a la Ficha Clínica Electrónica oficial del centro de salud.

### 2.1. Naturaleza del Producto (Alcance Estricto)
Nodal Scribe actúa como un **secretario administrativo, no como un diagnosticador**. 
*   **Regla de Cero Invención:** El sistema tiene prohibido deducir, asumir o inventar información médica. Si un dato no se menciona explícitamente en el audio, se omite.
*   **Blindaje Regulatorio:** Al limitarse a transcribir y ordenar información (y no diagnosticar de forma autónoma), el software evita ser clasificado como un Dispositivo Médico (SaMD) por entidades como el Instituto de Salud Pública (ISP) o la FDA, reduciendo drásticamente las barreras de entrada.

### 2.2. Por qué Software y no Hardware Dedicado
Inicialmente se evaluó la creación de un dispositivo físico dedicado. Sin embargo, fue descartado para el Producto Mínimo Viable (MVP) debido a limitaciones de arquitectura a bajo nivel: la carga de modelos de lenguaje locales exige un ancho de banda de memoria (RAM) y una disipación térmica que son físicamente incompatibles con dispositivos diminutos o portátiles cerrados. 

El enfoque será 100% digital (web/móvil), utilizando los dispositivos que el médico ya posee, eliminando el costo de fabricación (Capex) y la fricción burocrática de ingresar hardware externo a redes hospitalarias.

### 2.3. Personalización del Usuario
El sistema se adaptará a las necesidades de cada médico mediante perfiles dinámicos:
*   **Instrucciones Personalizadas:** El usuario podrá definir reglas de redacción (ej. viñetas, uso de siglas, terminología preferida).
*   **Plantillas por Especialidad:** Soporte para formatos estandarizados como SOAP (Subjetivo, Objetivo, Análisis, Plan) o notas narrativas para psiquiatría.
*   **Edición Humana Obligatoria:** La interfaz exigirá que el médico revise y modifique el borrador estructurado antes de validarlo y copiarlo al sistema final.

---

## 3. Modelo de Negocio e Implicancias

El mercado de fichas clínicas en Chile está altamente fragmentado (sistemas cerrados en clínicas privadas vs. sistemas diversos en atención primaria y hospitales públicos). 

*   **Estrategia de Inserción (Standalone):** En lugar de intentar integraciones complejas (vía API) con cada proveedor de software clínico, Nodal Scribe funcionará en paralelo. El médico genera la nota en nuestra plataforma y utiliza un flujo de "Copiar y Pegar" hacia su sistema oficial.
*   **Canal B2C (Bottom-Up):** Comercialización inicial mediante suscripciones mensuales directas al médico particular (SaaS). El médico paga de su bolsillo para recuperar su tiempo libre.
*   **Canal B2B (Top-Down):** Venta de licencias corporativas a clínicas o consultorios, ofreciendo una estandarización en la calidad de los registros médicos de la institución.

---

## 4. Seguridad y Privacidad (El Alma del Proyecto)

El manejo de datos médicos es el riesgo más alto del proyecto. La arquitectura se diseñó en torno a la confianza institucional y el cumplimiento de la **Ley 20.584 (Derechos y Deberes del Paciente)** y estándares internacionales como **HIPAA**.

### 4.1. Arquitectura de Procesamiento Cloud Enterprise
El procesamiento del audio no se realizará en servidores propios ni con APIs públicas, sino a través de contratos corporativos (*Enterprise*) con grandes proveedores de infraestructura en la nube (como Microsoft Azure o AWS).

### 4.2. Política de Retención Cero (Zero Data Retention)
El pilar de seguridad de Nodal Scribe se basa en la eliminación inmediata y garantizada de los datos:
1. El audio capturado se transmite de forma encriptada al servidor.
2. Se procesa exclusivamente en la memoria volátil del servidor (RAM).
3. Una vez devuelto el texto estructurado, **el archivo de audio se destruye inmediatamente**.
4. Ni el audio ni las transcripciones se utilizarán jamás para entrenar o mejorar modelos de inteligencia artificial de terceros. 

### 4.3. Aislamiento de Datos
Los pacientes no son identificados en el sistema con datos personales como RUT o nombre completo, actuando el sistema únicamente sobre el contenido clínico verbalizado, asegurando un anonimato efectivo desde la captura.