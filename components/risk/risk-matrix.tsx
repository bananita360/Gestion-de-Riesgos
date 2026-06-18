"use client"

import { cn } from "@/lib/utils"
import {
  type Risk,
  calcNivel,
  calcZona,
  riskCode,
  zonaMeta,
} from "@/lib/risk"

interface RiskMatrixProps {
  risks: Risk[]
  /** "inherente" usa P×I, "residual" usa P/I residual */
  mode?: "inherente" | "residual"
  highlighted?: string | null
  onCellClick?: (p: number, i: number) => void
}

export function RiskMatrix({
  risks,
  mode = "inherente",
  highlighted,
  onCellClick,
}: RiskMatrixProps) {
  const getP = (r: Risk) =>
    mode === "residual" ? r.probabilidadResidual : r.probabilidad
  const getI = (r: Risk) => (mode === "residual" ? r.impactoResidual : r.impacto)

  const rows = [5, 4, 3, 2, 1]
  const cols = [1, 2, 3, 4, 5]

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[460px]">
        <div className="mb-2 ml-16 text-center text-xs font-semibold tracking-wide text-muted-foreground">
          Probabilidad →
        </div>
        <div className="flex gap-2">
          {/* Eje Y */}
          <div className="flex items-center">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground [writing-mode:vertical-rl] rotate-180">
              Impacto ↑
            </span>
          </div>
          <div className="flex-1">
            {/* fila encabezado de probabilidad */}
            <div className="grid grid-cols-[40px_repeat(5,1fr)] gap-1.5">
              <div />
              {cols.map((p) => (
                <div
                  key={"head-" + p}
                  className="flex items-center justify-center rounded-md bg-secondary py-1 text-xs font-semibold text-muted-foreground"
                >
                  {p}
                </div>
              ))}
            </div>
            {/* filas de impacto */}
            {rows.map((i) => (
              <div
                key={"row-" + i}
                className="mt-1.5 grid grid-cols-[40px_repeat(5,1fr)] gap-1.5"
              >
                <div className="flex items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
                  {i}
                </div>
                {cols.map((p) => {
                  const nivel = calcNivel(p, i)
                  const meta = zonaMeta(calcZona(nivel))
                  const cellRisks = risks.filter(
                    (r) => getP(r) === p && getI(r) === i,
                  )
                  const codes = cellRisks.map(riskCode).join(", ")
                  const has = cellRisks.length > 0
                  const key = `${p}-${i}`
                  const isHl = highlighted === key
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!has && !onCellClick}
                      onClick={() => onCellClick?.(p, i)}
                      title={has ? codes : "Sin riesgos"}
                      className={cn(
                        "flex min-h-[58px] flex-col items-center justify-center gap-0.5 rounded-md px-1 py-2 text-[11px] font-semibold transition",
                        meta.cell,
                        has && onCellClick && "cursor-pointer hover:scale-[1.04]",
                        isHl &&
                          "scale-[1.05] outline-2 outline-offset-1 outline-foreground",
                        !has && "opacity-55",
                      )}
                    >
                      {has ? (
                        <>
                          <span>{codes}</span>
                          <span className="opacity-70">{nivel}</span>
                        </>
                      ) : (
                        <span className="opacity-70">{nivel}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Mini matriz para previsualización (resalta una celda) */
export function MiniMatrix({
  activeP,
  activeI,
}: {
  activeP: number
  activeI: number
}) {
  const rows = [5, 4, 3, 2, 1]
  const cols = [1, 2, 3, 4, 5]
  return (
    <div className="grid grid-cols-5 gap-1">
      {rows.map((i) =>
        cols.map((p) => {
          const meta = zonaMeta(calcZona(calcNivel(p, i)))
          const active = p === activeP && i === activeI
          return (
            <div
              key={`${p}-${i}`}
              title={`P:${p} I:${i}`}
              className={cn(
                "aspect-square rounded-[4px] transition",
                meta.solid,
                active &&
                  "scale-110 outline-2 outline-offset-1 outline-foreground",
                !active && "opacity-80",
              )}
            />
          )
        }),
      )}
    </div>
  )
}
