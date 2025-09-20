/**
 * AST工具函数
 * 提供AST操作相关的工具函数
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * AST工具类
 */
export class ASTUtils {
  /**
   * 检查节点是否为特定类型
   */
  static isNodeType(node: any, type: string): boolean {
    return node && node.type === type;
  }

  /**
   * 检查节点是否为表达式
   */
  static isExpression(node: any): boolean {
    return t.isExpression(node);
  }

  /**
   * 检查节点是否为语句
   */
  static isStatement(node: any): boolean {
    return t.isStatement(node);
  }

  /**
   * 检查节点是否为声明
   */
  static isDeclaration(node: any): boolean {
    return t.isDeclaration(node);
  }

  /**
   * 检查节点是否为函数
   */
  static isFunction(node: any): boolean {
    return t.isFunction(node);
  }

  /**
   * 检查节点是否为类
   */
  static isClass(node: any): boolean {
    return t.isClass(node);
  }

  /**
   * 检查节点是否为变量声明
   */
  static isVariableDeclaration(node: any): boolean {
    return t.isVariableDeclaration(node);
  }

  /**
   * 检查节点是否为函数声明
   */
  static isFunctionDeclaration(node: any): boolean {
    return t.isFunctionDeclaration(node);
  }

  /**
   * 检查节点是否为类声明
   */
  static isClassDeclaration(node: any): boolean {
    return t.isClassDeclaration(node);
  }

  /**
   * 检查节点是否为箭头函数
   */
  static isArrowFunctionExpression(node: any): boolean {
    return t.isArrowFunctionExpression(node);
  }

  /**
   * 检查节点是否为函数表达式
   */
  static isFunctionExpression(node: any): boolean {
    return t.isFunctionExpression(node);
  }

  /**
   * 检查节点是否为方法
   */
  static isMethod(node: any): boolean {
    return t.isMethod(node);
  }

  /**
   * 检查节点是否为标识符
   */
  static isIdentifier(node: any): boolean {
    return t.isIdentifier(node);
  }

  /**
   * 检查节点是否为字面量
   */
  static isLiteral(node: any): boolean {
    return t.isLiteral(node);
  }

  /**
   * 检查节点是否为字符串字面量
   */
  static isStringLiteral(node: any): boolean {
    return t.isStringLiteral(node);
  }

  /**
   * 检查节点是否为数字字面量
   */
  static isNumericLiteral(node: any): boolean {
    return t.isNumericLiteral(node);
  }

  /**
   * 检查节点是否为布尔字面量
   */
  static isBooleanLiteral(node: any): boolean {
    return t.isBooleanLiteral(node);
  }

  /**
   * 检查节点是否为数组表达式
   */
  static isArrayExpression(node: any): boolean {
    return t.isArrayExpression(node);
  }

  /**
   * 检查节点是否为对象表达式
   */
  static isObjectExpression(node: any): boolean {
    return t.isObjectExpression(node);
  }

  /**
   * 检查节点是否为成员表达式
   */
  static isMemberExpression(node: any): boolean {
    return t.isMemberExpression(node);
  }

  /**
   * 检查节点是否为调用表达式
   */
  static isCallExpression(node: any): boolean {
    return t.isCallExpression(node);
  }

  /**
   * 检查节点是否为条件表达式
   */
  static isConditionalExpression(node: any): boolean {
    return t.isConditionalExpression(node);
  }

  /**
   * 检查节点是否为二元表达式
   */
  static isBinaryExpression(node: any): boolean {
    return t.isBinaryExpression(node);
  }

  /**
   * 检查节点是否为一元表达式
   */
  static isUnaryExpression(node: any): boolean {
    return t.isUnaryExpression(node);
  }

  /**
   * 检查节点是否为逻辑表达式
   */
  static isLogicalExpression(node: any): boolean {
    return t.isLogicalExpression(node);
  }

  /**
   * 检查节点是否为赋值表达式
   */
  static isAssignmentExpression(node: any): boolean {
    return t.isAssignmentExpression(node);
  }

