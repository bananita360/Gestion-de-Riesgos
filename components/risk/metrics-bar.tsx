"use client"

import { cn } from "@/lib/utils"
import {
  type Risk,
  avanceControles,
  calcZona,
  nivelInherente,
  nivelResidual,
} from "@/lib/risk"
import {
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Layers,
} from "lucide-react"

function Metric({
  label,
  value,
  sub,
  valueClass,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  valueClass?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <div className={cn("mt-2 text-3xl font-semibold leading-none tracking-tight", valueClass)}>
        {value}
      </div>
      {sub ? (
        <div className="mt-1.5 text-xs text-muted-foreground">{sub}</div>
      ) : null}
    </div>
  )
}

export function MetricsBar({ risks }: { risks: Risk[] }) {
  const counts = { critico: 0, alto: 0, moderado: 0, bajo: 0 }
  let avanceTotal = 0
  let nivelInhTotal = 0
  let nivelResTotal = 0

  risks.forEach((r) => {
    const z = calcZona(nivelInherente(r))
    if (z === "Crítica") counts.critico++
    else if (z === "Alta") counts.alto++
    else if (z === "Moderada") counts.moderado++
    else counts.bajo++
    avanceTotal += avanceControles(r)
    nivelInhTotal += nivelInherente(r)
    nivelResTotal += nivelResidual(r)
  })

  const avanceProm = risks.length ? Math.round(avanceTotal / risks.length) : 0
  const reduccion =
    nivelInhTotal > 0
      ? Math.round(((nivelInhTotal - nivelResTotal) / nivelInhTotal) * 100)
      : 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Metric
        label="Total riesgos"
        value={risks.length}
        icon={<Layers className="size-4 text-muted-foreground" />}
      />
      <Metric
        label="Críticos"
        value={counts.critico}
        valueClass="text-critico"
        icon={<AlertTriangle className="size-4 text-critico" />}
      />
      <Metric label="Altos" value={counts.alto} valueClass="text-alto" />
      <Metric
        label="Moderados"
        value={counts.moderado}
        valueClass="text-moderado"
      />
      <Metric
        label="Avance controles"
        value={`${avanceProm}%`}
        sub="Promedio del plan"
        icon={<ShieldCheck className="size-4 text-moderado" />}
      />
      <Metric
        label="Reducción residual"
        value={`${reduccion}%`}
        sub="Inherente → residual"
        valueClass="text-bajo"
        icon={<TrendingDown className="size-4 text-bajo" />}
      />
    </div>
  )
}
