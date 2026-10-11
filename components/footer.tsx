"use client"

import Link from "next/link"
import { Instagram, MessageCircle } from "lucide-react"
import { useSiteConfig } from "@/lib/use-site-config"

export function Footer() {
  const config = useSiteConfig()
  return (
    <footer className="border-t border-border bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl text-center">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
          <div>
            <h3 className="mb-4 text-xl font-bold">{config.brand.name}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{config.brand.copyright}</p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">{config.footer.navigationTitle}</h4>
            <ul className="flex flex-col items-center gap-2">
              <li>
                <Link href={config.navigation.aboutUrl} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {config.navigation.about}
                </Link>
              </li>
              <li>
                <Link href={config.navigation.servicesUrl} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {config.navigation.services}
                </Link>
              </li>
              <li>
                <Link href={config.navigation.contactUrl} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {config.navigation.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">{config.footer.socialTitle}</h4>
            <div className="flex justify-center gap-4">
              <Link
                href={config.brand.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Busca Vida Garden"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Instagram className="size-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href={config.brand.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da Busca Vida Garden"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <MessageCircle className="size-5" />
                <span className="sr-only">WhatsApp</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
