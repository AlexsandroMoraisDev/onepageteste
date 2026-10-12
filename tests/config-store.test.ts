import { mkdtemp, readFile, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearConfigCache,
  githubContentsUrl,
  githubStoreConfig,
  isGithubStoreConfigured,
  normalizeConfigPath,
  readGithubConfig,
  readStoredConfig,
  serializeConfig,
  writeGithubConfig,
  writeStoredConfig,
  type GithubStoreConfig,
} from "@/lib/config-store"
import { mergeSiteConfig } from "@/lib/site-config"

const CONFIG: GithubStoreConfig = {
  repo: "dono/repo",
  token: "ghp_segredo",
  branch: "main",
  configPath: "content/site-config.json",
}

const SAMPLE = mergeSiteConfig({ brand: { name: "Loja Teste" } })
const REMOTE = { brand: { name: "Do GitHub" } }

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

function text(body: string, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "application/json" } })
}

describe("githubStoreConfig / isGithubStoreConfigured", () => {
  it("é nulo sem as variáveis do GitHub", () => {
    expect(githubStoreConfig({})).toBeNull()
    expect(githubStoreConfig({ GITHUB_REPO: "dono/repo" })).toBeNull()
    expect(githubStoreConfig({ GITHUB_TOKEN: "token" })).toBeNull()
    expect(isGithubStoreConfigured({})).toBe(false)
  })

  it("recusa repositório fora do formato dono/repo", () => {
    expect(githubStoreConfig({ GITHUB_REPO: "sem-barra", GITHUB_TOKEN: "t" })).toBeNull()
  })

  it("aplica padrões de branch e caminho", () => {
    const config = githubStoreConfig({ GITHUB_REPO: "dono/repo", GITHUB_TOKEN: "t" })
    expect(config).toMatchObject({ repo: "dono/repo", branch: "main", configPath: "content/site-config.json" })
  })

  it("respeita GITHUB_BRANCH e GITHUB_CONFIG_PATH", () => {
    const config = githubStoreConfig({
      GITHUB_REPO: "dono/repo",
      GITHUB_TOKEN: "t",
      GITHUB_BRANCH: "producao",
      GITHUB_CONFIG_PATH: "/dados/site.json",
    })
    expect(config).toMatchObject({ branch: "producao", configPath: "dados/site.json" })
  })
})

describe("normalizeConfigPath", () => {
  it("remove barra inicial e espaços", () => {
    expect(normalizeConfigPath("  /content/site-config.json ")).toBe("content/site-config.json")
  })

  it("usa o padrão quando vazio ou com '..'", () => {
    expect(normalizeConfigPath("")).toBe("content/site-config.json")
    expect(normalizeConfigPath(undefined)).toBe("content/site-config.json")
    expect(normalizeConfigPath("../fora.json")).toBe("content/site-config.json")
  })
})

describe("githubContentsUrl", () => {
  it("monta a URL da API com a branch e o caminho", () => {
    expect(githubContentsUrl(CONFIG)).toBe(
      "https://api.github.com/repos/dono/repo/contents/content/site-config.json?ref=main",
    )
  })

  it("permite sobrescrever a referência", () => {
    expect(githubContentsUrl(CONFIG, "outra/branch")).toContain("ref=outra%2Fbranch")
  })
})

describe("readGithubConfig", () => {
  it("devolve o conteúdo mesclado", async () => {
    const fetchImpl = vi.fn(async () => text(JSON.stringify(REMOTE))) as unknown as typeof fetch
    const config = await readGithubConfig(CONFIG, fetchImpl)
    expect(config?.brand.name).toBe("Do GitHub")
  })

  it("devolve null quando o arquivo ainda não existe (404)", async () => {
    const fetchImpl = vi.fn(async () => text("", 404)) as unknown as typeof fetch
    expect(await readGithubConfig(CONFIG, fetchImpl)).toBeNull()
  })

  it("lança quando o GitHub responde com erro", async () => {
    const fetchImpl = vi.fn(async () => text("erro", 500)) as unknown as typeof fetch
    await expect(readGithubConfig(CONFIG, fetchImpl)).rejects.toThrow("GitHub 500")
  })
})

