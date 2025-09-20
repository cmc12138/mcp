# MCP服务器实现文档

## 1. 概述

本文档详细描述了`FrontendAnalysisMCPServer`类的实现细节，包括MCP协议实现、工具定义、资源管理和请求处理机制。

## 2. 类结构

### 2.1 类定义

```typescript
class FrontendAnalysisMCPServer {
  private server: Server;                    // MCP服务器实例
  private analyzer: FrontendCodeAnalyzer | null = null; // 代码分析器

  constructor();
  private setupHandlers(): void;
  async run(): Promise<void>;
}
```

### 2.2 核心属性

- `server`: MCP协议服务器实例
- `analyzer`: 前端代码分析器实例

## 3. 构造函数实现

### 3.1 初始化服务器

```typescript
constructor() {
  this.server = new Server(
    {
      name: 'frontend-analysis-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  this.setupHandlers();
}
```

**功能**: 初始化MCP服务器，设置服务器信息和能力。

**服务器信息**:
- `name`: 服务器名称
- `version`: 服务器版本
- `capabilities`: 服务器能力声明

## 4. 处理器设置

### 4.1 setupHandlers 方法

```typescript
private setupHandlers(): void {
  // 工具列表处理器
  this.server.setRequestHandler(ListToolsRequestSchema, async () => { ... });
  
  // 资源列表处理器
  this.server.setRequestHandler(ListResourcesRequestSchema, async () => { ... });
  
  // 工具调用处理器
  this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => { ... });
  
  // 资源读取处理器
  this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => { ... });
}
```

**功能**: 设置所有MCP请求处理器。

**处理器类型**:
- 工具列表处理器
- 资源列表处理器
- 工具调用处理器
- 资源读取处理器

## 5. 工具定义

### 5.1 工具列表处理器

```typescript
this.server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_project',
        description: '分析前端项目的整体结构和逻辑',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: '前端项目的路径'
            },
            framework: {
              type: 'string',
              description: '前端框架类型 (react, vue, angular, vanilla)',
              enum: ['react', 'vue', 'angular', 'vanilla']
            }
          },
          required: ['projectPath']
        }
      },
      {
        name: 'get_variable_info',
        description: '获取特定变量的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            variableName: {
              type: 'string',
              description: '变量名'
            },
            filePath: {
              type: 'string',
              description: '文件路径'
            }
          },
          required: ['variableName', 'filePath']
        }
      },
      {
        name: 'generate_flow_diagram',
        description: '生成代码逻辑流程图',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: '文件路径'
            },
            diagramType: {
              type: 'string',
              description: '图表类型',
              enum: ['control_flow', 'data_flow', 'component_tree']
            }
          },
          required: ['filePath']
        }
      }
    ]
  };
});
```

**功能**: 定义MCP服务器提供的工具列表。

**工具列表**:
1. `analyze_project`: 分析整个项目
2. `get_variable_info`: 获取变量信息
3. `generate_flow_diagram`: 生成流程图

### 5.2 工具调用处理器

```typescript
this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'analyze_project':
        return await this.handleAnalyzeProject(args as any);
      
      case 'get_variable_info':
        return await this.handleGetVariableInfo(args as any);
      
      case 'generate_flow_diagram':
        return await this.handleGenerateFlowDiagram(args as any);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
});
```

**功能**: 处理工具调用请求，路由到相应的处理方法。

**错误处理**: 统一的错误处理机制，返回标准化的错误响应。

## 6. 资源定义

### 6.1 资源列表处理器

```typescript
this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'project://structure',
        name: '项目结构',
        description: '前端项目的整体结构信息',
        mimeType: 'application/json'
      },
      {
        uri: 'project://variables',
        name: '变量信息',
        description: '项目中所有变量的详细信息',
        mimeType: 'application/json'
      },
      {
        uri: 'project://components',
        name: '组件信息',
        description: 'React/Vue组件的详细信息',
        mimeType: 'application/json'
      }
    ]
  };
});
```

**功能**: 定义MCP服务器提供的资源列表。

**资源列表**:
1. `project://structure`: 项目结构信息
2. `project://variables`: 变量信息
3. `project://components`: 组件信息

### 6.2 资源读取处理器

```typescript
this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'project://structure':
        return await this.handleGetProjectStructure();
      
      case 'project://variables':
        return await this.handleGetVariables();
      
      case 'project://components':
        return await this.handleGetComponents();
      
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
});
```

