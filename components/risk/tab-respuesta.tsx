"use client"

import type { RiskStore } from "@/hooks/use-risks"
import {
  type Control,
  type EstadoControl,
  type Estrategia,
  type Risk,
  ESTADOS_CONTROL,
  ESTADO_CONTROL_META,
  ESTRATEGIAS,
  avanceControles,
  calcZona,
  controlesCompletados,
  nivelInherente,
  nivelResidual,
  riskCode,
  zonaMeta,
} from "@/lib/risk"
import { ZonaBadge } from "./zona-badge"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowRight,
  Plus,
  ShieldCheck,
  Trash2,
  TrendingDown,
} from "lucide-react"

function PISelect({
  value,
  onChange,
  label,
}: {
  value: number
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 w-12 rounded-md border bg-background px-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  )
}

function ControlRow({
  control,
  riskId,
  store,
}: {
  control: Control
  riskId: number
  store: RiskStore
}) {
  const { updateControl, removeControl } = store
  const meta = ESTADO_CONTROL_META[control.estado]
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start gap-2">
        <Input
          value={control.texto}
          onChange={(e) =>
            updateControl(riskId, control.id, { texto: e.target.value })
          }
          placeholder="Acción de control..."
          className="h-9 flex-1"
        />
        <Button
          size="icon"
          variant="outline"
          className="size-9 shrink-0 text-critico hover:text-critico"
          title="Quitar control"
          onClick={() => removeControl(riskId, control.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <Select
            value={control.estado}
            onValueChange={(v) =>
              updateControl(riskId, control.id, {
                estado: v as EstadoControl,
                avance:
                  v === "Completado"
                    ? 100
                    : v === "Pendiente"
                      ? 0
                      : control.avance,
              })
            }
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_CONTROL.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Responsable</Label>
          <Input
            value={control.responsable}
            onChange={(e) =>
              updateControl(riskId, control.id, { responsable: e.target.value })
            }
            placeholder="Responsable"
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fecha límite</Label>
          <Input
            type="date"
            value={control.fechaLimite}
            onChange={(e) =>
              updateControl(riskId, control.id, { fechaLimite: e.target.value })
            }
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Avance: {control.avance}%
          </Label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={control.avance}
            onChange={(e) =>
              updateControl(riskId, control.id, {
                avance: Number(e.target.value),
              })
            }
            className="w-full accent-[var(--primary)]"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            meta.badge,
          )}
        >
          {control.estado}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full transition-all", meta.bar)}
            style={{ width: `${control.avance}%` }}
          />
        </div>
      </div>

      <Input
        value={control.nota}
        onChange={(e) =>
          updateControl(riskId, control.id, { nota: e.target.value })
        }
        placeholder="Nota de seguimiento (opcional)..."
        className="mt-3 h-8 text-xs"
      />
    </div>
  )
}

function RiskResponseCard({
  risk,
  store,
}: {
  risk: Risk
  store: RiskStore
}) {
  const { updateRisk, addControl } = store
  const nivelInh = nivelInherente(risk)
  const nivelRes = nivelResidual(risk)
  const zonaInh = calcZona(nivelInh)
  const zonaRes = calcZona(nivelRes)
  const reduccion =
    nivelInh > 0 ? Math.round(((nivelInh - nivelRes) / nivelInh) * 100) : 0
  const avance = avanceControles(risk)
  const completados = controlesCompletados(risk)

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                {riskCode(risk)}{" "}
                <span className="font-normal text-muted-foreground">
                  · {risk.categoria}
                </span>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {risk.descripcion}
              </p>
            </div>
            <div className="w-40 shrink-0">
              <Label className="text-xs text-muted-foreground">Estrategia</Label>
              <Select
                value={risk.estrategia}
                onValueChange={(v) =>
                  updateRisk(risk.id, { estrategia: v as Estrategia })
                }
              >
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTRATEGIAS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Riesgo inherente -> residual */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-secondary/60 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Inherente
              </span>
              <ZonaBadge zona={zonaInh} showNivel nivel={nivelInh} />
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Residual
              </span>
              <ZonaBadge zona={zonaRes} showNivel nivel={nivelRes} />
            </div>
            <span
              className={cn(
                "ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                reduccion > 0
                  ? "bg-bajo-soft text-bajo-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <TrendingDown className="size-3.5" />
              {reduccion}% reducción
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Editor de riesgo residual */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Riesgo residual (tras controles)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PISelect
                label="P"
                value={risk.probabilidadResidual}
                onChange={(v) =>
                  updateRisk(risk.id, { probabilidadResidual: v })
                }
              />
              <PISelect
                label="I"
                value={risk.impactoResidual}
                onChange={(v) => updateRisk(risk.id, { impactoResidual: v })}
              />
              <span className="text-sm">
                Nivel <strong>{nivelRes}</strong>
              </span>
              <ZonaBadge zona={zonaRes} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Responsable del riesgo
              </Label>
              <Input
                value={risk.responsable}
                onChange={(e) =>
                  updateRisk(risk.id, { responsable: e.target.value })
                }
                className="h-8"
                placeholder="Responsable"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Indicador</Label>
              <Input
                value={risk.indicador}
                onChange={(e) =>
                  updateRisk(risk.id, { indicador: e.target.value })
                }
                className="h-8"
                placeholder="Indicador de seguimiento"
              />
            </div>
          </div>
        </div>

        {/* Seguimiento de controles */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Seguimiento de
              controles
              <span className="font-normal text-muted-foreground">
                ({completados}/{risk.controles.length} completados)
              </span>
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${avance}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {avance}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {risk.controles.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Sin controles. Agrega uno para iniciar el seguimiento.
              </p>
            ) : (
              risk.controles.map((c) => (
                <ControlRow
                  key={c.id}
                  control={c}
                  riskId={risk.id}
                  store={store}
                />
              ))
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addControl(risk.id)}
            >
              <Plus className="size-4" /> Agregar control
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TabRespuesta({ store }: { store: RiskStore }) {
  const { risks } = store
  const sorted = [...risks].sort((a, b) => nivelInherente(b) - nivelInherente(a))

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Estrategias de respuesta:
          </span>
          <span>
            <strong className="text-critico-foreground">Evitar</strong> ·
            eliminar la amenaza
          </span>
          <span>
            <strong className="text-alto-foreground">Mitigar</strong> · reducir
            probabilidad/impacto
          </span>
          <span>
            <strong className="text-moderado-foreground">Transferir</strong> ·
            trasladar a un tercero
          </span>
          <span>
            <strong className="text-bajo-foreground">Aceptar</strong> · actuar
            si se materializa
          </span>
        </CardContent>
      </Card>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay riesgos registrados.
          </CardContent>
        </Card>
      ) : (
        sorted.map((r) => (
          <RiskResponseCard key={r.id} risk={r} store={store} />
        ))
      )}
    </div>
  )
}
