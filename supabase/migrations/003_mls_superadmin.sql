-- ==============================================================================
-- DeusX Inmobiliarias - Migración 003: Red MLS Colaborativa & Control SuperAdmin SaaS
-- ==============================================================================

-- 1. Control de Licencias y Planes SaaS en tenants (SuperAdmin DeusX)
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS plan_saas text DEFAULT 'pro' CHECK (plan_saas IN ('starter', 'pro', 'enterprise')),
  ADD COLUMN IF NOT EXISTS estado_licencia text DEFAULT 'activa' CHECK (estado_licencia IN ('prueba', 'activa', 'vencida', 'suspendida')),
  ADD COLUMN IF NOT EXISTS fecha_vencimiento_licencia date DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  ADD COLUMN IF NOT EXISTS precio_suscripcion_mensual numeric(12,2) DEFAULT 75000.00,
  ADD COLUMN IF NOT EXISTS limite_propiedades integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS limite_usuarios integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS espacio_disco_mb integer DEFAULT 1024;

-- 2. Propiedades Compartidas en Red MLS
ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS compartir_red_mls boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS comision_compartida_porcentaje numeric(5,2) DEFAULT 50.00;

-- 3. Tabla de Búsquedas Activas de la Red MLS (Demand Pool / Reverse Matching)
CREATE TABLE IF NOT EXISTS public.mls_busquedas_activas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    tipo_operacion VARCHAR(30) NOT NULL CHECK (tipo_operacion IN ('alquiler', 'venta', 'temporal')),
    tipo_inmueble VARCHAR(50) NOT NULL, -- 'departamento', 'casa', 'local', 'terreno', etc.
    localidad VARCHAR(100) NOT NULL,
    zona_barrio VARCHAR(100),
    precio_maximo NUMERIC(15,2),
    moneda VARCHAR(10) NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
    dormitorios_min INT DEFAULT 1,
    requiere_cochera BOOLEAN DEFAULT false,
    descripcion_demanda TEXT NOT NULL,
    contacto_nombre VARCHAR(100) NOT NULL,
    contacto_telefono VARCHAR(50),
    contacto_email VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'concretada')),
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    actualizado_al TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para matching en tiempo real
CREATE INDEX IF NOT EXISTS idx_mls_busquedas_tenant ON public.mls_busquedas_activas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mls_busquedas_filtros ON public.mls_busquedas_activas(tipo_operacion, tipo_inmueble, localidad, estado);
CREATE INDEX IF NOT EXISTS idx_propiedades_mls ON public.propiedades(compartir_red_mls) WHERE compartir_red_mls = true;
