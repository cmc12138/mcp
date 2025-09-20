/**
 * 函数分析器
 * 负责分析代码中的函数定义和使用情况
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';
import type { FunctionInfo, FunctionType, ParameterInfo, PerformanceMetrics } from '../types/index';

/**
 * 函数分析器类
 */
export class FunctionAnalyzer {
  /**
   * 分析文件中的函数
   */
  analyzeFunctions(ast: any, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    traverse(ast, {
      FunctionDeclaration: path => {
        const functionInfo = this.createFunctionInfo(path, filePath, 'function');
        functions.push(functionInfo);
      },

      ArrowFunctionExpression: path => {
        if (this.isTopLevelArrowFunction(path)) {
          const functionInfo = this.createFunctionInfo(path, filePath, 'arrow');
          functions.push(functionInfo);
        }
      },

      FunctionExpression: path => {
        if (this.isTopLevelFunctionExpression(path)) {
          const functionInfo = this.createFunctionInfo(path, filePath, 'function');
          functions.push(functionInfo);
        }
      },

      Method: path => {
        const functionInfo = this.createFunctionInfo(path, filePath, 'method');
        functions.push(functionInfo);
      },
    });

    // 分析函数使用情况
    this.analyzeFunctionUsage(ast, functions);

    return functions;
  }

  /**
   * 创建函数信息
   */
  private createFunctionInfo(path: any, filePath: string, type: string): FunctionInfo {
    const node = path.node;
    const name = this.getFunctionName(node, path);
    const parameters = this.analyzeParameters(node);
    const returnType = this.inferReturnType(node);
    const body = this.extractFunctionBody(node);

    return {
      name,
      type: type as FunctionType,
      parameters,
      returnType,
      body,
      isAsync: node.async || false,
      isGenerator: node.generator || false,
      isArrow: t.isArrowFunctionExpression(node),
      isMethod: t.isMethod(node),
      isStatic: this.isStaticMethod(path),
      isPrivate: this.isPrivateMethod(name),
      isExported: this.isExported(path),
      isImported: false,
      line: node.loc?.start.line || 0,
      column: node.loc?.start.column || 0,
      description: this.extractDescription(node),
      complexity: this.calculateComplexity(node),
      callCount: 0,
      callers: [],
      callees: [],
      sideEffects: [],
      dependencies: [],
      variableUsage: [],
      controlFlow: [],
      exceptionHandling: [],
      performance: this.calculatePerformanceMetrics(node),
    };
  }

