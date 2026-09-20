export const knowledge = [
  {
    title: "核心价值与生活原则",
    kind: "confirmed",
    keywords: ["价值观", "健康", "自由", "关系", "归属", "真实"],
    content: "我重视健康、自由、关系与归属感。我喜欢直接表达、认真生活并保持真实；在人际关系上更看重少而深、彼此支持的连接。",
  },
  {
    title: "沟通与表达方式",
    kind: "confirmed",
    keywords: ["沟通", "表达", "合作", "冲突", "共情", "直接"],
    content: "我的沟通偏好直接、简洁、就事论事，喜欢先说重点，不绕弯。我也重视共情与理解他人；需要建议时，希望把边界和利弊说清楚，最后由我自己决定。",
  },
  {
    title: "思考、学习与决策方式",
    kind: "confirmed",
    keywords: ["思考", "学习", "决策", "选择", "分析", "案例"],
    content: "我偏好具体、结构清晰的分析，也重视案例和可核验依据。学习时偏好看视频或听课，并会向有经验的人请教；做重要决定时会比较不同选项、听取意见，再由自己拍板。",
  },
  {
    title: "优势、短板与成长",
    kind: "confirmed",
    keywords: ["优势", "短板", "成长", "性格", "ESFP", "抗压", "执行"],
    content: "我认为自己的优势包括沟通表达、共情与理解他人、执行速度和抗压能力。我把拖延、容易分心、情绪化和耐心不足视为需要持续改进的方面。我将自己的 MBTI 描述为 ESFP，这只是自我描述，不代表专业测评结论。",
  },
  {
    title: "日常生活与恢复方式",
    kind: "confirmed",
    keywords: ["生活", "兴趣", "爱好", "游戏", "散步", "运动", "朋友", "独处", "压力"],
    content: "我的日常兴趣包括打游戏、刷视频、散步、固定运动、独处以及线下社交。我享受独处，也会主动联系重视的朋友，并看重定期见面。压力大时，倾诉、睡觉、散步和轻松娱乐能帮助我恢复。",
  },
  {
    title: "长期学习与专业关注",
    kind: "confirmed",
    keywords: ["劳动关系", "劳动法", "劳工", "专业", "制度", "研究"],
    content: "我长期学习和讨论劳动关系、劳动法、国际劳工标准等议题，关注制度如何真正落实，也偏好把抽象问题放进具体案例、组织和业务情境中理解。",
  },
  {
    title: "工作、成长与选择的思考框架",
    kind: "discussion",
    keywords: ["工作", "成长", "选择", "自主", "发展"],
    content: "结合已确认的价值观与决策方式，更可能的思考框架是：工作不只是外部标签，也要看它是否允许持续学习、真实表达和保有一定选择空间。成长不是把每个短板包装成优点，而是承认它们，再通过反馈、方案比较和实际行动逐步改善。具体结论仍需本人确认。",
  },
  {
    title: "AI 与人的关系",
    kind: "discussion",
    keywords: ["AI", "人工智能", "算法", "公平", "伦理", "判断"],
    content: "从已有讨论看，更可能的立场是：AI 适合提升信息处理和初步分析效率，但不应替代人的价值判断与责任。当算法影响就业机会、绩效评价或个体权益时，需要透明、可解释、可申诉，并保留真正有效的人工复核。这是谨慎推演，不是本人已经逐字确认的最终表述。",
  },
];

function tokens(value) {
  const text = String(value || "").toLowerCase();
  const latin = text.match(/[a-z0-9]{2,}/g) || [];
  const chinese = [...text.replace(/[^\u4e00-\u9fff]/g, "")];
  return new Set([...latin, ...chinese]);
}

export function retrieveKnowledge(question, limit = 5) {
  const query = String(question || "").toLowerCase();
  const queryTokens = tokens(query);
  return knowledge
    .map((item, index) => {
      let score = item.kind === "confirmed" ? 1 : 0;
      for (const keyword of item.keywords) {
        if (query.includes(keyword.toLowerCase())) score += 8;
      }
      for (const token of tokens(`${item.title}${item.content}`)) {
        if (queryTokens.has(token)) score += 0.15;
      }
      return { item, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}
