import { allowRequest, buildPrompt, groundedPersonalReply, guardedReply, safeReply, sanitizeMessages } from "../_lib/chat.js";

export async function onRequestPost({ request, env }) {
  if (!env.AI) return Response.json({ error: "AI 服务尚未配置。" }, { status: 503 });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!allowRequest(ip)) return Response.json({ error: "提问有些频繁，请十分钟后再试。" }, { status: 429 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  const messages = sanitizeMessages(body?.messages);
  const latestQuestion = messages.filter((message) => message.role === "user").at(-1)?.content;
  if (!latestQuestion) return Response.json({ error: "请输入一个问题。" }, { status: 400 });
  const guarded = guardedReply(latestQuestion);
  if (guarded) return Response.json({ reply: guarded, mode: "guarded" });
    const grounded = groundedPersonalReply(latestQuestion);
  if (grounded) return Response.json({ reply: grounded, mode: "grounded" }, { headers: { "Cache-Control": "no-store" } });

  try {
    const result = await env.AI.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
      messages: [{ role: "system", content: buildPrompt(messages) }, ...messages],
      temperature: 0.35,
      max_tokens: 520,
    });
    return Response.json({ reply: safeReply(result?.response, latestQuestion) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Workers AI request failed", error);
    return Response.json({ error: "AI 服务暂时忙碌，请稍后再试。" }, { status: 502 });
  }
}

export function onRequestGet() {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
