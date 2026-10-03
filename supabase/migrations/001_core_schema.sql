-- ==============================================================================
-- MIGRACIÓN 001: ESQUEMA NÚCLEO, CRM POLIMÓRFICO, CONTRATOS, LEDGER Y RLS
-- Proyecto: DeusX Inmobiliaria (PropTech SaaS ERP)
-- Fecha: 2026-10-03
-- ==============================================================================

-- 1. EXTENSIONES BÁSICAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. FUNCIÓN DE AUDITORÍA: actualizado_al AUTOMÁTICO
CREATE OR REPLACE FUNCTION actualizar_timestamp_actualizado_al()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_al = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. TENANTS Y SEGURIDAD MULTI-TENANT (RBAC)
-- ==============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_fantasia VARCHAR(150) NOT NULL,
    razon_social VARCHAR(150),
    cuit VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    configuracion JSONB DEFAULT '{
        "moneda_defecto": "ARS",
        "dias_gracia_mora": 10,
        "tasa_mora_diaria": 0.10,
        "porcentaje_honorarios_defecto": 4.13
    }'::jsonb,
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    actualizado_al TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_tenants_actualizado_al
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_actualizado_al();

CREATE TABLE tenant_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL, -- auth.users(id) de Supabase
    rol VARCHAR(50) NOT NULL DEFAULT 'operador' CHECK (rol IN ('owner', 'admin', 'operador', 'contador')),
    activo BOOLEAN DEFAULT true,
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, usuario_id)
);

CREATE INDEX idx_tenant_usuarios_lookup ON tenant_usuarios(usuario_id, tenant_id) WHERE activo = true;

-- ==============================================================================
-- 4. FUNCIONES HELPER PARA POLÍTICAS RLS (Seguras y de alto rendimiento)
-- ==============================================================================

-- Retorna los IDs de tenants a los que pertenece el usuario autenticado
CREATE OR REPLACE FUNCTION get_auth_tenant_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM tenant_usuarios 
  WHERE usuario_id = auth.uid() AND activo = true;
$$;

-- Verifica pertenencia a un tenant específico sin bucles infinitos
CREATE OR REPLACE FUNCTION is_tenant_member(lookup_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_usuarios
    WHERE tenant_id = lookup_tenant_id
      AND usuario_id = auth.uid()
      AND activo = true
  );
$$;

-- ==============================================================================
-- 5. CRM UNIFICADO: PERSONAS (Físicas o Jurídicas)
-- ==============================================================================

CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tipo_persona VARCHAR(10) NOT NULL DEFAULT 'fisica' CHECK (tipo_persona IN ('fisica', 'juridica')),
    nombre_completo VARCHAR(200) NOT NULL,
    documento_tipo VARCHAR(10) NOT NULL DEFAULT 'DNI' CHECK (documento_tipo IN ('DNI', 'CUIT', 'CUIL', 'PASAPORTE')),
    documento_numero VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(50),
    telefono_secundario VARCHAR(50),
    direccion VARCHAR(255),
    cbu_alias VARCHAR(100),
    banco_nombre VARCHAR(100),
    notas TEXT,
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    actualizado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, documento_tipo, documento_numero)
);

CREATE INDEX idx_personas_tenant ON personas(tenant_id);
CREATE INDEX idx_personas_busqueda ON personas(tenant_id, nombre_completo);
CREATE INDEX idx_personas_doc ON personas(tenant_id, documento_numero);

CREATE TRIGGER trg_personas_actualizado_al
BEFORE UPDATE ON personas
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_actualizado_al();

-- ==============================================================================
-- 6. PROPIEDADES (Inmuebles & Unidades Funcionales)
-- ==============================================================================

CREATE TABLE propiedades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo_interno VARCHAR(50),
    direccion_calle VARCHAR(150) NOT NULL,
    direccion_numero VARCHAR(20) NOT NULL,
    piso_dpto VARCHAR(30),
    unidad_funcional VARCHAR(50),
    codigo_postal VARCHAR(20),
    localidad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL DEFAULT 'Buenos Aires',
    tipo_inmueble VARCHAR(50) NOT NULL, -- 'departamento', 'casa', 'local', 'oficina', 'cochera', 'galpon', 'terreno'
    destino VARCHAR(50) NOT NULL DEFAULT 'vivienda' CHECK (destino IN ('vivienda', 'comercial', 'temporal', 'industrial')),
    nomenclatura_catastral VARCHAR(100),
    partida_inmobiliaria VARCHAR(100),
    notas TEXT,
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    actualizado_al TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_propiedades_tenant ON propiedades(tenant_id);
CREATE INDEX idx_propiedades_direccion ON propiedades(tenant_id, direccion_calle, direccion_numero);

