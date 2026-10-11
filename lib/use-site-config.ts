"use client"

import { useEffect, useState } from "react"
import { defaultSiteConfig, type SiteConfig } from "@/lib/site-config"

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig)
  useEffect(() => { fetch("/api/site-config").then((response) => response.json()).then(setConfig).catch(() => {}) }, [])
  return config
}

export function updateAtPath<T>(value: T, path: (string | number)[], next: unknown): T {
  if (!path.length) return next as T
  const [head, ...rest] = path
  const copy = Array.isArray(value) ? [...value] : { ...(value as Record<string, unknown>) }
  ;(copy as Record<string | number, unknown>)[head] = updateAtPath((copy as Record<string | number, unknown>)[head], rest, next)
  return copy as T
}
