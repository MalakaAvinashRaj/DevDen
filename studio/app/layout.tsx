import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { DynamicIsland } from '@/components/DynamicIsland'

const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'DevDen',
  description: 'Multi-agent AI software factory',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased">
        <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-bold tracking-widest text-sm">DEVDEN</span>
            <span className="text-zinc-600 text-xs">v1</span>
          </div>
          <nav className="flex gap-6 text-xs text-zinc-500">
            <a href="/" className="hover:text-zinc-200 transition-colors">Missions</a>
            <a href="/canvas" className="hover:text-zinc-200 transition-colors">Factory</a>
          </nav>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        <DynamicIsland />
      </body>
    </html>
  )
}
