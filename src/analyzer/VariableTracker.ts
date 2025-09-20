/**
 * 变量追踪器
 * 负责分析和追踪代码中的变量使用情况
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { DeclarationType, VariableInfo, VariableScope, VariableUsage } from '../types/index';

/**
 * 变量追踪器类
 */
export class VariableTracker {
  /**
   * 分析文件中的变量
   */
  analyzeVariables(ast: any, filePath: string): VariableInfo[] {
    const variables: VariableInfo[] = [];
    const variableMap = new Map<string, VariableInfo>();

    traverse(ast, {
      VariableDeclarator: path => {
        if (t.isIdentifier(path.node.id)) {
          // 将path信息附加到node上
          (path.node as any).__path = path;
          const variableInfo = this.createVariableInfo(path, filePath, 'variable');
          variables.push(variableInfo);
          variableMap.set(variableInfo.name, variableInfo);
        }
      },

      FunctionDeclaration: path => {
        if (path.node.id) {
          (path.node as any).__path = path;
          const variableInfo = this.createVariableInfo(path, filePath, 'function');
          variables.push(variableInfo);
          variableMap.set(variableInfo.name, variableInfo);
        }
      },

      ClassDeclaration: path => {
        if (path.node.id) {
          (path.node as any).__path = path;
          const variableInfo = this.createVariableInfo(path, filePath, 'class');
          variables.push(variableInfo);
          variableMap.set(variableInfo.name, variableInfo);
        }
      },

      ArrowFunctionExpression: path => {
        if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
          (path.node as any).__path = path;
          const variableInfo = this.createVariableInfo(path, filePath, 'arrow');
          variables.push(variableInfo);
          variableMap.set(variableInfo.name, variableInfo);
        }
      },
    });

    // 分析变量使用情况
    this.analyzeVariableUsage(ast, variableMap);

