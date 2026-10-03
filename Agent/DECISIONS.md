# 🧠 DECISIONS: Architectural Decision Records (ADR) - DeusX Inmobiliaria

Este archivo documenta las decisiones técnicas y de arquitectura tomadas, sus fundamentos, ventajas, desventajas y alternativas descartadas.

---

### ADR-001: Multi-tenancy vía PostgreSQL Row Level Security (RLS) y Supabase Client Nativo
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** Plataforma SaaS B2B donde múltiples inmobiliarias procesan datos contables y personales sensibles (DNI, CUIT, CBU, ingresos, contratos).
- **Decisión:**
  - Todas las tablas de datos de negocio contienen la columna `tenant_id uuid references tenants(id)`.
  - La verificación de seguridad reside en la base de datos mediante políticas RLS estrictas evaluando `auth.uid()` contra `tenant_usuarios`.
  - Se descartan ORMs intermedios (Prisma, Drizzle). Usaremos el SDK oficial `@supabase/supabase-js` con tipos autogenerados de TypeScript (`supabase gen types typescript`).
- **Alternativas descartadas:**
  - *Esquemas separados por tenant (Schema-per-tenant):* Sobrecarga operativa de migraciones complejas con cientos de inmobiliarias.
  - *Prisma ORM:* Agrega overhead de bundle, no aprovecha fluidamente los features nativos de RLS de Supabase y ralentiza Server Actions en Edge/Serverless.
- **Consecuencias:**
  - *Positivas:* Seguridad a nivel motor de base de datos; imposible fugar datos entre tenants aunque un desarrollador olvide filtrar en la query. Tipado 100% fiel al motor PostgreSQL.
  - *Atención requerida:* En Server Actions con Service Role (`createAdminClient`), toda query DEBE filtrar explícitamente por `tenant_id` ya que el Service Role bypasea RLS.

---

### ADR-002: CRM Polimórfico Unificado (`personas` + `contrato_participantes`)
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** En el mercado inmobiliario real, una persona física o jurídica puede asumir múltiples roles simultáneos: ser inquilino en una vivienda y propietario de 3 locales en la misma administración, o ser garante de su hijo.
- **Decisión:**
  - Se crea una única tabla `personas` por tenant con atributos de identidad (DNI/CUIT, nombre, teléfono, email, datos bancarios CBU/Alias).
  - La relación de una persona con un contrato o propiedad se define exclusivamente en la tabla relacional `contrato_participantes` mediante el atributo `rol: 'propietario' | 'inquilino' | 'garante'`.
- **Alternativas descartadas:**
  - *Tablas separadas (`propietarios`, `inquilinos`, `garantes`):* Modelo clásico y obsoleto que duplica datos, rompe la sincronización telefónica/bancaria y confunde al usuario en la búsqueda de contactos.
- **Consecuencias:**
  - Búsquedas de personas unificadas, actualización de teléfono o email en un solo lugar y soporte nativo para co-titularidad con splits porcentuales (`porcentaje_participacion numeric default 100`).

---

### ADR-003: Motor Financiero Desacoplado de Doble Vía (Devengamiento, Cobro y Liquidación)
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** El error más grave de los sistemas inmobiliarios tradicionales es colocar un flag `pagado: boolean` en una cuota mensual. En Argentina, la cobranza al inquilino y la liquidación al propietario son eventos independientes en tiempo, montos, deducciones y medios de pago.
- **Decisión:**
  - **Devengamiento (`periodos_contrato`):** Se genera la obligación mensual exigible (Alquiler, Expensas, ABL/Tasa, Seguro, etc.).
  - **Cobranza Inquilino (`cobranzas` + `cobranza_imputaciones`):** Registra el ingreso de dinero del inquilino (efectivo, transferencia, depósito, débito) con número de recibo oficial y fecha real de cobro. Permite pagos parciales, adelantos y saldos a favor.
  - **Liquidación Propietario (`liquidaciones` + `liquidacion_detalles`):** Registra la rendición de cuentas al/los propietario/s: importe percibido menos comisión/honorarios inmobiliarios, menos retenciones impositivas, menos gastos de reparaciones imputadas.
