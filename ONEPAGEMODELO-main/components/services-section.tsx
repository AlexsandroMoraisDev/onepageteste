"use client"

"use client"

import { Flower2, Droplets, Home, Package, Shovel, Sprout } from "lucide-react"
import { useSiteConfig } from "@/lib/use-site-config"

const serviceIcons = [Sprout, Home, Shovel, Droplets, Package, Flower2]

const services = [
  { icon: Sprout, title: "Plantas ornamentais", description: "Espécies para dentro e fora de casa, escolhidas para trazer mais verde, beleza e vida ao seu ambiente." },
  { icon: Home, title: "Vasos e decoração", description: "Vasos, cachepôs e acessórios para combinar com seu estilo e valorizar cada planta." },
  { icon: Shovel, title: "Jardim e paisagismo", description: "Insumos e orientações para você plantar, cuidar e manter seu jardim sempre bonito." },
  { icon: Droplets, title: "Produtos para piscina", description: "Tudo para manter sua piscina limpa, equilibrada e pronta para os melhores momentos." },
  { icon: Package, title: "Terra e adubos", description: "Substratos, adubos e soluções para ajudar suas plantas a crescerem fortes e saudáveis." },
  { icon: Flower2, title: "Atendimento especializado", description: "Conte com uma equipe próxima para encontrar o produto certo para sua necessidade." },
]

export function ServicesSection() {
  const config = useSiteConfig()
  const editableServices = config.services.items.map((service, index) => ({ ...service, icon: serviceIcons[index] ?? Sprout }))
  return (
    <section id="servicos" className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{config.services.eyebrow}</p>
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{config.services.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{config.services.description}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {editableServices.map((service) => {
            const Icon = service.icon
            return <article key={service.title} className="group rounded-2xl border border-border/60 bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon /></div>
              <h3 className="mb-3 text-xl font-semibold">{service.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{service.description}</p>
            </article>
          })}
        </div>
      </div>
    </section>
  )
}
