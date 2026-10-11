import { Button } from "@/components/ui/button"
import { MapPin, MessageCircle, Phone } from "lucide-react"

export function ContactSection() {

  return (
    <section id="contact" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Próximo passo
          </div>
          <h2 className="text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
            Vamos cuidar do seu <span className="text-primary">jardim?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Fale com a Busca Vida Garden e encontre as plantas, vasos e produtos certos para transformar o seu espaço.
          </p>
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <Button asChild size="lg" className="rounded-full px-7">
              <a href="https://wa.me/5571997092070?text=Olá%20Busca%20Vida%20Garden!%20Gostaria%20de%20saber%20mais%20sobre%20os%20produtos%20e%20serviços." target="_blank" rel="noreferrer">
                <MessageCircle data-icon="inline-start" /> Solicitar orçamento pelo WhatsApp
              </a>
            </Button>
            <p className="text-sm text-muted-foreground">Fale diretamente com a nossa equipe e encontre a melhor solução para o seu espaço.</p>
          </div>

          <div className="flex w-full max-w-3xl flex-col gap-5 rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Visite a loja</p>
              <h3 className="mt-3 text-3xl font-bold">Estamos perto de você</h3>
            </div>
            <div className="flex items-start gap-4 border-t pt-6">
              <MapPin className="mt-1 text-primary" aria-hidden="true" />
              <div>
                <h4 className="font-semibold">Endereço</h4>
                <p className="mt-1 text-muted-foreground">R Direta de Busca Vida, S/N, Quadra 16<br />Catu de Abrantes, Camaçari - BA<br />CEP 42.825-576</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="mt-1 text-primary" aria-hidden="true" />
              <div>
                <h4 className="font-semibold">Telefone</h4>
                <p className="mt-1 text-muted-foreground">(71) 99709-2070</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageCircle className="mt-1 text-primary" aria-hidden="true" />
              <div>
                <h4 className="font-semibold">Horário de atendimento</h4>
                <p className="mt-1 text-muted-foreground">Segunda a sexta: 8h às 18h<br />Sábado: 8h às 12h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
