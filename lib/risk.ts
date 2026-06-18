export type Frecuencia = "Muy baja" | "Baja" | "Media" | "Alta" | "Muy alta"

export type Estrategia =
  | "Mitigar"
  | "Evitar"
  | "Transferir"
  | "Aceptar"
  | "Aceptar / Mitigar"
  | "Transferir / Mitigar"

export type Zona = "Crítica" | "Alta" | "Moderada" | "Baja"

export type EstadoControl = "Pendiente" | "En progreso" | "Completado"

export interface Control {
  id: string
  texto: string
  estado: EstadoControl
  responsable: string
  fechaLimite: string
  avance: number
  nota: string
}

export interface Risk {
  id: number
  descripcion: string
  categoria: string
  probabilidad: number
  impacto: number
  frecuencia: Frecuencia
  estrategia: Estrategia
  controles: Control[]
  responsable: string
  indicador: string
  frecuenciaRevision: string
  seguimiento: string
  probabilidadResidual: number
  impactoResidual: number
}

export const CATEGORIAS = [
  "Gestión de cliente",
  "Alcance",
  "Financiero",
  "Técnico",
  "Recursos humanos",
  "Cronograma",
  "Gestión del cambio",
  "Comercial",
  "Otro",
]

export const ESTRATEGIAS: Estrategia[] = [
  "Mitigar",
  "Evitar",
  "Transferir",
  "Aceptar",
  "Aceptar / Mitigar",
  "Transferir / Mitigar",
]

export const FRECUENCIAS: Frecuencia[] = [
  "Muy baja",
  "Baja",
  "Media",
  "Alta",
  "Muy alta",
]

export const FRECUENCIAS_REVISION = [
  "Diario",
  "Semanal",
  "Quincenal",
  "Mensual",
  "Trimestral",
]

export const ESTADOS_CONTROL: EstadoControl[] = [
  "Pendiente",
  "En progreso",
  "Completado",
]

export const FREQ_PCT: Record<Frecuencia, number> = {
  "Muy alta": 100,
  Alta: 78,
  Media: 56,
  Baja: 34,
  "Muy baja": 18,
}

// --- Cálculo de riesgo ---
export function calcNivel(probabilidad: number, impacto: number): number {
  return probabilidad * impacto
}

export function calcZona(nivel: number): Zona {
  if (nivel >= 16) return "Crítica"
  if (nivel >= 11) return "Alta"
  if (nivel >= 6) return "Moderada"
  return "Baja"
}

export interface ZonaMeta {
  zona: Zona
  /** Texto color clave del token */
  token: "critico" | "alto" | "moderado" | "bajo"
  recomendacion: string
  /** clase para badge / chip */
  badge: string
  /** clase para celda de matriz */
  cell: string
  /** clase para el punto de leyenda */
  dot: string
  /** clase texto sólido */
  text: string
  /** clase de fondo sólido (acento) */
  solid: string
}

const ZONA_MAP: Record<Zona, ZonaMeta> = {
  Crítica: {
    zona: "Crítica",
    token: "critico",
    recomendacion: "Acción inmediata. Requiere plan de contingencia.",
    badge: "bg-critico-soft text-critico-foreground ring-1 ring-critico/25",
    cell: "bg-critico-soft text-critico-foreground ring-1 ring-critico/20",
    dot: "bg-critico",
    text: "text-critico-foreground",
    solid: "bg-critico text-white",
  },
  Alta: {
    zona: "Alta",
    token: "alto",
    recomendacion: "Respuesta activa. Monitorear semanalmente.",
    badge: "bg-alto-soft text-alto-foreground ring-1 ring-alto/30",
    cell: "bg-alto-soft text-alto-foreground ring-1 ring-alto/25",
    dot: "bg-alto",
    text: "text-alto-foreground",
    solid: "bg-alto text-white",
  },
  Moderada: {
    zona: "Moderada",
    token: "moderado",
    recomendacion: "Monitorear periódicamente.",
    badge: "bg-moderado-soft text-moderado-foreground ring-1 ring-moderado/30",
    cell: "bg-moderado-soft text-moderado-foreground ring-1 ring-moderado/25",
    dot: "bg-moderado",
    text: "text-moderado-foreground",
    solid: "bg-moderado text-white",
  },
  Baja: {
    zona: "Baja",
    token: "bajo",
    recomendacion: "Aceptar. Revisión trimestral.",
    badge: "bg-bajo-soft text-bajo-foreground ring-1 ring-bajo/30",
    cell: "bg-bajo-soft text-bajo-foreground ring-1 ring-bajo/25",
    dot: "bg-bajo",
    text: "text-bajo-foreground",
    solid: "bg-bajo text-white",
  },
}