  /**
   * 检查节点是否为更新表达式
   */
  static isUpdateExpression(node: any): boolean {
    return t.isUpdateExpression(node);
  }

  /**
   * 检查节点是否为If语句
   */
  static isIfStatement(node: any): boolean {
    return t.isIfStatement(node);
  }

  /**
   * 检查节点是否为For语句
   */
  static isForStatement(node: any): boolean {
    return t.isForStatement(node);
  }

  /**
   * 检查节点是否为ForIn语句
   */
  static isForInStatement(node: any): boolean {
    return t.isForInStatement(node);
  }

  /**
   * 检查节点是否为ForOf语句
   */
  static isForOfStatement(node: any): boolean {
    return t.isForOfStatement(node);
  }

  /**
   * 检查节点是否为While语句
   */
  static isWhileStatement(node: any): boolean {
    return t.isWhileStatement(node);
  }

  /**
   * 检查节点是否为DoWhile语句
   */
  static isDoWhileStatement(node: any): boolean {
    return t.isDoWhileStatement(node);
  }

  /**
   * 检查节点是否为Switch语句
   */
  static isSwitchStatement(node: any): boolean {
    return t.isSwitchStatement(node);
  }

  /**
   * 检查节点是否为Try语句
   */
  static isTryStatement(node: any): boolean {
    return t.isTryStatement(node);
  }

  /**
   * 检查节点是否为Catch子句
   */
  static isCatchClause(node: any): boolean {
    return t.isCatchClause(node);
  }

  /**
   * 检查节点是否为Return语句
   */
  static isReturnStatement(node: any): boolean {
    return t.isReturnStatement(node);
  }

  /**
   * 检查节点是否为Break语句
   */
  static isBreakStatement(node: any): boolean {
    return t.isBreakStatement(node);
  }

  /**
   * 检查节点是否为Continue语句
   */
  static isContinueStatement(node: any): boolean {
    return t.isContinueStatement(node);
  }

  /**
   * 检查节点是否为Throw语句
   */
  static isThrowStatement(node: any): boolean {
    return t.isThrowStatement(node);
  }

  /**
   * 检查节点是否为Block语句
   */
  static isBlockStatement(node: any): boolean {
    return t.isBlockStatement(node);
  }

  /**
   * 检查节点是否为Expression语句
   */
  static isExpressionStatement(node: any): boolean {
    return t.isExpressionStatement(node);
  }

  /**
   * 检查节点是否为JSX元素
   */
  static isJSXElement(node: any): boolean {
    return t.isJSXElement(node);
  }

  /**
   * 检查节点是否为JSX片段
   */
  static isJSXFragment(node: any): boolean {
    return t.isJSXFragment(node);
  }

  /**
   * 检查节点是否为JSX文本
   */
  static isJSXText(node: any): boolean {
    return t.isJSXText(node);
  }

  /**
   * 检查节点是否为JSX表达式容器
   */
  static isJSXExpressionContainer(node: any): boolean {
    return t.isJSXExpressionContainer(node);
  }

  /**
   * 检查节点是否为JSX属性
   */
  static isJSXAttribute(node: any): boolean {
    return t.isJSXAttribute(node);
  }

  /**
   * 检查节点是否为JSX展开属性
   */
  static isJSXSpreadAttribute(node: any): boolean {
    return t.isJSXSpreadAttribute(node);
  }

  /**
   * 检查节点是否为导入声明
   */
  static isImportDeclaration(node: any): boolean {
    return t.isImportDeclaration(node);
  }

  /**
   * 检查节点是否为导出声明
   */
  static isExportDeclaration(node: any): boolean {
    return t.isExportDeclaration(node);
  }

  /**
   * 检查节点是否为导出默认声明
   */
  static isExportDefaultDeclaration(node: any): boolean {
    return t.isExportDefaultDeclaration(node);
  }

  /**
   * 检查节点是否为导出命名声明
   */
  static isExportNamedDeclaration(node: any): boolean {
    return t.isExportNamedDeclaration(node);
  }

  /**
   * 检查节点是否为导出全部声明
   */
  static isExportAllDeclaration(node: any): boolean {
    return t.isExportAllDeclaration(node);
  }

