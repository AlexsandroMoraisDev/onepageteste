import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { mergeSiteConfig, siteConfig, type SiteConfig } from "@/lib/site-config"

/**
 * Onde o conteúdo do site é lido e gravado.
 *
 * - Em qualquer host com disco gravável (VPS, Docker, `pnpm start` local), o painel
 *   grava direto em `content/site-config.json`.
 * - Em ambientes **serverless** (Vercel, Netlify, etc.) o disco é somente-leitura: a
 *   gravação falha e o conteúdo se perde. Para esses casos, defina `GITHUB_REPO` e
 *   `GITHUB_TOKEN` e o painel passa a gravar o próprio `content/site-config.json` no
 *   repositório via API do GitHub. O site lê a versão mais recente de lá a cada
 *   requisição, então o "Salvar" já aparece no site sem precisar recompilar.
 */

const DEFAULT_CONFIG_PATH = "content/site-config.json"
const DEFAULT_BRANCH = "main"
const COMMIT_MESSAGE = "chore(conteudo): atualiza content/site-config.json pelo painel"
const API_VERSION = "2022-11-28"

/** Caminho absoluto do JSON de conteúdo no disco. */
export function configFilePath(): string {
  // Caminho fixo (literal) para o bundler saber exatamente o que empacotar.
  return path.join(process.cwd(), "content", "site-config.json")
}

export type ConfigSource = "github" | "file" | "bundle"

export interface GithubStoreConfig {
  /** "dono/repositorio" */
  repo: string
  token: string
  branch: string
  /** Caminho do arquivo dentro do repositório. */
  configPath: string
}

type FetchLike = typeof fetch

/** Variáveis de ambiente (aceita objeto parcial nos testes). */
type EnvLike = Record<string, string | undefined>

/** Lê a configuração do GitHub a partir do ambiente (ou null quando não configurada). */
export function githubStoreConfig(env: EnvLike = process.env): GithubStoreConfig | null {
  const repo = env.GITHUB_REPO?.trim()
  const token = env.GITHUB_TOKEN?.trim()
  if (!repo || !token) return null
  if (!/^[^\s/]+\/[^\s/]+$/.test(repo)) return null
  return {
    repo,
    token,
    branch: env.GITHUB_BRANCH?.trim() || DEFAULT_BRANCH,
    configPath: normalizeConfigPath(env.GITHUB_CONFIG_PATH),
  }
}

/** True quando o painel pode gravar no GitHub via API. */
export function isGithubStoreConfigured(env: EnvLike = process.env): boolean {
  return githubStoreConfig(env) !== null
}

/** Garante um caminho relativo simples ("content/site-config.json"). */
export function normalizeConfigPath(value: string | undefined): string {
  const raw = (value ?? "").trim().replace(/^\/+/, "")
  if (!raw || raw.includes("..")) return DEFAULT_CONFIG_PATH
  return raw
}

/** URL da API de conteúdo do GitHub para o arquivo e a referência informados. */
export function githubContentsUrl(config: GithubStoreConfig, ref?: string): string {
  const base = `https://api.github.com/repos/${config.repo}/contents/${config.configPath}`
  const branch = ref ?? config.branch
  return `${base}?ref=${encodeURIComponent(branch)}`
}

function githubHeaders(config: GithubStoreConfig, accept: string): Record<string, string> {
  return {
    Authorization: `Bearer ${config.token}`,
    Accept: accept,
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "onepageteste-painel",
  }
}

/** Conteúdo do JSON no formato gravado (2 espaços + quebra final). */
export function serializeConfig(config: SiteConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`
}

/** Lê o JSON do repositório. Retorna null quando o arquivo ainda não existe lá. */
export async function readGithubConfig(
  config: GithubStoreConfig,
  fetchImpl: FetchLike = fetch,
): Promise<SiteConfig | null> {
  const response = await fetchImpl(githubContentsUrl(config), {
    headers: githubHeaders(config, "application/vnd.github.raw+json"),
    cache: "no-store",
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub ${response.status}`)
  const text = await response.text()
  return mergeSiteConfig(JSON.parse(text))
}

