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
- [x] Catálogo de Propiedades con unidades funcionales, ocupación y vidriera web. ✅ (2026-10-03)
- [x] Módulo Personas: Directorio CRM unificado (propietarios, inquilinos, garantes, proveedores) con legajo digital y WhatsApp directo. ✅ (2026-10-03)
- [ ] Búsqueda global tipo Spotlight / Command Palette (`Cmd+K`). ⏳

---

## 📄 Fase 2: Contratos & Motor de Indexación (Carpetas)
- [x] Hub de Contratos estilo SPOT/Deimos: Grilla con Carpeta, Barra de progreso de vencimiento, Dirección, Estado Cobranza y Liquidación. ✅ (2026-10-03)
- [x] Configuración de cláusula de ajuste (ICL, IPC, UVA, Fijo, escalonado libre post-DNU 70). ✅ (2026-10-03)
- [ ] Cron o sincronizador automático de índices oficiales (BCRA / INDEC). ⏳

---

## 💰 Fase 3: Motor de Cobranzas e Imputación Inquilinos
- [x] Generación de períodos exigibles con cálculo de mora automático (0.1% diario). ✅ (2026-10-03)
- [x] Cobranzas Hub: Modal de cobro con desglose, comprobante Recibo X AFIP (RG 4004-E). ✅ (2026-10-03)
- [x] Enlace directo de notificación y recibo por WhatsApp. ✅ (2026-10-03)

---

## ⚖️ Fase 4: Liquidaciones y Rendición a Propietarios
- [x] Bandeja de liquidaciones con balance disponible de cobros de alquiler. ✅ (2026-10-03)
- [x] Deducción automática de honorarios profesionales de inmobiliaria (4.13% - 5%). ✅ (2026-10-03)
- [x] Generador de Liquidación / Rendición oficial con comprobante imprimible y botón de transferencia. ✅ (2026-10-03)

---

## 🛠️ Fase 5: Mantenimiento y Tickets Imputables
- [x] Registro y gestión operativa de tickets de mantenimiento con asignación a gremios/técnicos. ✅ (2026-10-03)
- [x] Imputación financiera precisa: Deduce al Propietario en Rendición, Cobra al Inquilino, Inmobiliaria o 50% Compartido. ✅ (2026-10-03)
- [x] Tablero Kanban interactivo (Abierto, Presupuestado, En Curso, Completado) + Lista Detallada + WhatsApp directo. ✅ (2026-10-03)

---

## 🌴 Fase 6: Alquileres Temporarios & Vacacionales
- [x] Módulo Alquileres Temporarios (`/temporarios`): Reservas por noche (USD y ARS), calendario de disponibilidad y matriz de ocupación. ✅ (2026-10-03)
- [x] Housekeeping Board: Control de limpieza de unidades (Limpio, Sucio post check-out, En limpieza, Inspeccionado). ✅ (2026-10-03)
- [x] Generador de Voucher de Estadía con código PIN de cerradura electrónica y envío por WhatsApp. ✅ (2026-10-03)

---

## 🏢 Fase 7: Consorcios & Liquidación de Expensas
- [x] Hub de Consorcios & Expensas (`/consorcios`): Desglose automático de Expensas Ordinarias (Inquilino) y Extraordinarias / Fondo de Reserva (Propietario). ✅ (2026-10-04)
- [x] Directorio de Edificios/Consorcios con CUIT, datos de Administración y cuentas bancarias (CBU / Alias). ✅ (2026-10-04)
- [x] Envío de comprobantes y avisos de vencimiento por WhatsApp con cálculo de 1er y 2do vencimiento con recargo. ✅ (2026-10-04)

---

## 📈 Fase 8: Índices Económicos & Motor de Indexación
- [x] Hub de Índices Oficiales (`/indices`): Series históricas de ICL (BCRA), IPC (INDEC), UVA y cotizaciones USD Oficial/Blue. ✅ (2026-10-04)
- [x] Calculadora de Indexación: Coeficiente multiplicador, variación %, nuevo valor locativo y notificación preformateada. ✅ (2026-10-04)
- [x] Aplicador de ajuste en 1 clic a contratos y devengamientos exigibles en `/cobranzas`. ✅ (2026-10-04)

---

## 💵 Fase 9: Facturación AFIP / ARCA & Caja Diaria
- [x] Hub de Facturación & Caja (`/caja`): Libro diario de arqueo de tesorería (Efectivo ARS, Transferencias y Dólares físicos). ✅ (2026-10-04)
- [x] Emisión de Facturas Electrónicas AFIP con asignación de CAE de 14 dígitos, vencimiento y Punto de Venta 0004. ✅ (2026-10-04)
- [x] Generador de Comprobante Fiscal Oficial con código QR RG 4291/2018 verificable ante ARCA/AFIP y envío por WhatsApp. ✅ (2026-10-04)

---

## 📊 Fase 10: Reportes Financieros & Rendición Anual
- [x] Hub de Reportes (`/reportes`): Balance mensual consolidado (cobranzas brutas, honorarios, gastos y neto rendido). ✅ (2026-10-04)
- [x] Informe impositivo anual para propietarios: Certificado de retenciones y detalle de ingresos locativos para contadores (Ganancias/Bienes Personales). ✅ (2026-10-04)
- [x] Exportador directo a Excel / CSV con formato universal compatible con sistemas contables. ✅ (2026-10-04)

---

## ⚙️ Fase 11: Configuración del Tenant & Parámetros Operativos
- [x] Hub de Configuración (`/configuracion`): Gestión de hasta 10 emisores AFIP, CUIT, matrículas de martillero y certificados digitales. ✅ (2026-10-04)
- [x] Links rápidos a portales de servicios públicos para consulta de deudas (CEYS, ABSA, Camuzzi, Municipalidad, ARBA). ✅ (2026-10-04)
- [x] Memos masivos en recibos para inquilinos y propietarios, alertas de incremento y parámetros de mora diaria. ✅ (2026-10-04)




