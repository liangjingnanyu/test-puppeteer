# Windsurf 配置说明

本目录包含 cerlo-admin-website 项目的 Windsurf 配置文件和规则定义。

## 目录结构

```
.windsurf/
├── CHANGELOG.md       # 配置变更历史
├── README.md          # 本文件
├── contexts/          # 上下文配置
│   └── default.json   # 默认上下文配置
├── memories/          # 记忆存储
│   ├── base.md        # 基础记忆
│   ├── 极速.md        # 极速交互风格
│   ├── 渐进.md        # 渐进交互风格
│   ├── project-structure.md # 项目结构记忆
│   └── tech-patterns.md     # 技术栈模式记忆
├── rules/             # 规则定义
│   ├── base.md        # 基础规则
│   ├── component.md   # 组件开发规范
│   ├── structure.md   # 项目结构规范
│   ├── tech-stack.md  # 技术栈版本锁定
│   └── typescript.md  # TypeScript 规范
└── workflows/         # 工作流定义
    ├── by-ap.md       # 自动提交工作流
    ├── by-das.md      # 智能切换工作流
    └── by-fe.md       # AI编程工作流
```

## 文件说明

### 规则文件 (rules/)

1. **base.md**
   - 基础交互规则和要求
   - 自动化、架构、质量等核心规范

2. **component.md**
   - React 组件开发规范
   - 包含 Props、State、性能优化等指南

3. **structure.md**
   - 项目目录结构说明
   - 各模块功能描述

4. **tech-stack.md**
   - 技术栈说明
   - 核心依赖和版本信息

5. **typescript.md**
   - TypeScript 编码规范
   - 类型定义和最佳实践

### 其他目录

- **contexts/**: 存储上下文配置
- **memories/**: 存储长期记忆
- **workflows/**: 定义自动化工作流

## 使用说明

1. 修改规则后请更新 CHANGELOG.md
2. 保持规则文件简洁，控制 token 使用量
3. 新增功能时，先在 rules/ 下创建对应的规则文件

## 维护

- 定期检查并更新依赖版本
- 保持文档与代码同步更新
- 重大变更需更新版本号
