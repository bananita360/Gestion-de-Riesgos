"use client"

import type { RiskStore } from "@/hooks/use-risks"
import {
  ESTADO_CONTROL_META,
  FRECUENCIAS_REVISION,
  avanceControles,
  calcZona,
  controlesCompletados,
  nivelResidual,
  riskCode,
} from "@/lib/risk"
import { ZonaBadge } from "./zona-badge"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Eye } from "lucide-react"

export function TabMonitoreo({ store }: { store: RiskStore }) {
  const { risks, updateRisk } = store

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="size-4 text-muted-foreground" /> Tablero de monitoreo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Riesgo</TableHead>
                <TableHead>Zona residual</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead>Estado de controles</TableHead>
                <TableHead className="w-40">Frecuencia revisión</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="min-w-[200px]">Seguimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No hay riesgos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                risks.map((r) => {
                  const zona = calcZona(nivelResidual(r))
                  const avance = avanceControles(r)
                  const completados = controlesCompletados(r)
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="align-top">
                        <div className="font-semibold">{riskCode(r)}</div>
                        <div className="max-w-[180px] text-xs text-muted-foreground line-clamp-2">
                          {r.descripcion}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <ZonaBadge zona={zona} />
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {r.indicador || "—"}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${avance}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {avance}%
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {r.controles.map((c) => (
                              <span
                                key={c.id}
                                title={`${c.texto || "Control"} — ${c.estado}`}
                                className={cn(
                                  "size-2.5 rounded-full",
                                  ESTADO_CONTROL_META[c.estado].bar,
                                )}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {completados}/{r.controles.length} completados
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Select
                          value={r.frecuenciaRevision}
                          onValueChange={(v) =>
                            updateRisk(r.id, { frecuenciaRevision: v })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FRECUENCIAS_REVISION.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {r.responsable || "—"}
                      </TableCell>
                      <TableCell className="align-top">
                        <Input
                          value={r.seguimiento}
                          onChange={(e) =>
                            updateRisk(r.id, { seguimiento: e.target.value })
                          }
                          placeholder="Acción / observación..."
                          className="h-8"
                        />
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
  )
}
