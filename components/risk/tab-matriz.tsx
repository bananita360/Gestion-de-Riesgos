"use client"

import { useState } from "react"
import type { RiskStore } from "@/hooks/use-risks"
import {
  type Zona,
  calcZona,
  nivelInherente,
  nivelResidual,
  riskCode,
  zonaMeta,
} from "@/lib/risk"
import { RiskMatrix } from "./risk-matrix"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Lightbulb, Grid3x3 } from "lucide-react"

export function TabMatriz({ store }: { store: RiskStore }) {
  const { risks } = store
  const [mode, setMode] = useState<"inherente" | "residual">("inherente")
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const nivelFn = mode === "residual" ? nivelResidual : nivelInherente

  const byZona: Record<Zona, string[]> = {
    Crítica: [],
    Alta: [],
    Moderada: [],
    Baja: [],
  }
  risks.forEach((r) => {
    const z = calcZona(nivelFn(r))
    const p = mode === "residual" ? r.probabilidadResidual : r.probabilidad
    const i = mode === "residual" ? r.impactoResidual : r.impacto
    byZona[z].push(`${riskCode(r)} (P:${p}, I:${i})`)
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Grid3x3 className="size-4 text-muted-foreground" /> Matriz de
              riesgos
            </CardTitle>
            <div className="flex rounded-lg border bg-secondary p-1 text-xs font-semibold">
              {(["inherente", "residual"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setHighlighted(null)
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 capitalize transition",
                    mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "inherente" ? "Riesgo inherente" : "Riesgo residual"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            {mode === "inherente"
              ? "Probabilidad e impacto del riesgo antes de aplicar controles. Haz clic en una celda para resaltarla."
              : "Probabilidad e impacto estimados después de aplicar los controles (riesgo residual)."}
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {(["Crítica", "Alta", "Moderada", "Baja"] as Zona[]).map((z) => (
              <span key={z} className="flex items-center gap-1.5">
                <span className={cn("size-3 rounded", zonaMeta(z).dot)} />
                {z}
              </span>
            ))}
          </div>
          <RiskMatrix
            risks={risks}
            mode={mode}
            highlighted={highlighted}
            onCellClick={(p, i) => {
              const key = `${p}-${i}`
              setHighlighted((cur) => (cur === key ? null : key))
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-muted-foreground" /> Análisis de
            resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {risks.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Agrega riesgos para ver el análisis.
            </p>
          ) : (
            <>
              {byZona.Crítica.length > 0 && (
                <Insight zona="Crítica" label="Riesgos críticos">
                  {byZona.Crítica.join(", ")}. Requieren acción inmediata y plan
                  de contingencia.
                </Insight>
              )}
              {byZona.Alta.length > 0 && (
                <Insight zona="Alta" label="Atención inmediata">
                  {byZona.Alta.join(", ")}. Respuesta activa y monitoreo
                  semanal.
                </Insight>
              )}
              {byZona.Moderada.length > 0 && (
                <Insight zona="Moderada" label="Monitoreo periódico">
                  {byZona.Moderada.join(", ")}.
                </Insight>
              )}
              {byZona.Baja.length > 0 && (
                <Insight zona="Baja" label="Riesgo bajo">
                  {byZona.Baja.join(", ")}. Revisión trimestral.
                </Insight>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Insight({
  zona,
  label,
  children,
}: {
  zona: Zona
  label: string
  children: React.ReactNode
}) {
  const meta = zonaMeta(zona)
  return (
    <div
      className={cn(
        "rounded-r-md border-l-4 p-3 text-sm leading-relaxed",
        meta.badge,
      )}
      style={{ borderLeftColor: `var(--${meta.token})` }}
    >
      <strong>{label}:</strong> {children}
    </div>
  )
}
