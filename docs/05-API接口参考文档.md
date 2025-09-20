# API接口参考文档

## 1. 概述

本文档详细描述了前端逻辑转AI理解MCP项目的所有API接口，包括工具接口、资源接口、数据格式和错误处理。

### 1.1 当前实现状态

#### ✅ 已完全实现

- **analyze_project**: 项目分析工具 (100%)
- **get_variable_info**: 变量信息查询工具 (100%)
- **project://structure**: 项目结构资源 (100%)
- **project://variables**: 变量信息资源 (100%)
- **project://components**: 组件信息资源 (100%)

#### 🔄 部分实现

- **generate_flow_diagram**: 流程图生成工具 (70%)
  - 基础框架已实现
  - 支持Mermaid格式输出
  - 需要完善具体生成逻辑

#### ❌ 待实现

- 高级分析工具
- 性能监控工具
- 代码质量分析工具

## 2. MCP协议基础

### 2.1 协议版本

- MCP版本: 0.4.0
- 服务器名称: frontend-analysis-mcp
- 服务器版本: 1.0.0

### 2.2 传输方式

- 传输协议: stdio
- 数据格式: JSON
- 编码: UTF-8

## 3. 工具接口 (Tools)

### 3.1 analyze_project

**功能**: 分析前端项目的整体结构和逻辑

**请求格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "analyze_project",
    "arguments": {
      "projectPath": "/path/to/project",
      "framework": "react"
    }
  }
}
```

**参数说明**:

- `projectPath` (string, 必需): 前端项目的路径
- `framework` (string, 可选): 前端框架类型，可选值: `react`, `vue`, `angular`, `vanilla`

**响应格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"name\": \"my-project\",\n  \"framework\": \"react\",\n  \"files\": [...],\n  \"dependencies\": [...]\n}"
      }
    ]
  }
}
```

**响应数据结构**:

```typescript
interface ProjectInfo {
  name: string;
  framework: string;
  files: FileInfo[];
  dependencies: DependencyInfo[];
}
```

**使用示例**:

```bash
# 分析React项目
{
  "name": "analyze_project",
  "arguments": {
    "projectPath": "/Users/username/my-react-app",
    "framework": "react"
  }
}

# 分析Vue项目
{
  "name": "analyze_project",
  "arguments": {
    "projectPath": "/Users/username/my-vue-app",
    "framework": "vue"
  }
}
```

### 3.2 get_variable_info

**功能**: 获取特定变量的详细信息

**请求格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_variable_info",
    "arguments": {
      "variableName": "userName",
      "filePath": "/path/to/file.js"
    }
  }
}
```

**参数说明**:

- `variableName` (string, 必需): 变量名
- `filePath` (string, 必需): 文件路径

**响应格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"name\": \"userName\",\n  \"type\": \"string\",\n  \"scope\": \"module\",\n  \"declarationType\": \"const\",\n  \"usage\": [...],\n  \"dependencies\": [...],\n  \"isExported\": true,\n  \"isImported\": false,\n  \"line\": 10,\n  \"column\": 6\n}"
      }
    ]
  }
}
```

**响应数据结构**:

```typescript
interface VariableInfo {
  name: string;
  type: string;
  scope: 'global' | 'module' | 'function' | 'block';
  declarationType: 'var' | 'let' | 'const' | 'function' | 'class';
  usage: VariableUsage[];
  dependencies: string[];
  description?: string;
  isExported: boolean;
  isImported: boolean;
  line: number;
  column: number;
}
```

**前置条件**: 必须先调用 `analyze_project` 工具

**使用示例**:

```bash
# 获取变量信息
{
  "name": "get_variable_info",
  "arguments": {
    "variableName": "useState",
    "filePath": "/src/components/App.jsx"
  }
}
```

### 3.3 generate_flow_diagram

**功能**: 生成代码逻辑流程图

**请求格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "generate_flow_diagram",
    "arguments": {
      "filePath": "/path/to/file.js",
      "diagramType": "control_flow"
    }
  }
}
```

**参数说明**:

- `filePath` (string, 必需): 文件路径
- `diagramType` (string, 可选): 图表类型，可选值: `control_flow`, `data_flow`, `component_tree`，默认为 `control_flow`

**响应格式**:

````json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# control_flow 图表\n\n文件: /path/to/file.js\n\n```mermaid\ngraph TD\n    A[开始] --> B[处理逻辑]\n    B --> C[结束]\n```"
      }
    ]
  }
}
````

**响应格式**: Mermaid格式的流程图代码

**使用示例**:

```bash
# 生成控制流图
{
  "name": "generate_flow_diagram",
  "arguments": {
    "filePath": "/src/components/App.jsx",
    "diagramType": "control_flow"
  }
}