  /**
   * 获取节点位置信息
   */
  static getNodeLocation(node: any): { line: number; column: number } | null {
    if (node && node.loc) {
      return {
        line: node.loc.start.line,
        column: node.loc.start.column,
      };
    }
    return null;
  }

  /**
   * 获取节点范围
   */
  static getNodeRange(node: any): { start: number; end: number } | null {
    if (node && node.start !== undefined && node.end !== undefined) {
      return {
        start: node.start,
        end: node.end,
      };
    }
    return null;
  }

  /**
   * 获取节点源码
   */
  static getNodeSource(node: any, source: string): string | null {
    const range = this.getNodeRange(node);
    if (range) {
      return source.slice(range.start, range.end);
    }
    return null;
  }

  /**
   * 查找父节点
   */
  static findParent(path: any, predicate: (node: any) => boolean): any | null {
    let currentPath = path.parent;

    while (currentPath) {
      if (predicate(currentPath.node)) {
        return currentPath.node;
      }
      currentPath = currentPath.parent;
    }

    return null;
  }

  /**
   * 查找祖先节点
   */
  static findAncestor(path: any, predicate: (node: any) => boolean): any | null {
    let currentPath = path;

    while (currentPath) {
      if (predicate(currentPath.node)) {
        return currentPath.node;
      }
      currentPath = currentPath.parent;
    }

    return null;
  }

  /**
   * 遍历节点
   */
  static traverseNode(node: any, visitor: any): void {
    traverse(node, visitor);
  }

  /**
   * 获取所有子节点
   */
  static getChildNodes(node: any): any[] {
    const children: any[] = [];

    traverse(node, {
      enter(path) {
        if (path.node !== node) {
          children.push(path.node);
        }
      },
    });

    return children;
  }

  /**
   * 检查节点是否包含特定类型的子节点
   */
  static hasChildOfType(node: any, type: string): boolean {
    let hasType = false;

    traverse(node, {
      enter(path) {
        if (path.node.type === type) {
          hasType = true;
          path.stop();
        }
      },
    });

    return hasType;
  }

  /**
   * 计算节点复杂度
   */
  static calculateComplexity(node: any): number {
    let complexity = 1;

    traverse(node, {
      IfStatement: () => complexity++,
      ConditionalExpression: () => complexity++,
      SwitchStatement: () => complexity++,
      ForStatement: () => complexity++,
      ForInStatement: () => complexity++,
      ForOfStatement: () => complexity++,
      WhileStatement: () => complexity++,
      DoWhileStatement: () => complexity++,
      CatchClause: () => complexity++,
      LogicalExpression: path => {
        if (path.node.operator === '&&' || path.node.operator === '||') {
          complexity++;
        }
      },
    });

    return complexity;
  }

  /**
   * 检查节点是否为异步
   */
  static isAsync(node: any): boolean {
    return node && node.async === true;
  }

  /**
   * 检查节点是否为生成器
   */
  static isGenerator(node: any): boolean {
    return node && node.generator === true;
  }

  /**
   * 检查节点是否为静态
   */
  static isStatic(node: any): boolean {
    return node && node.static === true;
  }

  /**
   * 检查节点是否为私有
   */
  static isPrivate(node: any): boolean {
    return node && node.private === true;
  }

  /**
   * 检查节点是否为可选
   */
  static isOptional(node: any): boolean {
    return node && node.optional === true;
  }

  /**
   * 检查节点是否为计算属性
   */
  static isComputed(node: any): boolean {
    return node && node.computed === true;
  }

  /**
   * 检查节点是否为解构
   */
  static isDestructuring(node: any): boolean {
    return t.isObjectPattern(node) || t.isArrayPattern(node);
  }

  /**
   * 检查节点是否为剩余参数
   */
  static isRestElement(node: any): boolean {
    return t.isRestElement(node);
  }

  /**
   * 检查节点是否为展开元素
   */
  static isSpreadElement(node: any): boolean {
    return t.isSpreadElement(node);
  }
}
