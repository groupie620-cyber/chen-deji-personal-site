import test from "node:test";
import assert from "node:assert/strict";
import { buildPrompt, groundedPersonalReply, guardedReply, safeReply } from "../functions/_lib/chat.js";

test("Cloudflare DeepSeek reply hides internal reasoning", () => {
  const reply = safeReply("<think>internal reasoning</think>\n\n这是最终回答。");
  assert.equal(reply, "这是最终回答。");
});

test("Cloudflare DeepSeek reply hides an unfinished reasoning block", () => {
  const reply = safeReply("<think>unfinished internal reasoning");
  assert.equal(reply, "刚才这句我没接住，你换个说法再问我一次。");
});

test("AMA prompt positions the model as Chen Deji's conversational avatar", () => {
  const prompt = buildPrompt([
    { role: "user", content: "你平时怎么恢复状态？" },
    { role: "assistant", content: "我一般会散步。" },
    { role: "user", content: "为什么？" },
  ]);
  assert.match(prompt, /陈德基的线上分身/);
  assert.match(prompt, /像微信聊天一样自然/);
  assert.match(prompt, /如果只看这件事，我会/);
  assert.match(prompt, /压力|恢复/);
  assert.match(prompt, /不要输出思考过程/);
  assert.match(prompt, /绝不能说成我的经历、喜好、能力、习惯或已确定立场/);
  assert.match(prompt, /绝不根据 ESFP/);
  assert.match(prompt, /这件事我还没在这里确认过，所以不乱说/);
  assert.match(prompt, /绝不说“我是 AI\/\u6a21型\/\u52a9手”/);
});

test("ordinary drafting requests are handled instead of mechanically refused", () => {
  assert.equal(guardedReply("帮我回复朋友说我今天晚点到"), "");
});

test("private sentences are removed without discarding the whole answer", () => {
  assert.equal(safeReply("我现在在深圳。平时我更喜欢独处和散步。"), "平时我更喜欢独处和散步。");
});

test("role-breaking AI disclaimers are removed without losing the personal answer", () => {
  assert.equal(safeReply("作为一个AI，我无法了解陈德基。按我的性格，我大概率会先把问题说清楚。"), "按我的性格，我大概率会先把问题说清楚。");
});

test("voice requests keep Chen Deji in the first person", () => {
  const reply = groundedPersonalReply("以陈德基的口气给我说几句话");
  assert.match(reply, /我就是陈德基/);
  assert.doesNotMatch(reply, /陈德基是谁|告诉我更多关于他/);
});

test("third-person identity wording is still understood as self identity", () => {
  const reply = groundedPersonalReply("陈德基是谁");
  assert.match(reply, /我是陈德基/);
});

test("model role confusion is replaced with a grounded first-person reply", () => {
  const reply = safeReply(
    "陈德基是谁呢？如果你能告诉我更多关于他的背景，我会尽力配合。",
    "以陈德基的口气给我说几句话",
  );
  assert.match(reply, /我就是陈德基/);
  assert.doesNotMatch(reply, /陈德基是谁|告诉我更多关于他|尽力配合/);
});

test("unverified biographical details are removed from model replies", () => {
  assert.equal(
    safeReply("我去过东京。只看这个问题，我会先确认事实再判断。", "你怎么看旅行？"),
    "只看这个问题，我会先确认事实再判断。",
  );
});

test("replies are limited to three conversational sentences", () => {
  assert.equal(safeReply("第一句。第二句。第三句。第四句。", "测试"), "第一句。第二句。第三句。");
});
