"use client"

import { useState } from "react"
import type { RiskStore } from "@/hooks/use-risks"
import {
  type Frecuencia,
  type Zona,
  FRECUENCIAS,
  FREQ_PCT,
  calcZona,
  nivelInherente,
  riskCode,
  zonaMeta,
} from "@/lib/risk"
import { ZonaBadge } from "./zona-badge"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Info } from "lucide-react"

const FILTERS: ("all" | Zona)[] = ["all", "Crítica", "Alta", "Moderada", "Baja"]

function FreqBar({ frecuencia }: { frecuencia: Frecuencia }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", zonaMeta(
            FREQ_PCT[frecuencia] >= 78
              ? "Crítica"
              : FREQ_PCT[frecuencia] >= 56
                ? "Alta"
                : FREQ_PCT[frecuencia] >= 34
                  ? "Moderada"
                  : "Baja",
          ).solid)}
          style={{ width: `${FREQ_PCT[frecuencia]}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{frecuencia}</span>
    </div>
  )
}

const NumberStepper = ({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) => (
  <select
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="h-8 w-14 rounded-md border bg-background px-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <option key={n} value={n}>
        {n}
      </option>
    ))}
  </select>
)

export function TabAnalisis({ store }: { store: RiskStore }) {
  const { risks, updateRisk } = store
  const [filter, setFilter] = useState<"all" | Zona>("all")

  const filtered = risks.filter(
    (r) => filter === "all" || calcZona(nivelInherente(r)) === filter,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-sm text-muted-foreground">
          Filtrar por zona:
        </Label>
        <Select value={filter} onValueChange={(v) => setFilter(v as never)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f === "all" ? "Todas las zonas" : f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {(["Crítica", "Alta", "Moderada", "Baja"] as Zona[]).map((z) => (
            <span key={z} className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded", zonaMeta(z).dot)} />
              {z}
            </span>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Riesgo</TableHead>
                  <TableHead className="text-center">Probabilidad</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead className="text-center">Impacto</TableHead>
                  <TableHead className="text-center">Nivel</TableHead>
                  <TableHead>Zona</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Sin riesgos para este filtro.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => {
                    const nivel = nivelInherente(r)
                    const zona = calcZona(nivel)
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="max-w-[260px]">
                          <div className="font-semibold">{riskCode(r)}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {r.descripcion}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <NumberStepper
                            value={r.probabilidad}
                            onChange={(v) =>
                              updateRisk(r.id, { probabilidad: v })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <FreqBar frecuencia={r.frecuencia} />
                            <Select
                              value={r.frecuencia}
                              onValueChange={(v) =>
                                updateRisk(r.id, { frecuencia: v as Frecuencia })
                              }
                            >
                              <SelectTrigger className="h-7 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FRECUENCIAS.map((f) => (
                                  <SelectItem key={f} value={f}>
                                    {f}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <NumberStepper
                            value={r.impacto}
                            onChange={(v) => updateRisk(r.id, { impacto: v })}
                          />
                        </TableCell>
                        <TableCell className="text-center text-base font-bold">
                          {nivel}
                        </TableCell>
                        <TableCell>
                          <ZonaBadge zona={zona} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-muted-foreground" /> Escala de
            calificación y frecuencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <p className="mb-3 text-sm font-medium">
              Clasificación del nivel (Probabilidad × Impacto)
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { z: "Baja" as Zona, r: "1 – 5" },
                { z: "Moderada" as Zona, r: "6 – 10" },
                { z: "Alta" as Zona, r: "11 – 15" },
                { z: "Crítica" as Zona, r: "16 – 25" },
              ].map(({ z, r }) => (
                <div
                  key={z}
                  className={cn(
                    "rounded-lg p-3 text-sm",
                    zonaMeta(z).badge,
                  )}
                >
                  <div className="font-semibold">{z}</div>
                  <div className="opacity-80">Nivel {r}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Referencia temporal</TableHead>
                  <TableHead>Frecuencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Muy alta", "Ocurre casi con certeza", "≥ 1 vez por semana"],
                  ["Alta", "Varias veces en proyectos similares", "1 vez al mes"],
                  ["Media", "Podría ocurrir en algún momento", "1 vez por trimestre"],
                  ["Baja", "Poco probable, pero no imposible", "1 vez por semestre"],
                  ["Muy baja", "Excepcional, rara vez ocurre", "1 vez al año o menos"],
                ].map(([nivel, desc, ref]) => (
                  <TableRow key={nivel}>
                    <TableCell className="font-medium">{nivel}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {desc}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ref}</TableCell>
                    <TableCell className="w-40">
                      <FreqBar frecuencia={nivel as Frecuencia} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
