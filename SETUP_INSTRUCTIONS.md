# 数据库设置说明

投稿系统需要先在 Supabase 中创建数据库表和存储桶。请按以下步骤操作：

## 第一步：执行数据库脚本

1. 打开您的 Supabase 项目控制台：https://esoswgywjkkijwyvhwdl.supabase.co

2. 在左侧菜单中，点击 **SQL Editor**

3. 点击 **New Query** 创建新查询

4. 复制 `supabase-schema.sql` 文件的全部内容

5. 粘贴到 SQL Editor 中

6. 点击右下角的 **Run** 按钮执行脚本

这将创建：
- `submissions` 表（存储投稿信息）
- `admin_users` 表（存储管理员权限）
- `submissions` 存储桶（存储 PDF 文件）
- 行级安全策略（Row Level Security）

## 第二步：验证数据库表已创建

1. 在 Supabase 控制台，点击左侧的 **Table Editor**

2. 您应该能看到两个新表：
   - `submissions`
   - `admin_users`

3. 点击左侧的 **Storage**，您应该能看到 `submissions` 存储桶

## 第三步：测试投稿功能

现在您可以测试投稿功能：

1. 访问 http://localhost:3001
2. 登录您的账户
3. 点击 "Submit / 投稿" 按钮
4. 填写投稿表单并上传 PDF
5. 点击 "提交论文"

如果设置正确，您应该看到 "投稿成功！" 的消息。

## 第四步：设置管理员账户（可选）

如果您想访问管理后台：

1. 在 Supabase SQL Editor 中，查找您的用户 ID：
   ```sql
   SELECT id, email FROM auth.users;
   ```

2. 将您的用户 ID 添加到 admin_users 表：
   ```sql
   INSERT INTO admin_users (user_id) VALUES ('您的用户ID');
   ```

3. 现在您可以访问 http://localhost:3001/admin 查看管理后台

## 常见错误

### "数据库未配置" 错误
这意味着数据表或存储桶还没有创建。请确保您已经在 Supabase 中执行了 `supabase-schema.sql` 脚本。

### "PDF上传失败" 错误
检查：
1. 存储桶 `submissions` 是否已创建
2. 存储策略是否正确配置
3. 文件大小是否超过 10MB
4. 文件格式是否为 PDF

### 无法访问管理后台
确保：
1. 您已登录
2. 您的用户 ID 已添加到 `admin_users` 表
3. 数据表已正确创建

## 需要帮助？

如果遇到问题，请查看：
- Supabase 控制台的 Logs 部分
- 浏览器的开发者工具控制台（F12）
- `supabase-schema.sql` 文件中的注释