CREATE TRIGGER trg_propiedades_actualizado_al
BEFORE UPDATE ON propiedades
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_actualizado_al();

-- ==============================================================================
-- 7. CONTRATOS (Expedientes / Carpetas)
-- ==============================================================================

CREATE TABLE contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    carpeta_numero VARCHAR(50) NOT NULL, -- Identificador visible y operativo para el corredor (ej: '3', '104')
    propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE RESTRICT,
    estado VARCHAR(30) NOT NULL DEFAULT 'vigente' CHECK (estado IN ('borrador', 'vigente', 'finalizado', 'rescindido')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dia_vencimiento_pago INT NOT NULL DEFAULT 10 CHECK (dia_vencimiento_pago BETWEEN 1 AND 28),
    moneda_base VARCHAR(10) NOT NULL DEFAULT 'ARS' CHECK (moneda_base IN ('ARS', 'USD')),
    
    -- Condiciones de indexación (Post DNU 70/2023)
    tipo_ajuste VARCHAR(30) NOT NULL DEFAULT 'ICL' CHECK (tipo_ajuste IN ('ICL', 'IPC', 'UVA', 'CASA_PROPIA', 'FIJO', 'ESCALONADO')),
    frecuencia_ajuste_meses INT NOT NULL DEFAULT 3, -- trimestral, cuatrimestral, semestral, etc.
    valor_alquiler_inicial NUMERIC(15,2) NOT NULL,
    valor_alquiler_actual NUMERIC(15,2) NOT NULL,
    valor_indice_base NUMERIC(15,4),
    fecha_ultimo_ajuste DATE,
    
    -- Parámetros de cobro y liquidación
    porcentaje_honorarios_inmobiliaria NUMERIC(5,2) NOT NULL DEFAULT 4.13,
    aplica_punitorios BOOLEAN DEFAULT true,
    tasa_punitorio_diario NUMERIC(5,3) DEFAULT 0.100, -- 0.1% diario por mora
    
    notas TEXT,
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    actualizado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, carpeta_numero)
);

CREATE INDEX idx_contratos_tenant ON contratos(tenant_id);
CREATE INDEX idx_contratos_carpeta ON contratos(tenant_id, carpeta_numero);
CREATE INDEX idx_contratos_estado ON contratos(tenant_id, estado);
CREATE INDEX idx_contratos_vence ON contratos(tenant_id, fecha_fin);

CREATE TRIGGER trg_contratos_actualizado_al
BEFORE UPDATE ON contratos
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_actualizado_al();

-- ==============================================================================
-- 8. CONTRATO_PARTICIPANTES: MULTI-ROL Y CO-PROPIETARIOS CON SPLITS
-- ==============================================================================

CREATE TABLE contrato_participantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('propietario', 'inquilino', 'garante')),
    porcentaje_participacion NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    es_firmante BOOLEAN NOT NULL DEFAULT true,
    recibe_liquidacion BOOLEAN NOT NULL DEFAULT true,
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contrato_id, persona_id, rol)
);

CREATE INDEX idx_contrato_part_contrato ON contrato_participantes(contrato_id);
CREATE INDEX idx_contrato_part_persona ON contrato_participantes(persona_id);

-- ==============================================================================
-- 9. PERÍODOS DE CONTRATO (Devengamiento exigible mensual - Snapshot inmutable)
-- ==============================================================================

CREATE TABLE periodos_contrato (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
    periodo_mes INT NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
    periodo_anio INT NOT NULL,
    
    -- Conceptos desglosados
    monto_alquiler NUMERIC(15,2) NOT NULL,
    monto_expensas_ordinarias NUMERIC(15,2) DEFAULT 0.00,
    monto_servicios_tasas NUMERIC(15,2) DEFAULT 0.00,
    monto_otros_cargos NUMERIC(15,2) DEFAULT 0.00,
    monto_punitorios_calculados NUMERIC(15,2) DEFAULT 0.00,
    monto_total_exigible NUMERIC(15,2) GENERATED ALWAYS AS (
        monto_alquiler + monto_expensas_ordinarias + monto_servicios_tasas + monto_otros_cargos + monto_punitorios_calculados
    ) STORED,
    
    -- Trazabilidad de indexación congelada (Snapshot inmutable)
    indice_aplicado_nombre VARCHAR(30),
    indice_aplicado_valor NUMERIC(15,4),
    coeficiente_ajuste NUMERIC(10,6),
    
    fecha_vencimiento DATE NOT NULL,
    estado_cobranza VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado_cobranza IN ('pendiente', 'parcial', 'cobrado', 'anulado')),
    estado_liquidacion VARCHAR(30) NOT NULL DEFAULT 'pendiente' CHECK (estado_liquidacion IN ('pendiente', 'parcial', 'liquidado', 'no_aplica')),
    
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contrato_id, periodo_anio, periodo_mes)
);

