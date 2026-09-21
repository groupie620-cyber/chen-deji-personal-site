import { knowledgeCount } from "../../_lib/chat.js";

export async function onRequestGet({ env }) {
  return Response.json(
    {
      enabled: Boolean(env.AI),
      mode: env.AI ? "model" : "unavailable",
      provider: env.AI ? "Cloudflare Workers AI" : "服务未配置",
      model: env.AI ? "Qwen3 30B-A3B" : "",
      knowledgeDocuments: knowledgeCount,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
