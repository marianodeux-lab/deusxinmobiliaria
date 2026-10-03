-- ==============================================================================
-- DeusX Inmobiliarias - Migración 002: Vidriera Online Pública & Dominios Personalizados (NIC.ar)
-- ==============================================================================

-- 1. Campos de Vidriera Online y Dominio Personalizado en tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE,
  ADD COLUMN IF NOT EXISTS custom_domain_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_consultas text,
  ADD COLUMN IF NOT EXISTS telefono_fijo text,
  ADD COLUMN IF NOT EXISTS email_contacto text,
  ADD COLUMN IF NOT EXISTS direccion_publica text,
  ADD COLUMN IF NOT EXISTS color_marca text DEFAULT '#004d40',
  ADD COLUMN IF NOT EXISTS logo_publico_url text,
  ADD COLUMN IF NOT EXISTS matricula_profesional text;

-- 2. Campos de Publicación Web y Características en propiedades
ALTER TABLE public.propiedades
  ADD COLUMN IF NOT EXISTS ambientes integer DEFAULT 2,
  ADD COLUMN IF NOT EXISTS dormitorios integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS banios integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cocheras integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS superficie_total numeric(10,2),
  ADD COLUMN IF NOT EXISTS expensas_estimadas numeric(12,2),
  ADD COLUMN IF NOT EXISTS publicar_en_vidriera boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS operacion_web text CHECK (operacion_web IN ('alquiler', 'venta', 'temporal')) DEFAULT 'alquiler',
  ADD COLUMN IF NOT EXISTS moneda_web text CHECK (moneda_web IN ('ARS', 'USD')) DEFAULT 'ARS',
  ADD COLUMN IF NOT EXISTS precio_web numeric(14,2),
  ADD COLUMN IF NOT EXISTS mostrar_precio_web boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS destacada_web boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS titulo_web text,
  ADD COLUMN IF NOT EXISTS descripcion_web text,
  ADD COLUMN IF NOT EXISTS fotos_web jsonb DEFAULT '[]'::jsonb;

-- 3. Honorario de administración por propietario en contrato_participantes (o relación de co-titularidad)
ALTER TABLE public.contrato_participantes
  ADD COLUMN IF NOT EXISTS honorario_porcentual_administracion numeric(5,2) DEFAULT 8.00;

-- 4. Índice para búsquedas veloces por dominio personalizado (Edge Routing Next.js Middleware)
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON public.tenants(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_propiedades_vidriera ON public.propiedades(tenant_id, publicar_en_vidriera) WHERE publicar_en_vidriera = true;