export function zonaMeta(zona: Zona): ZonaMeta {
  return ZONA_MAP[zona]
}

export function riskCode(r: Risk): string {
  return "R" + r.id
}

export function clampPI(value: number | string): number {
  const n = typeof value === "string" ? parseInt(value, 10) : value
  return Math.min(5, Math.max(1, Number.isNaN(n) ? 1 : n))
}

// Nivel inherente
export function nivelInherente(r: Risk): number {
  return calcNivel(r.probabilidad, r.impacto)
}

// Nivel residual (después de aplicar los controles)
export function nivelResidual(r: Risk): number {
  return calcNivel(r.probabilidadResidual, r.impactoResidual)
}

// % de avance global de los controles de un riesgo
export function avanceControles(r: Risk): number {
  if (!r.controles.length) return 0
  const total = r.controles.reduce((acc, c) => acc + (c.avance || 0), 0)
  return Math.round(total / r.controles.length)
}

export function controlesCompletados(r: Risk): number {
  return r.controles.filter((c) => c.estado === "Completado").length
}

export function newControlId(): string {
  return "c-" + Math.random().toString(36).slice(2, 9)
}

export const ESTADO_CONTROL_META: Record<
  EstadoControl,
  { badge: string; bar: string }
> = {
  Pendiente: {
    badge: "bg-muted text-muted-foreground ring-1 ring-border",
    bar: "bg-muted-foreground/40",
  },
  "En progreso": {
    badge: "bg-alto-soft text-alto-foreground ring-1 ring-alto/30",
    bar: "bg-alto",
  },
  Completado: {
    badge: "bg-bajo-soft text-bajo-foreground ring-1 ring-bajo/30",
    bar: "bg-bajo",
  },
}

function ctrl(
  texto: string,
  estado: EstadoControl,
  responsable: string,
  fechaLimite: string,
  avance: number,
  nota = "",
): Control {
  return { id: newControlId(), texto, estado, responsable, fechaLimite, avance, nota }
}

