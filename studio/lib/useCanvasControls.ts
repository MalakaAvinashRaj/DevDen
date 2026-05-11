'use client'
// Ported from openswarm/frontend/src/app/pages/Dashboard/useCanvasControls.ts
// Simplified: no Redux, just React state. Same pan/zoom logic.

import { useCallback, useRef, useState } from 'react'

export interface CanvasTransform {
  x: number
  y: number
  zoom: number
}

export interface CanvasActions {
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  pan: (dx: number, dy: number) => void
  setTransform: React.Dispatch<React.SetStateAction<CanvasTransform>>
}

const MIN_ZOOM = 0.2
const MAX_ZOOM = 3.0
const ZOOM_STEP = 0.15

export function useCanvasControls(initial?: Partial<CanvasTransform>) {
  const [transform, setTransform] = useState<CanvasTransform>({
    x: initial?.x ?? 0,
    y: initial?.y ?? 0,
    zoom: initial?.zoom ?? 1,
  })

  const zoomIn = useCallback(() =>
    setTransform(t => ({ ...t, zoom: Math.min(MAX_ZOOM, t.zoom + ZOOM_STEP) })), [])

  const zoomOut = useCallback(() =>
    setTransform(t => ({ ...t, zoom: Math.max(MIN_ZOOM, t.zoom - ZOOM_STEP) })), [])

  const resetZoom = useCallback(() =>
    setTransform(t => ({ ...t, zoom: 1 })), [])

  const pan = useCallback((dx: number, dy: number) =>
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy })), [])

  const actions: CanvasActions = { zoomIn, zoomOut, resetZoom, pan, setTransform }
  return { transform, actions }
}
