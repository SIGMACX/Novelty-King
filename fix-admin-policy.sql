-- ========================================
-- 修复管理员表策略的无限递归问题
-- ========================================

-- 问题：admin_users 表的策略尝试查询自己，导致无限递归
-- 解决：移除有问题的策略，admin_users 表只需要 RLS 保护即可

-- 1. 删除导致递归的策略
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;

-- 2. 创建简单的策略：只允许已认证用户查看（不需要检查是否是管理员）
-- 因为普通用户查询这个表也没关系，表里只存储管理员 ID
CREATE POLICY "Authenticated users can view admin_users" ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- 或者，如果您想更严格，可以只允许管理员本人查看自己的记录：
-- DROP POLICY IF EXISTS "Authenticated users can view admin_users" ON admin_users;
-- CREATE POLICY "Users can view own admin record" ON admin_users
--   FOR SELECT
--   USING (user_id = auth.uid());

-- ========================================
-- 验证修复
-- ========================================

-- 查看 admin_users 表的策略
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'admin_users';

-- 测试查询（应该不再报错）
SELECT * FROM admin_users;

-- ========================================
-- 完成！
-- ========================================
