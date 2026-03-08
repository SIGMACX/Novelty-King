-- ========================================
-- 管理员权限诊断脚本
-- 请在 Supabase SQL Editor 中执行
-- ========================================

-- 1. 检查管理员表中的记录
SELECT
  'admin_users 表内容' as check_name,
  user_id,
  created_at
FROM admin_users;

-- 2. 检查管理员是否在 auth.users 中存在
SELECT
  'auth.users 中的管理员' as check_name,
  u.id,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.id IN (SELECT user_id FROM admin_users);

-- 3. 检查当前用户是否是管理员（替换为您的用户 ID）
SELECT
  '检查特定用户是否是管理员' as check_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = 'e5eb927f-45f2-4b69-b923-835a810c3ed8'
    ) THEN '是管理员 ✓'
    ELSE '不是管理员 ✗'
  END as result;

-- 4. 检查所有现有的策略
SELECT
  'submissions 表的策略' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'submissions';

-- 5. 检查 admin_users 表的策略
SELECT
  'admin_users 表的策略' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'admin_users';

-- 6. 测试：尝试以管理员身份查询所有投稿
-- （这个查询模拟了管理后台的查询）
SELECT
  'submissions 表的内容' as check_name,
  id,
  title,
  first_author,
  status,
  created_at
FROM submissions
ORDER BY created_at DESC;

-- 7. 检查 RLS 是否启用
SELECT
  'RLS 状态检查' as check_name,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('submissions', 'admin_users');

-- ========================================
-- 预期结果
-- ========================================
-- 1. admin_users 表应该有您的用户 ID
-- 2. auth.users 应该显示您的邮箱
-- 3. 特定用户检查应该显示"是管理员 ✓"
-- 4. submissions 表应该有 "Admins can view all submissions" 策略
-- 5. admin_users 表应该有 "Admins can view admin_users" 策略
-- 6. submissions 查询应该返回所有投稿（如果有的话）
-- 7. RLS 应该对两个表都启用（rls_enabled = true）