    return variables;
  }

  /**
   * 创建变量信息
   */
  private createVariableInfo(path: any, filePath: string, type: string): VariableInfo {
    const node = path.node;
    const name = this.getVariableName(node);

    const scope = this.determineScope(path);
    const declarationType = this.getDeclarationType(node, type);

    return {
      name,
      type: this.inferVariableType(node),
      scope,
      declarationType,
      usage: [],
      dependencies: [],
      ...(this.extractDescription(node) && { description: this.extractDescription(node) }),
      isExported: this.isExported(path),
      isImported: this.isImported(path),
      line: node.loc?.start.line || 0,
      column: node.loc?.start.column || 0,
      value: this.extractValue(node),
      isOptional: false,
      isReadonly: declarationType === 'const',
      isPrivate: this.isPrivate(name),
      isStatic: false,
      complexity: this.calculateComplexity(node),
      usageCount: 0,
      lastUsedAt: undefined,
    };
  }

  /**
   * 获取变量名
   */
  private getVariableName(node: any): string {
    if (t.isIdentifier(node.id)) {
      return node.id.name;
    } else if (t.isObjectPattern(node.id)) {
      return 'destructured';
    } else if (t.isArrayPattern(node.id)) {
      return 'destructured';
    }
    return 'unknown';
  }

  /**
   * 推断变量类型
   */
  private inferVariableType(node: any): string {
    if (t.isFunctionDeclaration(node) || t.isArrowFunctionExpression(node)) {
      return 'function';
    } else if (t.isClassDeclaration(node)) {
      return 'class';
    } else if (node.init) {
      if (t.isStringLiteral(node.init)) {
        return 'string';
      } else if (t.isNumericLiteral(node.init)) {
        return 'number';
      } else if (t.isBooleanLiteral(node.init)) {
        return 'boolean';
      } else if (t.isArrayExpression(node.init)) {
        return 'array';
      } else if (t.isObjectExpression(node.init)) {
        return 'object';
      } else if (t.isFunctionExpression(node.init) || t.isArrowFunctionExpression(node.init)) {
        return 'function';
      }
    }
    return 'any';
  }

  /**
   * 确定变量作用域
   */
  private determineScope(path: any): VariableScope {
    // 使用Babel的路径方法来查找父级作用域
    const functionParent = path.getFunctionParent();

    // 检查是否在类内部（包括类方法）
    let currentPath = path;
    while (currentPath) {
      if (currentPath.node) {
        // 检查是否在类方法内部（包括构造函数）
        if (t.isClassMethod(currentPath.node) || t.isClassPrivateMethod(currentPath.node)) {
          return 'class';
        }
        // 检查是否在类内部
        if (t.isClassDeclaration(currentPath.node) || t.isClassExpression(currentPath.node)) {
          return 'class';
        }
      }
      currentPath = currentPath.parent;
    }

    // 检查是否在函数内部
    if (functionParent) {
      return 'function';
    }

    // 默认返回模块作用域
    return 'module';
  }

  /**
   * 获取声明类型
   */
  private getDeclarationType(node: any, type: string): DeclarationType {
    if (type === 'function') {
      return 'function';
    } else if (type === 'class') {
      return 'class';
    } else if (type === 'arrow') {
      return 'arrow';
    } else if (t.isVariableDeclarator(node)) {
      // 检查是否是箭头函数
      if (t.isArrowFunctionExpression(node.init)) {
        return 'arrow';
      }
      // 从path中获取父节点信息
      const path = (node as any).__path;
      if (path && path.parent && t.isVariableDeclaration(path.parent)) {
        switch (path.parent.kind) {
          case 'var':
            return 'var';
          case 'let':
            return 'let';
          case 'const':
            return 'const';
        }
      }
    }
    return 'var'; // 默认返回var
  }

  /**
   * 提取变量描述
   */
  private extractDescription(node: any): string | undefined {
    // 这里可以添加JSDoc注释解析逻辑
    return undefined;
  }

  /**
   * 检查是否导出
   */
  private isExported(path: any): boolean {
    let currentPath = path.parent;

    while (currentPath) {
      if (
        t.isExportNamedDeclaration(currentPath.node) ||
        t.isExportDefaultDeclaration(currentPath.node)
      ) {
        return true;
      }
      currentPath = currentPath.parent;
    }

    return false;
  }

  /**
   * 检查是否导入
   */
  private isImported(path: any): boolean {
    // 变量通常不是导入的，除非是解构赋值
    return false;
  }

  /**
   * 提取变量值
   */
  private extractValue(node: any): any {
    if (t.isVariableDeclarator(node) && node.init) {
      if (t.isLiteral(node.init)) {
        return (node.init as any).value;
      }
    }
    return undefined;
  }

  /**
   * 检查是否为私有变量
   */
  private isPrivate(name: string): boolean {
    return name.startsWith('_');
  }

  /**
   * 计算变量复杂度
   */
  private calculateComplexity(node: any): number {
    let complexity = 1;

    if (t.isFunctionDeclaration(node) || t.isArrowFunctionExpression(node)) {
      complexity += this.countConditions(node);
      complexity += this.countLoops(node);
    } else if (t.isVariableDeclarator(node) && node.init) {
      // 对于变量声明，检查初始化值中的复杂度
      complexity += this.countConditions(node.init);
      complexity += this.countLoops(node.init);
    }

    return complexity;
  }

  /**
   * 计算条件语句数量
   */
  private countConditions(node: any): number {
    let count = 0;

    this.findConditionalNodes(node, () => count++);

    return count;
  }

  /**
   * 查找条件节点
   */
  private findConditionalNodes(node: any, callback: () => void): void {
    if (t.isIfStatement(node) || t.isConditionalExpression(node) || t.isSwitchStatement(node)) {
      callback();
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findConditionalNodes(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findConditionalNodes(node.consequent, callback);
      if (node.alternate) {
        this.findConditionalNodes(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findConditionalNodes(node.body, callback);
    } else if (t.isSwitchStatement(node)) {
      for (const caseStmt of node.cases) {
        this.findConditionalNodes(caseStmt, callback);
      }
    } else if (
      t.isFunctionDeclaration(node) ||
      t.isFunctionExpression(node) ||
      t.isArrowFunctionExpression(node)
    ) {
      // 处理函数体
      if (node.body) {
        this.findConditionalNodes(node.body, callback);
      }
    }
  }

  /**
   * 计算循环语句数量
   */
  private countLoops(node: any): number {
    let count = 0;

    this.findLoopNodes(node, () => count++);

    return count;
  }

  /**
   * 查找循环节点
   */
  private findLoopNodes(node: any, callback: () => void): void {
    if (
      t.isForStatement(node) ||
      t.isForInStatement(node) ||
      t.isForOfStatement(node) ||
      t.isWhileStatement(node) ||
      t.isDoWhileStatement(node)
    ) {
      callback();
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findLoopNodes(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findLoopNodes(node.consequent, callback);
      if (node.alternate) {
        this.findLoopNodes(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findLoopNodes(node.body, callback);
    } else if (
      t.isFunctionDeclaration(node) ||
      t.isFunctionExpression(node) ||
      t.isArrowFunctionExpression(node)
    ) {
      // 处理函数体
      if (node.body) {
        this.findLoopNodes(node.body, callback);
      }
    }
  }

  /**
   * 分析变量使用情况
   */
  private analyzeVariableUsage(ast: any, variableMap: Map<string, VariableInfo>): void {
    traverse(ast, {
      Identifier: path => {
        const name = path.node.name;
        const variable = variableMap.get(name);

        if (variable) {
          const usage: VariableUsage = {
            type: this.getUsageType(path),
            location: {
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
            },
            context: this.getUsageContext(path),
            isAssignment: this.isAssignment(path),
            isRead: this.isRead(path),
            isFunctionCall: this.isFunctionCall(path),
            isPropertyAccess: this.isPropertyAccess(path),
            isArrayAccess: this.isArrayAccess(path),
            isConditional: this.isConditional(path),
            isLoopVariable: this.isLoopVariable(path),
            frequency: 'medium',
          };

          variable.usage.push(usage);
          variable.usageCount++;
          variable.lastUsedAt = usage.location;
        }
      },
    });
  }

  /**
   * 获取使用类型
   */
  private getUsageType(
    path: any
  ):
    | 'declaration'
    | 'assignment'
    | 'read'
    | 'function_call'
    | 'property_access'
    | 'array_access'
    | 'conditional'
    | 'loop'
    | 'return'
    | 'other' {
    if (t.isAssignmentExpression(path.parent)) {
      return 'assignment';
    } else if (t.isCallExpression(path.parent)) {
      return 'function_call';
    } else if (t.isMemberExpression(path.parent)) {
      return 'property_access';
    } else if (t.isArrayExpression(path.parent)) {
      return 'array_access';
    } else if (t.isConditionalExpression(path.parent)) {
      return 'conditional';
    } else if (this.isInConditionalContext(path)) {
      return 'conditional';
    } else if (
      t.isForStatement(path.parent) ||
      t.isForInStatement(path.parent) ||
      t.isForOfStatement(path.parent) ||
      t.isWhileStatement(path.parent) ||
      t.isDoWhileStatement(path.parent)
    ) {
      return 'loop';
    }
    return 'read';
  }

  /**
   * 检查是否在条件上下文中
   */
  private isInConditionalContext(path: any): boolean {
    let currentPath = path.parent;
    while (currentPath) {
      if (
        t.isIfStatement(currentPath) ||
        t.isConditionalExpression(currentPath) ||
        t.isSwitchStatement(currentPath) ||
        t.isSwitchCase(currentPath)
      ) {
        return true;
      }
      currentPath = currentPath.parent;
    }
    return false;
  }

  /**
   * 获取使用上下文
   */
  private getUsageContext(path: any): string {
    let currentPath = path.parent;
    while (currentPath) {
      if (t.isFunctionDeclaration(currentPath.node) && currentPath.node.id) {
        return `function:${currentPath.node.id.name}`;
      } else if (
        t.isFunctionExpression(currentPath.node) ||
        t.isArrowFunctionExpression(currentPath.node)
      ) {
        if (t.isVariableDeclarator(currentPath.parent) && t.isIdentifier(currentPath.parent.id)) {
          return `function:${currentPath.parent.id.name}`;
        }
      }
      currentPath = currentPath.parent;
    }
    return 'global';
  }

  /**
   * 检查是否为赋值
   */
  private isAssignment(path: any): boolean {
    return t.isAssignmentExpression(path.parent);
  }

  /**
   * 检查是否为读取
   */
  private isRead(path: any): boolean {
    return !t.isAssignmentExpression(path.parent);
  }

  /**
   * 检查是否为函数调用
   */
  private isFunctionCall(path: any): boolean {
    return t.isCallExpression(path.parent);
  }

  /**
   * 检查是否为属性访问
   */
  private isPropertyAccess(path: any): boolean {
    return t.isMemberExpression(path.parent);
  }

  /**
   * 检查是否为数组访问
   */
  private isArrayAccess(path: any): boolean {
    return t.isArrayExpression(path.parent);
  }

  /**
   * 检查是否为条件语句
   */
  private isConditional(path: any): boolean {
    let currentPath = path.parent;
    while (currentPath) {
      if (t.isIfStatement(currentPath.node) || t.isConditionalExpression(currentPath.node)) {
        return true;
      }
      currentPath = currentPath.parent;
    }
    return false;
  }

  /**
   * 检查是否为循环变量
   */
  private isLoopVariable(path: any): boolean {
    let currentPath = path.parent;
    while (currentPath) {
      if (
        t.isForStatement(currentPath) ||
        t.isForInStatement(currentPath) ||
        t.isForOfStatement(currentPath) ||
        t.isWhileStatement(currentPath) ||
        t.isDoWhileStatement(currentPath)
      ) {
        // 对于for循环，检查是否在初始化、条件或更新部分
        if (t.isForStatement(currentPath)) {
          // 检查是否在for循环的初始化部分
          if (currentPath.init && t.isVariableDeclaration(currentPath.init)) {
            const declarations = currentPath.init.declarations;
            for (const decl of declarations) {
              if (t.isIdentifier(decl.id) && decl.id.name === path.node.name) {
                return true;
              }
            }
          }
          // 检查是否在for循环的条件或更新部分
          if (path.node === currentPath.test || path.node === currentPath.update) {
            return true;
          }
          // 检查是否在for循环体内
          return true;
        }
        // 对于其他类型的循环，检查是否在循环体内
        return true;
      }
      currentPath = currentPath.parent;
    }
    return false;
  }
}
