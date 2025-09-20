# 前端逻辑转AI理解MCP开发框架

基于Model Context Protocol (MCP)的前端代码分析工具开发框架，用于将前端项目的代码逻辑转换为AI易于理解的流程图和对象结构。

## 🚀 特性

- **完整的MCP协议实现** - 支持工具调用和资源访问
- **强大的代码分析能力** - 支持React、Vue、Angular等主流框架
- **类型安全** - 完整的TypeScript类型定义
- **模块化设计** - 清晰的架构和可扩展的模块
- **完善的测试框架** - 单元测试和集成测试支持
- **开发工具集成** - ESLint、Prettier、Jest等工具配置

## 📁 项目结构

```
frontend-analysis-mcp/
├── src/                          # 源代码目录
│   ├── analyzer/                 # 代码分析器
│   │   ├── FrontendCodeAnalyzer.ts
│   │   ├── VariableTracker.ts
│   │   ├── FunctionAnalyzer.ts
│   │   └── ComponentAnalyzer.ts
│   ├── server/                   # MCP服务器
│   │   ├── FrontendAnalysisMCPServer.ts
│   │   ├── ToolHandler.ts
│   │   └── ResourceHandler.ts
│   ├── types/                    # 类型定义
│   │   ├── ProjectInfo.ts
│   │   ├── VariableInfo.ts
│   │   ├── FunctionInfo.ts
│   │   ├── ComponentInfo.ts
│   │   └── errors.ts
│   ├── utils/                    # 工具函数
│   │   ├── fileUtils.ts
│   │   ├── astUtils.ts
│   │   ├── typeUtils.ts
│   │   ├── logger.ts
│   │   └── errorHandler.ts
│   └── index.ts                  # 入口文件
├── tests/                        # 测试目录
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── fixtures/                 # 测试数据
├── examples/                     # 示例目录
├── docs/                         # 文档目录
├── .vscode/                      # VS Code配置
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## 🛠️ 安装和设置

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- TypeScript >= 5.2.0

### 安装依赖

```bash
npm install
```

### 开发脚本

```bash
# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 代码检查
npm run lint

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

## 🚀 快速开始

### 基本使用

```typescript
import { FrontendAnalysisMCPServer } from './src/server/index.js';
import { FrontendCodeAnalyzer } from './src/analyzer/index.js';

// 创建MCP服务器
const server = new FrontendAnalysisMCPServer();

// 创建代码分析器
const analyzer = new FrontendCodeAnalyzer('/path/to/your/project');

// 设置分析器
server.setAnalyzer(analyzer);

// 启动服务器
await server.run();
```

### 分析项目

```typescript
import { FrontendCodeAnalyzer } from './src/analyzer/index.js';

const analyzer = new FrontendCodeAnalyzer('/path/to/your/project');
const projectInfo = await analyzer.analyzeProject();

console.log('项目信息:', projectInfo);
console.log('框架类型:', projectInfo.framework);
console.log('文件数量:', projectInfo.files.length);
console.log('变量数量:', projectInfo.stats.totalVariables);
```

## 🔧 MCP工具

### 可用工具

1. **analyze_project** - 分析整个项目
2. **get_variable_info** - 获取特定变量信息
3. **get_function_info** - 获取特定函数信息
4. **get_component_info** - 获取特定组件信息
5. **generate_flow_diagram** - 生成流程图
6. **search_code** - 搜索代码

### 工具使用示例

```typescript
// 分析项目
const result = await toolHandler.handleToolCall('analyze_project', {
  projectPath: '/path/to/project',
  framework: 'react'
});

// 获取变量信息
const variableInfo = await toolHandler.handleToolCall('get_variable_info', {
  variableName: 'count',
  filePath: '/path/to/file.jsx'
});
```

## 📊 MCP资源

### 可用资源

1. **project://structure** - 项目结构信息
2. **project://variables** - 变量信息
3. **project://functions** - 函数信息
4. **project://components** - 组件信息
5. **project://dependencies** - 依赖信息
6. **project://statistics** - 统计信息

### 资源访问示例

```typescript
// 获取项目结构
const structure = await resourceHandler.handleResourceRead('project://structure');

// 获取所有变量
const variables = await resourceHandler.handleResourceRead('project://variables');
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 测试结构

- `tests/unit/` - 单元测试
- `tests/integration/` - 集成测试
- `tests/fixtures/` - 测试数据

## 📝 开发指南

### 代码规范

- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 编写完整的JSDoc注释
- 保持函数和类的单一职责

### 添加新功能

1. 在相应的模块中添加新功能
2. 更新类型定义
3. 添加单元测试
4. 更新文档

### 调试

使用VS Code调试配置：

1. 打开VS Code
2. 按F5启动调试
3. 选择"Debug MCP Server"配置

## 📚 文档

详细的文档请参考 `docs/` 目录：

- [项目架构文档](docs/01-项目架构文档.md)
- [数据结构定义文档](docs/02-数据结构定义文档.md)
- [代码分析器实现文档](docs/03-代码分析器实现文档.md)
- [MCP服务器实现文档](docs/04-MCP服务器实现文档.md)
- [API接口参考文档](docs/05-API接口参考文档.md)
- [使用示例文档](docs/06-使用示例文档.md)
- [开发指南文档](docs/07-开发指南文档.md)

## 🤝 贡献

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP协议规范
- [Babel](https://babeljs.io/) - JavaScript解析和转换
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的JavaScript
- [Jest](https://jestjs.io/) - JavaScript测试框架