async function readGithubSha(config: GithubStoreConfig, fetchImpl: FetchLike): Promise<string | null> {
  const response = await fetchImpl(githubContentsUrl(config), {
    headers: githubHeaders(config, "application/vnd.github+json"),
    cache: "no-store",
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub ${response.status}`)
  const data = (await response.json()) as { sha?: unknown }
  return typeof data.sha === "string" ? data.sha : null
}

/** Grava o JSON no repositório (cria ou atualiza). Lança em caso de falha. */
export async function writeGithubConfig(
  config: GithubStoreConfig,
  content: SiteConfig,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  const sha = await readGithubSha(config, fetchImpl)
  const body: Record<string, unknown> = {
    message: COMMIT_MESSAGE,
    content: Buffer.from(serializeConfig(content), "utf8").toString("base64"),
    branch: config.branch,
  }
  if (sha) body.sha = sha

  const url = `https://api.github.com/repos/${config.repo}/contents/${config.configPath}`
  const response = await fetchImpl(url, {
    method: "PUT",
    headers: { ...githubHeaders(config, "application/vnd.github+json"), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`GitHub ${response.status}${detail ? `: ${detail.slice(0, 180)}` : ""}`)
  }
}

/** Lê o JSON do disco local. */
async function readLocalConfig(): Promise<{ config: SiteConfig; source: ConfigSource }> {
  try {
    const raw = await readFile(configFilePath(), "utf8")
    return { config: mergeSiteConfig(JSON.parse(raw)), source: "file" }
  } catch {
    return { config: siteConfig, source: "bundle" }
  }
}

// Cache curto em memória: evita bater na API do GitHub a cada visita sem deixar o
// conteúdo visivelmente velho. É limpo assim que este processo grava algo.
const CACHE_TTL_MS = 15_000
let cache: { config: SiteConfig; source: ConfigSource; expiresAt: number } | null = null

/** Esquece o conteúdo em cache (usado após salvar e nos testes). */
export function clearConfigCache(): void {
  cache = null
}

/**
 * Lê o conteúdo mais recente: do GitHub quando configurado, senão do disco e,
 * em último caso, do conteúdo embutido no bundle.
 *
 * `fresh` ignora o cache (o painel usa isso para mostrar sempre o que está salvo).
 */
export async function readStoredConfig(
  options: { fresh?: boolean } = {},
): Promise<{ config: SiteConfig; source: ConfigSource }> {
  const github = githubStoreConfig()
  if (github) {
    if (!options.fresh && cache && cache.expiresAt > Date.now()) {
      return { config: cache.config, source: cache.source }
    }
    try {
      const remote = await readGithubConfig(github)
      if (remote) {
        cache = { config: remote, source: "github", expiresAt: Date.now() + CACHE_TTL_MS }
        return { config: remote, source: "github" }
      }
    } catch {
      // Rede/credencial fora: segue para o arquivo local (o site nunca fica vazio).
    }
  }
  return readLocalConfig()
}

export type WriteResult =
  | { ok: true; via: "github" | "file" }
  | { ok: false; message: string }

/** Grava o conteúdo no destino configurado (GitHub ou disco local). */
export async function writeStoredConfig(config: SiteConfig): Promise<WriteResult> {
  const github = githubStoreConfig()
  if (github) {
    try {
      await writeGithubConfig(github, config)
      clearConfigCache()
      return { ok: true, via: "github" }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      return {
        ok: false,
        message:
          `Não foi possível gravar no GitHub (${detail}). Confira GITHUB_REPO e GITHUB_BRANCH, ` +
          "e use um token com permissão “Contents: Read and write”.",
      }
    }
  }

  try {
    await mkdir(path.dirname(configFilePath()), { recursive: true })
    await writeFile(configFilePath(), serializeConfig(config), "utf8")
    clearConfigCache()
    return { ok: true, via: "file" }
  } catch {
    return {
      ok: false,
      message:
        "Este ambiente não permite gravar arquivos. Para salvar direto pelo painel, defina " +
        "GITHUB_REPO e GITHUB_TOKEN (veja o README). Enquanto isso, use “Baixar JSON” e " +
        "substitua content/site-config.json no repositório.",
    }
  }
}
