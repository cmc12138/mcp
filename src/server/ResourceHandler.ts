/**
 * 资源处理器
 * 处理MCP资源访问请求
 */

import { FrontendCodeAnalyzer } from '../analyzer/index';
import type { ProjectInfo } from '../types/index';

/**
 * 资源处理器类
 */
export class ResourceHandler {
  /**
   * 获取可用资源列表
   */
  getResources() {
    return [
      {
        uri: 'project://structure',
        name: '项目结构',
        description: '前端项目的整体结构信息',
        mimeType: 'application/json',
      },
      {
        uri: 'project://variables',
        name: '变量信息',
        description: '项目中所有变量的详细信息',
        mimeType: 'application/json',
      },
      {
        uri: 'project://functions',
        name: '函数信息',
        description: '项目中所有函数的详细信息',
        mimeType: 'application/json',
      },
      {
        uri: 'project://components',
        name: '组件信息',
        description: 'React/Vue组件的详细信息',
        mimeType: 'application/json',
      },
      {
        uri: 'project://dependencies',
        name: '依赖信息',
        description: '项目依赖的详细信息',
        mimeType: 'application/json',
      },
      {
        uri: 'project://statistics',
        name: '统计信息',
        description: '项目代码统计信息',
        mimeType: 'application/json',
      },
    ];
  }

  /**
   * 处理资源读取请求
   */
  async handleResourceRead(uri: string, analyzer: FrontendCodeAnalyzer | null) {
    if (!analyzer) {
      throw new Error('请先分析项目');
    }

    const projectInfo = (analyzer as any).projectInfo as ProjectInfo;

    switch (uri) {
      case 'project://structure':
        return await this.handleGetProjectStructure(projectInfo);

      case 'project://variables':
        return await this.handleGetVariables(projectInfo);

      case 'project://functions':
        return await this.handleGetFunctions(projectInfo);

      case 'project://components':
        return await this.handleGetComponents(projectInfo);

      case 'project://dependencies':
        return await this.handleGetDependencies(projectInfo);

      case 'project://statistics':
        return await this.handleGetStatistics(projectInfo);

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  /**
   * 处理项目结构资源请求
   */
  private async handleGetProjectStructure(projectInfo: ProjectInfo) {
    return {
      contents: [
        {
          uri: 'project://structure',
          mimeType: 'application/json',
          text: JSON.stringify(projectInfo, null, 2),
        },
      ],
    };
  }

  /**
   * 处理变量信息资源请求
   */
  private async handleGetVariables(projectInfo: ProjectInfo) {
    const allVariables = projectInfo.files.flatMap(file =>
      file.variables.map(variable => ({
        ...variable,
        file: file.path,
      }))
    );

    return {
      contents: [
        {
          uri: 'project://variables',
          mimeType: 'application/json',
          text: JSON.stringify(allVariables, null, 2),
        },
      ],
    };
  }

  /**
   * 处理函数信息资源请求
   */
  private async handleGetFunctions(projectInfo: ProjectInfo) {
    const allFunctions = projectInfo.files.flatMap(file =>
      file.functions.map(func => ({
        ...func,
        file: file.path,
      }))
    );

    return {
      contents: [
        {
          uri: 'project://functions',
          mimeType: 'application/json',
          text: JSON.stringify(allFunctions, null, 2),
        },
      ],
    };
  }

  /**
   * 处理组件信息资源请求
   */
  private async handleGetComponents(projectInfo: ProjectInfo) {
    const allComponents = projectInfo.files.flatMap(file =>
      file.components.map(component => ({
        ...component,
        file: file.path,
      }))
    );

    return {
      contents: [
        {
          uri: 'project://components',
          mimeType: 'application/json',
          text: JSON.stringify(allComponents, null, 2),
        },
      ],
    };
  }

  /**
   * 处理依赖信息资源请求
   */
  private async handleGetDependencies(projectInfo: ProjectInfo) {
    return {
      contents: [
        {
          uri: 'project://dependencies',
          mimeType: 'application/json',
          text: JSON.stringify(projectInfo.dependencies, null, 2),
        },
      ],
    };
  }

  /**
   * 处理统计信息资源请求
   */
  private async handleGetStatistics(projectInfo: ProjectInfo) {
    const statistics = {
      project: {
        name: projectInfo.name,
        framework: projectInfo.framework,
        version: projectInfo.version,
        description: projectInfo.description,
        rootPath: projectInfo.rootPath,
        analyzedAt: projectInfo.analyzedAt,
        analysisDuration: projectInfo.analysisDuration,
      },
      stats: projectInfo.stats,
      files: projectInfo.files.map(file => ({
        path: file.path,
        type: file.type,
        size: file.size,
        lines: file.lines,
        variableCount: file.variables.length,
        functionCount: file.functions.length,
        componentCount: file.components.length,
      })),
      summary: {
        totalFiles: projectInfo.files.length,
        totalLines: projectInfo.stats.totalLines,
        totalVariables: projectInfo.stats.totalVariables,
        totalFunctions: projectInfo.stats.totalFunctions,
        totalComponents: projectInfo.stats.totalComponents,
        averageFileSize: projectInfo.stats.averageFileSize,
        maxFileSize: projectInfo.stats.maxFileSize,
        minFileSize: projectInfo.stats.minFileSize,
      },
    };

    return {
      contents: [
        {
          uri: 'project://statistics',
          mimeType: 'application/json',
          text: JSON.stringify(statistics, null, 2),
        },
      ],
    };
  }
}
