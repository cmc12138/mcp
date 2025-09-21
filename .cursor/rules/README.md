# Cursor规则总览

本目录包含了为MCP项目定制的Cursor规则文件，这些规则将帮助AI助手更好地理解和协助开发工作。

## 规则文件列表

### 1. 项目结构规则 (`project-structure.mdc`)

- **适用范围**: 始终应用
- **描述**: 定义MCP项目的整体架构和模块组织
- **主要内容**:
  - 核心模块结构说明
  - 文件命名约定
  - 导入导出规范
  - 项目目录组织

### 2. TypeScript编码标准 (`typescript-standards.mdc`)

- **适用范围**: `*.ts`, `*.tsx` 文件
- **描述**: TypeScript编码标准和最佳实践
- **主要内容**:
  - 严格类型检查规范
  - 接口和类型定义标准
  - 错误处理模式
  - 性能优化规范

### 3. 分析器模式规则 (`analyzer-patterns.mdc`)

- **适用范围**: `src/analyzer/*.ts` 文件
- **描述**: AST分析和组件检测的最佳实践模式
- **主要内容**:
  - Babel AST遍历模式
  - 组件检测规则
  - 分析器架构模式
  - 性能优化策略

### 4. 测试标准规则 (`testing-standards.mdc`)

- **适用范围**: `tests/**/*.ts`, `**/*.test.ts`, `**/*.spec.ts` 文件
- **描述**: 单元测试和集成测试的编写规范
- **主要内容**:
  - 测试文件组织
  - 测试用例编写规范
  - Mock和Stub使用
  - 覆盖率要求

### 5. MCP服务器模式规则 (`mcp-server-patterns.mdc`)

- **适用范围**: `src/server/*.ts` 文件
- **描述**: MCP服务器实现模式和最佳实践
- **主要内容**:
  - MCP协议实现规范
  - 工具和资源处理器模式
  - 错误处理和安全模式
  - 性能监控和日志记录

### 6. 中文文档规范 (`chinese-documentation.mdc`)

- **适用范围**: 始终应用
- **描述**: 中文注释和文档编写规范
- **主要内容**:
  - JSDoc注释标准
  - 代码可读性规范
  - 测试文档规范
  - 版本更新文档

## 规则使用说明

### 自动应用规则

- `project-structure.mdc` 和 `chinese-documentation.mdc` 会自动应用到所有请求
- 这些规则提供项目背景和通用编码标准

### 文件类型特定规则

- TypeScript文件会自动应用 `typescript-standards.mdc`
- 分析器文件会自动应用 `analyzer-patterns.mdc`
- 测试文件会自动应用 `testing-standards.mdc`
- 服务器文件会自动应用 `mcp-server-patterns.mdc`

### 手动应用规则

- 所有规则都可以通过描述手动触发
- 在需要特定指导时，AI助手会主动获取相关规则

## 规则维护

### 更新规则

- 当项目架构发生变化时，更新相应的规则文件
- 保持规则内容与项目实际情况同步
- 定期审查规则的有效性和准确性

### 添加新规则

- 新规则应遵循 `.mdc` 文件格式
- 包含适当的元数据（alwaysApply、globs、description）
- 提供清晰的规则描述和示例

### 规则测试

- 定期验证规则是否按预期工作
- 确保规则不会产生冲突或重复指导
- 收集开发团队反馈并持续改进

## 技术细节

### 文件格式

- 使用Markdown格式编写规则内容
- 支持Cursor特定的扩展语法
- 文件引用使用 `[filename.ext](mdc:filename.ext)` 格式

### 元数据配置

```yaml
---
alwaysApply: true/false # 是否始终应用
description: string # 规则描述
globs: string # 文件匹配模式
---
```

### 最佳实践

- 规则内容应具体、可操作
- 提供代码示例和反例
- 保持规则简洁明了
- 定期更新和维护