describe("writeGithubConfig", () => {
  it("atualiza o arquivo existente incluindo o sha", async () => {
    const calls: RequestInit[] = []
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      calls.push(init ?? {})
      return calls.length === 1 ? json({ sha: "abc123" }) : json({ commit: "ok" })
    }) as unknown as typeof fetch

    await writeGithubConfig(CONFIG, SAMPLE, fetchImpl)

    const put = JSON.parse(String(calls[1].body))
    expect(put.sha).toBe("abc123")
    expect(put.branch).toBe("main")
    expect(put.content).toBe(Buffer.from(serializeConfig(SAMPLE), "utf8").toString("base64"))
    expect(calls[1].method).toBe("PUT")
  })

  it("cria o arquivo sem sha quando ele não existe", async () => {
    const calls: RequestInit[] = []
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) => {
      calls.push(init ?? {})
      return calls.length === 1 ? text("", 404) : json({ commit: "ok" })
    }) as unknown as typeof fetch

    await writeGithubConfig(CONFIG, SAMPLE, fetchImpl)
    expect(JSON.parse(String(calls[1].body))).not.toHaveProperty("sha")
  })

  it("lança quando a gravação falha", async () => {
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === "PUT" ? text("nope", 403) : json({ sha: "abc" }),
    ) as unknown as typeof fetch
    await expect(writeGithubConfig(CONFIG, SAMPLE, fetchImpl)).rejects.toThrow("GitHub 403")
  })
})

describe("readStoredConfig / writeStoredConfig", () => {
  const original = { ...process.env }

  beforeEach(() => {
    clearConfigCache()
    delete process.env.GITHUB_REPO
    delete process.env.GITHUB_TOKEN
  })
  afterEach(() => {
    clearConfigCache()
    vi.restoreAllMocks()
    process.env = { ...original }
  })

  it("lê do GitHub quando configurado", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    vi.stubGlobal("fetch", vi.fn(async () => text(JSON.stringify(REMOTE))))

    const { config, source } = await readStoredConfig({ fresh: true })
    expect(source).toBe("github")
    expect(config.brand.name).toBe("Do GitHub")
  })

  it("cai no arquivo local quando o GitHub falha", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("sem rede") }))

    const { source } = await readStoredConfig({ fresh: true })
    expect(source).toBe("file")
  })

  it("usa o arquivo local quando o GitHub não está configurado", async () => {
    const { config, source } = await readStoredConfig({ fresh: true })
    expect(source).toBe("file")
    expect(config.brand.name).toBeTruthy()
  })

  it("grava no GitHub e devolve sucesso", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    const fetchImpl = vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === "PUT" ? json({ commit: "ok" }) : json({ sha: "abc" }),
    )
    vi.stubGlobal("fetch", fetchImpl)

    await expect(writeStoredConfig(SAMPLE)).resolves.toEqual({ ok: true, via: "github" })
  })

  it("grava no disco local quando o GitHub não está configurado", async () => {
    const tmp = await mkdtemp(path.join(os.tmpdir(), "site-config-"))
    const cwd = process.cwd()
    process.chdir(tmp)
    try {
      const result = await writeStoredConfig(SAMPLE)
      expect(result).toEqual({ ok: true, via: "file" })
      const saved = JSON.parse(await readFile(path.join(tmp, "content", "site-config.json"), "utf8"))
      expect(saved.brand.name).toBe("Loja Teste")
    } finally {
      process.chdir(cwd)
      await rm(tmp, { recursive: true, force: true })
    }
  })

  it("devolve mensagem clara quando a gravação no GitHub falha", async () => {
    process.env.GITHUB_REPO = "dono/repo"
    process.env.GITHUB_TOKEN = "t"
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init?: RequestInit) =>
      init?.method === "PUT" ? text("forbidden", 403) : json({ sha: "abc" }),
    ))

    const result = await writeStoredConfig(SAMPLE)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain("GitHub")
  })
})
