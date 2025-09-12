---
trigger: always_on
---

# TypeScript 规范

## 1. 类型定义

- 显式声明所有类型
- 避免使用 `any`，优先使用 `unknown`
- 使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型或工具类型
- 为复杂类型添加 JSDoc 注释

## 2. 最佳实践

- 使用严格模式 (`strict: true`)
- 启用严格空检查 (`strictNullChecks: true`)
- 使用可选链操作符 (`?.`)
- 使用空值合并操作符 (`??`)
- 使用 `const` 断言 (`as const`)

## 3. 模块导入

- 使用 ES6 模块语法
- 导入顺序：
  1. 第三方库
  2. 绝对路径导入 (`@/`)
  3. 相对路径导入 (`./` 或 `../`)
- 使用 `import type` 导入类型

## 4. 类型导出

- 优先使用 `interface` 而不是 `type`
- 导出类型时使用 `export type`
- 为公共 API 提供完整的类型定义
- 使用 `Omit`、`Pick`、`Partial` 等工具类型

## 5. 泛型

- 为泛型参数添加有意义的名称
- 为泛型添加约束条件
- 避免过度使用泛型

## 6. 类型守卫

- 使用 `typeof`、`instanceof` 进行类型收窄
- 使用自定义类型守卫函数
- 使用 `in` 操作符进行属性检查

## 7. 实用类型

- 使用 `Record` 定义键值对
- 使用 `Partial`、`Required`、`Readonly` 等工具类型
- 使用 `ReturnType` 获取函数返回类型
- 使用 `Parameters` 获取函数参数类型

## 8. 枚举和常量

- 使用 `const enum` 或 `as const` 定义常量
- 避免使用数字枚举
- 为枚举添加文档注释

## 9. 错误处理

- 使用 `never` 类型表示不应该到达的代码
- 使用自定义错误类
- 为可能抛出错误的函数添加 `@throws` 注释
