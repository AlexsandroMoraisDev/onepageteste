/** @type {import('next').NextConfig} */
const nextConfig = {
  // O build valida os tipos: um conteúdo mal formatado quebra o deploy
  // em vez de gerar um site silenciosamente errado.
  images: {
    // Fotos enviadas pelo painel são redimensionadas e convertidas
    // (AVIF/WEBP) automaticamente pelo next/image.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600, 1920],
  },
  // Apenas em desenvolvimento: libera hosts extras (ex.: o preview do editor)
  // no formato ALLOWED_DEV_ORIGINS="host1,host2". Em produção não tem efeito.
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
}

export default nextConfig
