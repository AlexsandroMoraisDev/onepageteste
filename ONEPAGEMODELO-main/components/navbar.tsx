"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { MobileMenu } from "@/components/mobile-menu"
import { useState, useEffect } from "react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-lg border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#over-ons" className="text-sm font-medium hover:text-primary transition-colors">
              Sobre nós
            </Link>
            <Link href="#servicos" className="text-sm font-medium hover:text-primary transition-colors">
              Serviços
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contato
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