# 生成数据流图
{
  "name": "generate_flow_diagram",
  "arguments": {
    "filePath": "/src/utils/dataProcessor.js",
    "diagramType": "data_flow"
  }
}
```

## 4. 资源接口 (Resources)

### 4.1 资源列表

**功能**: 获取可用的资源列表

**请求格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/list",
  "params": {}
}
```

**响应格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "resources": [
      {
        "uri": "project://structure",
        "name": "项目结构",
        "description": "前端项目的整体结构信息",
        "mimeType": "application/json"
      },
      {
        "uri": "project://variables",
        "name": "变量信息",
        "description": "项目中所有变量的详细信息",
        "mimeType": "application/json"
      },
      {
        "uri": "project://components",
        "name": "组件信息",
        "description": "React/Vue组件的详细信息",
        "mimeType": "application/json"
      }
    ]
  }
}
```

### 4.2 项目结构资源

**功能**: 获取项目结构信息

**请求格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "resources/read",
  "params": {
    "uri": "project://structure"
  }
}
```

**响应格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "contents": [
      {
        "uri": "project://structure",
        "mimeType": "application/json",
        "text": "{\n  \"name\": \"my-project\",\n  \"framework\": \"react\",\n  \"files\": [...],\n  \"dependencies\": [...]\n}"
      }
    ]
  }
}
```

**前置条件**: 必须先调用 `analyze_project` 工具

### 4.3 变量信息资源

**功能**: 获取所有变量信息

**请求格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "resources/read",
  "params": {
    "uri": "project://variables"
  }
}
```

**响应格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "result": {
    "contents": [
      {
        "uri": "project://variables",
        "mimeType": "application/json",
        "text": "[\n  {\n    \"name\": \"userName\",\n    \"type\": \"string\",\n    \"file\": \"/src/App.jsx\",\n    ...\n  },\n  ...\n]"
      }
    ]
  }
}
```

**前置条件**: 必须先调用 `analyze_project` 工具

### 4.4 组件信息资源

**功能**: 获取所有组件信息

**请求格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "resources/read",
  "params": {
    "uri": "project://components"
  }
}
```

**响应格式**:

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "result": {
    "contents": [
      {
        "uri": "project://components",
        "mimeType": "application/json",
        "text": "[\n  {\n    \"name\": \"App\",\n    \"type\": \"functional\",\n    \"file\": \"/src/App.jsx\",\n    ...\n  },\n  ...\n]"
      }
    ]
  }
}
```

**前置条件**: 必须先调用 `analyze_project` 工具

## 5. 数据结构详细说明

### 5.1 ProjectInfo 结构

```typescript
interface ProjectInfo {
  name: string; // 项目名称
  framework: string; // 框架类型
  files: FileInfo[]; // 文件列表
  dependencies: DependencyInfo[]; // 依赖列表
}

interface FileInfo {
  path: string; // 文件路径
  type: 'component' | 'page' | 'util' | 'service' | 'store'; // 文件类型
  variables: VariableInfo[]; // 变量列表
  functions: FunctionInfo[]; // 函数列表
  components: ComponentInfo[]; // 组件列表
}

interface DependencyInfo {
  name: string; // 依赖名
  version: string; // 版本号
  type: 'dependency' | 'devDependency' | 'peerDependency'; // 依赖类型
  usedIn: string[]; // 使用位置
}
```

### 5.2 VariableInfo 结构

```typescript
interface VariableInfo {
  name: string; // 变量名
  type: string; // 变量类型
  scope: 'global' | 'module' | 'function' | 'block'; // 作用域
  declarationType: 'var' | 'let' | 'const' | 'function' | 'class'; // 声明类型
  usage: VariableUsage[]; // 使用情况
  dependencies: string[]; // 依赖列表
  description?: string; // 描述
  isExported: boolean; // 是否导出
  isImported: boolean; // 是否导入
  line: number; // 行号
  column: number; // 列号
}

interface VariableUsage {
  type: 'assignment' | 'reference' | 'parameter' | 'return'; // 使用类型
  location: SourceLocation; // 位置信息
  context: string; // 上下文
}

