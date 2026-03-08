-- 删除旧的存储策略
DROP POLICY IF EXISTS "Users can upload own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all PDFs" ON storage.objects;

-- 创建新的存储策略（使用 LIKE 而不是 foldername）
CREATE POLICY "Users can upload own PDFs" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'submissions' AND
    (name LIKE (auth.uid()::text || '/%'))
  );

CREATE POLICY "Users can view own PDFs" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'submissions' AND
    (name LIKE (auth.uid()::text || '/%'))
  );

CREATE POLICY "Admins can view all PDFs" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'submissions' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
