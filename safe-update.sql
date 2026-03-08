-- ========================================
-- 安全更新脚本 - 只添加缺少的字段和功能
-- 适用于已有基本表结构的情况
-- ========================================

-- 1. 添加缺少的字段（如果不存在）
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- 2. 更新状态约束（先删除旧的，再添加新的）
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check
CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'published'));

-- 3. 创建性能优化索引
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_published ON submissions(is_published, published_at DESC);

-- 4. 删除可能存在的旧策略（避免冲突）
DROP POLICY IF EXISTS "Anyone can view published submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;

-- 5. 添加公开访问已发表论文的策略
CREATE POLICY "Anyone can view published submissions" ON submissions
  FOR SELECT
  USING (is_published = true);

-- 6. 添加管理员查看管理员表的策略
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 7. 创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 删除可能存在的旧触发器
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

-- 9. 创建触发器：自动更新 updated_at 字段
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. 添加管理员账户（如果尚未添加）
-- 替换为您的实际用户 ID
INSERT INTO admin_users (user_id)
VALUES ('e5eb927f-45f2-4b69-b923-835a810c3ed8')
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- 验证设置
-- ========================================

-- 查看所有管理员
SELECT
  au.user_id,
  u.email,
  au.created_at as admin_since
FROM admin_users au
JOIN auth.users u ON au.user_id = u.id;

-- 查看 submissions 表结构（验证字段是否添加成功）
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'submissions'
ORDER BY ordinal_position;

-- ========================================
-- 完成！
-- ========================================
