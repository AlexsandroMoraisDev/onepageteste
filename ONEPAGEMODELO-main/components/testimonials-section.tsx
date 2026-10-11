"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Encontrei plantas lindas e um atendimento que realmente entende do assunto. Minha casa ficou muito mais viva.",
    name: "Ana Paula Souza",
    role: "Cliente residencial",
  },
  {
    quote:
      "A equipe ajudou a escolher os vasos e os cuidados para cada ambiente. Foi fácil, rápido e o resultado ficou lindo.",
    name: "Carlos Henrique Lima",
    role: "Cliente residencial",
  },
  {
    quote:
      "Além da variedade, gostei muito da orientação. Saí com tudo o que precisava para montar meu jardim.",
    name: "Mariana Oliveira",
    role: "Paisagista",
  },
]

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationFrameId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5

    const scroll = () => {
      scrollPosition += scrollSpeed

      if (scrollContainer.scrollWidth && scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }

      scrollContainer.scrollLeft = scrollPosition
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-balance">
          Quem conhece, recomenda
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-pretty leading-relaxed">
          Na Busca Vida, qualidade e cuidado vêm sempre em primeiro lugar. Ajudamos você a escolher as plantas,
          vasos e soluções certas para deixar cada ambiente mais bonito e vivo.
        </p>

        <div className="relative">
          <div ref={scrollRef} className="flex gap-6 overflow-x-hidden" style={{ scrollBehavior: "auto" }}>
            {/* Duplicate testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <Card key={index} className="flex-shrink-0 w-[90vw] sm:w-[450px] border-none shadow-lg">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  <p className="text-base sm:text-lg mb-6 leading-relaxed text-pretty min-h-[120px]">
                    {testimonial.quote}
                  </p>
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
