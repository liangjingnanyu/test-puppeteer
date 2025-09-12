---
trigger: always_on
description: 组件开发规则
---

# React 组件开发规范

## 1. 组件定义

- 使用函数组件 + Hooks
- 使用严格的的类型定义组件
- 组件文件使用 `.tsx` 扩展名
- 组件命名使用 `PascalCase`
- 一个文件只导出一个组件

## 2. Props 和 State

- 使用 `interface` 定义 `Props` 类型
- 避免使用 `any` 类型
- 使用解构设置默认值
- 使用 `useState` 管理本地状态
- 复杂状态考虑使用 `useReducer`

## 3. 性能优化

- 使用 `React.memo` 优化组件
- 使用 `useCallback` 缓存回调函数
- 使用 `useMemo` 缓存计算结果
- 避免在渲染函数中创建对象/函数
- 使用 `React.lazy` 和 `Suspense` 实现代码分割

## 4. 样式管理

- 使用 `tailwindcss` 来管理书写样式


## 5. 组件设计

- 保持组件单一职责
- 合理拆分大型组件
- 使用组合而非继承
- 为组件添加 `displayName` 便于调试
- 使用 `PropTypes` 或 TypeScript 类型检查

## 6. Hooks 规范

- 自定义 Hook 以 `use` 开头
- 只在最顶层调用 Hook
- 只在 React 函数中调用 Hook
- 为自定义 Hook 添加 JSDoc 注释

## 7. 表单处理

- 使用 `antd Form` 或 `ProForm` 处理复杂表单
- 为表单字段添加清晰的错误提示
- 实现防抖/节流处理频繁的表单输入

## 8. 数据获取

- 使用 `ahooks` 获取数据，管理服务端状态
- 为 API 调用添加加载状态和错误处理
- 实现数据缓存和失效策略
- 使用 `AbortController` 取消未完成的请求

## 9. 可访问性

- 使用语义化 HTML 标签
- 为交互元素添加 `aria-*` 属性
- 确保键盘可访问性
- 提供适当的焦点管理