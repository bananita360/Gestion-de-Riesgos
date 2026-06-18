"use client"

import { useCallback, useEffect, useState } from "react"
import {
  type Control,
  type Risk,
  DEFAULT_RISKS,
  clampPI,
  newControlId,
} from "@/lib/risk"

const STORAGE_KEY = "gestion_riesgos_data_v2"

interface StoredData {
  risks: Risk[]
  nextId: number
}

/** Normaliza un riesgo cargado desde almacenamiento (migración / valores faltantes). */
function normalizeRisk(raw: any, fallbackId: number): Risk {
  const probabilidad = clampPI(raw?.probabilidad ?? 3)
  const impacto = clampPI(raw?.impacto ?? 3)

  // Migra acciones antiguas (string[]) a controles con seguimiento
  let controles: Control[] = []
  if (Array.isArray(raw?.controles)) {
    controles = raw.controles.map((c: any) => ({
      id: c?.id ?? newControlId(),
      texto: c?.texto ?? "",
      estado: c?.estado ?? "Pendiente",
      responsable: c?.responsable ?? "",
      fechaLimite: c?.fechaLimite ?? "",
      avance: typeof c?.avance === "number" ? c.avance : 0,
      nota: c?.nota ?? "",
    }))
  } else if (Array.isArray(raw?.acciones)) {
    controles = raw.acciones
      .filter(Boolean)
      .map((texto: string) => ({
        id: newControlId(),
        texto,
        estado: "Pendiente" as const,
        responsable: raw?.responsable ?? "",
        fechaLimite: "",
        avance: 0,
        nota: "",
      }))
  }

  return {
    id: raw?.id ?? fallbackId,
    descripcion: raw?.descripcion ?? "",
    categoria: raw?.categoria ?? "Otro",
    probabilidad,
    impacto,
    frecuencia: raw?.frecuencia ?? "Media",
    estrategia: raw?.estrategia ?? "Mitigar",
    controles,
    responsable: raw?.responsable ?? "",
    indicador: raw?.indicador ?? "",
    frecuenciaRevision: raw?.frecuenciaRevision ?? "Mensual",
    seguimiento: raw?.seguimiento ?? "",
    probabilidadResidual: clampPI(raw?.probabilidadResidual ?? probabilidad),
    impactoResidual: clampPI(raw?.impactoResidual ?? impacto),
  }
}

export function useRisks() {
  const [risks, setRisks] = useState<Risk[]>([])
  const [nextId, setNextId] = useState(11)
  const [hydrated, setHydrated] = useState(false)

  // Cargar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved) as StoredData
        const loaded = (data.risks || []).map((r, i) => normalizeRisk(r, i + 1))
        setRisks(loaded)
        setNextId(
          data.nextId || Math.max(0, ...loaded.map((r) => r.id)) + 1,
        )
      } else {
        setRisks(structuredClone(DEFAULT_RISKS))
        setNextId(11)
      }
    } catch {
      setRisks(structuredClone(DEFAULT_RISKS))
      setNextId(11)
    }
    setHydrated(true)
  }, [])

  // Guardar
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ risks, nextId }))
  }, [risks, nextId, hydrated])

  const addRisk = useCallback(
    (data: Partial<Risk> & { descripcion: string }) => {
      let created: Risk | null = null
      setRisks((prev) => {
        created = {
          id: nextId,
          descripcion: data.descripcion.trim(),
          categoria: data.categoria ?? "Otro",
          probabilidad: clampPI(data.probabilidad ?? 3),
          impacto: clampPI(data.impacto ?? 3),
          frecuencia: data.frecuencia ?? "Media",
          estrategia: data.estrategia ?? "Mitigar",
          controles: data.controles ?? [],
          responsable: data.responsable ?? "",
          indicador: data.indicador ?? "",
          frecuenciaRevision: data.frecuenciaRevision ?? "Mensual",
          seguimiento: data.seguimiento ?? "",
          probabilidadResidual: clampPI(
            data.probabilidadResidual ?? data.probabilidad ?? 3,
          ),
          impactoResidual: clampPI(data.impactoResidual ?? data.impacto ?? 3),
        }
        return [...prev, created]
      })
      setNextId((n) => n + 1)
      return created
    },
    [nextId],
  )

  const updateRisk = useCallback((id: number, fields: Partial<Risk>) => {
    setRisks((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, ...fields }
        if (fields.probabilidad !== undefined)
          next.probabilidad = clampPI(fields.probabilidad)
        if (fields.impacto !== undefined) next.impacto = clampPI(fields.impacto)
        if (fields.probabilidadResidual !== undefined)
          next.probabilidadResidual = clampPI(fields.probabilidadResidual)
        if (fields.impactoResidual !== undefined)
          next.impactoResidual = clampPI(fields.impactoResidual)
        return next
      }),
    )
  }, [])

  const deleteRisk = useCallback((id: number) => {
    setRisks((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // --- Controles ---
  const addControl = useCallback((riskId: number) => {
    setRisks((prev) =>
      prev.map((r) =>
        r.id === riskId
          ? {
              ...r,
              controles: [
                ...r.controles,
                {
                  id: newControlId(),
                  texto: "",
                  estado: "Pendiente",
                  responsable: r.responsable,
                  fechaLimite: "",
                  avance: 0,
                  nota: "",
                },
              ],
            }
          : r,
      ),
    )
  }, [])

  const updateControl = useCallback(
    (riskId: number, controlId: string, fields: Partial<Control>) => {
      setRisks((prev) =>
        prev.map((r) =>
          r.id === riskId
            ? {
                ...r,
                controles: r.controles.map((c) =>
                  c.id === controlId ? { ...c, ...fields } : c,
                ),
              }
            : r,
        ),
      )
    },
    [],
  )

  const removeControl = useCallback((riskId: number, controlId: string) => {
    setRisks((prev) =>
      prev.map((r) =>
        r.id === riskId
          ? { ...r, controles: r.controles.filter((c) => c.id !== controlId) }
          : r,
      ),
    )
  }, [])

  const resetData = useCallback(() => {
    setRisks(structuredClone(DEFAULT_RISKS))
    setNextId(11)
  }, [])

  return {
    risks,
    hydrated,
    addRisk,
    updateRisk,
    deleteRisk,
    addControl,
    updateControl,
    removeControl,
    resetData,
  }
}

export type RiskStore = ReturnType<typeof useRisks>
