'use client'
import dynamic from 'next/dynamic'

const Canvas = dynamic(() => import('@/components/canvas/Canvas'), { ssr: false })

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-neutral-50 overflow-hidden">
      <Canvas />
    </main>
  )
}
