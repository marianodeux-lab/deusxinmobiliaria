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
  - **Paleta Neutra Base:** Escala de grises Slate/Zinc cálidos (`bg-slate-50` o `bg-zinc-100` en modo claro con tarjetas en blanco roto o zinc-50; modo oscuro en `zinc-900` / `slate-950`).
  - **Acentos Semánticos en Tonos Pasteles Muted:**
    - Verde Salvia suave (`emerald-100` / `emerald-700` text): Al día / Cobrado / Vigente.
    - Ámbar Cálido suave (`amber-100` / `amber-800` text): Próximo a vencer / Pendiente de cobro / En revisión.
    - Rosa Terracota / Coral apagado (`rose-100` / `rose-800` text): Vencido / Mora / Reclamo urgente.
    - Azul Pizarra suave (`sky-100` / `slate-700` text): Carpetas / Expedientes / Información general.
  - **Tipografía y Legibilidad de Datos:**
    - Fuente tipográfica moderna y nítida (`Geist` o `Inter`).
    - Tabular figures obligatorias para números y monedas (`font-mono tabular-nums`) para evitar bailes de caracteres en columnas contables.
- **Consecuencias:**
  - Interfaz sumamente relajada a la vista pero de alto contraste WCAG AA, que permite jornadas laborales prolongadas sin fatiga ocular.
