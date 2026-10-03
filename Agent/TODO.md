# 📋 TODO: Roadmap y Backlog Priorizado - DeusX Inmobiliaria

> Convenciones:  
> ⏳ **Pendiente** | 🚧 **En Curso** | ✅ **Completado** | 🛑 **Bloqueado**

---

## 🚀 Fase 0: Arquitectura Base y Fundaciones
- [x] Establecer rol de Tech Lead / Arquitecto y reglas fijas de diseño. ✅ (2026-10-03)
- [x] Crear estructura de memoria persistente en `/Agent/` (`INDEX.md`, `DECISIONS.md`, `TODO.md`, `SESSIONS.md`). ✅ (2026-10-03)
- [x] Definir script SQL `001_core_schema.sql` (Tenants, CRM personas, propiedades, contratos, ledger doble vía). ✅ (2026-10-03)
- [x] Definir políticas RLS para `001_core_schema.sql`. ✅ (2026-10-03)
- [x] Ejecución de `001_core_schema.sql` en Supabase SQL Editor por Mariano. ✅ (2026-10-03)
- [x] Inicializar proyecto Next.js 16+ con App Router, TypeScript estricto, Tailwind CSS 4, shadcn/ui y Lucide Icons. ✅ (2026-10-03)
- [x] Configurar clientes Supabase tipados (`client.ts`, `server.ts`, `admin.ts`). ✅ (2026-10-03)
- [x] Implementar sistema visual anti-fatiga y Hub Operativo de Contratos verificado en localhost:3000. ✅ (2026-10-03)

---

## 👥 Fase 1: CRM Unificado y Gestión de Inmuebles
- [x] Módulo Propiedades: Asistente interactivo de Nueva Propiedad con live preview y multi-titularidad con split %. ✅ (2026-10-03)
- [x] Catálogo de Propiedades con unidades funcionales y propietarios asignados con %. ✅ (2026-10-03)
- [ ] Módulo Personas: CRUD rápido con autocompletado y validación de CUIT/DNI. ⏳
- [ ] Búsqueda global tipo Spotlight / Command Palette (`Cmd+K`). ⏳

---

## 📄 Fase 2: Contratos & Motor de Indexación (Carpetas)
- [ ] Asistente de creación de contrato (Propiedad + Inquilinos + Propietarios + Garantes). ⏳
- [ ] Configuración de cláusula de ajuste (ICL, IPC, UVA, Fijo, escalonado libre post-DNU 70). ⏳
- [ ] Cron o sincronizador de índices oficiales (BCRA / INDEC). ⏳
- [ ] Hub de Contratos estilo SPOT/Deimos: Grilla con Carpeta, Barra de progreso de vencimiento, Dirección, Estado Cobranza y Liquidación. ⏳

---

## 💰 Fase 3: Motor de Cobranzas e Imputación Inquilinos
- [ ] Generación automática de períodos exigibles (`periodos_contrato`) con snapshot inmutable. ⏳
- [ ] Interfaz de cobro rápido (1 o 2 clics): Alquiler + Expensas + Servicios + Punitorios por mora. ⏳
- [ ] Soporte de pagos parciales y saldos a favor (ledger de imputaciones). ⏳
- [ ] Generador de Recibos en PDF con `jspdf` + `jspdf-autotable` (diseño limpio y profesional). ⏳
- [ ] Botón de envío directo por WhatsApp con link al recibo o texto preformateado. ⏳

---

## ⚖️ Fase 4: Liquidaciones y Rendición a Propietarios
- [ ] Bandeja de liquidaciones pendientes (fondos cobrados disponibles para rendir). ⏳
- [ ] Descuento automático de honorarios inmobiliarios (% o suma fija) y retenciones. ⏳
- [ ] Split automático de fondos para co-propietarios con cuentas bancarias independientes. ⏳
- [ ] Generador de Liquidación / Rendición de Cuentas en PDF descargable. ⏳

---

## 🛠️ Fase 5: Mantenimiento y Tickets Imputables
- [ ] Registro de averías y reparaciones con asignación a proveedores. ⏳
- [ ] Imputación financiera: ¿A cargo de propietario (deducción liquidación), inquilino (suma al recibo) o inmobiliaria? ⏳
- [ ] Cierre de ticket con comprobante adjunto y pase automático al ledger. ⏳