- **Consecuencias:**
  - Cero inconsistencias contables ante pagos parciales o mora acumulada.
  - Soporte nativo para rendirle al propietario sólo cuando el inquilino haya pagado efectivamente (o rendición garantizada si la inmobiliaria ofrece garantía de pago).

---

### ADR-004: Inmutabilidad de Períodos Devengados (Snapshot) vs. Series de Índices
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** Con el DNU 70/2023, conviven contratos con actualizaciones mensuales, trimestrales o semestrales bajo índices oficiales (ICL, IPC, Casa Propia, UVA) o valores fijos. Si el INDEC o el BCRA corrigen una serie histórica, no se deben alterar retroactivamente recibos ya emitidos.
- **Decisión:**
  - La tabla `indices_economicos` guarda los valores oficiales de las series.
  - Al devengar o emitir un período de alquiler (`periodos_contrato`), el valor resultante del alquiler y el coeficiente utilizado se guardan como **snapshot inmutable** en el registro del período.
- **Consecuencias:**
  - Auditoría financiera perfecta. Los reportes pasados jamás cambian.

---

### ADR-005: Bimonetarismo Nativo con Registro de Tipo de Cambio en la Transacción
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** Alquileres comerciales o residenciales temporarios pactados en USD donde el inquilino a menudo abona en pesos argentinos (ARS) al tipo de cambio acordado (MEP, Blue, Oficial).
- **Decisión:**
  - El contrato define su `moneda_base` ('ARS' | 'USD').
  - Cada transacción de `cobranzas` y `liquidaciones` registra: `moneda_pago`, `monto_pago`, `tipo_cambio_aplicado` y `monto_equivalente_moneda_base`.
- **Consecuencias:**
  - Permite cerrar arqueos de caja en billetes USD físicos y pesos simultáneamente sin distorsionar el saldo del contrato.

---

### ADR-006: Sistema de Diseño Anti-Fatiga Visual (Slate/Zinc + Pasteles Semánticos)
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** Los operadores y empleados inmobiliarios pasan entre 6 y 9 horas consecutivas frente a pantallas cargando contratos, recibos y liquidaciones. Los fondos blancos puros (`#ffffff`) causan deslumbramiento y fatiga ocular severa, mientras que los contrastes extremos o colores chillones generan rechazo y errores visuales en cifras numéricas.
- **Decisión:**
  - **Estilo Clean Canvas:** Lateral en Gris Claro Cálido (Slate #f8fafc / #f1f5f9) que unifica la pantalla como un solo lienzo aireado, eliminando la sensación pesada y encajonada de las barras oscuras.
  - **Acento Primario Oficial (Teal / Verde Petróleo #26A69A):** Seleccionado por psicología del color (estabilidad financiera, patrimonio, calma y balance). Se utiliza en ítems activos (`#e0f2f1`), botones de acción clave y métricas.
  - **Fondo de Pantalla:** Celeste Pastel Suave / Ice Mint (`#edf6f7`), inspirado en los tonos `#E0F2F1` y `#E0F7FA` de la paleta oficial, libre de deslumbramiento y fatiga visual.
  - **Acento de Marca DeusX:** Incorporación del logo oficial con la "X" escarlata/roja (`#e51a2d`) y gris grafito (`#4a4a4a`) en cápsula oscura de alto contraste.
  - **Tipografía y Legibilidad de Datos:**
    - Fuente tipográfica moderna y nítida (`Geist`).
    - Tabular figures obligatorias para números y monedas (`font-mono tabular-nums`) para evitar bailes de caracteres en columnas contables.
- **Consecuencias:**
  - Interfaz sumamente relajada a la vista pero de alto contraste WCAG AA, que permite jornadas laborales prolongadas sin fatiga ocular.

---

### ADR-007: Vidriera Online Pública Multi-tenant y Soporte de Dominios NIC.ar (Custom Domains)
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** Cada inmobiliaria necesita publicar sus propiedades disponibles (venta, alquiler permanente, temporario) en su propia página web. Requieren: 
  1) Un enlace automático por defecto dentro de la plataforma (ej: `app.deusxinmobiliarias.com/p/inmobiliaria-deus` o `inmobiliaria-deus.deusx.com.ar`).
  2) La posibilidad de conectar su propio dominio de NIC.ar (ej: `www.deusinmobiliaria.com.ar`) mediante CNAME.