interface SourceLocation {
  line: number; // 行号
  column: number; // 列号
  file: string; // 文件路径
}
```

### 5.3 FunctionInfo 结构

```typescript
interface FunctionInfo {
  name: string; // 函数名
  type: 'function' | 'arrow' | 'method' | 'constructor'; // 函数类型
  parameters: ParameterInfo[]; // 参数列表
  returnType: string; // 返回类型
  calls: FunctionCall[]; // 调用列表
  calledBy: string[]; // 被调用列表
  complexity: number; // 复杂度
  line: number; // 行号
  column: number; // 列号
}

interface ParameterInfo {
  name: string; // 参数名
  type: string; // 参数类型
  defaultValue?: any; // 默认值
  isOptional: boolean; // 是否可选
  description?: string; // 描述
}

interface FunctionCall {
  name: string; // 被调用函数名
  location: SourceLocation; // 调用位置
  arguments: any[]; // 调用参数
}
```

### 5.4 ComponentInfo 结构

```typescript
interface ComponentInfo {
  name: string; // 组件名
  type: 'functional' | 'class' | 'sfc'; // 组件类型
  props: PropInfo[]; // 属性列表
  state: StateInfo[]; // 状态列表
  hooks: HookInfo[]; // Hook列表
  line: number; // 行号
  column: number; // 列号
}

interface PropInfo {
  name: string; // 属性名
  type: string; // 属性类型
  required: boolean; // 是否必需
  defaultValue?: any; // 默认值
  description?: string; // 描述
}

interface StateInfo {
  name: string; // 状态名
  type: string; // 状态类型
  initialValue?: any; // 初始值
  setter?: string; // 设置函数
}

interface HookInfo {
  name: string; // Hook名
  type: string; // Hook类型
  dependencies: string[]; // 依赖列表
  line: number; // 行号
  column: number; // 列号
}
```

## 6. 错误处理

### 6.1 错误响应格式

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": "Error: 请先分析项目"
  }
}
```

### 6.2 常见错误码

| 错误码 | 错误类型         | 描述         |
| ------ | ---------------- | ------------ |
| -32600 | Invalid Request  | 请求格式错误 |
| -32601 | Method Not Found | 方法不存在   |
| -32602 | Invalid Params   | 参数错误     |
| -32603 | Internal Error   | 内部错误     |
| -32000 | Server Error     | 服务器错误   |

### 6.3 业务错误

| 错误信息               | 原因                  | 解决方案                  |
| ---------------------- | --------------------- | ------------------------- |
| "请先分析项目"         | 未调用analyze_project | 先调用analyze_project工具 |
| "文件未找到"           | 文件路径错误          | 检查文件路径是否正确      |
| "变量未找到"           | 变量名错误            | 检查变量名是否正确        |
| "Failed to parse file" | 文件解析失败          | 检查文件语法是否正确      |

## 7. 使用流程

### 7.1 基本使用流程

1. **启动服务器**: 启动MCP服务器
2. **分析项目**: 调用 `analyze_project` 工具
3. **查询信息**: 调用其他工具或访问资源
4. **生成图表**: 调用 `generate_flow_diagram` 工具

### 7.2 完整示例

```bash
# 1. 分析项目
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "analyze_project",
    "arguments": {
      "projectPath": "/path/to/project",
      "framework": "react"
    }
  }
}

# 2. 获取项目结构
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "project://structure"
  }
}

# 3. 获取变量信息
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_variable_info",
    "arguments": {
      "variableName": "useState",
      "filePath": "/src/App.jsx"
    }
  }
}

# 4. 生成流程图
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "generate_flow_diagram",
    "arguments": {
      "filePath": "/src/App.jsx",
      "diagramType": "control_flow"
    }
  }
}
```

## 8. 性能考虑

### 8.1 响应时间

- 小型项目 (< 100文件): < 5秒
- 中型项目 (100-500文件): < 30秒
- 大型项目 (> 500文件): < 2分钟

### 8.2 内存使用

- 基础内存: ~50MB
- 每100个文件: +10MB
- 最大内存: ~500MB

### 8.3 并发限制

- 最大并发请求: 10
- 请求超时: 30秒
- 连接超时: 60秒

## 9. 安全考虑

### 9.1 路径安全

- 只允许访问指定目录下的文件
- 禁止访问系统敏感文件
- 路径遍历攻击防护

### 9.2 内容安全

- 文件大小限制: 10MB
- 文件类型限制: 仅支持源代码文件
- 恶意代码检测

### 9.3 访问控制

- 基于路径的访问控制
- 请求频率限制
- 日志记录和审计

---

**文档版本**: v1.0  
**创建日期**: 2024年12月  
**最后更新**: 2024年12月  
**维护者**: AI助手
