"use client"

import { useState } from "react"
import { useRisks } from "@/hooks/use-risks"
import { MetricsBar } from "./metrics-bar"
import { TabRegistro } from "./tab-registro"
import { TabAnalisis } from "./tab-analisis"
import { TabMatriz } from "./tab-matriz"
import { TabRespuesta } from "./tab-respuesta"
import { TabMonitoreo } from "./tab-monitoreo"
import { TabEvaluar } from "./tab-evaluar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  BarChart3,
  Grid3x3,
  ShieldCheck,
  Eye,
  PencilLine,
  RotateCcw,
  ShieldAlert,
} from "lucide-react"

const TABS = [
  { value: "registro", label: "Registro", icon: AlertTriangle },
  { value: "analisis", label: "Análisis", icon: BarChart3 },
  { value: "matriz", label: "Matriz", icon: Grid3x3 },
  { value: "respuesta", label: "Plan de respuesta", icon: ShieldCheck },
  { value: "monitoreo", label: "Monitoreo", icon: Eye },
  { value: "evaluar", label: "Evaluar", icon: PencilLine },
]

export function RiskDashboard() {
  const store = useRisks()
  const [tab, setTab] = useState("registro")
  const [evalRiskId, setEvalRiskId] = useState<number | null>(null)

  function gotoEvaluar(id: number) {
    setEvalRiskId(id)
    setTab("evaluar")
  }

  if (!store.hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Cargando tablero de riesgos…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h1 className="text-pretty text-xl font-semibold tracking-tight sm:text-2xl">
              Gestión de Riesgos del Proyecto
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Implementación de soluciones de software — PYMES de Barranquilla y
              el Magdalena
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (
              confirm(
                "¿Restablecer los datos a los riesgos de ejemplo? Se perderán los cambios.",
              )
            ) {
              store.resetData()
            }
          }}
        >
          <RotateCcw className="size-4" /> Restablecer datos
        </Button>
      </header>

      <div className="mb-6">
        <MetricsBar risks={store.risks} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="registro">
          <TabRegistro store={store} onEvaluar={gotoEvaluar} />
        </TabsContent>
        <TabsContent value="analisis">
          <TabAnalisis store={store} />
        </TabsContent>
        <TabsContent value="matriz">
          <TabMatriz store={store} />
        </TabsContent>
        <TabsContent value="respuesta">
          <TabRespuesta store={store} />
        </TabsContent>
        <TabsContent value="monitoreo">
          <TabMonitoreo store={store} />
        </TabsContent>
        <TabsContent value="evaluar">
          <TabEvaluar
            store={store}
            defaultRiskId={evalRiskId}
            onGotoRegistro={() => setTab("registro")}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
