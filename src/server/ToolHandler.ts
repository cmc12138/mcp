/**
 * 工具处理器
 * 处理MCP工具调用请求
 */

import { FrontendCodeAnalyzer } from '../analyzer/index';
import type { ProjectInfo } from '../types/index';

/**
 * 工具处理器类
 */
export class ToolHandler {
  /**
   * 获取可用工具列表
   */
  getTools() {
    return [
      {
        name: 'analyze_project',
        description: '分析前端项目的整体结构和逻辑',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: '前端项目的路径',
            },
            framework: {
              type: 'string',
              description: '前端框架类型 (react, vue, angular, vanilla)',
              enum: ['react', 'vue', 'angular', 'vanilla'],
            },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'get_variable_info',
        description: '获取特定变量的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            variableName: {
              type: 'string',
              description: '变量名',
            },
            filePath: {
              type: 'string',
              description: '文件路径',
            },
          },
          required: ['variableName', 'filePath'],
        },
      },
      {
        name: 'get_function_info',
        description: '获取特定函数的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            functionName: {
              type: 'string',
              description: '函数名',
            },
            filePath: {
              type: 'string',
              description: '文件路径',
            },
          },
          required: ['functionName', 'filePath'],
        },
      },
      {
        name: 'get_component_info',
        description: '获取特定组件的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            componentName: {
              type: 'string',
              description: '组件名',
            },
            filePath: {
              type: 'string',
              description: '文件路径',
            },
          },
          required: ['componentName', 'filePath'],
        },
      },
      {
        name: 'generate_flow_diagram',
        description: '生成代码逻辑流程图',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: '文件路径',
            },
            diagramType: {
              type: 'string',
              description: '图表类型',
              enum: ['control_flow', 'data_flow', 'component_tree'],
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'search_code',
        description: '在项目中搜索代码',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索查询',
            },
            filePattern: {
              type: 'string',
              description: '文件模式过滤',
            },
            searchType: {
              type: 'string',
              description: '搜索类型',
              enum: ['text', 'regex', 'ast'],
            },
          },
          required: ['query'],
        },
      },
    ];
  }

  /**
   * 处理工具调用
   */
  async handleToolCall(name: string, args: any, analyzer: FrontendCodeAnalyzer | null) {
    switch (name) {
      case 'analyze_project':
        return await this.handleAnalyzeProject(args, analyzer);

      case 'get_variable_info':
        return await this.handleGetVariableInfo(args, analyzer);

      case 'get_function_info':
        return await this.handleGetFunctionInfo(args, analyzer);

      case 'get_component_info':
        return await this.handleGetComponentInfo(args, analyzer);

      case 'generate_flow_diagram':
        return await this.handleGenerateFlowDiagram(args, analyzer);

      case 'search_code':
        return await this.handleSearchCode(args, analyzer);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * 处理项目分析请求
   */
  private async handleAnalyzeProject(
    args: { projectPath: string; framework?: string },
    analyzer: FrontendCodeAnalyzer | null
  ) {
    const { projectPath, framework } = args;

    if (!analyzer) {
      analyzer = new FrontendCodeAnalyzer(projectPath);
    }

    const projectInfo = await analyzer.analyzeProject();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projectInfo, null, 2),
        },
      ],
    };
  }

  /**
   * 处理变量信息查询请求
   */
  private async handleGetVariableInfo(
    args: { variableName: string; filePath: string },
    analyzer: FrontendCodeAnalyzer | null
  ) {
    if (!analyzer) {
      throw new Error('请先分析项目');
    }

    const { variableName, filePath } = args;
    const projectInfo = (analyzer as any).projectInfo as ProjectInfo;

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
          text: JSON.stringify(variable, null, 2),
        },
      ],
    };
  }

  /**
   * 处理函数信息查询请求
   */
  private async handleGetFunctionInfo(
    args: { functionName: string; filePath: string },
    analyzer: FrontendCodeAnalyzer | null
  ) {
    if (!analyzer) {
      throw new Error('请先分析项目');
    }

    const { functionName, filePath } = args;
    const projectInfo = (analyzer as any).projectInfo as ProjectInfo;

    const file = projectInfo.files.find(f => f.path === filePath);
    if (!file) {
      throw new Error(`文件未找到: ${filePath}`);
    }

    const func = file.functions.find(f => f.name === functionName);
    if (!func) {
      throw new Error(`函数未找到: ${functionName}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(func, null, 2),
        },
      ],
    };
  }

  /**
   * 处理组件信息查询请求
   */
  private async handleGetComponentInfo(
    args: { componentName: string; filePath: string },
    analyzer: FrontendCodeAnalyzer | null
  ) {
    if (!analyzer) {
      throw new Error('请先分析项目');
    }

    const { componentName, filePath } = args;
    const projectInfo = (analyzer as any).projectInfo as ProjectInfo;

    const file = projectInfo.files.find(f => f.path === filePath);
    if (!file) {
      throw new Error(`文件未找到: ${filePath}`);
    }

    const component = file.components.find(c => c.name === componentName);
    if (!component) {
      throw new Error(`组件未找到: ${componentName}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(component, null, 2),
        },
      ],
    };
  }

  /**
   * 处理流程图生成请求
   */
  private async handleGenerateFlowDiagram(
    args: { filePath: string; diagramType?: string },
    analyzer: FrontendCodeAnalyzer | null
  ) {
    const { filePath, diagramType = 'control_flow' } = args;

    // 简化的流程图生成
    const diagram = this.generateSimpleDiagram(filePath, diagramType);

    return {
      content: [
        {
          type: 'text',
          text: diagram,
        },
      ],
    };
  }

  /**
   * 处理代码搜索请求
   */
  private async handleSearchCode(
    args: { query: string; filePattern?: string; searchType?: string },
    analyzer: FrontendCodeAnalyzer | null
  ) {
    if (!analyzer) {
      throw new Error('请先分析项目');
    }

    const { query, filePattern, searchType = 'text' } = args;
    const projectInfo = (analyzer as any).projectInfo as ProjectInfo;

    const results = this.searchInProject(projectInfo, query, filePattern, searchType);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  /**
   * 生成简化流程图
   */
  private generateSimpleDiagram(filePath: string, diagramType: string): string {
    return `# ${diagramType} 图表

文件: ${filePath}

\`\`\`mermaid
graph TD
    A[开始] --> B[处理逻辑]
    B --> C[结束]
\`\`\``;
  }

  /**
   * 在项目中搜索代码
   */
  private searchInProject(
    projectInfo: ProjectInfo,
    query: string,
    filePattern?: string,
    searchType: string = 'text'
  ) {
    const results: any[] = [];

    for (const file of projectInfo.files) {
      if (filePattern && !file.path.includes(filePattern)) {
        continue;
      }

      // 搜索变量
      const matchingVariables = file.variables.filter(v =>
        v.name.toLowerCase().includes(query.toLowerCase())
      );

      // 搜索函数
      const matchingFunctions = file.functions.filter(f =>
        f.name.toLowerCase().includes(query.toLowerCase())
      );

      // 搜索组件
      const matchingComponents = file.components.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      );

      if (
        matchingVariables.length > 0 ||
        matchingFunctions.length > 0 ||
        matchingComponents.length > 0
      ) {
        results.push({
          file: file.path,
          variables: matchingVariables,
          functions: matchingFunctions,
          components: matchingComponents,
        });
      }
    }

    return {
      query,
      searchType,
      filePattern,
      results,
      totalMatches: results.length,
    };
  }
}
