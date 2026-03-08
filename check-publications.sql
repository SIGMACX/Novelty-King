-- ========================================
-- 检查已发表论文的状态
-- ========================================

-- 1. 查看所有投稿的状态
SELECT
  'All Submissions' as check_name,
  id,
  title,
  first_author,
  status,
  is_published,
  published_at,
  created_at
FROM submissions
ORDER BY created_at DESC;

-- 2. 查看已接受但未发表的文章
SELECT
  'Accepted but NOT Published' as check_name,
  id,
  title,
  first_author,
  status,
  is_published
FROM submissions
WHERE status = 'accepted' AND (is_published = false OR is_published IS NULL);

-- 3. 查看已发表的文章（这些会在网站上显示）
SELECT
  'Published Articles (shown on website)' as check_name,
  id,
  title,
  first_author,
  status,
  is_published,
  published_at
FROM submissions
WHERE is_published = true
ORDER BY published_at DESC;

-- 4. 如果你想手动发表某篇文章，使用以下 SQL（替换 ID）
-- UPDATE submissions
-- SET
--   status = 'published',
--   is_published = true,
--   published_at = NOW()
-- WHERE id = 'YOUR_SUBMISSION_ID_HERE';

-- ========================================
-- 说明
-- ========================================
--
-- status = 'accepted'  --> 文章被接受，但还没发表
-- is_published = true  --> 文章已发表，会在网站上显示
--
-- 要让文章在网站显示，需要：
-- 1. 在管理后台点击"发表论文"按钮，或
-- 2. 手动执行上面的 UPDATE SQL 命令
