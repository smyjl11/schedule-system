-- ========================================
-- 种子数据：管理员 + 3位员工 + 示例日程
-- ========================================

-- 密码都是 "123456"，通过 bcryptjs 加密后的 hash
-- Admin: admin / 123456
INSERT OR IGNORE INTO users (id, username, password, name, department, role) VALUES
(1, 'admin',    '$2a$10$Hp25yETjkCou4tVXTE920.OqJBFunU9HrmSZ5nraWLwY3X.8.uM82', '张管理', '技术部',   'admin'),
(2, 'zhangsan', '$2a$10$Hp25yETjkCou4tVXTE920.OqJBFunU9HrmSZ5nraWLwY3X.8.uM82', '张三',   '产品部',   'employee'),
(3, 'lisi',     '$2a$10$Hp25yETjkCou4tVXTE920.OqJBFunU9HrmSZ5nraWLwY3X.8.uM82', '李四',   '设计部',   'employee'),
(4, 'wangwu',   '$2a$10$Hp25yETjkCou4tVXTE920.OqJBFunU9HrmSZ5nraWLwY3X.8.uM82', '王五',   '技术部',   'employee');

-- 为每一位员工创建未来一周的示例日程
INSERT OR IGNORE INTO schedules (user_id, title, description, start_time, end_time, status) VALUES
(2, '产品需求评审',   'Q3 需求文档评审会议',          '2026-07-08 09:00', '2026-07-08 11:00', 'pending'),
(2, '用户访谈',       '电话访谈核心用户',             '2026-07-09 14:00', '2026-07-09 15:30', 'pending'),
(2, '竞品分析',       '完成竞品功能对比报告',         '2026-07-11 10:00', '2026-07-11 12:00', 'in_progress'),
(3, 'UI 设计稿交付',  '首页与个人中心界面设计',       '2026-07-08 09:00', '2026-07-08 18:00', 'in_progress'),
(3, '设计评审',       '团队周设计评审',               '2026-07-10 10:00', '2026-07-10 12:00', 'pending'),
(4, '后端 API 开发',  '用户模块接口联调',             '2026-07-08 09:00', '2026-07-08 18:00', 'in_progress'),
(4, '代码审查',       'Review 前端代码 PR',            '2026-07-09 16:00', '2026-07-09 17:00', 'pending'),
(4, '技术分享',       '部门技术分享：Server Components','2026-07-11 14:00', '2026-07-11 16:00', 'pending'),
(2, '周报撰写',       '部门周报汇总提交',             '2026-07-12 16:00', '2026-07-12 17:00', 'pending'),
(3, '图标资源整理',   '整理通用图标组件库',           '2026-07-12 10:00', '2026-07-12 11:30', 'pending');
