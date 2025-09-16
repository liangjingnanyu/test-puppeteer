# Windsurf 配置说明

本目录包含 test-puppeteer 项目的 Windsurf 配置文件和规则定义。

## 项目概述

**test-puppeteer** - Puppeteer 浏览器自动化测试项目
- 前端：React 19.1.1 + Vite 7.1.2 + TypeScript 5.8.3 + Antd 5.27.3 + TailwindCSS 4.1.13
- 后端：Express 4.18.2 + Puppeteer 24.20.0
- 功能：浏览器生命周期管理、页面操作、图片识图搜索

## 目录结构

```
.windsurf/
├── contexts/          # 上下文配置
│   └── default.json   # 项目配置和变量定义
├── memories/          # 代码模式记忆
│   ├── base.md        # 项目基础信息
│   ├── project-structure.md # 项目目录结构
│   ├── react-patterns.md    # React 19 + Hooks 模式
│   ├── antd-patterns.md     # Antd 5.x 组件模式
│   ├── api-patterns.md      # API 调用模式
│   ├── puppeteer-patterns.md # Puppeteer 控制模式
│   ├── tech-patterns.md     # 技术栈和常用模式
│   ├── 极速.md        # 极速交互风格
│   └── 渐进.md        # 渐进交互风格
├── rules/             # 开发规范
│   ├── base.md        # 基础交互规则
│   ├── component.md   # React 组件开发规范
│   └── typescript.md  # TypeScript 编码规范
└── workflows/         # 自动化工作流
    ├── by-ap.md       # 自动提交代码工作流
    ├── by-das.md      # 智能切换交互风格
    └── by-fe.md       # AI 编程工作流
```

## 核心功能

### 代码模式记忆
- **React 模式**：函数组件 + Hooks、状态管理、事件处理
- **Antd 模式**：ConfigProvider、组件使用、消息提示
- **API 模式**：请求封装、错误处理、类型定义
- **Puppeteer 模式**：浏览器控制、页面操作、状态管理

### 工作流支持
- `/by-fe [需求]` - AI 编程工作流（方案设计→任务执行→自检优化）
- `/by-das [风格]` - 智能切换交互风格（极速/渐进）
- `/by-ap` - 自动提交代码到当前分支

### 技术栈版本锁定
确保开发环境一致性，避免依赖冲突

## 使用指南

1. **开发模式切换**
   ```bash
   /by-das 极速    # 切换到极速模式
   /by-das 渐进    # 切换到渐进模式
   ```

2. **AI 编程工作流**
   ```bash
   /by-fe 实现登录页面
   /by-fe 添加图片上传功能
   ```

3. **自动提交代码**
   ```bash
   /by-ap
   ```

## 维护说明

- 配置文件基于实际项目代码生成，确保准确性
- 定期同步代码模式与项目实际实现
- 新增功能时及时更新相关 memories 文件