CREATE INDEX idx_periodos_tenant ON periodos_contrato(tenant_id);
CREATE INDEX idx_periodos_contrato ON periodos_contrato(contrato_id);
CREATE INDEX idx_periodos_cobranza ON periodos_contrato(tenant_id, estado_cobranza);
CREATE INDEX idx_periodos_liquidacion ON periodos_contrato(tenant_id, estado_liquidacion);

-- ==============================================================================
-- 10. VÍA COBRANZA: RECIBOS EMITIDOS A INQUILINOS
-- ==============================================================================

CREATE TABLE cobranzas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE RESTRICT,
    numero_recibo VARCHAR(50) NOT NULL,
    fecha_cobro DATE NOT NULL,
    
    medio_pago VARCHAR(50) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia', 'deposito', 'cheque', 'otro')),
    moneda_cobro VARCHAR(10) NOT NULL DEFAULT 'ARS',
    monto_total_cobrado NUMERIC(15,2) NOT NULL,
    tipo_cambio_aplicado NUMERIC(15,4) DEFAULT 1.0000,
    monto_equivalente_moneda_base NUMERIC(15,2) NOT NULL,
    
    comprobante_referencia VARCHAR(150),
    observaciones TEXT,
    anulado BOOLEAN DEFAULT false,
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, numero_recibo)
);

CREATE INDEX idx_cobranzas_tenant ON cobranzas(tenant_id);
CREATE INDEX idx_cobranzas_contrato ON cobranzas(contrato_id);
CREATE INDEX idx_cobranzas_fecha ON cobranzas(tenant_id, fecha_cobro);

CREATE TABLE cobranza_imputaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cobranza_id UUID NOT NULL REFERENCES cobranzas(id) ON DELETE CASCADE,
    periodo_contrato_id UUID NOT NULL REFERENCES periodos_contrato(id) ON DELETE RESTRICT,
    monto_imputado_alquiler NUMERIC(15,2) DEFAULT 0.00,
    monto_imputado_expensas NUMERIC(15,2) DEFAULT 0.00,
    monto_imputado_servicios NUMERIC(15,2) DEFAULT 0.00,
    monto_imputado_punitorios NUMERIC(15,2) DEFAULT 0.00,
    monto_imputado_otros NUMERIC(15,2) DEFAULT 0.00,
    total_imputado NUMERIC(15,2) GENERATED ALWAYS AS (
        monto_imputado_alquiler + monto_imputado_expensas + monto_imputado_servicios + monto_imputado_punitorios + monto_imputado_otros
    ) STORED
);

CREATE INDEX idx_imputaciones_cobranza ON cobranza_imputaciones(cobranza_id);
CREATE INDEX idx_imputaciones_periodo ON cobranza_imputaciones(periodo_contrato_id);

-- ==============================================================================
-- 11. VÍA LIQUIDACIÓN: RENDICIONES NOMINALES A PROPIETARIOS
-- ==============================================================================

CREATE TABLE liquidaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE RESTRICT,
    propietario_id UUID NOT NULL REFERENCES personas(id) ON DELETE RESTRICT,
    numero_liquidacion VARCHAR(50) NOT NULL,
    fecha_liquidacion DATE NOT NULL,
    
    monto_bruto_percibido NUMERIC(15,2) NOT NULL,
    monto_honorarios_inmobiliaria NUMERIC(15,2) NOT NULL,
    monto_iva_honorarios NUMERIC(15,2) DEFAULT 0.00,
    monto_gastos_reparaciones NUMERIC(15,2) DEFAULT 0.00,
    monto_retenciones_impositivas NUMERIC(15,2) DEFAULT 0.00,
    monto_neto_liquidado NUMERIC(15,2) NOT NULL,
    
    medio_pago VARCHAR(50) NOT NULL DEFAULT 'transferencia' CHECK (medio_pago IN ('transferencia', 'efectivo', 'cheque', 'otro')),
    cuenta_origen_inmobiliaria VARCHAR(100),
    cbu_destino_propietario VARCHAR(100),
    comprobante_transferencia VARCHAR(150),
    
    estado VARCHAR(30) NOT NULL DEFAULT 'liquidado' CHECK (estado IN ('borrador', 'liquidado', 'transferido', 'anulado')),
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, numero_liquidacion)
);

CREATE INDEX idx_liquidaciones_tenant ON liquidaciones(tenant_id);
CREATE INDEX idx_liquidaciones_propietario ON liquidaciones(propietario_id);
CREATE INDEX idx_liquidaciones_contrato ON liquidaciones(contrato_id);

