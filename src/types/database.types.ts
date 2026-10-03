export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          nombre_fantasia: string;
          razon_social: string | null;
          cuit: string;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          configuracion: Json;
          creado_al: string;
          actualizado_al: string;
        };
        Insert: {
          id?: string;
          nombre_fantasia: string;
          razon_social?: string | null;
          cuit: string;
          email?: string | null;
          telefono?: string | null;
          direccion?: string | null;
          configuracion?: Json;
          creado_al?: string;
          actualizado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
      tenant_usuarios: {
        Row: {
          id: string;
          tenant_id: string;
          usuario_id: string;
          rol: "owner" | "admin" | "operador" | "contador";
          activo: boolean;
          creado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          usuario_id: string;
          rol?: "owner" | "admin" | "operador" | "contador";
          activo?: boolean;
          creado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenant_usuarios"]["Insert"]>;
      };
      personas: {
        Row: {
          id: string;
          tenant_id: string;
          tipo_persona: "fisica" | "juridica";
          nombre_completo: string;
          documento_tipo: "DNI" | "CUIT" | "CUIL" | "PASAPORTE";
          documento_numero: string;
          email: string | null;
          telefono: string | null;
          telefono_secundario: string | null;
          direccion: string | null;
          cbu_alias: string | null;
          banco_nombre: string | null;
          notas: string | null;
          creado_al: string;
          actualizado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          tipo_persona?: "fisica" | "juridica";
          nombre_completo: string;
          documento_tipo?: "DNI" | "CUIT" | "CUIL" | "PASAPORTE";
          documento_numero: string;
          email?: string | null;
          telefono?: string | null;
          telefono_secundario?: string | null;
          direccion?: string | null;
          cbu_alias?: string | null;
          banco_nombre?: string | null;
          notas?: string | null;
          creado_al?: string;
          actualizado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["personas"]["Insert"]>;
      };
      propiedades: {
        Row: {
          id: string;
          tenant_id: string;
          codigo_interno: string | null;
          direccion_calle: string;
          direccion_numero: string;
          piso_dpto: string | null;
          unidad_funcional: string | null;
          codigo_postal: string | null;
          localidad: string;
          provincia: string;
          tipo_inmueble: string;
          destino: "vivienda" | "comercial" | "temporal" | "industrial";
          nomenclatura_catastral: string | null;
          partida_inmobiliaria: string | null;
          notas: string | null;
          creado_al: string;
          actualizado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          codigo_interno?: string | null;
          direccion_calle: string;
          direccion_numero: string;
          piso_dpto?: string | null;
          unidad_funcional?: string | null;
          codigo_postal?: string | null;
          localidad: string;
          provincia?: string;
          tipo_inmueble: string;
          destino?: "vivienda" | "comercial" | "temporal" | "industrial";
          nomenclatura_catastral?: string | null;
          partida_inmobiliaria?: string | null;
          notas?: string | null;
          creado_al?: string;
          actualizado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["propiedades"]["Insert"]>;
      };
      contratos: {
        Row: {
          id: string;
          tenant_id: string;
          carpeta_numero: string;
          propiedad_id: string;
          estado: "borrador" | "vigente" | "finalizado" | "rescindido";
          fecha_inicio: string;
          fecha_fin: string;
          dia_vencimiento_pago: number;
          moneda_base: "ARS" | "USD";
          tipo_ajuste: "ICL" | "IPC" | "UVA" | "CASA_PROPIA" | "FIJO" | "ESCALONADO";
          frecuencia_ajuste_meses: number;
          valor_alquiler_inicial: number;
          valor_alquiler_actual: number;
          valor_indice_base: number | null;
          fecha_ultimo_ajuste: string | null;
          porcentaje_honorarios_inmobiliaria: number;
          aplica_punitorios: boolean;
          tasa_punitorio_diario: number;
          notas: string | null;
          creado_al: string;
          actualizado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          carpeta_numero: string;
          propiedad_id: string;
          estado?: "borrador" | "vigente" | "finalizado" | "rescindido";
          fecha_inicio: string;
          fecha_fin: string;
          dia_vencimiento_pago?: number;
          moneda_base?: "ARS" | "USD";
          tipo_ajuste?: "ICL" | "IPC" | "UVA" | "CASA_PROPIA" | "FIJO" | "ESCALONADO";
          frecuencia_ajuste_meses?: number;
          valor_alquiler_inicial: number;
          valor_alquiler_actual: number;
          valor_indice_base?: number | null;
          fecha_ultimo_ajuste?: string | null;
          porcentaje_honorarios_inmobiliaria?: number;
          aplica_punitorios?: boolean;
          tasa_punitorio_diario?: number;
          notas?: string | null;
          creado_al?: string;
          actualizado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contratos"]["Insert"]>;
      };
      contrato_participantes: {
        Row: {
          id: string;
          contrato_id: string;
          persona_id: string;
          rol: "propietario" | "inquilino" | "garante";
          porcentaje_participacion: number;
          es_firmante: boolean;
          recibe_liquidacion: boolean;
          creado_al: string;
        };
        Insert: {
          id?: string;
          contrato_id: string;
          persona_id: string;
          rol: "propietario" | "inquilino" | "garante";
          porcentaje_participacion?: number;
          es_firmante?: boolean;
          recibe_liquidacion?: boolean;
          creado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contrato_participantes"]["Insert"]>;
      };
      periodos_contrato: {
        Row: {
          id: string;
          tenant_id: string;
          contrato_id: string;
          periodo_mes: number;
          periodo_anio: number;
          monto_alquiler: number;
          monto_expensas_ordinarias: number;
          monto_servicios_tasas: number;
          monto_otros_cargos: number;
          monto_punitorios_calculados: number;
          monto_total_exigible: number;
          indice_aplicado_nombre: string | null;
          indice_aplicado_valor: number | null;
          coeficiente_ajuste: number | null;
          fecha_vencimiento: string;
          estado_cobranza: "pendiente" | "parcial" | "cobrado" | "anulado";
          estado_liquidacion: "pendiente" | "parcial" | "liquidado" | "no_aplica";
          creado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contrato_id: string;
          periodo_mes: number;
          periodo_anio: number;
          monto_alquiler: number;
          monto_expensas_ordinarias?: number;
          monto_servicios_tasas?: number;
          monto_otros_cargos?: number;
          monto_punitorios_calculados?: number;
          indice_aplicado_nombre?: string | null;
          indice_aplicado_valor?: number | null;
          coeficiente_ajuste?: number | null;
          fecha_vencimiento: string;
          estado_cobranza?: "pendiente" | "parcial" | "cobrado" | "anulado";
          estado_liquidacion?: "pendiente" | "parcial" | "liquidado" | "no_aplica";
          creado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["periodos_contrato"]["Insert"]>;
      };
      cobranzas: {
        Row: {
          id: string;
          tenant_id: string;
          contrato_id: string;
          numero_recibo: string;
          fecha_cobro: string;
          medio_pago: "efectivo" | "transferencia" | "deposito" | "cheque" | "otro";
          moneda_cobro: string;
          monto_total_cobrado: number;
          tipo_cambio_aplicado: number;
          monto_equivalente_moneda_base: number;
          comprobante_referencia: string | null;
          observaciones: string | null;
          anulado: boolean;
          creado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contrato_id: string;
          numero_recibo: string;
          fecha_cobro: string;
          medio_pago: "efectivo" | "transferencia" | "deposito" | "cheque" | "otro";
          moneda_cobro?: string;
          monto_total_cobrado: number;
          tipo_cambio_aplicado?: number;
          monto_equivalente_moneda_base: number;
          comprobante_referencia?: string | null;
          observaciones?: string | null;
          anulado?: boolean;
          creado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cobranzas"]["Insert"]>;
      };
      liquidaciones: {
        Row: {
          id: string;
          tenant_id: string;
          contrato_id: string;
          propietario_id: string;
          numero_liquidacion: string;
          fecha_liquidacion: string;
          monto_bruto_percibido: number;
          monto_honorarios_inmobiliaria: number;
          monto_iva_honorarios: number;
          monto_gastos_reparaciones: number;
          monto_retenciones_impositivas: number;
          monto_neto_liquidado: number;
          medio_pago: "transferencia" | "efectivo" | "cheque" | "otro";
          cuenta_origen_inmobiliaria: string | null;
          cbu_destino_propietario: string | null;
          comprobante_transferencia: string | null;
          estado: "borrador" | "liquidado" | "transferido" | "anulado";
          creado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          contrato_id: string;
          propietario_id: string;
          numero_liquidacion: string;
          fecha_liquidacion: string;
          monto_bruto_percibido: number;
          monto_honorarios_inmobiliaria: number;
          monto_iva_honorarios?: number;
          monto_gastos_reparaciones?: number;
          monto_retenciones_impositivas?: number;
          monto_neto_liquidado: number;
          medio_pago?: "transferencia" | "efectivo" | "cheque" | "otro";
          cuenta_origen_inmobiliaria?: string | null;
          cbu_destino_propietario?: string | null;
          comprobante_transferencia?: string | null;
          estado?: "borrador" | "liquidado" | "transferido" | "anulado";
          creado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["liquidaciones"]["Insert"]>;
      };
      tickets_mantenimiento: {
        Row: {
          id: string;
          tenant_id: string;
          propiedad_id: string;
          contrato_id: string | null;
          proveedor_id: string | null;
          titulo: string;
          descripcion: string;
          estado: "abierto" | "presupuestado" | "en_curso" | "completado" | "cancelado";
          prioridad: "baja" | "media" | "alta" | "urgente";
          costo_total: number;
          imputacion_gasto: "propietario" | "inquilino" | "inmobiliaria" | "compartido";
          deducido_en_liquidacion_id: string | null;
          sumado_en_cobranza_id: string | null;
          creado_al: string;
          actualizado_al: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          propiedad_id: string;
          contrato_id?: string | null;
          proveedor_id?: string | null;
          titulo: string;
          descripcion: string;
          estado?: "abierto" | "presupuestado" | "en_curso" | "completado" | "cancelado";
          prioridad?: "baja" | "media" | "alta" | "urgente";
          costo_total?: number;
          imputacion_gasto?: "propietario" | "inquilino" | "inmobiliaria" | "compartido";
          deducido_en_liquidacion_id?: string | null;
          sumado_en_cobranza_id?: string | null;
          creado_al?: string;
          actualizado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tickets_mantenimiento"]["Insert"]>;
      };
      indices_economicos: {
        Row: {
          id: string;
          tipo_indice: "ICL" | "IPC" | "UVA" | "CASA_PROPIA" | "USD_OFICIAL" | "USD_BLUE";
          fecha: string;
          valor: number;
          fuente: string | null;
          creado_al: string;
        };
        Insert: {
          id?: string;
          tipo_indice: "ICL" | "IPC" | "UVA" | "CASA_PROPIA" | "USD_OFICIAL" | "USD_BLUE";
          fecha: string;
          valor: number;
          fuente?: string | null;
          creado_al?: string;
        };
        Update: Partial<Database["public"]["Tables"]["indices_economicos"]["Insert"]>;
      };
    };
  };
}
