import { cn } from "@/lib/utils"
import { type Zona, zonaMeta } from "@/lib/risk"

export function ZonaBadge({
  zona,
  className,
  showNivel,
  nivel,
}: {
  zona: Zona
  className?: string
  showNivel?: boolean
  nivel?: number
}) {
  const meta = zonaMeta(zona)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        meta.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {zona}
      {showNivel && nivel !== undefined ? (
        <span className="opacity-70">· {nivel}</span>
      ) : null}
    </span>
  )
}
