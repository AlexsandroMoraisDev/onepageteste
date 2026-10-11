"use client"

import { useEffect } from "react"
import { defaultSiteConfig, type SiteConfig } from "@/lib/site-config"

function applyConfig(config: SiteConfig) {
  const root = document.documentElement
  root.style.setProperty("--site-primary", config.colors.primary)
  root.style.setProperty("--site-background", config.colors.background)
  root.style.setProperty("--site-foreground", config.colors.foreground)
  root.style.setProperty("--site-muted", config.colors.mutedForeground)
  root.style.setProperty("--site-hero-glow", config.colors.heroGlow)
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let active = true
    fetch("/api/site-config", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Configuração indisponível"))))
      .then((config: SiteConfig) => {
        if (active) applyConfig(config)
      })
      .catch(() => applyConfig(defaultSiteConfig))
    return () => {
      active = false
    }
  }, [])

  return children
}
