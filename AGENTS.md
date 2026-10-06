<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Directivas Principales de DeusX Inmobiliaria (Reglas de Negocio y Arquitectura)

1. **Ciclo de Vida y Filtrado de Contratos de Locación**:
   - Los contratos cuya fecha de fin ya expiró (`fecha_fin < hoy`) deben filtrarse obligatoriamente bajo la vista **"Terminados / Finalizados"** para mantener limpio el panel operativo de cobranzas activas.
   - Todo contrato terminado debe contar con una instancia formal de **Cierre de Alquiler**:
     - Acta de entrega y restitución de llaves.
     - Inspección del estado de conservación del inmueble.
     - Verificación de libre deuda de servicios (luz, gas, agua, tasas municipales).
     - Liquidación y devolución del **Depósito en Garantía** (con detalle de deducciones/retenciones si las hubiere).
     - Al formalizar el cierre, la propiedad vinculada debe quedar automáticamente disponible para volver a comercializarse.

2. **Régimen Contractual y Concordancia con Colegios de Martilleros**:
   - El contrato generado debe ser un instrumento legal articulado completo acorde a los modelos del Colegio de Martilleros y Corredores Públicos de la Provincia de Buenos Aires (Colmart) y CUCICBA post-DNU 70/2023.
   - Debe proveerse un espacio previo de edición y ajuste de cláusulas particulares antes de emitir el documento final.
   - Las variables esenciales (depósito en garantía, garantes/fianzas, destino, índices de indexación, mora y jurisdicción) deben ser seteables por el usuario.

3. **Arquitectura Multi-Tenant y Almacenamiento**:
   - Base de datos única compartida con aislamiento estricto por `tenant_id` y RLS.
   - Máximo 5 operadores por licencia activa controlados a nivel de tabla `tenant_usuarios`.
   - Almacenamiento de archivos (fotos de vidriera, contratos firmados) en Supabase Storage (Object Storage / CDN), formateados en el cliente a WebP para no saturar cuotas.

4. **Control de Versiones y Cierre de Sesiones (Git)**:
   - Al finalizar cada sesión, si hay modificaciones que subir o integrar, es OBLIGATORIO proveer al usuario los comandos y códigos Git correspondientes (y/o ejecutarlos) para asegurar que el trabajo quede versionado y empujado a la rama correspondiente (`dev` y `main`).