  /**
   * 获取函数名
   */
  private getFunctionName(node: any, path: any): string {
    if (t.isFunctionDeclaration(node) && node.id) {
      return node.id.name;
    } else if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
      if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
        return path.parent.id.name;
      } else if (t.isAssignmentExpression(path.parent) && t.isIdentifier(path.parent.left)) {
        return path.parent.left.name;
      }
    } else if (t.isMethod(node) && t.isIdentifier(node.key)) {
      return node.key.name;
    }
    return 'anonymous';
  }

  /**
   * 分析函数参数
   */
  private analyzeParameters(node: any): ParameterInfo[] {
    const parameters: ParameterInfo[] = [];

    if (node.params) {
      for (const param of node.params) {
        if (t.isIdentifier(param)) {
          parameters.push({
            name: param.name,
            type: this.inferParameterType(param),
            optional: false,
            isRest: false,
          });
        } else if (t.isAssignmentPattern(param)) {
          parameters.push({
            name: t.isIdentifier(param.left) ? param.left.name : 'destructured',
            type: this.inferParameterType(param.left),
            optional: true,
            defaultValue: this.extractDefaultValue(param.right),
            isRest: false,
          });
        } else if (t.isRestElement(param)) {
          parameters.push({
            name: t.isIdentifier(param.argument) ? param.argument.name : 'rest',
            type: 'array',
            optional: false,
            isRest: true,
          });
        }
      }
    }

    return parameters;
  }

  /**
   * 推断参数类型
   */
  private inferParameterType(param: any): string {
    if (t.isIdentifier(param)) {
      return 'any';
    } else if (t.isAssignmentPattern(param)) {
      return this.inferParameterType(param.left);
    } else if (t.isRestElement(param)) {
      return 'array';
    }
    return 'any';
  }

  /**
   * 提取默认值
   */
  private extractDefaultValue(node: any): any {
    if (t.isLiteral(node)) {
      return (node as any).value;
    } else if (t.isArrayExpression(node)) {
      return [];
    } else if (t.isObjectExpression(node)) {
      return {};
    }
    return undefined;
  }

  /**
   * 推断返回类型
   */
  private inferReturnType(node: any): string {
    // 简单的返回类型推断
    let returnType = 'void';

    // 检查是否有函数体
    if (!node.body) {
      return returnType;
    }

    // 使用简单的AST遍历而不是traverse
    this.findReturnStatements(node.body, (returnNode: any) => {
      if (returnNode.argument) {
        returnType = this.inferExpressionType(returnNode.argument);
      } else {
        // 如果没有返回值，检查函数体类型
        returnType = this.inferExpressionType(node.body);
      }
    });

    return returnType;
  }

  /**
   * 推断表达式类型
   */
  private inferExpressionType(node: any): string {
    if (t.isLiteral(node)) {
      return typeof (node as any).value;
    } else if (t.isStringLiteral(node)) {
      return 'string';
    } else if (t.isNumericLiteral(node)) {
      return 'number';
    } else if (t.isBooleanLiteral(node)) {
      return 'boolean';
    } else if (t.isArrayExpression(node)) {
      return 'array';
    } else if (t.isObjectExpression(node)) {
      return 'object';
    } else if (t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)) {
      return 'function';
    } else if (t.isBinaryExpression(node)) {
      // 处理二元表达式，如字符串连接
      if (node.operator === '+') {
        const leftType = this.inferExpressionType(node.left);
        const rightType = this.inferExpressionType(node.right);
        if (leftType === 'string' || rightType === 'string') {
          return 'string';
        }
        if (leftType === 'number' && rightType === 'number') {
          return 'number';
        }
        return 'any';
      }
      return 'any';
    } else if (t.isTemplateLiteral(node)) {
      return 'string';
    } else if (t.isCallExpression(node)) {
      // 对于函数调用，尝试推断返回类型
      if (t.isMemberExpression(node.callee)) {
        const property = node.callee.property;
        if (t.isIdentifier(property)) {
          if (property.name === 'json') {
            return 'object';
          } else if (property.name === 'toString') {
            return 'string';
          } else if (property.name === 'valueOf') {
            return 'any';
          }
        }
      }
      return 'any';
    }
    return 'any';
  }

  /**
   * 查找返回语句
   */
  private findReturnStatements(node: any, callback: (returnNode: any) => void): void {
    if (t.isReturnStatement(node)) {
      callback(node);
    } else if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findReturnStatements(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findReturnStatements(node.consequent, callback);
      if (node.alternate) {
        this.findReturnStatements(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findReturnStatements(node.body, callback);
    }
  }

  /**
   * 提取函数体
   */
  private extractFunctionBody(node: any): string {
    if (t.isBlockStatement(node.body)) {
      return node.body.body.map((stmt: any) => this.nodeToString(stmt)).join('\n');
    } else {
      return this.nodeToString(node.body);
    }
  }

  /**
   * 将AST节点转换为字符串
   */
  private nodeToString(node: any): string {
    // 这里应该使用Babel的代码生成器
    // 为了简化，返回节点类型
    return node.type;
  }

  /**
   * 检查是否为顶级箭头函数
   */
  private isTopLevelArrowFunction(path: any): boolean {
    return t.isVariableDeclarator(path.parent) || t.isAssignmentExpression(path.parent);
  }

  /**
   * 检查是否为顶级函数表达式
   */
  private isTopLevelFunctionExpression(path: any): boolean {
    return t.isVariableDeclarator(path.parent) || t.isAssignmentExpression(path.parent);
  }

  /**
   * 检查是否为静态方法
   */
  private isStaticMethod(path: any): boolean {
    return t.isMethod(path.node) && path.node.static;
  }

  /**
   * 检查是否为私有方法
   */
  private isPrivateMethod(name: string): boolean {
    return name.startsWith('_') || name.startsWith('#');
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
   * 提取函数描述
   */
  private extractDescription(node: any): string | undefined {
    // 这里可以添加JSDoc注释解析逻辑
    return undefined;
  }

  /**
   * 计算函数复杂度
   */
  private calculateComplexity(node: any): number {
    let complexity = 1;

    // 使用简单的递归遍历而不是traverse
    this.findComplexityNodes(node, () => complexity++);

    return complexity;
  }

  /**
   * 查找复杂度节点
   */
  private findComplexityNodes(node: any, callback: () => void): void {
    if (t.isIfStatement(node) || t.isConditionalExpression(node) || t.isSwitchStatement(node)) {
      callback();
    } else if (
      t.isForStatement(node) ||
      t.isForInStatement(node) ||
      t.isForOfStatement(node) ||
      t.isWhileStatement(node) ||
      t.isDoWhileStatement(node)
    ) {
      callback();
    } else if (t.isCatchClause(node)) {
      callback();
    } else if (t.isLogicalExpression(node) && (node.operator === '&&' || node.operator === '||')) {
      callback();
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findComplexityNodes(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findComplexityNodes(node.consequent, callback);
      if (node.alternate) {
        this.findComplexityNodes(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findComplexityNodes(node.body, callback);
    } else if (t.isSwitchStatement(node)) {
      for (const caseStmt of node.cases) {
        this.findComplexityNodes(caseStmt, callback);
      }
    }
  }

  /**
   * 分析函数使用情况
   */
  private analyzeFunctionUsage(ast: any, functions: FunctionInfo[]): void {
    const functionMap = new Map(functions.map(f => [f.name, f]));
    const self = this;

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        let functionName: string | undefined;

        if (t.isIdentifier(callee)) {
          functionName = callee.name;
        } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
          functionName = callee.property.name;
        }

        if (functionName && functionMap.has(functionName)) {
          const func = functionMap.get(functionName)!;
          func.callCount++;

          // 记录调用者
          const caller = self.findCallerFunction(path);
          if (caller && !func.callers.includes(caller)) {
            func.callers.push(caller);
          }
        }
      },
    });
  }

  /**
   * 计算性能指标
   */
  private calculatePerformanceMetrics(node: any): PerformanceMetrics {
    let cyclomaticComplexity = 1;
    let cognitiveComplexity = 0;
    let nestingDepth = 0;
    let parameterCount = node.params ? node.params.length : 0;
    let localVariableCount = 0;
    let statementCount = 0;
    let expressionCount = 0;
    let conditionCount = 0;
    let loopCount = 0;
    let recursiveCallCount = 0;
    let maxCallDepth = 0;
    let avgCallDepth = 0;

    // 使用简单的递归遍历而不是traverse
    this.analyzePerformanceNodes(node, {
      onIfStatement: () => {
        cyclomaticComplexity++;
        conditionCount++;
      },
      onConditionalExpression: () => {
        cyclomaticComplexity++;
        conditionCount++;
      },
      onSwitchStatement: () => {
        cyclomaticComplexity++;
        conditionCount++;
      },
      onForStatement: () => {
        cyclomaticComplexity++;
        loopCount++;
      },
      onForInStatement: () => {
        cyclomaticComplexity++;
        loopCount++;
      },
      onForOfStatement: () => {
        cyclomaticComplexity++;
        loopCount++;
      },
      onWhileStatement: () => {
        cyclomaticComplexity++;
        loopCount++;
      },
      onDoWhileStatement: () => {
        cyclomaticComplexity++;
        loopCount++;
      },
      onCatchClause: () => {
        cyclomaticComplexity++;
      },
      onVariableDeclarator: () => {
        localVariableCount++;
      },
      onStatement: () => {
        statementCount++;
      },
      onExpression: () => {
        expressionCount++;
      },
    });

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      nestingDepth,
      parameterCount,
      localVariableCount,
      statementCount,
      expressionCount,
      conditionCount,
      loopCount,
      recursiveCallCount,
      maxCallDepth,
      avgCallDepth,
    };
  }

  /**
   * 分析性能节点
   */
  private analyzePerformanceNodes(node: any, callbacks: any): void {
    if (t.isIfStatement(node)) {
      callbacks.onIfStatement?.();
    } else if (t.isConditionalExpression(node)) {
      callbacks.onConditionalExpression?.();
    } else if (t.isSwitchStatement(node)) {
      callbacks.onSwitchStatement?.();
    } else if (t.isForStatement(node)) {
      callbacks.onForStatement?.();
    } else if (t.isForInStatement(node)) {
      callbacks.onForInStatement?.();
    } else if (t.isForOfStatement(node)) {
      callbacks.onForOfStatement?.();
    } else if (t.isWhileStatement(node)) {
      callbacks.onWhileStatement?.();
    } else if (t.isDoWhileStatement(node)) {
      callbacks.onDoWhileStatement?.();
    } else if (t.isCatchClause(node)) {
      callbacks.onCatchClause?.();
    } else if (t.isVariableDeclarator(node)) {
      callbacks.onVariableDeclarator?.();
    } else if (t.isStatement(node)) {
      callbacks.onStatement?.();
    } else if (t.isExpression(node)) {
      callbacks.onExpression?.();
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.analyzePerformanceNodes(stmt, callbacks);
      }
    } else if (t.isIfStatement(node)) {
      this.analyzePerformanceNodes(node.consequent, callbacks);
      if (node.alternate) {
        this.analyzePerformanceNodes(node.alternate, callbacks);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.analyzePerformanceNodes(node.body, callbacks);
    } else if (t.isSwitchStatement(node)) {
      for (const caseStmt of node.cases) {
        this.analyzePerformanceNodes(caseStmt, callbacks);
      }
    }
  }

  /**
   * 查找调用者函数
   */
  private findCallerFunction(path: any): string | null {
    let currentPath = path.parent;
    while (currentPath) {
      if (t.isFunctionDeclaration(currentPath.node) && currentPath.node.id) {
        return currentPath.node.id.name;
      } else if (
        t.isFunctionExpression(currentPath.node) ||
        t.isArrowFunctionExpression(currentPath.node)
      ) {
        if (t.isVariableDeclarator(currentPath.parent) && t.isIdentifier(currentPath.parent.id)) {
          return currentPath.parent.id.name;
        }
      }
      currentPath = currentPath.parent;
    }
    return null;
  }
}
