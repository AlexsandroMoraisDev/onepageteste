import { readFile } from "node:fs/promises"
import path from "node:path"
import { mergeSiteConfig, siteConfig, type SiteConfig } from "@/lib/site-config"

/**
 * Lê o conteúdo do site direto de `content/site-config.json` a cada requisição.
 *
 * Assim, quando o painel salva, o site já mostra a alteração sem precisar
 * recompilar (`pnpm build`). Em ambientes onde o arquivo não existe no runtime
 * (ex.: serverless empacotado), cai no conteúdo embutido no bundle — o site
 * continua funcionando, apenas volta a exigir novo deploy.
 */
export async function readSiteConfig(): Promise<SiteConfig> {
  try {
    const file = path.join(process.cwd(), "content", "site-config.json")
    const raw = await readFile(file, "utf8")
    return mergeSiteConfig(JSON.parse(raw))
  } catch {
    return siteConfig
  }
}