**功能**: 处理资源读取请求，返回相应的资源内容。

## 7. 工具处理方法

### 7.1 handleAnalyzeProject 方法

```typescript
private async handleAnalyzeProject(args: { projectPath: string; framework?: string }) {
  const { projectPath, framework } = args;
  
  this.analyzer = new FrontendCodeAnalyzer(projectPath);
  const projectInfo = await this.analyzer.analyzeProject();
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(projectInfo, null, 2)
      }
    ]
  };
}
```

**功能**: 处理项目分析请求。

**参数**:
- `projectPath`: 项目路径（必需）
- `framework`: 框架类型（可选）

**返回**: 项目分析结果的JSON字符串。

### 7.2 handleGetVariableInfo 方法

```typescript
private async handleGetVariableInfo(args: { variableName: string; filePath: string }) {
  if (!this.analyzer) {
    throw new Error('请先分析项目');
  }

  const { variableName, filePath } = args;
  const projectInfo = this.analyzer['projectInfo'];
  
  const file = projectInfo.files.find(f => f.path === filePath);
  if (!file) {
    throw new Error(`文件未找到: ${filePath}`);
  }

  const variable = file.variables.find(v => v.name === variableName);
  if (!variable) {
    throw new Error(`变量未找到: ${variableName}`);
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(variable, null, 2)
      }
    ]
  };
}
```

**功能**: 处理变量信息查询请求。

**参数**:
- `variableName`: 变量名（必需）
- `filePath`: 文件路径（必需）

**前置条件**: 必须先调用`analyze_project`工具。

**返回**: 变量详细信息的JSON字符串。

### 7.3 handleGenerateFlowDiagram 方法

```typescript
private async handleGenerateFlowDiagram(args: { filePath: string; diagramType?: string }) {
  const { filePath, diagramType = 'control_flow' } = args;
  
  // 简化的流程图生成
  const diagram = this.generateSimpleDiagram(filePath, diagramType);
  
  return {
    content: [
      {
        type: 'text',
        text: diagram
      }
    ]
  };
}
```

**功能**: 处理流程图生成请求。

**参数**:
- `filePath`: 文件路径（必需）
- `diagramType`: 图表类型（可选，默认为'control_flow'）

**返回**: 流程图的Mermaid格式字符串。

### 7.4 generateSimpleDiagram 方法

