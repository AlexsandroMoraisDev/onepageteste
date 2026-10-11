"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { defaultSiteConfig, type SiteConfig } from "@/lib/site-config"
import { updateAtPath } from "@/lib/use-site-config"

const labels: Record<string, string> = { brand: "Marca", navigation: "Navegação", hero: "Hero", services: "Serviços", about: "Sobre nós", process: "Processo", testimonials: "Depoimentos", contact: "Contato", footer: "Rodapé", colors: "Cores", items: "Itens", values: "Valores", stats: "Indicadores", steps: "Passos", title: "Título", description: "Descrição", url: "Link", name: "Nome", role: "Função", quote: "Depoimento", number: "Número", label: "Texto", primary: "Cor principal", background: "Fundo", foreground: "Texto principal", mutedForeground: "Texto secundário", heroGlow: "Brilho do fundo" }

function humanize(key: string) { return labels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()) }
function Editor({ value, path, onChange }: { value: unknown; path: (string | number)[]; onChange: (path: (string | number)[], value: unknown) => void }) {
  if (typeof value === "string") return <div className="flex flex-col gap-2"><Label>{humanize(String(path[path.length - 1]))}</Label><Input value={value} onChange={(event) => onChange(path, event.target.value)} /></div>
  if (Array.isArray(value)) return <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4">{value.map((item, index) => <div key={index} className="flex flex-col gap-4 rounded-lg border bg-background p-4"><p className="text-sm font-semibold text-muted-foreground">Item {index + 1}</p><Editor value={item} path={[...path, index]} onChange={onChange} /></div>)}</div>
  if (value && typeof value === "object") return <div className="grid gap-5 sm:grid-cols-2">{Object.entries(value as Record<string, unknown>).map(([key, item]) => <div key={key} className={typeof item === "object" ? "sm:col-span-2" : ""}><p className="mb-3 text-sm font-semibold text-foreground">{humanize(key)}</p><Editor value={item} path={[...path, key]} onChange={onChange} /></div>)}</div>
  return null
}

export default function PainelPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  useEffect(() => {
    fetch("/api/site-config", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar as configurações")
        return response.json()
      })
      .then(setConfig)
      .catch(() => {})
  }, [])
  function change(path: (string | number)[], value: unknown) { setConfig((current) => updateAtPath(current, path, value)) }
  async function save() {
    setSaved(false)
    setSaveError("")
    try {
      const response = await fetch("/api/site-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config), cache: "no-store" })
      if (!response.ok) throw new Error("Não foi possível salvar as alterações")
      setConfig(await response.json())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaveError("Não foi possível salvar. Verifique a conexão e tente novamente.")
    }
  }
  return <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-8"><div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><a href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Voltar ao site</a><h1 className="text-3xl font-bold tracking-tight">Editor completo do site</h1><p className="mt-1 text-muted-foreground">Todos os textos, links e cores estão disponíveis abaixo. Nenhum conteúdo fica fora do painel.</p></div><div className="flex flex-col items-stretch gap-2 sm:items-end"><Button onClick={save}>{saved ? <Check data-icon="inline-start" /> : <Save data-icon="inline-start" />}{saved ? "Alterações salvas" : "Salvar alterações"}</Button>{saveError ? <p className="text-sm text-destructive" role="alert">{saveError}</p> : null}</div></div><div className="flex flex-col gap-6">{Object.entries(config).map(([section, value]) => <Card key={section}><CardHeader><CardTitle>{humanize(section)}</CardTitle><CardDescription>Edite cada campo desta seção, incluindo textos e links.</CardDescription></CardHeader><CardContent><Editor value={value} path={[section]} onChange={change} /></CardContent></Card>)}</div></div></main>
}
