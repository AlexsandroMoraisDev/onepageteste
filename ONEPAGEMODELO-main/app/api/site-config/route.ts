import { Pool } from "pg"
import { defaultSiteConfig, mergeSiteConfig } from "@/lib/site-config"

export const runtime = "nodejs"
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET() {
  const result = await pool.query("SELECT content FROM site_settings WHERE id = $1 LIMIT 1", ["main"])
  return Response.json(mergeSiteConfig(result.rows[0]?.content ?? defaultSiteConfig), {
    headers: { "Cache-Control": "no-store" },
  })
}

export async function PUT(request: Request) {
  const body = mergeSiteConfig(await request.json())
  await pool.query("INSERT INTO site_settings (id, content, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()", ["main", JSON.stringify(body)])
  return Response.json(body)
}