-- ==============================================================================
-- 12. TICKETS DE MANTENIMIENTO CON IMPUTACIÓN FINANCIERA
-- ==============================================================================

CREATE TABLE tickets_mantenimiento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE RESTRICT,
    contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
    proveedor_id UUID REFERENCES personas(id) ON DELETE SET NULL,
    
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'presupuestado', 'en_curso', 'completado', 'cancelado')),
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    
    costo_total NUMERIC(15,2) DEFAULT 0.00,
    imputacion_gasto VARCHAR(30) NOT NULL DEFAULT 'propietario' CHECK (imputacion_gasto IN ('propietario', 'inquilino', 'inmobiliaria', 'compartido')),
    
    deducido_en_liquidacion_id UUID REFERENCES liquidaciones(id) ON DELETE SET NULL,
    sumado_en_cobranza_id UUID REFERENCES cobranzas(id) ON DELETE SET NULL,
    
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    actualizado_al TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_tenant ON tickets_mantenimiento(tenant_id);
CREATE INDEX idx_tickets_propiedad ON tickets_mantenimiento(propiedad_id);

CREATE TRIGGER trg_tickets_actualizado_al
BEFORE UPDATE ON tickets_mantenimiento
FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_actualizado_al();

-- ==============================================================================
-- 13. ÍNDICES ECONÓMICOS OFICIALES (Compartido/Global)
-- ==============================================================================

CREATE TABLE indices_economicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_indice VARCHAR(30) NOT NULL CHECK (tipo_indice IN ('ICL', 'IPC', 'UVA', 'CASA_PROPIA', 'USD_OFICIAL', 'USD_BLUE')),
    fecha DATE NOT NULL,
    valor NUMERIC(15,4) NOT NULL,
    fuente VARCHAR(100) DEFAULT 'BCRA/INDEC',
    creado_al TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tipo_indice, fecha)
);

CREATE INDEX idx_indices_tipo_fecha ON indices_economicos(tipo_indice, fecha DESC);

-- ==============================================================================
-- 14. ACTIVACIÓN DE ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ==============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contrato_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobranzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cobranza_imputaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE indices_economicos ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 15. POLÍTICAS RLS ESPECÍFICAS
-- ==============================================================================

-- tenant_usuarios: Cada usuario ve sus propias membresías
CREATE POLICY "tenant_usuarios_select" ON tenant_usuarios
FOR SELECT USING (usuario_id = auth.uid());

-- tenants: Cada usuario ve los tenants a los que pertenece
CREATE POLICY "tenants_select" ON tenants
FOR SELECT USING (id IN (SELECT get_auth_tenant_ids()));

CREATE POLICY "tenants_update" ON tenants
FOR UPDATE USING (id IN (
    SELECT tenant_id FROM tenant_usuarios 
    WHERE usuario_id = auth.uid() AND rol IN ('owner', 'admin') AND activo = true
));

-- Tablas con columna directa tenant_id
CREATE POLICY "personas_policy" ON personas
FOR ALL USING (is_tenant_member(tenant_id));

CREATE POLICY "propiedades_policy" ON propiedades
FOR ALL USING (is_tenant_member(tenant_id));

CREATE POLICY "contratos_policy" ON contratos
FOR ALL USING (is_tenant_member(tenant_id));

CREATE POLICY "periodos_contrato_policy" ON periodos_contrato
FOR ALL USING (is_tenant_member(tenant_id));

CREATE POLICY "cobranzas_policy" ON cobranzas
FOR ALL USING (is_tenant_member(tenant_id));

CREATE POLICY "liquidaciones_policy" ON liquidaciones
FOR ALL USING (is_tenant_member(tenant_id));

CREATE POLICY "tickets_mantenimiento_policy" ON tickets_mantenimiento
FOR ALL USING (is_tenant_member(tenant_id));

-- Tablas hijas vinculadas a tablas de tenant
CREATE POLICY "contrato_participantes_policy" ON contrato_participantes
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM contratos c 
        WHERE c.id = contrato_participantes.contrato_id 
          AND is_tenant_member(c.tenant_id)
    )
);

CREATE POLICY "cobranza_imputaciones_policy" ON cobranza_imputaciones
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM cobranzas cob 
        WHERE cob.id = cobranza_imputaciones.cobranza_id 
          AND is_tenant_member(cob.tenant_id)
    )
);

-- indices_economicos: Lectura abierta para todo usuario autenticado
CREATE POLICY "indices_economicos_select" ON indices_economicos
FOR SELECT USING (auth.role() = 'authenticated');
