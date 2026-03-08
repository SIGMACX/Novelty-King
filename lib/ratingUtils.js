/**
 * 根据评分和评价人数自动计算文章等级（创新修炼池）
 * @param {number} averageRating - 平均评分 (0-5)
 * @param {number} ratingCount - 评价人数
 * @returns {object} - 包含 slug, name, cn 的等级对象
 */
export function calculateStage(averageRating, ratingCount) {
  // 合体: 评价人数 > 100 且 平均分 > 4.5
  if (ratingCount > 100 && averageRating > 4.5) {
    return {
      slug: "heti",
      name: "Integration",
      cn: "合体"
    };
  }

  // 元婴: 平均分 > 3.5
  if (averageRating > 3.5) {
    return {
      slug: "yuanying",
      name: "Nascent Soul",
      cn: "元婴"
    };
  }

  // 筑基: 平均分 > 2.5
  if (averageRating > 2.5) {
    return {
      slug: "zhuji",
      name: "Foundation",
      cn: "筑基"
    };
  }

  // 凡人: 其他情况
  return {
    slug: "fanren",
    name: "Mortal",
    cn: "凡人"
  };
}

/**
 * 获取等级的颜色
 * @param {string} stageSlug - 等级的 slug
 * @returns {string} - 颜色值
 */
export function getStageColor(stageSlug) {
  const colors = {
    "heti": "#FFD700",        // 合体 - 金色
    "yuanying": "#9C27B0",    // 元婴 - 紫色
    "zhuji": "#2196F3",       // 筑基 - 蓝色
    "fanren": "#9E9E9E"       // 凡人 - 灰色
  };
  return colors[stageSlug] || "#9E9E9E";
}

/**
 * 格式化评分为步长 0.2 的值
 * @param {number} rating - 原始评分
 * @returns {number} - 格式化后的评分
 */
export function formatRating(rating) {
  return Math.round(rating / 0.2) * 0.2;
}