```typescript
private generateSimpleDiagram(filePath: string, diagramType: string): string {
  // 这里应该实现真正的流程图生成逻辑
  // 可以使用Mermaid、PlantUML等工具
  return `# ${diagramType} 图表\n\n文件: ${filePath}\n\n\`\`\`mermaid\ngraph TD\n    A[开始] --> B[处理逻辑]\n    B --> C[结束]\n\`\`\``;
}
```

**功能**: 生成简化的流程图。

**支持的类型**:
- `control_flow`: 控制流图
- `data_flow`: 数据流图
- `component_tree`: 组件树图

## 8. 资源处理方法

### 8.1 handleGetProjectStructure 方法

```typescript
private async handleGetProjectStructure() {
  if (!this.analyzer) {
    throw new Error('请先分析项目');
  }

  const projectInfo = this.analyzer['projectInfo'];
  
  return {
    contents: [
      {
        uri: 'project://structure',
        mimeType: 'application/json',
        text: JSON.stringify(projectInfo, null, 2)
      }
    ]
  };
}
```

**功能**: 返回项目结构信息。

**前置条件**: 必须先调用`analyze_project`工具。

### 8.2 handleGetVariables 方法

```typescript
private async handleGetVariables() {
  if (!this.analyzer) {
    throw new Error('请先分析项目');
  }

  const projectInfo = this.analyzer['projectInfo'];
  const allVariables = projectInfo.files.flatMap(file => 
    file.variables.map(variable => ({
      ...variable,
      file: file.path
    }))
  );

  return {
    contents: [
      {
        uri: 'project://variables',
        mimeType: 'application/json',
        text: JSON.stringify(allVariables, null, 2)
      }
    ]
  };
}
```

**功能**: 返回所有变量的信息。

**数据转换**: 将文件级别的变量信息转换为全局变量列表。

### 8.3 handleGetComponents 方法

```typescript
private async handleGetComponents() {
  if (!this.analyzer) {
    throw new Error('请先分析项目');
  }

  const projectInfo = this.analyzer['projectInfo'];
  const allComponents = projectInfo.files.flatMap(file => 
    file.components.map(component => ({
      ...component,
      file: file.path
    }))
  );

  return {
    contents: [
      {
        uri: 'project://components',
        mimeType: 'application/json',
        text: JSON.stringify(allComponents, null, 2)
      }
    ]
  };
}
```

**功能**: 返回所有组件的信息。

**数据转换**: 将文件级别的组件信息转换为全局组件列表。

## 9. 服务器运行

### 9.1 run 方法

```typescript
async run(): Promise<void> {
  const transport = new StdioServerTransport();
  await this.server.connect(transport);
  console.error('前端分析MCP服务器已启动');
}
```

**功能**: 启动MCP服务器。

**传输方式**: 使用标准输入输出传输。

**日志输出**: 使用`console.error`输出日志信息。

## 10. 错误处理机制

### 10.1 工具调用错误处理

```typescript
try {
  switch (name) {
    case 'analyze_project':
      return await this.handleAnalyzeProject(args as any);
    // ... 其他工具
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
} catch (error) {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }
    ]
  };
}
```

**错误处理策略**:
- 捕获所有异常
- 返回标准化的错误响应
- 保持错误信息的可读性

### 10.2 资源访问错误处理

```typescript
try {
  switch (uri) {
    case 'project://structure':
      return await this.handleGetProjectStructure();
    // ... 其他资源
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
} catch (error) {
  return {
    contents: [
      {
        uri,
        mimeType: 'text/plain',
        text: `Error: ${error instanceof Error ? error.message : String(error)}`
      }
    ]
  };
}
```

**错误处理策略**:
- 捕获所有异常
- 返回包含URI的错误响应
- 使用text/plain格式返回错误信息

## 11. 状态管理

### 11.1 分析器状态

```typescript
private analyzer: FrontendCodeAnalyzer | null = null;
```

**状态说明**:
- `null`: 未初始化状态
- `FrontendCodeAnalyzer`: 已初始化状态

**状态检查**: 在需要分析器的方法中检查状态。

### 11.2 状态检查示例

```typescript
if (!this.analyzer) {
  throw new Error('请先分析项目');
}
```

**检查时机**: 在访问分析器数据之前进行检查。

## 12. 响应格式

### 12.1 工具调用响应格式

```typescript
{
  content: [
    {
      type: 'text',
      text: string
    }
  ]
}
```

**字段说明**:
- `content`: 响应内容数组
- `type`: 内容类型（固定为'text'）
- `text`: 文本内容

### 12.2 资源访问响应格式

```typescript
{
  contents: [
    {
      uri: string,
      mimeType: string,
      text: string
    }
  ]
}
```

**字段说明**:
- `contents`: 资源内容数组
- `uri`: 资源URI
- `mimeType`: 内容类型
- `text`: 文本内容

## 13. 启动脚本

### 13.1 主启动脚本

```typescript
// 启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new FrontendAnalysisMCPServer();
  server.run().catch(console.error);
}
```

**功能**: 当文件作为主模块运行时启动服务器。

**错误处理**: 使用`catch`捕获启动错误。

### 13.2 导出声明

```typescript
export { FrontendAnalysisMCPServer, FrontendCodeAnalyzer };
```

**功能**: 导出主要类供其他模块使用。

## 14. 使用示例

### 14.1 基本使用

```typescript
import { FrontendAnalysisMCPServer } from './mcp-server-example.js';

const server = new FrontendAnalysisMCPServer();
await server.run();
```

### 14.2 错误处理

```typescript
try {
  const server = new FrontendAnalysisMCPServer();
  await server.run();
} catch (error) {
  console.error('服务器启动失败:', error);
}
```

## 15. 扩展性设计

### 15.1 添加新工具

```typescript
// 在setupHandlers中添加新工具
{
  name: 'new_tool',
  description: '新工具描述',
  inputSchema: {
    type: 'object',
    properties: {
      // 参数定义
    },
    required: ['param1']
  }
}

// 在工具调用处理器中添加处理逻辑
case 'new_tool':
  return await this.handleNewTool(args as any);
```

### 15.2 添加新资源

```typescript
// 在资源列表中添加新资源
{
  uri: 'project://new_resource',
  name: '新资源',
  description: '新资源描述',
  mimeType: 'application/json'
}

// 在资源读取处理器中添加处理逻辑
case 'project://new_resource':
  return await this.handleGetNewResource();
```

---

**文档版本**: v1.0  
**创建日期**: 2024年12月  
**最后更新**: 2024年12月  
**维护者**: AI助手
