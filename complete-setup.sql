-- ========================================
-- 完整的数据库设置脚本
-- ========================================

-- 1. 创建投稿表
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  first_author TEXT NOT NULL,
  corresponding_author TEXT,
  email TEXT NOT NULL,
  research_field TEXT,
  keywords TEXT,
  abstract TEXT,
  pdf_url TEXT NOT NULL,
  pdf_filename TEXT NOT NULL,
  pdf_size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'published')),
  admin_notes TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建管理员表
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_published ON submissions(is_published, published_at DESC);

-- 4. 启用行级安全（Row Level Security）
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. 删除可能存在的旧策略（避免冲突）
DROP POLICY IF EXISTS "Users can insert own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Anyone can view published submissions" ON submissions;

-- 6. 策略：用户可以插入自己的投稿
CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. 策略：用户可以查看自己的投稿
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 8. 策略：管理员可以查看所有投稿
CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 9. 策略：管理员可以更新所有投稿
CREATE POLICY "Admins can update all submissions" ON submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 10. 策略：管理员可以查看管理员表
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 11. 策略：公开访问已发表的文章
CREATE POLICY "Anyone can view published submissions" ON submissions
  FOR SELECT
  USING (is_published = true);

-- 12. 创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. 删除可能存在的旧触发器
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

-- 14. 创建触发器：自动更新 updated_at 字段
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 添加管理员账户
-- ========================================

-- 替换为您的实际用户 ID
-- 如果不确定用户 ID，先执行：
-- SELECT id, email FROM auth.users WHERE email = '您的邮箱';

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

-- ========================================
-- 完成！
-- ========================================
-- 现在您可以：
-- 1. 使用管理员邮箱登录 http://localhost:3000/admin/login
-- 2. 发送验证码并登录
-- 3. 访问管理后台查看所有投稿
