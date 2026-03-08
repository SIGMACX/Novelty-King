# 快速设置指南 - 投稿功能

## 问题：提交时提示"数据库未配置"

这是因为 Supabase 存储桶还没有创建。请按以下步骤操作：

---

## 第一步：创建存储桶（Storage Bucket）

1. 访问 https://esoswgywjkkijwyvhwdl.supabase.co
2. 点击左侧菜单的 **Storage**
3. 点击 **New bucket** 按钮
4. 填写信息：
   - **Name**: `submissions`
   - **Public bucket**: **关闭**（不要勾选）
5. 点击 **Create bucket**

---

## 第二步：设置存储桶策略

### 方法 A：通过 UI 设置（推荐 - 更简单）

1. 在 Storage 页面，点击刚创建的 `submissions` 存储桶
2. 点击顶部的 **Policies** 标签
3. 点击 **New Policy** 按钮

**创建策略 1 - 用户上传：**
- 点击 **For full customization**
- Policy name: `Users can upload own PDFs`
- Allowed operation: 勾选 **INSERT**
- Target roles: `authenticated`
- USING expression: 留空
- WITH CHECK expression:
  ```sql
  bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- 点击 **Review** -> **Save policy**

**创建策略 2 - 用户查看：**
- 点击 **New Policy** -> **For full customization**
- Policy name: `Users can view own PDFs`
- Allowed operation: 勾选 **SELECT**
- Target roles: `authenticated`
- USING expression:
  ```sql
  bucket_id = 'submissions' AND (storage.foldername(name))[1] = auth.uid()::text
  ```
- WITH CHECK expression: 留空
- 点击 **Review** -> **Save policy**

### 方法 B：通过 SQL 设置

在 SQL Editor 中执行：

```sql
-- 策略 1: 用户上传
CREATE POLICY "Users can upload own PDFs" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 策略 2: 用户查看自己的文件
CREATE POLICY "Users can view own PDFs" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 第三步：创建数据表

在 SQL Editor 中执行（如果还没执行过）：

```sql
-- 创建 submissions 表
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
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 用户可以插入自己的投稿
CREATE POLICY "Users can insert own submissions" ON submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以查看自己的投稿
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 第四步：测试投稿

1. 访问 http://localhost:3001
2. 登录账户
3. 点击 **Submit / 投稿**
4. 填写表单并上传一个 PDF 文件
5. 点击 **提交论文**

应该会看到：**"投稿成功！我们将在3个工作日内完成初审。"**

---

## 验证设置是否正确

### 检查存储桶：
- Storage -> 应该看到 `submissions` 存储桶
- 点击进入 -> Policies 标签 -> 应该有 2 个策略

### 检查数据表：
- Table Editor -> 应该看到 `submissions` 表
- 点击 Policies 标签 -> 应该有 2 个策略

### 检查提交结果：
- 提交成功后，在 Table Editor -> submissions 表中应该能看到新记录
- 在 Storage -> submissions 存储桶中应该能看到上传的 PDF 文件

---

## 常见问题

### Q: 提示 "new row violates row-level security policy"
**A:** RLS 策略没有正确设置。确保执行了第三步中的 CREATE POLICY 语句。

### Q: 提示 "Bucket not found"
**A:** 存储桶没有创建。回到第一步手动创建。

### Q: 文件上传后提示 "permission denied"
**A:** 存储策略没有设置。回到第二步设置策略。

### Q: 提交成功但数据库中没有记录
**A:** 数据表策略有问题。在 SQL Editor 中检查：
```sql
SELECT * FROM submissions;
```

---

## 需要帮助？

1. 按 F12 打开浏览器开发者工具
2. 查看 Console 标签的错误信息
3. 将错误信息提供给我
