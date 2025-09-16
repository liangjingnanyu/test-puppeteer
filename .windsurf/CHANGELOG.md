# Windsurf 配置变更日志

## [2.0.0] - 2025-09-16

### 重大更新
- 项目名称更新：cerlo-admin-website → test-puppeteer
- 技术栈完全更新为 Puppeteer 浏览器自动化测试项目

### 新增
- **memories/react-patterns.md** - React 19 + Hooks 高频代码模式
- **memories/antd-patterns.md** - Antd 5.27.3 组件使用模式  
- **memories/api-patterns.md** - API 调用和错误处理模式
- **memories/puppeteer-patterns.md** - 浏览器控制专业模式
- 项目基础信息更新：技术栈版本、端口配置、依赖管理

### 优化
- **memories/base.md** - 更新为当前项目基础信息
- **memories/project-structure.md** - 同步实际项目目录结构
- **memories/tech-patterns.md** - 修正版本信息，移除无关依赖
- **contexts/default.json** - 完整重构，添加所有新配置项

### 删除
- 删除过时的 CHANGELOG.md 和 README.md
- 删除错误的 rules/structure.md（目录结构不匹配）
- 删除错误的 rules/tech-stack.md（版本信息错误）

### 配置更新
- memories 数组更新：添加 6 个新模式文件
- rules 数组更新：移除不存在的配置文件引用
- variables 更新：React 19.1.1、Vite 7.1.2、Puppeteer 24.20.0 等
- excludes 新增：uploads 目录排除

## [1.0.0] - 2025-09-12

### 初始版本
- 初始化 Windsurf 配置目录结构
- 添加基础规则和工作流文件
