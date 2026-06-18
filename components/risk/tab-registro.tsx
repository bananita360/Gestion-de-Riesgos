"use client"

import { useState } from "react"
import type { RiskStore } from "@/hooks/use-risks"
import {
  type Estrategia,
  type Frecuencia,
  CATEGORIAS,
  ESTRATEGIAS,
  FRECUENCIAS,
  calcNivel,
  calcZona,
  nivelInherente,
  riskCode,
} from "@/lib/risk"
import { ZonaBadge } from "./zona-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, PencilLine, Trash2, ListChecks } from "lucide-react"

const empty = {
  descripcion: "",
  categoria: "Gestión de cliente",
  probabilidad: "3",
  impacto: "3",
  frecuencia: "Media" as Frecuencia,
  estrategia: "Mitigar" as Estrategia,
  responsable: "",
  indicador: "",
  acciones: "",
}

export function TabRegistro({
  store,
  onEvaluar,
}: {
  store: RiskStore
  onEvaluar: (id: number) => void
}) {
  const { risks, addRisk, deleteRisk } = store
  const [form, setForm] = useState({ ...empty })

  const previewNivel = calcNivel(
    Number(form.probabilidad) || 1,
    Number(form.impacto) || 1,
  )
  const previewZona = calcZona(previewNivel)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.descripcion.trim()) return
    const controles = form.acciones
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((texto) => ({
        id: "c-" + Math.random().toString(36).slice(2, 9),
        texto,
        estado: "Pendiente" as const,
        responsable: form.responsable,
        fechaLimite: "",
        avance: 0,
        nota: "",
      }))
    addRisk({
      descripcion: form.descripcion,
      categoria: form.categoria,
      probabilidad: Number(form.probabilidad),
      impacto: Number(form.impacto),
      frecuencia: form.frecuencia,
      estrategia: form.estrategia,
      responsable: form.responsable,
      indicador: form.indicador,
      controles,
      probabilidadResidual: Number(form.probabilidad),
      impactoResidual: Number(form.impacto),
    })
    setForm({ ...empty })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-primary" /> Agregar riesgo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="rf-desc">Descripción del riesgo</Label>
              <Input
                id="rf-desc"
                value={form.descripcion}
                onChange={(e) => set("descripcion", e.target.value)}
                placeholder="Describe el riesgo..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => set("categoria", v)}
              >
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
              <Label htmlFor="rf-prob">Probabilidad (1-5)</Label>
              <Input
                id="rf-prob"
                type="number"
                min={1}
                max={5}
                value={form.probabilidad}
                onChange={(e) => set("probabilidad", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rf-imp">Impacto (1-5)</Label>
              <Input
                id="rf-imp"
                type="number"
                min={1}
                max={5}
                value={form.impacto}
                onChange={(e) => set("impacto", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select
                value={form.frecuencia}
                onValueChange={(v) => set("frecuencia", v as Frecuencia)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Estrategia</Label>
              <Select
                value={form.estrategia}
                onValueChange={(v) => set("estrategia", v as Estrategia)}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label htmlFor="rf-resp">Responsable</Label>
              <Input
                id="rf-resp"
                value={form.responsable}
                onChange={(e) => set("responsable", e.target.value)}
                placeholder="Ej. Líder del proyecto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rf-ind">Indicador</Label>
              <Input
                id="rf-ind"
                value={form.indicador}
                onChange={(e) => set("indicador", e.target.value)}
                placeholder="Ej. % cumplimiento"
              />
            </div>

            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="rf-acc">Acciones de control (una por línea)</Label>
              <Textarea
                id="rf-acc"
                value={form.acciones}
                onChange={(e) => set("acciones", e.target.value)}
                placeholder={"Acción 1\nAcción 2"}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
              <Button type="submit">
                <Plus className="size-4" /> Agregar riesgo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setForm({ ...empty })}
              >
                Limpiar
              </Button>
              <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                Calificación previa:
                <strong className="text-foreground">{previewNivel}</strong>
                <ZonaBadge zona={previewZona} />
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="size-4 text-muted-foreground" />{" "}
            Identificación de riesgos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">I</TableHead>
                  <TableHead className="text-center">Nivel</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No hay riesgos registrados. Agrega uno arriba.
                    </TableCell>
                  </TableRow>
                ) : (
                  risks.map((r) => {
                    const nivel = nivelInherente(r)
                    const zona = calcZona(nivel)
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-semibold">
                          {riskCode(r)}
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          {r.descripcion}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.categoria}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.probabilidad}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.impacto}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {nivel}
                        </TableCell>
                        <TableCell>
                          <ZonaBadge zona={zona} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8"
                              title="Evaluar"
                              onClick={() => onEvaluar(r.id)}
                            >
                              <PencilLine className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="size-8 text-critico hover:text-critico"
                              title="Eliminar"
                              onClick={() => deleteRisk(r.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
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
    </div>
  )
}
