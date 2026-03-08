-- 简化版设置脚本（不需要 Storage）
-- 只需在 Supabase SQL Editor 中执行此脚本即可

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
  pdf_url TEXT NOT NULL, -- 存储 Base64 格式的 PDF
  pdf_filename TEXT NOT NULL,
  pdf_size INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected')),
  admin_notes TEXT,
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

-- 4. 启用行级安全（Row Level Security）
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 5. 设置策略：用户可以查看自己的投稿
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 6. 设置策略：用户可以插入自己的投稿
CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. 设置策略：管理员可以查看所有投稿
CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 8. 设置策略：管理员可以更新所有投稿
CREATE POLICY "Admins can update all submissions" ON submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 9. 设置策略：管理员可以查看管理员表
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 10. 创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. 创建触发器：自动更新 updated_at 字段
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 设置完成！
-- 现在您可以：
-- 1. 提交论文（PDF 会以 Base64 格式存储在数据库中）
-- 2. 添加管理员：INSERT INTO admin_users (user_id) VALUES ('您的用户ID');
-- 3. 访问管理后台：http://localhost:3001/admin
