/**
 * 根据评分和评价人数自动计算文章等级
 * @param {number} averageRating - 平均评分 (0-5)
 * @param {number} ratingCount - 评价人数
 * @returns {object} - 包含 slug, name, cn 的等级对象
 */
export function calculateStage(averageRating, ratingCount) {
  // King (创新之王): 评价人数 > 100 且 平均分 > 4.5
  if (ratingCount > 100 && averageRating > 4.5) {
    return {
      slug: "king-novelty",
      name: "King",
      cn: "创新之王"
    };
  }

  // Significant (显著创新): 平均分 > 3.5
  if (averageRating > 3.5) {
    return {
      slug: "significant-novelty",
      name: "Significant",
      cn: "显著创新"
    };
  }

  // Small (小创新): 平均分 > 2.5
  if (averageRating > 2.5) {
    return {
      slug: "small-novelty",
      name: "Small",
      cn: "小创新"
    };
  }

  // Claimed (声称创新): 其他情况
  return {
    slug: "claimed-novelty",
    name: "Claimed",
    cn: "声称创新"
  };
}

/**
 * 获取等级的颜色
 * @param {string} stageSlug - 等级的 slug
 * @returns {string} - 颜色值
 */
export function getStageColor(stageSlug) {
  const colors = {
    "king-novelty": "#FFD700",        // 金色
    "significant-novelty": "#4CAF50",  // 绿色
    "small-novelty": "#2196F3",        // 蓝色
    "claimed-novelty": "#9E9E9E"       // 灰色
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