export const DEFAULT_RISKS: Risk[] = [
  {
    id: 1,
    descripcion: "Retraso en la entrega de requerimientos por parte de las PYMES",
    categoria: "Gestión de cliente",
    probabilidad: 4,
    impacto: 4,
    frecuencia: "Alta",
    estrategia: "Mitigar",
    controles: [
      ctrl("Definir fechas límite contractuales", "Completado", "Líder del proyecto", "2025-02-15", 100, "Cláusulas firmadas con 3 PYMES"),
      ctrl("Reuniones semanales de avance", "En progreso", "Líder del proyecto", "2025-06-30", 60),
      ctrl("Checklist de entrega de requerimientos", "Pendiente", "Analista de requisitos", "2025-07-10", 0),
    ],
    responsable: "Líder del proyecto",
    indicador: "% requerimientos entregados a tiempo",
    frecuenciaRevision: "Semanal",
    seguimiento: "Verificación de avances en reunión",
    probabilidadResidual: 2,
    impactoResidual: 3,
  },
  {
    id: 2,
    descripcion: "Cambios frecuentes en los requerimientos durante el desarrollo",
    categoria: "Alcance",
    probabilidad: 5,
    impacto: 5,
    frecuencia: "Muy alta",
    estrategia: "Mitigar",
    controles: [
      ctrl("Control formal de cambios (CR)", "Completado", "Analista de requisitos", "2025-03-01", 100),
      ctrl("Congelación de alcance por sprint", "En progreso", "Scrum Master", "2025-06-30", 70),
      ctrl("Validación y firma del cliente antes de implementar", "En progreso", "Analista de requisitos", "2025-06-25", 40),
    ],
    responsable: "Analista de requisitos",
    indicador: "Nro. de cambios aprobados vs rechazados",
    frecuenciaRevision: "Semanal",
    seguimiento: "Registro en control de cambios",
    probabilidadResidual: 3,
    impactoResidual: 4,
  },
  {
    id: 3,
    descripcion: "Falta de recursos económicos para continuar el proyecto",
    categoria: "Financiero",
    probabilidad: 3,
    impacto: 5,
    frecuencia: "Media",
    estrategia: "Aceptar / Mitigar",
    controles: [
      ctrl("Control financiero mensual", "En progreso", "Gerente del proyecto", "2025-06-30", 80),
      ctrl("Reserva de contingencia del 15%", "Completado", "Gerente del proyecto", "2025-01-20", 100),
      ctrl("Identificar financiadores alternativos", "Pendiente", "Gerente comercial", "2025-08-01", 10),
    ],
    responsable: "Gerente del proyecto",
    indicador: "% ejecución presupuestal",
    frecuenciaRevision: "Mensual",
    seguimiento: "Revisión financiera e informe",
    probabilidadResidual: 2,
    impactoResidual: 4,
  },
  {
    id: 4,
    descripcion: "Fallas en hosting, dominio o infraestructura tecnológica",
    categoria: "Técnico",
    probabilidad: 3,
    impacto: 4,
    frecuencia: "Media",
    estrategia: "Transferir / Mitigar",
    controles: [
      ctrl("Contratar SLA con proveedor de hosting", "Completado", "Administrador TI", "2025-02-10", 100),
      ctrl("Plan de contingencia en nube secundaria", "En progreso", "Administrador TI", "2025-07-01", 50),
      ctrl("Monitoreo de uptime", "En progreso", "Administrador TI", "2025-06-30", 65),
    ],
    responsable: "Administrador TI",
    indicador: "% disponibilidad mensual del servidor",
    frecuenciaRevision: "Semanal",
    seguimiento: "Dashboard de monitoreo uptime",
    probabilidadResidual: 2,
    impactoResidual: 3,
  },
  {
    id: 5,
    descripcion: "Pérdida de información o respaldos insuficientes",
    categoria: "Técnico",
    probabilidad: 3,
    impacto: 5,
    frecuencia: "Baja",
    estrategia: "Evitar",
    controles: [
      ctrl("Respaldos automáticos diarios en nube", "Completado", "Administrador TI", "2025-02-01", 100),
      ctrl("Prueba de restauración mensual", "En progreso", "Administrador TI", "2025-06-30", 50),
      ctrl("Políticas de retención de datos", "Pendiente", "Administrador TI", "2025-07-15", 0),
    ],
    responsable: "Administrador TI",
    indicador: "Nro. de copias realizadas y validadas",
    frecuenciaRevision: "Diario",
    seguimiento: "Validación automática de respaldos",
    probabilidadResidual: 1,
    impactoResidual: 4,
  },
  {
    id: 6,
    descripcion: "Ausencia o renuncia de un desarrollador clave",
    categoria: "Recursos humanos",
    probabilidad: 3,
    impacto: 4,
    frecuencia: "Media",
    estrategia: "Mitigar",
    controles: [
      ctrl("Documentación técnica actualizada", "En progreso", "Líder técnico", "2025-06-30", 55),
      ctrl("Plan de sucesión", "Pendiente", "Líder técnico", "2025-08-01", 20),
      ctrl("Contrato con desarrollador externo de respaldo", "Pendiente", "Gerente del proyecto", "2025-07-20", 0),
    ],
    responsable: "Líder técnico",
    indicador: "% documentación técnica completada",
    frecuenciaRevision: "Quincenal",
    seguimiento: "Revisión de repositorio de docs",
    probabilidadResidual: 2,
    impactoResidual: 3,
  },
  {
    id: 7,
    descripcion: "Retrasos en el cronograma de actividades",
    categoria: "Cronograma",
    probabilidad: 4,
    impacto: 4,
    frecuencia: "Alta",
    estrategia: "Mitigar",
    controles: [
      ctrl("Seguimiento semanal de cronograma", "En progreso", "Líder del proyecto", "2025-06-30", 70),
      ctrl("Alertas automáticas de desvío", "Completado", "Líder del proyecto", "2025-03-05", 100),
      ctrl("Revisión de holguras cada 2 semanas", "En progreso", "Líder del proyecto", "2025-06-28", 50),
    ],
    responsable: "Líder del proyecto",
    indicador: "% actividades cumplidas según plan",
    frecuenciaRevision: "Semanal",
    seguimiento: "Comparación plan-real (Gantt)",
    probabilidadResidual: 2,
    impactoResidual: 3,
  },
  {
    id: 8,
    descripcion: "Vulnerabilidades de seguridad en el software desarrollado",
    categoria: "Técnico",
    probabilidad: 3,
    impacto: 5,
    frecuencia: "Media",
    estrategia: "Mitigar",
    controles: [
      ctrl("Pruebas de penetración antes del despliegue", "Pendiente", "Equipo de desarrollo", "2025-08-10", 15),
      ctrl("Revisión de código (code review)", "En progreso", "Equipo de desarrollo", "2025-06-30", 60),
      ctrl("Actualizaciones de dependencias", "En progreso", "Equipo de desarrollo", "2025-06-30", 75),
    ],
    responsable: "Equipo de desarrollo",
    indicador: "Nro. de vulnerabilidades detectadas y resueltas",
    frecuenciaRevision: "Mensual",
    seguimiento: "Registro y corrección en backlog",
    probabilidadResidual: 2,
    impactoResidual: 4,
  },
  {
    id: 9,
    descripcion: "Baja aceptación del sistema por parte de los usuarios finales",
    categoria: "Gestión del cambio",
    probabilidad: 2,
    impacto: 4,
    frecuencia: "Baja",
    estrategia: "Mitigar",
    controles: [
      ctrl("Capacitación a usuarios finales", "Pendiente", "Líder del proyecto", "2025-09-01", 0),
      ctrl("Pilotos controlados antes del despliegue", "Pendiente", "Líder del proyecto", "2025-08-15", 10),
    ],
    responsable: "Líder del proyecto",
    indicador: "% usuarios que aprueban el sistema",
    frecuenciaRevision: "Mensual",
    seguimiento: "Encuesta de satisfacción de usuarios",
    probabilidadResidual: 1,
    impactoResidual: 3,
  },
  {
    id: 10,
    descripcion: "Competencia con precios inferiores o servicios similares",
    categoria: "Comercial",
    probabilidad: 2,
    impacto: 3,
    frecuencia: "Media",
    estrategia: "Aceptar",
    controles: [
      ctrl("Análisis de propuesta de valor", "Completado", "Gerente comercial", "2025-02-20", 100),
      ctrl("Benchmarking trimestral de precios", "En progreso", "Gerente comercial", "2025-06-30", 50),
    ],
    responsable: "Gerente comercial",
    indicador: "Análisis de competencia",
    frecuenciaRevision: "Trimestral",
    seguimiento: "Benchmarking de precios y servicios",
    probabilidadResidual: 2,
    impactoResidual: 2,
  },
]
