-- 添加发表相关的字段到 submissions 表

-- 添加发表日期字段
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- 添加是否公开显示的字段
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- 更新状态检查约束，添加 'published' 状态
ALTER TABLE submissions
DROP CONSTRAINT IF EXISTS submissions_status_check;

ALTER TABLE submissions
ADD CONSTRAINT submissions_status_check
CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'published'));

-- 创建索引以提高查询已发表文章的性能
CREATE INDEX IF NOT EXISTS idx_submissions_published ON submissions(is_published, published_at DESC);

-- 添加策略：公开访问已发表的文章
CREATE POLICY "Anyone can view published submissions" ON submissions
  FOR SELECT
  USING (is_published = true);

-- 添加注释说明
COMMENT ON COLUMN submissions.is_published IS '是否公开发表';
COMMENT ON COLUMN submissions.published_at IS '发表时间';
