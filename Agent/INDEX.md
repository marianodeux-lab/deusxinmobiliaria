# 🗺️ INDEX: Mapa Vivo del Repositorio - DeusX Inmobiliaria (PropTech ERP)

> **Estado del Sistema:** Fase 0 - Arquitectura, Diseño de Datos y Setup Inicial  
> **Última Actualización:** 2026-10-03  
> **Tech Lead / Arquitecto:** Antigravity AI  
> **Fundador & Core Dev:** Mariano  

---

## 🏗️ 1. Estructura de Directorios (Propuesta & Convenciones)

```text
/
├── Agent/                         # Memoria viva y persistente del asistente
│   ├── INDEX.md                   # Este archivo: Mapa de rutas, módulos y DB
│   ├── DECISIONS.md               # ADRs (Architectural Decision Records)
│   ├── TODO.md                    # Roadmap y backlog priorizado
│   └── SESSIONS.md                # Bitácora ultraliviana de sesiones
├── supabase/
│   └── migrations/                # Scripts SQL versionados para Supabase Editor / CLI
│       └── 001_core_schema.sql    # Schema inicial (Tenants, CRM, Contratos, Ledger)
├── src/
│   ├── app/                       # Next.js 16+ App Router
│   │   ├── (auth)/                # Rutas públicas / login / recuperación
│   │   ├── (dashboard)/           # Rutas protegidas del ERP por Tenant
│   │   │   ├── contratos/         # Gestión de contratos, vencimientos y carpetas
│   │   │   ├── cobranzas/         # Hub operativo de cobro a inquilinos y recibos
│   │   │   ├── liquidaciones/     # Hub de liquidación y pago a propietarios
│   │   │   ├── propiedades/       # CRM de inmuebles, unidades funcionales y carteles
│   │   │   ├── personas/          # CRM unificado de contactos (inquilinos/propietarios/garantes)
│   │   │   ├── mantenimiento/     # Tickets de incidencias y gastos imputables
│   │   │   ├── indices/           # Cotizaciones y series ICL / IPC / UVA / USD
│   │   │   └── configuracion/     # Parámetros del tenant, talonarios y usuarios
│   │   ├── api/                   # Route Handlers específicos (webhooks, cron jobs)
│   │   └── layout.tsx
│   ├── components/                # Componentes React
│   │   ├── ui/                    # Primitivas de shadcn/ui
│   │   ├── shared/                # Tablas de datos, filtros, modales, badges
│   │   ├── documents/             # Templates y generadores jspdf (recibos, liquidaciones)
│   │   └── layout/                # Sidebar, TopBar con cotizaciones/alertas, UserNav
│   ├── lib/
│   │   ├── supabase/              # Clientes Supabase (client, server, admin)
│   │   ├── calculations/          # Motores matemáticos: indexación ICL/IPC, punitorios, prorrateos
│   │   ├── pdf/                   # Configuración y utilitarios jspdf-autotable
│   │   └── utils.ts               # Formateadores de moneda (ARS/USD), fechas y helpers
│   ├── modules/                   # Capa de dominio (Server Actions y queries por feature)
│   │   ├── personas/
│   │   ├── propiedades/
│   │   ├── contratos/
│   │   ├── cobranzas/
│   │   ├── liquidaciones/
│   │   └── indices/
│   └── types/                     # Definiciones TypeScript generadas y tipos de dominio
│       ├── database.types.ts      # Tipos autogenerados de Supabase
│       └── domain.ts              # Modelos de dominio y DTOs
└── public/                        # Assets estáticos
```

---

## 🗄️ 2. Mapa de Base de Datos (Módulos de Negocio)

| Tabla | Dominio | Propósito | RLS |
| :--- | :--- | :--- | :---: |
| `tenants` | Multi-tenancy | Inmobiliarias o administraciones registradas | ✅ |
| `tenant_usuarios` | Auth/RBAC | Vínculo entre auth.users y un tenant (roles: admin, operador, contador) | ✅ |
| `personas` | CRM Unificado | Contactos únicos (físicos o jurídicos) con CUIT, CBU, teléfono, email | ✅ |
| `propiedades` | Inmuebles | Unidades administradas, dirección, tipo, UF, destino | ✅ |
| `contratos` | Contratos | Expedientes/carpetas de alquiler, vigencia, moneda, condiciones indexación | ✅ |
| `contrato_participantes`| CRM Polimórfico| Asocia personas a contratos con rol (`propietario`, `inquilino`, `garante`) y % | ✅ |
| `periodos_contrato` | Ledger / Devengamiento | Meses/cuotas exigibles con desglose: alquiler base, expensas, servicios, mora | ✅ |
| `cobranzas` | Vía Cobro | Registro de cobros a inquilinos (recibo oficial, medio de pago, TC USD) | ✅ |
| `cobranza_imputaciones` | Ledger | Detalle de qué ítems de qué períodos salda cada cobranza | ✅ |
| `liquidaciones` | Vía Liquidación | Pagos a propietarios: alquiler percibido - honorarios - deducciones | ✅ |
| `liquidacion_detalles` | Ledger | Desglose por concepto y split porcentual para co-propietarios | ✅ |
| `tickets_mantenimiento` | Servicios | Averías y reclamos con imputación de costo (inquilino, propietario, agencia) | ✅ |
| `indices_economicos` | Monetario | Historial de series ICL, IPC, UVA y cotizaciones USD oficiales/blue | ✅ Global |

---

## 🔗 3. Rutas y Vistas del Sistema

- `/` → Redirección inteligente al Dashboard o Login según estado de sesión.
- `/contratos` → Grilla operativa principal (estilo SPOT/Deimos): Carpetas, Vencimiento, Dirección, Estado Cobranza, Estado Liquidación.
- `/cobranzas/nueva` → Flujo rápido (1-2 clics) para imputar pago de inquilino y disparar Recibo PDF / WhatsApp.
- `/liquidaciones/pendientes` → Bandeja de fondos recaudados listos para rendir a propietarios con cálculo de honorarios automático.
- `/mantenimiento` → Tablero Kanban o listado de averías con asignación a proveedores e imputación de gastos.
