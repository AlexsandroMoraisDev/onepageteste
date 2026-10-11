"use client"

import { useEffect, useRef } from "react"
import { Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TestimonialsConfig } from "@/lib/site-config"

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialsConfig }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    let position = 0
    const step = () => {
      position += 0.5
      if (container.scrollWidth && position >= container.scrollWidth / 2) position = 0
      container.scrollLeft = position
      frame = window.requestAnimationFrame(step)
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const items = testimonials.items
  const looping = [...items, ...items]

  return (
    <section id="depoimentos" className="overflow-hidden bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{testimonials.eyebrow}</p>
          <h2 className="mb-4 text-balance text-3xl font-bold sm:text-4xl md:text-5xl">{testimonials.title}</h2>
          <p className="mx-auto text-pretty leading-relaxed text-muted-foreground">{testimonials.description}</p>
        </div>

        {items.length > 0 ? (
          <div className="relative">
            <div ref={scrollRef} className="flex gap-6 overflow-x-hidden" aria-label="Depoimentos de clientes">
              {looping.map((testimonial, index) => (
                <Card key={`${testimonial.name}-${index}`} className="w-[85vw] flex-shrink-0 border-none shadow-lg sm:w-[420px]">
                  <CardContent className="p-8">
                    <Quote aria-hidden="true" className="mb-4 size-8 text-primary" />
                    <p className="mb-6 min-h-[110px] text-pretty text-base leading-relaxed sm:text-lg">{testimonial.quote}</p>
                    <div>
                      <p className="text-lg font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
