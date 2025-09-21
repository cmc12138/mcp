/**
 * 前端代码分析器
 * 负责分析前端项目的代码结构、变量、函数和组件
 */

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as fs from 'fs';
import * as path from 'path';
import { ParseError } from '../types/errors';
import type { DependencyInfo, FileInfo, ProjectInfo } from '../types/index';
import { ComponentAnalyzer } from './ComponentAnalyzer';
import { FunctionAnalyzer } from './FunctionAnalyzer';
import { VariableTracker } from './VariableTracker';

/**
 * 前端代码分析器类
 */
export class FrontendCodeAnalyzer {
  private projectPath: string;
  private projectInfo: ProjectInfo;
  private variableTracker: VariableTracker;
  private functionAnalyzer: FunctionAnalyzer;
  private componentAnalyzer: ComponentAnalyzer;
  private startTime: number = 0;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.projectInfo = this.createDefaultProjectInfo();
    this.variableTracker = new VariableTracker();
    this.functionAnalyzer = new FunctionAnalyzer();
    this.componentAnalyzer = new ComponentAnalyzer();
  }

  /**
   * 分析整个项目
   */
  async analyzeProject(): Promise<ProjectInfo> {
    this.startTime = Date.now();

    try {
      // 检查项目路径是否存在
      if (!fs.existsSync(this.projectPath)) {
        // 如果项目路径不存在，返回默认的项目信息而不是抛出错误
        return {
          name: path.basename(this.projectPath),
          path: this.projectPath,
          framework: 'unknown',
          files: [],
          components: [],
          functions: [],
          variables: [],
          dependencies: [],
          analyzedAt: new Date(),
          analysisDuration: Date.now() - this.startTime,
        };
      }

      // 检测框架类型
      this.detectFramework();

      // 分析项目依赖
      await this.analyzeDependencies();

      // 扫描和分析所有源代码文件
      await this.analyzeFiles();

      // 计算项目统计信息
      this.calculateProjectStats();

      // 设置分析完成时间
      this.projectInfo.analyzedAt = new Date();
      this.projectInfo.analysisDuration = Date.now() - this.startTime;

      return this.projectInfo;
    } catch (error) {
      // 如果项目路径不存在，返回默认的项目信息而不是抛出错误
      if (error instanceof Error && error.message.includes('ENOENT')) {
        return {
          name: path.basename(this.projectPath),
          path: this.projectPath,
          framework: 'unknown',
          files: [],
          components: [],
          functions: [],
          variables: [],
          dependencies: [],
          analyzedAt: new Date(),
          analysisDuration: Date.now() - this.startTime,
        };
      }

      throw new ParseError(
        `项目分析失败: ${error instanceof Error ? error.message : String(error)}`,
        {
          projectPath: this.projectPath,
          error,
        }
      );
    }
  }

  /**
   * 检测框架类型
   */
  private detectFramework(): void {
    const packageJsonPath = path.join(this.projectPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      this.projectInfo.framework = 'unknown';
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (dependencies.react) {
        this.projectInfo.framework = 'react';
      } else if (dependencies.vue) {
        this.projectInfo.framework = 'vue';
      } else if (dependencies['@angular/core']) {
        this.projectInfo.framework = 'angular';
      } else {
        this.projectInfo.framework = 'vanilla';
      }

      this.projectInfo.name = packageJson.name || path.basename(this.projectPath);
      this.projectInfo.version = packageJson.version;
      this.projectInfo.description = packageJson.description;
    } catch (error) {
      this.projectInfo.framework = 'unknown';
    }
  }

  /**
   * 分析项目依赖
   */
  private async analyzeDependencies(): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const dependencies: DependencyInfo[] = [];

      // 分析生产依赖
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({
            name,
            version: version as string,
            type: 'production',
            source: 'npm',
            installed: true,
          });
        }
      }

      // 分析开发依赖
      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({
            name,
            version: version as string,
            type: 'development',
            source: 'npm',
            installed: true,
          });
        }
      }

      this.projectInfo.dependencies = dependencies;
    } catch (error) {
      // 依赖分析失败不影响整体分析
      console.warn('依赖分析失败:', error);
    }
  }

  /**
   * 分析所有文件
   */
  private async analyzeFiles(): Promise<void> {
    const sourceFiles = this.getSourceFiles();
    const files: FileInfo[] = [];

    for (const filePath of sourceFiles) {
      try {
        const fileInfo = await this.analyzeFile(filePath);
        files.push(fileInfo);
      } catch (error) {
        console.warn(`文件分析失败: ${filePath}`, error);
      }
    }

    this.projectInfo.files = files;
  }

  /**
   * 获取源代码文件列表
   */
  private getSourceFiles(): string[] {
    const sourceFiles: string[] = [];
    const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue'];

    const scanDirectory = (dir: string): void => {
      try {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // 跳过node_modules、.git等目录
            if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
              scanDirectory(fullPath);
            }
          } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (supportedExtensions.includes(ext)) {
              sourceFiles.push(fullPath);
            }
          }
        }
      } catch (error) {
        // 忽略无法访问的目录
      }
    };

    scanDirectory(this.projectPath);
    return sourceFiles;
  }

  /**
   * 分析单个文件
   */
  private async analyzeFile(filePath: string): Promise<FileInfo> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);

    const fileInfo: FileInfo = {
      path: filePath,
      type: this.detectFileType(filePath),
      size: stats.size,
      lines: content.split('\n').length,
      variables: [],
      functions: [],
      components: [],
      imports: [],
      exports: [],
      dependencies: [],
      lastModified: stats.mtime,
      encoding: 'utf-8',
    };

    try {
      // 解析AST
      const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy'],
      });

      if (!ast) {
        throw new ParseError('无法解析文件AST');
      }

      // 分析变量
      fileInfo.variables = this.variableTracker.analyzeVariables(ast, filePath);

      // 分析函数
      fileInfo.functions = this.functionAnalyzer.analyzeFunctions(ast, filePath);

      // 分析组件
      fileInfo.components = await this.componentAnalyzer.analyzeComponents(ast, filePath);

      // 分析导入导出
      this.analyzeImportsExports(ast, fileInfo);
    } catch (error) {
      throw new ParseError(`文件解析失败: ${filePath}`, {
        filePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return fileInfo;
  }

  /**
   * 检测文件类型
   */
  private detectFileType(filePath: string): FileInfo['type'] {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    // 检测测试文件
    if (
      fileName.includes('.test.') ||
      fileName.includes('.spec.') ||
      dirName.includes('__tests__') ||
      dirName.includes('test')
    ) {
      return 'test';
    }

    // 检测配置文件
    if (fileName.includes('config') || fileName.includes('Config')) {
      return 'config';
    }

    // 检测组件文件
    if (
      fileName.includes('Component') ||
      fileName.includes('component') ||
      fileName.includes('Page') ||
      fileName.includes('page')
    ) {
      return 'component';
    }

    // 检测工具文件
    if (
      fileName.includes('util') ||
      fileName.includes('Utils') ||
      fileName.includes('helper') ||
      fileName.includes('Helper')
    ) {
      return 'util';
    }

    // 检测服务文件
    if (
      fileName.includes('service') ||
      fileName.includes('Service') ||
      fileName.includes('api') ||
      fileName.includes('API')
    ) {
      return 'service';
    }

    // 检测状态管理文件
    if (
      fileName.includes('store') ||
      fileName.includes('Store') ||
      fileName.includes('state') ||
      fileName.includes('State')
    ) {
      return 'store';
    }

    return 'other';
  }

  /**
   * 分析导入导出语句
   */
  private analyzeImportsExports(ast: any, fileInfo: FileInfo): void {
    traverse(ast as any, {
      ImportDeclaration(path) {
        const importInfo = {
          module: path.node.source.value,
          variables: path.node.specifiers.map(spec => {
            if (t.isImportDefaultSpecifier(spec)) {
              return spec.local.name;
            } else if (t.isImportSpecifier(spec)) {
              return (spec.imported as any).name;
            }
            return (spec as any).local.name;
          }),
          type: (path.node.specifiers.length === 0 ? 'side-effect' : 'named') as
            | 'default'
            | 'named'
            | 'namespace'
            | 'side-effect',
          path: path.node.source.value,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        };
        fileInfo.imports.push(importInfo);
      },

      ExportDefaultDeclaration(path) {
        const exportInfo = {
          name: t.isIdentifier(path.node.declaration) ? path.node.declaration.name : 'default',
          type: 'default' as const,
          isReExport: false,
          line: path.node.loc?.start.line || 0,
          column: path.node.loc?.start.column || 0,
        };
        fileInfo.exports.push(exportInfo);
      },

      ExportNamedDeclaration(path) {
        if (path.node.specifiers) {
          for (const spec of path.node.specifiers) {
            const exportInfo = {
              name: t.isExportSpecifier(spec)
                ? (spec.exported as any).name
                : (spec as any).local.name,
              type: 'named' as const,
              isReExport: !!path.node.source,
              fromModule: path.node.source?.value,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
            };
            fileInfo.exports.push(exportInfo);
          }
        }
      },
    });
  }

  /**
   * 计算项目统计信息
   */
  private calculateProjectStats(): void {
    const files = this.projectInfo.files;
    const totalLines = files.reduce((sum, file) => sum + file.lines, 0);
    const totalVariables = files.reduce((sum, file) => sum + file.variables.length, 0);
    const totalFunctions = files.reduce((sum, file) => sum + file.functions.length, 0);
    const totalComponents = files.reduce((sum, file) => sum + file.components.length, 0);

    const fileSizes = files.map(file => file.lines);
    const averageFileSize = fileSizes.length > 0 ? totalLines / fileSizes.length : 0;
    const maxFileSize = Math.max(...fileSizes, 0);
    const minFileSize = Math.min(...fileSizes, 0);

    this.projectInfo.stats = {
      totalFiles: files.length,
      sourceFiles: files.length,
      totalLines,
      totalVariables,
      totalFunctions,
      totalComponents,
      averageFileSize: Math.round(averageFileSize),
      maxFileSize,
      minFileSize,
    };
  }

  /**
   * 创建默认项目信息
   */
  private createDefaultProjectInfo(): ProjectInfo {
    return {
      name: path.basename(this.projectPath),
      framework: 'unknown',
      files: [],
      dependencies: [],
      rootPath: this.projectPath,
      analyzedAt: new Date(),
      analysisDuration: 0,
      stats: {
        totalFiles: 0,
        sourceFiles: 0,
        totalLines: 0,
        totalVariables: 0,
        totalFunctions: 0,
        totalComponents: 0,
        averageFileSize: 0,
        maxFileSize: 0,
        minFileSize: 0,
      },
    };
  }
}
