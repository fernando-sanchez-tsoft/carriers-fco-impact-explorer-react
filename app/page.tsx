"use client";

import {
  AppWindow,
  Boxes,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  FileCode2,
  Filter,
  FolderTree,
  Layers3,
  Menu,
  Package,
  Search,
  Table2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Operation = "SELECT" | "INSERT" | "UPDATE" | "DELETE";
type NodeKind =
  | "application"
  | "module"
  | "menu"
  | "form"
  | "block"
  | "package"
  | "table";

type Impact = {
  table: string;
  operations: Operation[];
  mode: "Directo" | "Indirecto";
  evidence: string;
  description: string;
};

type TreeNode = {
  id: string;
  name: string;
  kind: NodeKind;
  subtitle?: string;
  description?: string;
  source?: string;
  operations?: Operation[];
  impacts?: Impact[];
  children?: TreeNode[];
};

const operationStyles: Record<Operation, string> = {
  SELECT: "op-select",
  INSERT: "op-insert",
  UPDATE: "op-update",
  DELETE: "op-delete",
};

const iconByKind: Record<NodeKind, typeof AppWindow> = {
  application: Boxes,
  module: Layers3,
  menu: Menu,
  form: AppWindow,
  block: Code2,
  package: Package,
  table: Database,
};

const labelByKind: Record<NodeKind, string> = {
  application: "Aplicación",
  module: "Módulo",
  menu: "Opción de menú",
  form: "Oracle Form",
  block: "Bloque / proceso",
  package: "Package",
  table: "Tabla",
};

const demoTree: TreeNode = {
  id: "carriers",
  name: "CARRIERS",
  kind: "application",
  subtitle: "Aplicación",
  description: "Mapa técnico de pantallas e impactos sobre base de datos.",
  children: [
    {
      id: "fco",
      name: "FCO",
      kind: "module",
      subtitle: "Menú funcional",
      description:
        "Módulo principal del relevamiento. Cada rama representa una opción visible del menú.",
      children: [
        {
          id: "consultas",
          name: "Consultas",
          kind: "menu",
          subtitle: "Opción del menú",
          children: [
            {
              id: "conceptos-form",
              name: "Consulta de conceptos",
              kind: "form",
              subtitle: "fco_conceptos.fmb",
              source: "fco_conceptos.fmb",
              description:
                "Pantalla de ejemplo para consultar conceptos y recorrer su historial de estados.",
              operations: ["SELECT"],
              impacts: [
                {
                  table: "SIA_RELACIONES_CPTO_FCO",
                  operations: ["SELECT"],
                  mode: "Directo",
                  evidence: "Bloque BL_CONCEPTOS · Query Data Source",
                  description: "Obtiene la relación y los datos identificatorios del concepto.",
                },
                {
                  table: "SIA_ESTADOS_CPTO_FCO",
                  operations: ["SELECT"],
                  mode: "Directo",
                  evidence: "Trigger WHEN-BUTTON-PRESSED · BTN_HISTORIAL",
                  description: "Consulta la secuencia histórica de estados del concepto.",
                },
              ],
              children: [
                {
                  id: "conceptos-block",
                  name: "BL_CONCEPTOS",
                  kind: "block",
                  subtitle: "Bloque de datos",
                  operations: ["SELECT"],
                  children: [
                    {
                      id: "rel-table",
                      name: "SIA_RELACIONES_CPTO_FCO",
                      kind: "table",
                      subtitle: "Acceso directo",
                      operations: ["SELECT"],
                    },
                    {
                      id: "est-table",
                      name: "SIA_ESTADOS_CPTO_FCO",
                      kind: "table",
                      subtitle: "Acceso directo",
                      operations: ["SELECT"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "gestion",
          name: "Gestión de conceptos",
          kind: "menu",
          subtitle: "Opción del menú",
          children: [
            {
              id: "estado-form",
              name: "Actualización de estado",
              kind: "form",
              subtitle: "fco_estados.fmb",
              source: "fco_estados.fmb",
              description:
                "Ejemplo de una pantalla que consulta directamente y confirma cambios mediante un package.",
              operations: ["SELECT", "INSERT", "UPDATE"],
              impacts: [
                {
                  table: "SIA_RELACIONES_CPTO_FCO",
                  operations: ["SELECT", "UPDATE"],
                  mode: "Indirecto",
                  evidence: "PKG_FCO.ACTUALIZAR_ESTADO",
                  description: "Localiza la relación y actualiza sus datos de control.",
                },
                {
                  table: "SIA_ESTADOS_CPTO_FCO",
                  operations: ["INSERT"],
                  mode: "Indirecto",
                  evidence: "PKG_FCO.ACTUALIZAR_ESTADO",
                  description: "Registra el nuevo estado como un movimiento histórico.",
                },
              ],
              children: [
                {
                  id: "pkg-fco",
                  name: "PKG_FCO.ACTUALIZAR_ESTADO",
                  kind: "package",
                  subtitle: "Invocación indirecta",
                  operations: ["SELECT", "INSERT", "UPDATE"],
                  children: [
                    {
                      id: "rel-table-2",
                      name: "SIA_RELACIONES_CPTO_FCO",
                      kind: "table",
                      subtitle: "Acceso indirecto",
                      operations: ["SELECT", "UPDATE"],
                    },
                    {
                      id: "est-table-2",
                      name: "SIA_ESTADOS_CPTO_FCO",
                      kind: "table",
                      subtitle: "Acceso indirecto",
                      operations: ["INSERT"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: "configuracion",
          name: "Configuración",
          kind: "menu",
          subtitle: "Pendiente de relevar",
          description: "Rama preparada para incorporar las pantallas reales del menú.",
          children: [],
        },
      ],
    },
  ],
};

const evidence = "FMB · cadenas observadas (frmf2xml falló en la instalación local)";
const item = (table: string, operations: Operation[], description: string, note = evidence): Impact => ({ table, operations, description, evidence: note, mode: "Directo" });
const responsibilities = [
  "Alta, aprobación y anulación de Servicios por Prestador", "Aprob. / Anul. de comprobantes de Facturación", "Aprob. / Anul. Líquido Producto - FCO", "Aprobación / Anulación Acuerdos/Convenios - FCO", "Aprobación / Anulación Envío Liquidaciones - FCO", "Aprobación / Anulación Reclamos - FCO", "Aprobación / Anulación Retribuciones - FCO", "Consultas - FCO", "Consultas Generales de Facturación", "Informes - FCO", "ITP Adm. Reclamos", "ITP Aprob Anulacion Cobranzas", "ITP Consultas Reclamos", "ITP-Cuentas Corrientes - COB", "ITP Parametros Generales DTH", "ITP Procesos Generales", "ITP Reg. Cobranzas", "ITP Reportes", "ITP Reportes Fac", "ITP-IMPRESION DE NC/ND-RECL", "MENU RECL_PARAM_GRALES", "Módulo de Particionado", "Parametros generales - Cob", "Parámetros Generales de Facturación", "Parámetros Generales de ITX", "Parámetros Grales FCO", "Prestadores ITX", "Procesos Específicos en Interconexión", "Procesos Generales - FCO", "Procesos Generales de Facturación", "Registros Líquidos / Convenios FCO", "Registración Liquidaciones - FCO", "Registración Reclamos",
];
const pendingMenu = (id: string, name: string): TreeNode => ({
  id, name, kind: "menu", subtitle: "Opción de menú · formulario fuente pendiente",
  description: "Opción observada en el menú de aplicación. Aún no se localizó su .fmb o reporte fuente, por lo que no se atribuyen tablas u operaciones.",
});
const responsibility = (name: string): TreeNode => {
  const id = `responsibility-${name.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  if (name === "Aprob. / Anul. Líquido Producto - FCO") {
    return {
      id, name, kind: "menu", subtitle: "Responsabilidad · estructura capturada",
      description: "Primer nivel relevado de la responsabilidad. La captura confirma dos menús y sus acciones; falta localizar los formularios fuente de cada acción.",
      children: [
        { id: `${id}-emitidos`, name: "Menú Apr/Anul Env LP Emitidos", kind: "menu", subtitle: "Menú de aplicación", children: [
          pendingMenu(`${id}-emitidos-registracion`, "Registración"), pendingMenu(`${id}-emitidos-aprobacion`, "Aprobación"), pendingMenu(`${id}-emitidos-anulacion`, "Anulación"), pendingMenu(`${id}-emitidos-envio`, "Envío"), pendingMenu(`${id}-emitidos-consulta`, "Consulta Anulados"), pendingMenu(`${id}-emitidos-documentos`, "Documentos Internos"),
        ] },
        { id: `${id}-recibidos`, name: "Menú Apr/Anul Env LP Recibidos", kind: "menu", subtitle: "Menú de aplicación", children: [
          pendingMenu(`${id}-recibidos-registracion`, "Registración"), pendingMenu(`${id}-recibidos-aprobacion`, "Aprobación"), pendingMenu(`${id}-recibidos-anulacion`, "Anulación"),
        ] },
      ],
    };
  }
  return { id, name, kind: "menu", subtitle: "Responsabilidad · formulario fuente pendiente", description: "Incluida por la captura del primer menú. No hay un .fmb asociado en el material local, por lo que todavía no se atribuyen tablas u operaciones." };
};
const form = (id: string, name: string, description: string, impacts: Impact[], sourceName = name): TreeNode => ({
  id, name, kind: "form", subtitle: `${sourceName}.fmb`, source: `${sourceName}.fmb`, description, impacts,
  operations: [...new Set(impacts.flatMap((impact) => impact.operations))],
  children: [{ id: `${id}-sql`, name: "Bloques, triggers y SQL embebido", kind: "block", subtitle: "Evidencia del formulario", operations: [...new Set(impacts.flatMap((impact) => impact.operations))], children: impacts.map((impact, index) => ({ id: `${id}-${index}`, name: impact.table, kind: "table", subtitle: `${impact.mode} · ${impact.operations.join(" / ")}`, operations: impact.operations })) }],
});

const fcoTree: TreeNode = {
  id: "carriers-real", name: "CARRIERS", kind: "application", subtitle: "Aplicación",
  description: "Relevamiento técnico de los Oracle Forms del menú FCO disponibles en el repositorio.",
  children: [{
    id: "fco-real", name: "FCO", kind: "module", subtitle: "Menú funcional",
    description: "Alcance: todas las responsabilidades del primer menú. Solo se imputan impactos cuando existe un formulario fuente o evidencia verificable.",
    children: [
      { id: "responsibilities", name: "Responsabilidades del primer menú", kind: "menu", subtitle: `${responsibilities.length} responsabilidades inventariadas`, description: "Inventario transcripto de la captura. Cada responsabilidad se relevará contra sus formularios y reportes fuente.", children: responsibilities.map(responsibility) },
      { id: "lp", name: "Líquidos de productos", kind: "menu", subtitle: "Gestión", children: [
        form("siadfc01", "SIADFC01", "Gestión de líquidos de productos: bloque maestro y detalle CRUD, con lookups y seguridad.", [
          item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Bloque maestro editable.", "BASE SIA_LIQUIDOS_PRODUCTOS SEL INS UPD DEL"),
          item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Bloque detalle editable.", "BASE SIA_DETALLES_LIQUIDO_PRODUCTO SEL INS UPD DEL"),
          item("SIA_DET_LIQ_PROD_DEC_VW", ["SELECT"], "Detalle declarado por líquido producto.", "FROM SIA_DET_LIQ_PROD_DEC_VW"),
          item("SIA_INTERCONECTANTES", ["SELECT"], "Lookup y filtro de prestador."), item("SIA_SERVICIOS", ["SELECT"], "Lookup y restricción de servicio."), item("SIA_MONEDAS", ["SELECT"], "Lookup de moneda."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros de servicios y temporales."), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad por usuario/interconectante."),
        ]),
        form("siadfc02", "SIADFC02", "Gestión de líquidos de productos con validaciones específicas del detalle FCO.", [
          item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Bloque maestro editable.", "BASE SIA_LIQUIDOS_PRODUCTOS SEL INS UPD DEL"),
          item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Bloque detalle editable.", "BASE SIA_DETALLES_LIQUIDO_PRODUCTO SEL INS UPD DEL"),
          item("SIA_DETALLES_LIQ_PROD_FCO", ["SELECT"], "Validación de existencia del detalle FCO.", "FROM SIA_DETALLES_LIQ_PROD_FCO"), item("SIA_INTERCONECTANTES", ["SELECT"], "Lookup de prestador."), item("SIA_SERVICIOS", ["SELECT"], "Lookup de servicio."), item("SIA_MONEDAS", ["SELECT"], "Lookup de moneda."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Reglas de servicio y numeración."), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad de acceso."),
        ]),
      ]},
      { id: "conceptos", name: "Conceptos y acuerdos", kind: "menu", subtitle: "Consulta y parametrización", children: [
        form("siadfc16", "SIADFC16", "Consulta/control de conceptos FCO; arma SQL dinámico y limpia los temporales de la sesión.", [
          item("SIA_CONTROLES_PROCESO", ["SELECT"], "Bloque de control, solo lectura.", "BASE SIA_CONTROLES_PROCESO SEL"), item("SIA_TMP_CTRL_LIQ_FCO", ["DELETE"], "Limpieza de temporales de la sesión.", "DELETE FROM ... WHERE USUARIO_ALTA = :PARAMETER.USR_SESSION"), item("SIA_ESTADOS_CPTO_FCO", ["SELECT"], "Fuente del SQL dinámico de estados.", "SQL dinámico FROM SIA_ESTADOS_CPTO_FCO"), item("SIA_RELACIONES_CPTO_FCO", ["SELECT"], "Fuente del SQL dinámico de relaciones.", "SQL dinámico FROM SIA_RELACIONES_CPTO_FCO"), item("SIA_TIPOS_CONCEPTO", ["SELECT"], "Clasificación de conceptos."), item("SIA_CAMPOS_REPORTE_FCO", ["SELECT"], "Configuración de columnas.", "FUNCTION GET_TABLA"), item("SIA_INTERCONECTANTES", ["SELECT"], "Filtro de prestador."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Rutas y parámetros de generación."),
        ]),
        form("siadfc17", "SIADFC17", "Administración de acuerdos servicio–interconectante; bloque principal CRUD y borrado explícito.", [
          item("SIA_AC_SERV_INTERCONECTANTES", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Tabla principal de acuerdos y validación de duplicidad.", "BASE ... SEL INS UPD DEL; DELETE FROM SIA_AC_SERV_INTERCONECTANTES"), item("SIA_INTERCONECTANTES", ["SELECT"], "Bloque de contexto.", "BASE SIA_INTERCONECTANTES SEL"), item("SIA_OPERADORES", ["SELECT"], "Lookup de operador.", "BASE SIA_OPERADORES SEL"), item("SIA_SERVICIOS", ["SELECT"], "Lookup y seguridad de servicios."), item("SIA_MONEDAS", ["SELECT"], "Lookup de moneda."), item("SIA_INTER_POR_TIPO", ["SELECT"], "Tipo del interconectante."), item("SIA_TIPO_INTERCONECTANTES", ["SELECT"], "Filtro de tipos."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Validación de servicios especiales."),
        ]),
      ]},
      { id: "liquidaciones-real", name: "Liquidaciones FCO", kind: "menu", subtitle: "Gestión y composición", children: [
        form("siadfc35", "SIADFC35", "Gestión de liquidaciones y composición; un trigger actualiza el importe de cabecera desde el detalle.", [
          item("SIA_LIQUIDACIONES_FCO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Cabecera editable y actualización explícita de importe.", "BASE ... SEL INS UPD DEL; UPDATE SIA_LIQUIDACIONES_FCO SET IMPORTE"), item("SIA_DETALLES_LIQ_FCO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Detalle editable de conceptos.", "BASE SIA_DETALLES_LIQ_FCO SEL INS UPD DEL"), item("SIA_COMPOSICIONES_LIQ_FCO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Composición editable por comprobante o líquido.", "BASE SIA_COMPOSICIONES_LIQ_FCO SEL INS UPD DEL"), item("SIA_COMPROBANTES", ["SELECT"], "Lookup de comprobantes."), item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT"], "Lookup de líquidos producto."), item("SIA_CONCEPTOS_LIQ_FCO", ["SELECT"], "Configuración de conceptos."), item("SIA_ESTRUCTURA_LIQ_FCO", ["SELECT"], "Validación de estructura."), item("SIA_ALGORITMOS_LIQ_FCO", ["SELECT"], "Algoritmos aplicables."), item("SIA_FECHAS_VTO_LIQ_FCO", ["SELECT"], "Vencimientos de la estructura."),
        ]),
        form("siadfc36", "SIADFC36", "Procesamiento de composición: inserta componentes y detalles, y ajusta importes de detalle.", [
          item("SIA_LIQUIDACIONES_FCO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Cabecera editable y fuente de validaciones.", "BASE SIA_LIQUIDACIONES_FCO SEL INS UPD DEL"), item("SIA_DETALLES_LIQ_FCO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Inserta y ajusta detalles incluidos/excluidos.", "BASE ...; INSERT INTO / UPDATE SIA_DETALLES_LIQ_FCO"), item("SIA_COMPOSICIONES_LIQ_FCO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Inserta la composición de liquidación.", "BASE ...; INSERT INTO SIA_COMPOSICIONES_LIQ_FCO"), item("SIA_COMPROBANTES", ["SELECT"], "Fuente de comprobantes."), item("SIA_DETALLES_COMPROBANTE", ["SELECT"], "Detalle fuente de comprobantes.", "FROM SIA_DETALLES_COMPROBANTE"), item("SIA_CONCEPTOS_LIQ_FCO", ["SELECT"], "Configuración de conceptos."), item("SIA_ESTRUCTURA_LIQ_FCO", ["SELECT"], "Configuración de estructura."), item("SIA_ALGORITMOS_LIQ_FCO", ["SELECT"], "Algoritmos de cálculo."), item("SIA_FECHAS_VTO_LIQ_FCO", ["SELECT"], "Fechas de vencimiento."), item("SIA_ESTRUCTURAS_LIQ_ACUERDO", ["SELECT"], "Relación acuerdo–estructura."),
        ]),
      ]},
      { id: "planos-real", name: "Planos recibidos", kind: "menu", subtitle: "Control de interfaces", children: [
        form("siadfc96", "SIADFC96", "Control y reproceso de planos recibidos FCO; marca registros para ejecución y permite CRUD sobre el bloque principal.", [
          item("SIA_PLANOS_REC_FCO", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Tabla principal de planos; se marca EN PROCESO y se asigna PID.", "BASE ... SEL INS UPD DEL; UPDATE SIA_PLANOS_REC_FCO SET MARCA_PROC"), item("SIA_PERIODOS_TRAFICO", ["SELECT"], "Consulta de período de tráfico.", "BASE SIA_PERIODOS_TRAFICO SEL"), item("SIA_LET_INTERFACE_PROC_FCO", ["SELECT"], "Relación interfaz/proceso.", "BASE SIA_LET_INTERFACE_PROC_FCO SEL"), item("SIA_INTERFACES_PROC_FCO", ["SELECT"], "Lookup de interfaz."), item("SIA_EJECUTABLES_PROC_FCO", ["SELECT"], "Lookup de ejecutable."), item("SIA_ERRORES_FORMATO", ["SELECT"], "Descripción y tratamiento de errores de formato."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Rutas de logs y temporales."),
        ]),
      ]},
    ],
  }],
};

const cleanTree: TreeNode = {
  id: "carriers", name: "CARRIERS", kind: "application", subtitle: "Aplicación",
  description: "Base limpia para relevar los impactos del menú FCO, opción por opción.",
  children: [{
    id: "fco", name: "FCO", kind: "module", subtitle: "Primer menú de responsabilidades",
    description: "Alcance inicial: Aprob. / Anul. Líquido Producto - FCO.",
    children: [{
      id: "responsibilities", name: "Responsabilidades", kind: "menu", subtitle: "Primer nivel",
      children: [{
        id: "responsibility-lp", name: "Aprob. / Anul. Líquido Producto - FCO", kind: "menu", subtitle: "Responsabilidad",
        description: "Estructura confirmada por captura. Las opciones están listas para asociar formularios, triggers y tablas.",
        children: [
          { id: "lp-emitidos", name: "Menú Apr/Anul Env LP Emitidos", kind: "menu", subtitle: "Menú de aplicación", children: [
            form("lp-emitidos-registracion", "Registración · SIADFC01", "Título de pantalla: Líquidos Producto/Planillas de Transferencia – Emitidos. Relevado contra la fuente actual copiada en forms/SIADFC01.fmb (30/09/2026).", [
              item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT"], "Tabla física subyacente de cabecera; el DML funcional Base 19 se expone mediante la vista.", "BASE SIA_LIQUIDOS_PRODUCTOS SEL INS UPD DEL"),
              item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT"], "Tabla física subyacente del detalle; el DML funcional Base 19 se expone mediante la vista.", "BASE SIA_DETALLES_LIQUIDO_PRODUCTO SEL INS UPD DEL"),
              item("SIA_LIQ_PROD_19_VW", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Vista Base 19 de cabecera. La registración crea, modifica y elimina líquidos producto por esta capa de acceso.", "Modelo Base 19 · cabecera de registración"),
              item("SIA_DLP_19_VW", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Vista Base 19 de detalle. La registración crea, modifica y elimina renglones por esta capa de acceso.", "Modelo Base 19 · detalle de registración"),
              item("SIA_DLP_DEC_19_VW", ["SELECT"], "Vista del detalle declarado mostrada en el formulario.", "Bloque DECLARADO · SIA_DLP_DEC_19_VW"),
              item("SIA_LIQUIDOS_PRODUCTOS@DBL_CARRFCOP_RW.WORLD", ["SELECT"], "Consulta remota de validación por líquido producto.", "FROM SIA_LIQUIDOS_PRODUCTOS@DBL_CARRFCOP_RW.WORLD"),
              item("SIA_INTER_19_VW", ["SELECT"], "Vista de lookup y filtros de prestador.", "FROM SIA_INTER_19_VW"),
              item("SIA_SERV_19_VW", ["SELECT"], "Vista de lookup y filtros de servicio.", "FROM SIA_SERV_19_VW"),
              item("SIA_MON_19_VW", ["SELECT"], "Vista de lookup y filtros de moneda.", "FROM SIA_MON_19_VW"),
              item("SIA_OPER_19_VW", ["SELECT"], "Vista de validación del operador.", "SELECT ... FROM SIA_OPER_19_VW"),
              item("SIA_DET_LIQ_PROD_DEC_VW", ["SELECT"], "Vista de detalle declarado presente en el módulo.", "SELECT 1 FROM SIA_DET_LIQ_PROD_DEC_VW"),
              item("SIA_INTERCONECTANTES", ["SELECT"], "Consulta de seguridad y asociación con el usuario.", "FROM SIA_INTERCONECTANTES, SIA_USUARIO_INTERCONECTANTES"),
              item("SIA_SERVICIOS", ["SELECT"], "Consulta de seguridad por servicio.", "FROM SIA_SERVICIOS, SIA_USUARIO_INTERCONECTANTES"),
              item("SIA_MONEDAS", ["SELECT"], "Record group de moneda heredado en el módulo.", "FROM SIA_MONEDAS ORDER BY MONEDA"),
              item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros generales de servicios y temporales.", "FROM SIA_PARAMETROS_GRALES"),
              item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Filtro de seguridad por usuario e interconectante.", "JOIN SIA_USUARIO_INTERCONECTANTES"),
            ], "SIADFC01"),
            form("lp-emitidos-aprobacion", "Aprobación · SIADFC02", "Título de pantalla: Líquidos Producto/Planillas de Transferencia – Emitidos. Acción visible: Aprobar.", [
              item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT"], "Tabla física subyacente de la cabecera; el DML Base 19 se realiza sobre la vista.", "BASE SIA_LIQUIDOS_PRODUCTOS SEL INS UPD DEL"),
              item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT"], "Tabla física subyacente del detalle; sin DML funcional de aprobación sobre la tabla.", "BASE SIA_DETALLES_LIQUIDO_PRODUCTO SEL INS UPD DEL"),
              item("SIA_LIQ_PROD_19_VW", ["SELECT", "UPDATE"], "Vista DB19 consultada y actualizada por la lógica de aprobación.", "UPDATE INTER.SIA_LIQ_PROD_19_VW SET FECHA_APROBACION, USUARIO_APROBACION, NRO_LIQ_PRODUCTO ..."),
              item("SIA_DLP_19_VW", ["SELECT"], "Vista DB19 utilizada para validar detalles antes de aprobar.", "FROM INTER.SIA_DLP_19_VW"),
              item("SIA_DLP_DEC_19_VW", ["SELECT"], "Detalle declarado mostrado por el formulario.", "Bloque DECLARADO · SIA_DLP_DEC_19_VW"),
              item("SIA_INTER_19_VW", ["SELECT"], "Lookup de prestador.", "FROM SIA_INTER_19_VW"), item("SIA_SERV_19_VW", ["SELECT"], "Lookup de servicio.", "FROM SIA_SERV_19_VW"), item("SIA_MON_19_VW", ["SELECT"], "Lookup de moneda.", "FROM SIA_MON_19_VW"), item("SIA_OPER_19_VW", ["SELECT"], "Validación del operador.", "FROM SIA_OPER_19_VW"), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros de control."), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad por usuario e interconectante."),
            ], "SIADFC02"),
            form("lp-emitidos-anulacion", "Anulación · SIADFC03", "Título de pantalla: Líquidos Producto/Planillas de Transferencia – Emitidos. Acción visible: Anular.", [
              item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT"], "Tabla física subyacente de cabecera.", "Filtro FECHA_ANULACION IS NULL; bloque LIQ"),
              item("SIA_LIQ_PROD_19_VW", ["SELECT", "UPDATE"], "Vista Base 19 de cabecera: la anulación actualiza los datos de estado del líquido.", "Modelo Base 19 · acción Anular (FECHA_ANULACION)"),
              item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT"], "Tabla física subyacente del detalle.", "BASE SIA_DETALLES_LIQUIDO_PRODUCTO"), item("SIA_DLP_19_VW", ["SELECT"], "Vista Base 19 del detalle asociado al líquido."), item("SIA_DETALLES_LIQ_PROD_FCO", ["SELECT"], "Validaciones sobre detalle FCO."), item("SIA_INTERCONECTANTES", ["SELECT"], "Lookup de prestador."), item("SIA_SERVICIOS", ["SELECT"], "Lookup de servicio."), item("SIA_MONEDAS", ["SELECT"], "Lookup de moneda."), item("SIA_OPERADORES", ["SELECT"], "Lookup de operador."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros de control."), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad por usuario/interconectante."),
            ], "SIADFC03"),
            form("lp-emitidos-envio", "Envío · SIADFC08", "Título de pantalla: Envíos de Líquidos Producto/Planillas de Transferencia – Emitidos. Acción visible: Enviar.", [
              item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT"], "Tabla física subyacente de cabecera."), item("SIA_LIQ_PROD_19_VW", ["SELECT", "UPDATE"], "Vista Base 19 de cabecera: el envío actualiza FECHA_ENVIO y USUARIO_ENVIO.", "Modelo Base 19 · acción Enviar"), item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT"], "Tabla física subyacente del detalle."), item("SIA_DLP_19_VW", ["SELECT"], "Vista Base 19 del detalle a enviar."), item("SIA_PROCESOS_INFORME_WEB", ["INSERT"], "Encola un proceso de generación/envío de informe web; es una tabla de cola, no una vista Base 19.", "INSERT INTO SIA_PROCESOS_INFORME_WEB"), item("SIA_INTERCONECTANTES", ["SELECT"], "Lookup de prestador."), item("SIA_SERVICIOS", ["SELECT"], "Lookup de servicio."), item("SIA_MONEDAS", ["SELECT"], "Lookup de moneda."), item("SIA_OPERADORES", ["SELECT"], "Lookup de operador."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros de generación."), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad por usuario/interconectante."),
            ], "SIADFC08"),
            form("lp-emitidos-consulta", "Consulta Anulados · SIADFC51", "Título de pantalla: Líquidos Producto/Planillas de Transferencia – Anulados. Consulta de líquidos anulados; no se observó DML explícito.", [
              item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT"], "Consulta cabeceras aprobadas y anuladas.", "Filtro FECHA_APROBACION IS NOT NULL y FECHA_ANULACION"), item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT"], "Detalle del líquido consultado."), item("SIA_INTERCONECTANTES", ["SELECT"], "Lookup de prestador."), item("SIA_SERVICIOS", ["SELECT"], "Lookup de servicio."), item("SIA_MONEDAS", ["SELECT"], "Lookup de moneda."), item("SIA_OPERADORES", ["SELECT"], "Lookup de operador."), item("SIA_TIPO_INTERCONECTANTES", ["SELECT"], "Filtro de tipo de interconectante."), item("SIA_TIPOS_CONCEPTO", ["SELECT"], "Lookup de tipo de concepto."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros generales."), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad por usuario/interconectante."),
            ], "SIADFC51"),
            form("lp-emitidos-documentos", "Documentos Internos · SIADFC60", "Título de pantalla: Documento Interno / Planilla de Transferencia. Consulta de documentos internos; no se observó DML explícito.", [
              item("SIA_LIQUIDOS_PRODUCTOS", ["SELECT"], "Consulta cabecera del líquido/documento interno."), item("SIA_DETALLES_LIQUIDO_PRODUCTO", ["SELECT"], "Bloque detalle del documento."), item("SIA_INTERCONECTANTES", ["SELECT"], "Lookup de prestador."), item("SIA_SERVICIOS", ["SELECT"], "Lookup de servicio."), item("SIA_MONEDAS", ["SELECT"], "Lookup de moneda."), item("SIA_OPERADORES", ["SELECT"], "Lookup de operador."), item("SIA_TIPO_INTERCONECTANTES", ["SELECT"], "Filtro de tipo de interconectante."), item("SIA_TIPOS_CONCEPTO", ["SELECT"], "Lookup de tipo de concepto."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros generales."), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad por usuario/interconectante."),
            ], "SIADFC60"),
          ] },
          { id: "lp-recibidos", name: "Menú Apr/Anul Env LP Recibidos", kind: "menu", subtitle: "Menú de aplicación", children: [
            pendingMenu("lp-recibidos-registracion", "Registración"), pendingMenu("lp-recibidos-aprobacion", "Aprobación"), pendingMenu("lp-recibidos-anulacion", "Anulación"),
          ] },
        ],
      },
      form("liquidaciones-registracion", "Registración Liquidaciones · SIADFC35", "Título de pantalla: Liquidaciones Emitidas. Fuente actual: forms/SIADFC35.fmb (15/10/2026).", [
        item("SIA_LIQ_FCO_19_VW", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Vista Base 19 de cabecera para registrar y mantener liquidaciones emitidas.", "Modelo Base 19; UPDATE INTER.SIA_LIQ_FCO_19_VW confirmado en la fuente"),
        item("SIA_DET_LIQ_FCO_19_VW", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Vista Base 19 del detalle de liquidación; la fuente inserta detalles por la capa DB19.", "INSERT INTO INTER.SIA_DET_LIQ_FCO_19_VW confirmado"),
        item("SIA_COMP_LIQ_FCO_19_VW", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Vista Base 19 de composición entre liquidación, líquido producto y comprobante."),
        item("SIA_LIQ_PROD_19_VW", ["SELECT"], "Líquidos producto/documentos internos disponibles para asociar."), item("SIA_COMPROBANTES_19_VW", ["SELECT"], "Comprobantes disponibles para asociar."), item("SIA_CONC_LIQ_FCO_19_VW", ["SELECT"], "Conceptos de liquidación."), item("SIA_ALGORITMOS_LIQ_FCO_19_VW", ["SELECT"], "Algoritmos aplicables."), item("SIA_INTER_19_VW", ["SELECT"], "Filtro y lookup de prestador."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros funcionales."),
      ], "SIADFC35"),
      { id: "liquidaciones-fco", name: "Liquidaciones FCO", kind: "menu", subtitle: "Responsabilidad", description: "Pantallas de aprobación, anulación, envío, control y carga relacionadas con liquidaciones FCO.", children: [
            { id: "liquidaciones-gestion", name: "Aprobación / Anulación / Envío Liquidaciones", kind: "menu", subtitle: "Menú de aplicación", children: [
              form("liquidaciones-aprobacion", "Aprobación Liquidaciones · SIADFC36", "Título de pantalla: Aprobación de Liquidaciones Emitidas. Fuente actual: forms/SIADFC36.fmb (28/09/2026).", [
                item("SIA_LIQ_FCO_19_VW", ["SELECT", "UPDATE"], "Vista Base 19 de cabecera; aprueba la liquidación y registra fecha, usuario y número.", "UPDATE INTER.SIA_LIQ_FCO_19_VW SET FECHA_APROBACION, USUARIO_APROBACION, NUMERO_LIQUIDACION ..."),
                item("SIA_DET_LIQ_FCO_19_VW", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Vista Base 19 del detalle; las acciones Facturas a incluir/excluir ajustan los conceptos."), item("SIA_COMP_LIQ_FCO_19_VW", ["SELECT", "INSERT", "UPDATE", "DELETE"], "Vista Base 19 de composiciones; altas y bajas de inclusiones/exclusiones."), item("SIA_LIQ_PROD_19_VW", ["SELECT"], "Líquidos producto disponibles."), item("SIA_COMPROB_19_VW", ["SELECT"], "Comprobantes disponibles."), item("SIA_CONC_LIQ_FCO_19_VW", ["SELECT"], "Conceptos de liquidación."), item("SIA_INTER_19_VW", ["SELECT"], "Filtro de prestador."),
              ], "SIADFC36"),
              pendingMenu("liquidaciones-anulacion", "Anulación Liquidaciones"),
              form("liquidaciones-envio", "Envío Liquidaciones · SIADFC38", "Título de pantalla: Envío de Liquidaciones Emitidas. Fuente disponible: forms/SIADFC38.fmb (24/01/2020).", [
                item("SIA_LIQ_FCO_19_VW", ["SELECT", "UPDATE"], "Vista Base 19 de cabecera: el envío actualiza el estado, la fecha y el usuario de envío de la liquidación.", "Modelo Base 19 · acción Enviar; selección funcional sobre liquidaciones emitidas aprobadas"),
                item("SIA_DET_LIQ_FCO_19_VW", ["SELECT"], "Vista Base 19 del detalle de la liquidación enviada."), item("SIA_COMP_LIQ_FCO_19_VW", ["SELECT"], "Composición de la liquidación."), item("SIA_LIQ_PROD_19_VW", ["SELECT"], "Líquidos producto asociados."), item("SIA_COMPROB_19_VW", ["SELECT"], "Comprobantes asociados."), item("SIA_INTER_19_VW", ["SELECT"], "Filtro de prestador."), item("SIA_PROCESOS_INFORME_WEB", ["INSERT"], "Encola la generación de reportes web al enviar cuando existe un reporte vigente para el servicio.", "INSERT INTO SIA_PROCESOS_INFORME_WEB; validación con SIA_REP_WEB_SERVICIO_FCO"), item("SIA_REP_WEB_SERVICIO_FCO", ["SELECT"], "Determina si hay un reporte web vigente para el servicio de la liquidación."),
              ], "SIADFC38"),
            ] },
            { id: "liquidaciones-control", name: "Consultas FCO", kind: "menu", subtitle: "Menú de aplicación", children: [
              form("liquidaciones-control-consulta", "Control de Liquidación · SIADFC16", "Título de pantalla: Control de Liquidación. Consulta parametrizable para Bancos Fijos.", [
                item("SIA_CONSULTA_DINAMICA", ["SELECT"], "Definición de consultas y columnas dinámicas."), item("SIA_CAMPOS_REPORTE_FCO", ["SELECT"], "Campos disponibles para el reporte."), item("SIA_CONTROLES_PROCESO", ["SELECT"], "Controles de ejecución."), item("SIA_ESTADOS_CPTO_FCO", ["SELECT"], "Estados disponibles."), item("SIA_RELACIONES_CPTO_FCO", ["SELECT"], "Relaciones de conceptos FCO."), item("SIA_INTER_POR_TIPO", ["SELECT"], "Filtro de prestador por tipo."), item("SIA_INTERCONECTANTES", ["SELECT"], "Lookup de prestador."), item("SIA_SERVICIOS", ["SELECT"], "Lookup de servicio."), item("SIA_TIPO_INTERCONECTANTES", ["SELECT"], "Tipos de interconectante."), item("SIA_TMP_CTRL_LIQ_FCO", ["DELETE"], "Limpieza de controles temporales de la sesión al generar la consulta.", "DELETE FROM SIA_TMP_CTRL_LIQ_FCO WHERE USUARIO_ALTA = :PARAMETER.USR_SESSION"),
              ], "SIADFC16"),
            ] },
            { id: "planos-fco", name: "Carga de Archivos Planos", kind: "menu", subtitle: "Menú de aplicación", children: [
              form("planos-fco-control", "Consulta y Carga de Archivos Planos · SIADFC96", "Título de pantalla: Consulta y Carga de Archivos Planos. Fuente actual: forms/SIADFC96.fmb (19/10/2026).", [
                item("SIA_PLANOS_REC_FCO_19_VW", ["SELECT", "UPDATE"], "Vista Base 19 de planos recibidos; marca EN PROCESO y asigna PID para ejecutar la carga.", "UPDATE INTER.SIA_PLANOS_REC_FCO_19_VW SET MARCA_PROC = 'EN PROCESO', PID = ..."), item("SIA_PERIODOS_TRAFICO", ["SELECT"], "Período de tráfico."), item("SIA_LET_INTERFACE_PROC_FCO", ["SELECT"], "Relación letra/interfaz/proceso."), item("SIA_INTERFACES_PROC_FCO", ["SELECT"], "Configuración de interfaces."), item("SIA_EJECUTABLES_PROC_FCO", ["SELECT"], "Ejecutables asociados."), item("SIA_ERRORES_FORMATO", ["SELECT"], "Errores de formato y su descripción."), item("SIA_PARAMETROS_GRALES", ["SELECT"], "Parámetros de rutas y ejecución."),
              ], "SIADFC96"),
            ] },
            { id: "procesos-fco", name: "Procesos Generales - FCO", kind: "menu", subtitle: "Menú de aplicación", children: [
              form("procesos-generacion-lp", "Generación de Líquidos Producto · SIADPR05", "Título de pantalla: Generación de Líquidos Producto. Fuente actual: forms/SIADPR05.fmb (25/09/2026).", [
                item("SIA_PARAM_LP_19_VW", ["SELECT"], "Vista Base 19 de parametrización de generación por servicio, estado y tipo de documento.", "FROM INTER.SIA_PARAM_LP_19_VW"), item("SIA_DAEMON_19_VW", ["SELECT", "INSERT"], "Vista Base 19 de procesos daemon: consulta ejecuciones activas y crea el proceso de generación.", "SELECT FROM INTER.SIA_DAEMON_19_VW; alta funcional mediante INTER.SIA_PR05_DB19_PKG.CREAR_PROCESO"), item("SIA_INTER_19_VW", ["SELECT"], "Prestadores habilitados para ejecutar el proceso."), item("SIA_SERV_19_VW", ["SELECT"], "Servicios habilitados para ejecutar el proceso."), item("SIA_PARAM_GRAL_19_VW", ["SELECT"], "Parámetros generales Base 19."), item("SIA_CONTROLES_PROCESO", ["SELECT"], "Controles de ejecución."), item("SIA_PR05_DB19_PKG", ["INSERT"], "Paquete DB19 que obtiene secuencia y crea el proceso daemon; expone el PID al formulario.", "INTER.SIA_PR05_DB19_PKG.NEXT_DAEMON / CREAR_PROCESO"), item("SIA_USUARIO_INTERCONECTANTES", ["SELECT"], "Seguridad por usuario e interconectante."),
              ], "SIADPR05"),
            ] },
          ] },
        ],
      }],
    }],
};

function flattenTree(node: TreeNode, parents: string[] = []) {
  const current = [{ node, parents }];
  for (const child of node.children ?? []) {
    current.push(...flattenTree(child, [...parents, node.name]));
  }
  return current;
}

const allNodes = flattenTree(cleanTree);
const initialExpanded = new Set(
  allNodes
    .filter(({ node }) => node.kind !== "table")
    .map(({ node }) => node.id),
);

function collectOperations(node: TreeNode): Set<Operation> {
  const operations = new Set<Operation>(node.operations ?? []);
  node.impacts?.forEach((impact) =>
    impact.operations.forEach((operation) => operations.add(operation)),
  );
  node.children?.forEach((child) =>
    collectOperations(child).forEach((operation) => operations.add(operation)),
  );
  return operations;
}

function nodeMatches(
  node: TreeNode,
  query: string,
  operations: Set<Operation>,
): boolean {
  const normalized = query.trim().toLowerCase();
  const ownText = [
    node.name,
    node.subtitle,
    node.description,
    node.source,
    ...(node.impacts?.flatMap((impact) => [
      impact.table,
      impact.evidence,
      impact.description,
    ]) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const matchesQuery = !normalized || ownText.includes(normalized);
  const nodeOperations = collectOperations(node);
  const matchesOperations =
    operations.size === 0 ||
    [...operations].some((operation) => nodeOperations.has(operation));

  return (
    (matchesQuery && matchesOperations) ||
    (node.children?.some((child) => nodeMatches(child, query, operations)) ??
      false)
  );
}

function OperationPill({ operation }: { operation: Operation }) {
  return (
    <span className={`operation-pill ${operationStyles[operation]}`}>
      <span className="operation-dot" />
      {operation}
    </span>
  );
}

function TreeItem({
  node,
  depth,
  selectedId,
  expanded,
  query,
  filters,
  onSelect,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string;
  expanded: Set<string>;
  query: string;
  filters: Set<Operation>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  if (!nodeMatches(node, query, filters)) return null;

  const Icon = iconByKind[node.kind];
  const hasChildren = Boolean(node.children?.length);
  const isOpen = expanded.has(node.id) || Boolean(query) || filters.size > 0;
  const isSelected = selectedId === node.id;

  return (
    <div className="tree-branch">
      <div
        className={`tree-item ${isSelected ? "selected" : ""}`}
        style={{ paddingLeft: `${10 + depth * 22}px` }}
      >
        <button
          type="button"
          className={`tree-toggle ${!hasChildren ? "invisible" : ""}`}
          aria-label={isOpen ? "Contraer rama" : "Expandir rama"}
          onClick={() => hasChildren && onToggle(node.id)}
        >
          {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
        <button
          type="button"
          className="tree-main"
          onClick={() => onSelect(node.id)}
        >
          <span className={`node-icon node-${node.kind}`}>
            <Icon size={15} />
          </span>
          <span className="tree-copy">
            <strong>{node.name}</strong>
            {node.subtitle && <small>{node.subtitle}</small>}
          </span>
          {node.kind === "form" && (
            <span className="tree-count">{node.impacts?.length ?? 0}</span>
          )}
        </button>
      </div>
      {hasChildren && isOpen && (
        <div className="tree-children">
          {node.children?.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              query={query}
              filters={filters}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("lp-emitidos-registracion");
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);
  const [query, setQuery] = useState("");
  const [tableQuery, setTableQuery] = useState("");
  const [operationFilters, setOperationFilters] = useState<Set<Operation>>(
    new Set(),
  );

  const selectedEntry =
    allNodes.find(({ node }) => node.id === selectedId) ?? allNodes[0];
  const selected = selectedEntry.node;
  const selectedOperations = [...collectOperations(selected)];

  const summary = useMemo(() => {
    const forms = allNodes.filter(({ node }) => node.kind === "form").length;
    const tableNames = new Set(
      allNodes
        .filter(({ node }) => node.kind === "table")
        .map(({ node }) => node.name),
    );
    const packages = allNodes.filter(
      ({ node }) => node.kind === "package",
    ).length;
    const impactCount = allNodes.reduce(
      (total, { node }) => total + (node.impacts?.length ?? 0),
      0,
    );
    return { forms, tables: tableNames.size, packages, impactCount };
  }, []);

  const tableDependencies = useMemo(() => {
    const catalog = new Map<string, { formId: string; formName: string; operations: Set<Operation> }[]>();
    allNodes
      .filter(({ node }) => node.kind === "form")
      .forEach(({ node }) => {
        node.impacts?.forEach((impact) => {
          const usages = catalog.get(impact.table) ?? [];
          const existing = usages.find((usage) => usage.formId === node.id);
          if (existing) impact.operations.forEach((operation) => existing.operations.add(operation));
          else usages.push({ formId: node.id, formName: node.name, operations: new Set(impact.operations) });
          catalog.set(impact.table, usages);
        });
      });
    return [...catalog.entries()]
      .map(([table, usages]) => ({ table, usages }))
      .filter(({ table }) => table.toLowerCase().includes(tableQuery.trim().toLowerCase()))
      .sort((a, b) => a.table.localeCompare(b.table));
  }, [tableQuery]);

  function toggleNode(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleOperation(operation: Operation) {
    setOperationFilters((current) => {
      const next = new Set(current);
      if (next.has(operation)) next.delete(operation);
      else next.add(operation);
      return next;
    });
  }

  function selectNode(id: string) {
    setSelectedId(id);
    if (window.innerWidth < 900) {
      document
        .querySelector(".detail-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <FolderTree size={21} />
          </span>
          <div>
            <span className="eyebrow">Mapa de impacto</span>
            <h1>CARRIERS · FCO</h1>
          </div>
        </div>
        <div className="status-chip">
          <span className="status-dot" />
          Relevamiento · evidencia observada
        </div>
      </header>

      <section className="intro-strip">
        <div>
          <p className="kicker">RELEVAMIENTO ORACLE FORMS</p>
          <h2>Del menú FCO a cada tabla, sin perder el rastro.</h2>
          <p>
            Explorá cada pantalla <code>.fmb</code>, sus bloques y SQL embebido,
            con el tipo de operación detectado sobre cada tabla.
          </p>
        </div>
        <div className="summary-grid" aria-label="Resumen del relevamiento">
          <article><strong>{summary.forms}</strong><span>Pantallas</span></article>
          <article><strong>{summary.tables}</strong><span>Tablas</span></article>
          <article><strong>{summary.packages}</strong><span>Packages</span></article>
          <article><strong>{summary.impactCount}</strong><span>Impactos</span></article>
        </div>
      </section>

      <section className="workspace">
        <aside className="tree-panel panel">
          <div className="panel-heading">
            <div>
              <span className="section-label">ESTRUCTURA</span>
              <h3>Árbol funcional</h3>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setExpanded(
                  expanded.size > 2
                    ? new Set(["carriers", "fco"])
                    : new Set(initialExpanded),
                )
              }
            >
              {expanded.size > 2 ? "Contraer" : "Expandir"}
            </button>
          </div>

          <label className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar pantalla, tabla o package..."
              aria-label="Buscar en el árbol"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
                <X size={15} />
              </button>
            )}
          </label>

          <div className="filter-row">
            <span><Filter size={13} /> Filtrar</span>
            {(["SELECT", "INSERT", "UPDATE", "DELETE"] as Operation[]).map(
              (operation) => (
                <button
                  type="button"
                  key={operation}
                  className={`filter-chip ${operationFilters.has(operation) ? `active ${operationStyles[operation]}` : ""}`}
                  onClick={() => toggleOperation(operation)}
                >
                  {operation}
                </button>
              ),
            )}
          </div>

          <nav className="tree" aria-label="Árbol de pantallas FCO">
            <TreeItem
              node={cleanTree}
              depth={0}
              selectedId={selectedId}
              expanded={expanded}
              query={query}
              filters={operationFilters}
              onSelect={selectNode}
              onToggle={toggleNode}
            />
          </nav>

          <div className="legend">
            <span><i className="legend-line direct" /> Impacto directo</span>
            <span><i className="legend-line indirect" /> Vía package</span>
          </div>
        </aside>

        <section className="detail-panel panel">
          <div className="breadcrumb">
            {[...selectedEntry.parents, selected.name].map((part, index, list) => (
              <span key={`${part}-${index}`}>
                {part}
                {index < list.length - 1 && <ChevronRight size={13} />}
              </span>
            ))}
          </div>

          <div className="detail-title-row">
            <div className={`hero-icon node-${selected.kind}`}>
              {(() => {
                const Icon = iconByKind[selected.kind];
                return <Icon size={23} />;
              })()}
            </div>
            <div className="detail-heading-copy">
              <span className="section-label">{labelByKind[selected.kind]}</span>
              <h3>{selected.name}</h3>
              {selected.subtitle && <p>{selected.subtitle}</p>}
            </div>
            <span className="review-badge">Evidencia observada</span>
          </div>

          <p className="detail-description">
            {selected.description ??
              "Seleccioná una pantalla para ver el detalle de sus impactos, evidencias y dependencias técnicas."}
          </p>

          <div className="operation-summary">
            <span>Operaciones detectadas</span>
            <div>
              {selectedOperations.length ? (
                selectedOperations.map((operation) => (
                  <OperationPill key={operation} operation={operation} />
                ))
              ) : (
                <span className="empty-inline">Sin operaciones registradas</span>
              )}
            </div>
          </div>

          {selected.impacts?.length ? (
            <div className="impact-section">
              <div className="section-title-row">
                <div>
                  <span className="section-label">TRAZABILIDAD</span>
                  <h4>Tablas impactadas</h4>
                </div>
                <span>{selected.impacts.length} relaciones</span>
              </div>
              <div className="impact-list">
                {selected.impacts.map((impact) => (
                  <article
                    className={`impact-card ${impact.mode === "Directo" ? "impact-direct" : "impact-indirect"}`}
                    key={`${impact.table}-${impact.evidence}`}
                  >
                    <div className="impact-topline">
                      <div className="table-name">
                        <span><Table2 size={16} /></span>
                        <strong>{impact.table}</strong>
                      </div>
                      <span className={`mode-badge ${impact.mode.toLowerCase()}`}>
                        {impact.mode}
                      </span>
                    </div>
                    <p>{impact.description}</p>
                    <div className="impact-footer">
                      <div className="impact-operations">
                        {impact.operations.map((operation) => (
                          <OperationPill key={operation} operation={operation} />
                        ))}
                      </div>
                      <span className="evidence">
                        <FileCode2 size={14} /> {impact.evidence}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Database size={26} />
              <strong>No hay detalle asociado a este nodo</strong>
              <p>
                Abrí una pantalla <code>.fmb</code> para visualizar las tablas y
                evidencias detectadas.
              </p>
            </div>
          )}
        </section>
      </section>

      <section className="dependency-catalog panel" aria-label="Catálogo de dependencias por tabla">
        <div className="catalog-heading">
          <div>
            <span className="section-label">IMPACTO INVERSO</span>
            <h3>¿Qué pantallas dependen de cada tabla?</h3>
            <p>El catálogo se genera automáticamente a partir de las pantallas relevadas en este árbol.</p>
          </div>
          <label className="catalog-search">
            <Search size={16} />
            <input value={tableQuery} onChange={(event) => setTableQuery(event.target.value)} placeholder="Filtrar tabla o vista..." aria-label="Filtrar catálogo de tablas" />
          </label>
        </div>
        <div className="catalog-list">
          {tableDependencies.map(({ table, usages }) => (
            <article className="catalog-row" key={table}>
              <div className="catalog-table"><Database size={17} /><strong>{table}</strong><span>{usages.length} pantalla{usages.length === 1 ? "" : "s"}</span></div>
              <div className="catalog-usages">
                {usages.map((usage) => (
                  <button type="button" className="usage-link" key={usage.formId} onClick={() => selectNode(usage.formId)}>
                    <span>{usage.formName}</span>
                    {([...usage.operations] as Operation[]).map((operation) => <OperationPill key={operation} operation={operation} />)}
                  </button>
                ))}
              </div>
            </article>
          ))}
          {!tableDependencies.length && <div className="catalog-empty">No hay tablas o vistas que coincidan con el filtro.</div>}
        </div>
      </section>

      <footer>
        <span>CARRIERS · Relevamiento técnico FCO</span>
        <span>Fuente canónica: forms/ dentro del explorador. Los accesos se extraen de los .fmb y requieren validación XML si Oracle Forms está disponible.</span>
      </footer>
    </main>
  );
}