- **Decisión:**
  - **Enrutamiento por Middleware de Next.js:** Inspección del header `Host` en `middleware.ts`. Si la petición proviene de un dominio personalizado o subdominio, se reescribe internamente hacia la ruta pública `/portal/[tenant_slug]`.
  - **Infraestructura Vercel Domains API:** Automatización del registro del CNAME y aprovisionamiento de certificados SSL automáticos de Let's Encrypt para los dominios de NIC.ar.
  - **Aislamiento de Datos Públicos:** Las propiedades poseen una columna `publicar_en_vidriera: boolean` y `precio_publicacion_visible: boolean`. La consulta de la vidriera pública no expone datos sensibles de propietarios (DNI, CBU, honorarios de administración) y corre con caché ISR (Incremental Static Regeneration) para velocidad instantánea y SEO para Google / WhatsApp Cards (Open Graph).
- **Consecuencias:**
  - Escalabilidad infinita: 1 sola instancia de Next.js sirve los sitios web de cientos de inmobiliarias sin desplegar sitios separados.
  - Gran valor comercial: permite ofrecer un tier "Pro" con dominio propio (`.com.ar`).

---

### ADR-008: Red MLS Colaborativa Inter-Inmobiliarias (Propiedades Compartidas y Reverse Matching)
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** Las inmobiliarias suelen perder operaciones por falta de inventario propio para un cliente demandante, o propiedades estancadas por falta de compradores. Se descarta el concepto "Marketplace" B2C para adoptar el estándar profesional internacional MLS (Multiple Listing Service).
- **Decisión:**
  - **Propiedades Compartidas (Co-brokering):** Atributo opcional `compartir_en_red_mls: boolean` y `comision_compartida_porcentaje: numeric` (por defecto 50%). Los colegas de la red pueden consultar el catálogo compartido y generar fichas neutras o coordinar visitas.
  - **Búsquedas Activas (Reverse Matching):** Tabla `mls_busquedas_activas` donde una inmobiliaria publica una demanda insatisfecha. Un motor de matching en tiempo real sugiere coincidencias con inmuebles de otros tenants de la zona.
- **Consecuencias:**
  - Creación de un fuerte *Network Effect*: cuanto más crece la red de DeusX Inmobiliarias, mayor valor percibe cada suscriptor y menor es la tasa de cancelación (churn).

---

### ADR-009: Panel SuperAdmin de Gobierno y Licencias SaaS (Patrón Deus Gestión)
- **Fecha:** 2026-10-03
- **Estado:** Aceptado
- **Contexto:** Mariano requiere gobernar de forma centralizada todas las licencias de inmobiliarias, planes de suscripción, facturación de cuotas, márgenes netos y consumos de infraestructura de nube (PostgreSQL, Storage, Vercel).
- **Decisión:**
  - Se implementa el módulo `/superadmin` protegido por rol de sistema (`role: 'superadmin'`).
  - Reutilización del exitoso modelo de gestión financiera y de cuotas de Deus Gestión: Dashboard de MRR/ARR, matriz de planes (Estándar, Pro, Enterprise), control de estados de cuenta (Vigente, Prueba, Vencido, Suspendido) y métricas de cuotas de nube.
- **Consecuencias:**
  - Control total del negocio SaaS desde un único panel administrativo. Operaciones de congelamiento o reactivación de licencias en un clic.
