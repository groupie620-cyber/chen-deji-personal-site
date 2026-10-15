import test from "node:test";
import assert from "node:assert/strict";
import { retrieveKnowledge } from "../functions/_lib/knowledge.js";

test("unrelated questions do not receive a dump of personal facts", () => {
  assert.deepEqual(retrieveKnowledge("你怎么看量子计算？"), []);
});

test("knowledge retrieval returns only a small relevant set", () => {
  const items = retrieveKnowledge("你压力大时怎么恢复？");
  assert.ok(items.length > 0);
  assert.ok(items.length <= 4);
  assert.ok(items.some((item) => /压力|恢复/.test(`${item.title}${item.content}`)));
});

test("discussion material requires a direct topic match", () => {
  assert.equal(retrieveKnowledge("随便聊聊").some((item) => item.kind === "discussion"), false);
  assert.equal(retrieveKnowledge("你怎么看人工智能？").some((item) => item.title === "AI 与人的关系"), true);
});
