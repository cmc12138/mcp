/**
 * 前端分析MCP服务器
 * 基于Model Context Protocol的前端代码分析工具
 */

import { FlowDiagramGenerator } from '../analyzer/FlowDiagramGenerator';
import { FrontendCodeAnalyzer } from '../analyzer/FrontendCodeAnalyzer';

export class FrontendAnalysisMCPServer {
  private analyzer: FrontendCodeAnalyzer;
  private flowGenerator: FlowDiagramGenerator;

  constructor() {
    this.analyzer = new FrontendCodeAnalyzer('');
    this.flowGenerator = new FlowDiagramGenerator();
  }

  /**
   * 处理工具调用
   */
  async handleToolCall(name: string, arguments_: any): Promise<any> {
    try {
      switch (name) {
        case 'analyze_project':
          if (!arguments_.projectPath) {
            throw new Error('projectPath is required');
          }
          return await this.analyzeProject(arguments_.projectPath);

        case 'analyze_file':
          if (!arguments_.filePath) {
            throw new Error('filePath is required');
          }
          return await this.analyzeFile(arguments_.filePath);

        case 'get_project_structure':
          if (!arguments_.projectPath) {
            throw new Error('projectPath is required');
          }
          return await this.getProjectStructure(arguments_.projectPath);

        case 'get_dependencies':
          if (!arguments_.projectPath) {
            throw new Error('projectPath is required');
          }
          return await this.getDependencies(arguments_.projectPath);

        case 'get_components':
          if (!arguments_.projectPath) {
            throw new Error('projectPath is required');
          }
          return await this.getComponents(arguments_.projectPath);

        case 'get_functions':
          if (!arguments_.projectPath) {
            throw new Error('projectPath is required');
          }
          return await this.getFunctions(arguments_.projectPath);

        case 'get_variables':
          if (!arguments_.projectPath) {
            throw new Error('projectPath is required');
          }
          return await this.getVariables(arguments_.projectPath);

        case 'generate_flow_diagram':
          if (!arguments_.projectPath) {
            throw new Error('projectPath is required');
          }
          return await this.generateFlowDiagram(arguments_.projectPath);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        isError: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        content: null,
      };
    }
  }

  /**
   * 处理资源请求
   */
  async handleResourceRequest(uri: string): Promise<any> {
    try {
      // 处理file://协议
      const filePath = uri.startsWith('file://') ? uri.slice(7) : uri;

      const fs = await import('fs/promises');
      const path = await import('path');

      // 检查是否为目录
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        // 目录请求，返回目录列表
        const files = await fs.readdir(filePath);
        return {
          contents: files.join('\n'),
          mimeType: 'text/plain',
        };
      } else {
        // 文件请求，读取文件内容
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          contents: content,
          mimeType: this.getMimeType(filePath),
        };
      }
    } catch (error) {
      return {
        isError: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        content: null,
      };
    }
  }

  /**
   * 分析项目
   */
  private async analyzeProject(projectPath: string): Promise<any> {
    // 创建新的分析器实例，使用正确的项目路径
    const analyzer = new FrontendCodeAnalyzer(projectPath);
    const result = await analyzer.analyzeProject();
    return {
      content: [result],
      mimeType: 'application/json',
    };
  }

  /**
   * 分析文件
   */
  private async analyzeFile(filePath: string): Promise<any> {
    const result = await this.analyzer.analyzeFile(filePath);
    return {
      content: [result],
      mimeType: 'application/json',
    };
  }

  /**
   * 获取项目结构
   */
  private async getProjectStructure(projectPath: string): Promise<any> {
    const result = await this.analyzer.analyzeProject(projectPath);
    return {
      content: [result.structure],
      mimeType: 'application/json',
    };
  }

  /**
   * 获取依赖关系
   */
  private async getDependencies(projectPath: string): Promise<any> {
    const result = await this.analyzer.analyzeProject(projectPath);
    return {
      content: [result.dependencies],
      mimeType: 'application/json',
    };
  }

  /**
   * 获取组件信息
   */
  private async getComponents(projectPath: string): Promise<any> {
    const result = await this.analyzer.analyzeProject(projectPath);
    return {
      content: [result.components],
      mimeType: 'application/json',
    };
  }

  /**
   * 获取函数信息
   */
  private async getFunctions(projectPath: string): Promise<any> {
    const result = await this.analyzer.analyzeProject(projectPath);
    return {
      content: [result.functions],
      mimeType: 'application/json',
    };
  }

  /**
   * 获取变量信息
   */
  private async getVariables(projectPath: string): Promise<any> {
    const result = await this.analyzer.analyzeProject(projectPath);
    return {
      content: [result.variables],
      mimeType: 'application/json',
    };
  }

  /**
   * 生成流程图
   */
  private async generateFlowDiagram(projectPath: string): Promise<any> {
    const result = await this.analyzer.analyzeProject(projectPath);
    const diagram = this.flowGenerator.generateProjectFlow(result);

    return {
      content: [diagram],
      mimeType: 'text/plain',
    };
  }

  /**
   * 获取MIME类型
   */
  private getMimeType(uri: string): string {
    const ext = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      js: 'application/javascript',
      jsx: 'application/javascript',
      ts: 'application/typescript',
      tsx: 'application/typescript',
      json: 'application/json',
      html: 'text/html',
      css: 'text/css',
      md: 'text/markdown',
      txt: 'text/plain',
    };
    return mimeTypes[ext || ''] || 'text/plain';
  }
}
