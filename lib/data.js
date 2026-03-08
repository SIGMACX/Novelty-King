// 示例文章已删除，现在papers数组为空
// 只有通过管理员确认的文章才会显示在页面上
// 文章数据将从Supabase数据库的submissions表中获取
export const papers = [];

export const stages = [
  {
    slug: "claimed-novelty",
    name: "Claimed",
    cn: "声称创新",
    description: "Research asserting novelty through new perspectives or approaches.",
    descriptionCn: "通过新视角或新方法主张创新性的研究。",
  },
  {
    slug: "small-novelty",
    name: "Small",
    cn: "小创新",
    description: "Incremental contributions and minor improvements to existing knowledge.",
    descriptionCn: "渐进式贡献与现有知识的小幅改进。",
  },
  {
    slug: "significant-novelty",
    name: "Significant",
    cn: "显著创新",
    description: "Substantial contributions that advance understanding in meaningful ways.",
    descriptionCn: "以有意义的方式推进理解的实质性贡献。",
  },
  {
    slug: "king-novelty",
    name: "King",
    cn: "创新之王",
    description: "Groundbreaking work that transforms thinking in fundamental ways.",
    descriptionCn: "从根本上转变思维方式的开创性工作。",
  },
];
