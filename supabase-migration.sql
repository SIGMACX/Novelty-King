-- 添加评分字段到 submissions 表
-- Add rating columns to submissions table

-- 检查并添加 average_rating 字段
-- Check and add average_rating column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'submissions'
        AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE submissions ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.0;
    END IF;
END $$;

-- 检查并添加 rating_count 字段
-- Check and add rating_count column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'submissions'
        AND column_name = 'rating_count'
    ) THEN
        ALTER TABLE submissions ADD COLUMN rating_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 删除所有现有的 UPDATE 策略
DROP POLICY IF EXISTS "Allow public to update ratings" ON submissions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON submissions;

-- 创建新的策略:允许任何人读取已发布的文章
DROP POLICY IF EXISTS "Allow public to read published submissions" ON submissions;
CREATE POLICY "Allow public to read published submissions"
ON submissions
FOR SELECT
USING (status = 'published');

-- 创建新的策略:允许任何人更新评分字段
CREATE POLICY "Allow public to update ratings"
ON submissions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 或者,如果上面的策略不工作,尝试使用更宽松的策略(仅用于测试)
-- DROP POLICY IF EXISTS "Allow all updates" ON submissions;
-- CREATE POLICY "Allow all updates" ON submissions FOR UPDATE USING (true) WITH CHECK (true);

-- 确保 RLS 已启用
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_average_rating ON submissions(average_rating);
CREATE INDEX IF NOT EXISTS idx_submissions_rating_count ON submissions(rating_count);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- 注释
COMMENT ON COLUMN submissions.average_rating IS '文章平均评分 (0.0-5.0)';
COMMENT ON COLUMN submissions.rating_count IS '评分总人数';

-- 刷新 PostgREST schema 缓存
NOTIFY pgrst, 'reload schema';
