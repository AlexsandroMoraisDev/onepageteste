"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Droplets, Flower2 } from "lucide-react"
import { useEffect, useState } from "react"
import { defaultSiteConfig, type SiteConfig } from "@/lib/site-config"

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig)

  useEffect(() => {
    fetch("/api/site-config").then((response) => response.json()).then(setConfig).catch(() => {})
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => setMousePosition({ x: event.clientX, y: event.clientY })
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[18%] size-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[5%] right-[10%] size-[380px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute size-[280px] rounded-full bg-lime-400/10 blur-3xl transition-all duration-1000" style={{ left: mousePosition.x - 140, top: mousePosition.y - 140 }} />
      </div>
      <div className="pointer-events-none absolute inset-0 text-primary/35">
        <Leaf className="absolute left-[12%] top-[20%] animate-float" size={42} />
        <Flower2 className="absolute right-[17%] top-[28%] animate-float" size={36} />
        <Droplets className="absolute bottom-[20%] left-[20%] animate-float" size={30} />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <Leaf className="size-4" /> {config.hero.eyebrow}
        </div>
        <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {config.hero.title} <span className="text-primary">{config.hero.highlight}</span>
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-pretty text-xl leading-relaxed text-muted-foreground sm:text-2xl">
          {config.hero.description}
        </p>
        <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="group px-8 py-6 text-lg shadow-lg shadow-primary/25" asChild>
            <a href={config.hero.primaryUrl} target="_blank" rel="noopener noreferrer">{config.hero.primaryLabel} <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" /></a>
          </Button>
          <Button size="lg" variant="outline" className="border-primary/30 px-8 py-6 text-lg" asChild>
            <a href={config.hero.secondaryUrl} target="_blank" rel="noopener noreferrer">{config.hero.secondaryLabel}</a>
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <span>Plantas ornamentais</span><span>Vasos e decoração</span><span>Produtos para piscina</span>
        </div>
      </div>
    </section>
  )
}

