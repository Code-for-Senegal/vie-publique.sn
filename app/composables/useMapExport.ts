// app/composables/useMapExport.ts
// Export de la carte en PNG (image présentée) ou des données en CSV.

import type { MapDatasetConfig, LegendConfig } from '~~/types/map'

interface ExportPNGOptions {
  title?: string
  subtitle?: string
  legend?: LegendConfig | null
  fileName?: string
  /** Fonction qui recentre la carte et retourne une Promise qui résout quand c'est fait */
  fitBounds?: () => Promise<void>
  /** Capture le canvas en dataURL via render callback (fiable avec deck.gl) */
  captureSnapshot?: () => Promise<string | null>
}

export function useMapExport() {
  /** Charger une dataURL en tant qu'Image bitmap */
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  /** Exporter la carte en PNG — image bien présentée */
  async function exportPNG(
    getCanvas: () => HTMLCanvasElement | null,
    options: ExportPNGOptions = {},
  ) {
    const {
      title = 'Carte du Sénégal',
      subtitle,
      legend,
      fileName = 'carte-senegal',
    } = options

    // Recentrer la carte si une fonction est fournie
    if (options.fitBounds) {
      try {
        await options.fitBounds()
      } catch {
        // Continue sans recentrer
      }
    }

    // ─── Capturer le canvas comme bitmap statique ───────────────
    // Méthode fiable : captureSnapshot force un render et lit toDataURL
    // dans le callback 'render' (buffer WebGL garanti plein).
    // Fallback : lecture directe du canvas (peut être vide avec deck.gl).
    let mapImage: HTMLImageElement | HTMLCanvasElement | null = null
    let mapW = 0
    let mapH = 0

    if (options.captureSnapshot) {
      const dataUrl = await options.captureSnapshot()
      if (dataUrl) {
        const img = await loadImage(dataUrl)
        mapImage = img
        mapW = img.naturalWidth
        mapH = img.naturalHeight
      }
    }

    if (!mapImage) {
      const canvas = getCanvas()
      if (!canvas) {
        console.warn('[useMapExport] Canvas non disponible')
        return
      }
      mapImage = canvas
      mapW = canvas.width
      mapH = canvas.height
    }

    const dpr = window.devicePixelRatio || 1

    // ─── Dimensions de l'image finale ─────────────────────────
    const padding = Math.round(20 * dpr)
    const headerH = Math.round((title ? 50 : 0) * dpr)
    const subtitleH = Math.round((subtitle ? 24 : 0) * dpr)
    const legendH = Math.round((legend ? 55 : 0) * dpr)
    const footerH = Math.round(28 * dpr)
    const gap = Math.round(10 * dpr)

    const totalW = mapW + padding * 2
    const totalH = padding + headerH + subtitleH + (subtitle ? gap : 0) + mapH + gap + legendH + footerH + padding

    // ─── Canvas final ─────────────────────────────────────────
    const canvas = document.createElement('canvas')
    canvas.width = totalW
    canvas.height = totalH
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ─── Fond sombre ──────────────────────────────────────────
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, totalW, totalH)

    // ─── Bordure subtile ──────────────────────────────────────
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 2 * dpr
    ctx.strokeRect(dpr, dpr, totalW - 2 * dpr, totalH - 2 * dpr)

    let y = padding

    // ─── Titre ────────────────────────────────────────────────
    if (title) {
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.round(22 * dpr)}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(title, totalW / 2, y + Math.round(36 * dpr))
      y += headerH
    }

    // ─── Sous-titre ───────────────────────────────────────────
    if (subtitle) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = `${Math.round(13 * dpr)}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(subtitle, totalW / 2, y + Math.round(18 * dpr))
      y += subtitleH + gap
    }

    // ─── Carte (avec bordure arrondie simulée) ────────────────
    ctx.save()
    const mapX = padding
    const mapY = y
    const radius = Math.round(8 * dpr)

    // Clip arrondi
    ctx.beginPath()
    ctx.moveTo(mapX + radius, mapY)
    ctx.lineTo(mapX + mapW - radius, mapY)
    ctx.quadraticCurveTo(mapX + mapW, mapY, mapX + mapW, mapY + radius)
    ctx.lineTo(mapX + mapW, mapY + mapH - radius)
    ctx.quadraticCurveTo(mapX + mapW, mapY + mapH, mapX + mapW - radius, mapY + mapH)
    ctx.lineTo(mapX + radius, mapY + mapH)
    ctx.quadraticCurveTo(mapX, mapY + mapH, mapX, mapY + mapH - radius)
    ctx.lineTo(mapX, mapY + radius)
    ctx.quadraticCurveTo(mapX, mapY, mapX + radius, mapY)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(mapImage, mapX, mapY, mapW, mapH)
    ctx.restore()

    // Bordure carte
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1.5 * dpr
    ctx.beginPath()
    ctx.moveTo(mapX + radius, mapY)
    ctx.lineTo(mapX + mapW - radius, mapY)
    ctx.quadraticCurveTo(mapX + mapW, mapY, mapX + mapW, mapY + radius)
    ctx.lineTo(mapX + mapW, mapY + mapH - radius)
    ctx.quadraticCurveTo(mapX + mapW, mapY + mapH, mapX + mapW - radius, mapY + mapH)
    ctx.lineTo(mapX + radius, mapY + mapH)
    ctx.quadraticCurveTo(mapX, mapY + mapH, mapX, mapY + mapH - radius)
    ctx.lineTo(mapX, mapY + radius)
    ctx.quadraticCurveTo(mapX, mapY, mapX + radius, mapY)
    ctx.closePath()
    ctx.stroke()

    y += mapH + gap

    // ─── Légende ──────────────────────────────────────────────
    if (legend && legend.colorScale) {
      const lx = padding
      const ly = y

      // Titre légende
      ctx.fillStyle = '#d1d5db'
      ctx.font = `bold ${Math.round(11 * dpr)}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText((legend.title || 'Légende').toUpperCase(), lx, ly + Math.round(14 * dpr))

      // Gradient bar
      const barY = ly + Math.round(22 * dpr)
      const barH = Math.round(12 * dpr)
      const barW = mapW

      if (legend.colorScale.stops.length >= 2) {
        const gradient = ctx.createLinearGradient(lx, 0, lx + barW, 0)
        const stops = legend.colorScale.stops
        const minVal = stops[0].value
        const maxVal = stops[stops.length - 1].value
        const range = maxVal - minVal || 1

        for (const stop of stops) {
          const t = (stop.value - minVal) / range
          const [r, g, b, a] = stop.color
          gradient.addColorStop(Math.min(1, Math.max(0, t)), `rgba(${r},${g},${b},${(a ?? 255) / 255})`)
        }

        ctx.fillStyle = gradient
        roundRect(ctx, lx, barY, barW, barH, Math.round(3 * dpr))
        ctx.fill()

        // Labels
        ctx.fillStyle = '#9ca3af'
        ctx.font = `${Math.round(9 * dpr)}px system-ui, -apple-system, sans-serif`
        const labelY = barY + barH + Math.round(13 * dpr)

        for (const stop of stops) {
          if (!stop.label) continue
          const t = (stop.value - minVal) / range
          const x = lx + t * barW
          ctx.textAlign = t < 0.1 ? 'left' : t > 0.9 ? 'right' : 'center'
          ctx.fillText(stop.label, x, labelY)
        }
      }

      y += legendH
    }

    // ─── Footer ───────────────────────────────────────────────
    y = totalH - padding
    ctx.fillStyle = '#4b5563'
    ctx.font = `${Math.round(9 * dpr)}px system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText('vie-publique.sn', padding, y)
    ctx.textAlign = 'right'
    const today = new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    ctx.fillText(today, totalW - padding, y)

    // ─── Télécharger ──────────────────────────────────────────
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
      if (!blob) {
        console.warn('[useMapExport] Échec de la création du blob')
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[useMapExport] Erreur export PNG:', err)
    }
  }

  /** Dessiner un rect arrondi (helper) */
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  /** Exporter les données d'un dataset en CSV */
  function exportCSV(dataset: MapDatasetConfig, title?: string) {
    const data = dataset.data
    if (!data || data.length === 0) {
      console.warn('[useMapExport] Aucune donnée à exporter')
      return
    }

    // Récupérer les clés depuis le popup ou les données
    const keys: string[] = dataset.popup?.fields
      ? dataset.popup.fields.map((f) => f.key)
      : Object.keys(data[0]).filter((k) => !k.startsWith('_'))

    const headers: string[] = dataset.popup?.fields
      ? dataset.popup.fields.map((f) => f.label)
      : keys

    // Construire le CSV
    const rows = data.map((item) => {
      return keys.map((key) => {
        const val = item[key]
        if (val === null || val === undefined) return ''
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
    })

    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title ?? dataset.label}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    exportPNG,
    exportCSV,
  }
}
