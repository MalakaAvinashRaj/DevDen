'use client'
// Ported from openswarm/frontend/src/app/pages/Dashboard/CanvasControls.tsx
// Adapted: MUI → Tailwind, Electron IPC → REST API

import type { CanvasActions } from '@/lib/useCanvasControls'

interface Props {
  zoom: number
  actions: CanvasActions
  onFitToView: () => void
  onTidy: () => void
}

export default function CanvasControls({ zoom, actions, onFitToView, onTidy }: Props) {
  const pct = Math.round(zoom * 100)

  return (
    <div className="flex flex-col items-end gap-2 select-none">
      <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl shadow-sm px-2 py-1.5">
        <button
          onClick={actions.zoomOut}
          title="Zoom out"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors text-xl leading-none"
        >
          −
        </button>

        <button
          onClick={actions.resetZoom}
          title="Reset to 100%"
          className="min-w-[48px] text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors px-1"
        >
          {pct}%
        </button>

        <button
          onClick={actions.zoomIn}
          title="Zoom in"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors text-xl leading-none"
        >
          +
        </button>

        <div className="w-px h-4 bg-neutral-200 mx-1" />

        <button
          onClick={onFitToView}
          title="Fit to view"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors text-base"
        >
          ⊞
        </button>

        <button
          onClick={onTidy}
          title="Tidy layout"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 transition-colors text-base"
        >
          ✦
        </button>
      </div>
    </div>
  )
}
