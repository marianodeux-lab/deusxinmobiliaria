-- ==============================================================================
-- DeusX Inmobiliarias - Migración 004: Hardening de Seguridad RLS y Multi-Tenancy
-- ==============================================================================

-- 1. Habilitar RLS en mls_busquedas_activas
ALTER TABLE public.mls_busquedas_activas ENABLE ROW LEVEL SECURITY;

-- Política de lectura para MLS: miembros autenticados pueden ver búsquedas activas de la red
DROP POLICY IF EXISTS "mls_busquedas_activas_select_shared" ON public.mls_busquedas_activas;
CREATE POLICY "mls_busquedas_activas_select_shared"
    ON public.mls_busquedas_activas
    FOR SELECT
    TO authenticated
    USING (estado = 'activa');

-- Política de inserción: sólo para el tenant del usuario autenticado
DROP POLICY IF EXISTS "mls_busquedas_activas_insert_own" ON public.mls_busquedas_activas;
CREATE POLICY "mls_busquedas_activas_insert_own"
    ON public.mls_busquedas_activas
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id IN (SELECT get_auth_tenant_ids())
    );

-- Política de actualización/eliminación: sólo el creador de su tenant
DROP POLICY IF EXISTS "mls_busquedas_activas_update_own" ON public.mls_busquedas_activas;
CREATE POLICY "mls_busquedas_activas_update_own"
    ON public.mls_busquedas_activas
    FOR UPDATE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_auth_tenant_ids())
    );

DROP POLICY IF EXISTS "mls_busquedas_activas_delete_own" ON public.mls_busquedas_activas;
CREATE POLICY "mls_busquedas_activas_delete_own"
    ON public.mls_busquedas_activas
    FOR DELETE
    TO authenticated
    USING (
        tenant_id IN (SELECT get_auth_tenant_ids())
    );

-- 2. Habilitar RLS en indices_economicos (datos de referencia del mercado)
ALTER TABLE public.indices_economicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "indices_economicos_read_all" ON public.indices_economicos;
CREATE POLICY "indices_economicos_read_all"
    ON public.indices_economicos
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Blindaje de RLS en tenants: los usuarios sólo pueden consultar su propia organización
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_select" ON public.tenants;
DROP POLICY IF EXISTS "tenants_isolation_policy" ON public.tenants;
CREATE POLICY "tenants_isolation_policy"
    ON public.tenants
    FOR SELECT
    TO authenticated
    USING (
        id IN (SELECT get_auth_tenant_ids())
    );
