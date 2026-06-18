"use client"

import { useEffect, useState } from "react"
import type { RiskStore } from "@/hooks/use-risks"
import {
  type Frecuencia,
  CATEGORIAS,
  FRECUENCIAS,
  calcNivel,
  calcZona,
  riskCode,
  zonaMeta,
} from "@/lib/risk"
import { MiniMatrix } from "./risk-matrix"
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
import { Calculator, Plus, Save } from "lucide-react"

export function TabEvaluar({
  store,
  defaultRiskId,
  onGotoRegistro,
}: {
  store: RiskStore
  defaultRiskId: number | null
  onGotoRegistro: () => void
}) {
  const { risks, addRisk, updateRisk } = store
  const [mode, setMode] = useState<"existing" | "new">("existing")
  const [selectedId, setSelectedId] = useState<string>("")
  const [prob, setProb] = useState(3)
  const [imp, setImp] = useState(3)
  const [frecuencia, setFrecuencia] = useState<Frecuencia>("Media")
  const [desc, setDesc] = useState("")
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [responsable, setResponsable] = useState("")

  // Selección inicial / cuando cambian los riesgos
  useEffect(() => {
    if (mode === "existing" && risks.length) {
      const id = String(defaultRiskId ?? risks[0].id)
      setSelectedId(id)
    }
  }, [defaultRiskId, mode, risks])

  // Cargar valores del riesgo seleccionado
  useEffect(() => {
    if (mode !== "existing" || !selectedId) return
    const r = risks.find((x) => String(x.id) === selectedId)
    if (r) {
      setProb(r.probabilidad)
      setImp(r.impacto)
      setFrecuencia(r.frecuencia)
    }
  }, [selectedId, mode, risks])

  const nivel = calcNivel(prob, imp)
  const zona = calcZona(nivel)
  const meta = zonaMeta(zona)

  function handleSave() {
    if (mode === "existing") {
      if (!selectedId) return
      updateRisk(Number(selectedId), {
        probabilidad: prob,
        impacto: imp,
        frecuencia,
      })
    } else {
      if (!desc.trim()) return
      const created = addRisk({
        descripcion: desc,
        categoria,
        probabilidad: prob,
        impacto: imp,
        frecuencia,
        responsable,
        controles: [],
        probabilidadResidual: prob,
        impactoResidual: imp,
      })
      setMode("existing")
      setDesc("")
      setResponsable("")
      if (created) setSelectedId(String(created.id))
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4 text-muted-foreground" /> Evaluación
          dinámica de riesgos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Modo */}
        <div className="flex w-fit rounded-full border bg-secondary p-1 text-xs font-semibold">
          {(["existing", "new"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full px-3 py-1.5 transition",
                mode === m
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "existing" ? "Evaluar riesgo existente" : "Nuevo riesgo"}
            </button>
          ))}
        </div>

        {mode === "existing" ? (
          <div className="space-y-2">
            <Label>Seleccionar riesgo</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un riesgo" />
              </SelectTrigger>
              <SelectContent>
                {risks.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {riskCode(r)} — {r.descripcion.slice(0, 60)}
                    {r.descripcion.length > 60 ? "…" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ev-desc">Descripción del riesgo</Label>
              <Input
                id="ev-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe el riesgo a evaluar..."
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-resp">Responsable</Label>
              <Input
                id="ev-resp"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Responsable"
              />
            </div>
          </div>
        )}

        {/* Sliders */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Probabilidad:{" "}
              <span className="font-bold text-primary">{prob}</span>
            </Label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={prob}
              onChange={(e) => setProb(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 Muy baja</span>
              <span>5 Muy alta</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>
              Impacto: <span className="font-bold text-primary">{imp}</span>
            </Label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={imp}
              onChange={(e) => setImp(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 Mínimo</span>
              <span>5 Catastrófico</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Frecuencia estimada</Label>
          <Select
            value={frecuencia}
            onValueChange={(v) => setFrecuencia(v as Frecuencia)}
          >
            <SelectTrigger className="sm:w-72">
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

        {/* Resultado */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div
            className={cn(
              "rounded-xl border p-5",
              meta.badge,
            )}
          >
            <p className="text-xs font-medium opacity-80">
              Calificación del riesgo
            </p>
            <div className="mt-2 flex items-center gap-5">
              <div className="text-center">
                <div className="text-5xl font-bold leading-none tracking-tight">
                  {nivel}
                </div>
                <div className="mt-1 text-xs opacity-80">Nivel</div>
              </div>
              <div>
                <div className="text-xl font-semibold">{zona}</div>
                <div className="mt-1 text-sm opacity-80">
                  {meta.recomendacion}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <p className="mb-3 text-sm font-semibold">Posición en la matriz</p>
            <div className="mx-auto max-w-[200px]">
              <MiniMatrix activeP={prob} activeI={imp} />
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full rounded-full transition-all", meta.solid)}
                style={{ width: `${(nivel / 25) * 100}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
              <span>Baja</span>
              <span>Crítica</span>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              P:{prob} × I:{imp} = nivel {nivel}
              <ZonaBadge zona={zona} />
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave}>
            {mode === "existing" ? (
              <>
                <Save className="size-4" /> Guardar evaluación
              </>
            ) : (
              <>
                <Plus className="size-4" /> Agregar riesgo evaluado
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onGotoRegistro}>
            Ir a registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
