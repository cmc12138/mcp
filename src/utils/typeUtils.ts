/**
 * 类型工具函数
 * 提供类型推断和检查相关的工具函数
 */

import * as t from '@babel/types';

/**
 * 类型工具类
 */
export class TypeUtils {
  /**
   * 推断字面量类型
   */
  static inferLiteralType(node: any): string {
    if (t.isStringLiteral(node)) {
      return 'string';
    } else if (t.isNumericLiteral(node)) {
      return 'number';
    } else if (t.isBooleanLiteral(node)) {
      return 'boolean';
    } else if (t.isNullLiteral(node)) {
      return 'null';
    } else if (t.isRegExpLiteral(node)) {
      return 'RegExp';
    } else if (t.isBigIntLiteral(node)) {
      return 'bigint';
    } else if (t.isDecimalLiteral(node)) {
      return 'number';
    }
    return 'unknown';
  }

  /**
   * 推断表达式类型
   */
  static inferExpressionType(node: any): string {
    if (t.isLiteral(node)) {
      return this.inferLiteralType(node);
    } else if (t.isArrayExpression(node)) {
      return 'array';
    } else if (t.isObjectExpression(node)) {
      return 'object';
    } else if (t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)) {
      return 'function';
    } else if (t.isClassExpression(node)) {
      return 'class';
    } else if (t.isIdentifier(node)) {
      return 'identifier';
    } else if (t.isMemberExpression(node)) {
      return 'member';
    } else if (t.isCallExpression(node)) {
      return 'function';
    } else if (t.isNewExpression(node)) {
      return 'object';
    } else if (t.isConditionalExpression(node)) {
      return 'conditional';
    } else if (t.isBinaryExpression(node)) {
      return this.inferBinaryExpressionType(node);
    } else if (t.isUnaryExpression(node)) {
      return this.inferUnaryExpressionType(node);
    } else if (t.isLogicalExpression(node)) {
      return this.inferLogicalExpressionType(node);
    } else if (t.isAssignmentExpression(node)) {
      return this.inferAssignmentExpressionType(node);
    } else if (t.isUpdateExpression(node)) {
      return 'number';
    } else if (t.isTemplateLiteral(node)) {
      return 'string';
    } else if (t.isTaggedTemplateExpression(node)) {
      return 'string';
    } else if (t.isJSXElement(node) || t.isJSXFragment(node)) {
      return 'JSX';
    }
    return 'unknown';
  }

  /**
   * 推断二元表达式类型
   */
  static inferBinaryExpressionType(node: any): string {
    const { operator } = node;
    
    switch (operator) {
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
      case '**':
        return 'number';
      case '==':
      case '!=':
      case '===':
      case '!==':
      case '<':
      case '<=':
      case '>':
      case '>=':
        return 'boolean';
      case '&&':
      case '||':
        return 'logical';
      case '&':
      case '|':
      case '^':
      case '<<':
      case '>>':
      case '>>>':
        return 'number';
      case 'in':
      case 'instanceof':
        return 'boolean';
      default:
        return 'unknown';
    }
  }

  /**
   * 推断一元表达式类型
   */
  static inferUnaryExpressionType(node: any): string {
    const { operator } = node;
    
    switch (operator) {
      case '+':
      case '-':
      case '~':
        return 'number';
      case '!':
        return 'boolean';
      case 'typeof':
        return 'string';
      case 'void':
        return 'undefined';
      case 'delete':
        return 'boolean';
      default:
        return 'unknown';
    }
  }

  /**
   * 推断逻辑表达式类型
   */
  static inferLogicalExpressionType(node: any): string {
    const { operator } = node;
    
    switch (operator) {
      case '&&':
      case '||':
        return 'logical';
      case '??':
        return 'nullish';
      default:
        return 'unknown';
    }
  }

  /**
   * 推断赋值表达式类型
   */
  static inferAssignmentExpressionType(node: any): string {
    const { operator } = node;
    
    if (operator === '=') {
      return this.inferExpressionType(node.right);
    } else {
      return 'number';
    }
  }

  /**
   * 推断函数类型
   */
  static inferFunctionType(node: any): string {
    if (t.isFunctionDeclaration(node) || t.isFunctionExpression(node)) {
      return 'function';
    } else if (t.isArrowFunctionExpression(node)) {
      return 'arrow';
    } else if (t.isMethod(node)) {
      return 'method';
    } else if (t.isClassMethod(node)) {
      return 'classMethod';
    } else if (t.isObjectMethod(node)) {
      return 'objectMethod';
    }
    return 'unknown';
  }

  /**
   * 推断类类型
   */
  static inferClassType(node: any): string {
    if (t.isClassDeclaration(node)) {
      return 'class';
    } else if (t.isClassExpression(node)) {
      return 'classExpression';
    }
    return 'unknown';
  }

  /**
   * 推断变量类型
   */
  static inferVariableType(node: any): string {
    if (t.isVariableDeclarator(node)) {
      if (node.init) {
        return this.inferExpressionType(node.init);
      } else {
        return 'undefined';
      }
    } else if (t.isFunctionDeclaration(node)) {
      return 'function';
    } else if (t.isClassDeclaration(node)) {
      return 'class';
    }
    return 'unknown';
  }

  /**
   * 推断参数类型
   */
  static inferParameterType(node: any): string {
    if (t.isIdentifier(node)) {
      return 'any';
    } else if (t.isAssignmentPattern(node)) {
      return this.inferExpressionType(node.right);
    } else if (t.isRestElement(node)) {
      return 'array';
    } else if (t.isObjectPattern(node)) {
      return 'object';
    } else if (t.isArrayPattern(node)) {
      return 'array';
    }
    return 'unknown';
  }

  /**
   * 推断返回类型
   */
  static inferReturnType(node: any): string {
    let returnType = 'void';
    
    if (t.isFunction(node)) {
      const body = node.body;
      
      if (t.isBlockStatement(body)) {
        // 查找return语句
        for (const stmt of body.body) {
          if (t.isReturnStatement(stmt)) {
            if (stmt.argument) {
              returnType = this.inferExpressionType(stmt.argument);
            } else {
              returnType = 'undefined';
            }
            break;
          }
        }
      } else {
        // 箭头函数表达式体
        returnType = this.inferExpressionType(body);
      }
    }
    
    return returnType;
  }

  /**
   * 检查类型是否兼容
   */
  static isTypeCompatible(type1: string, type2: string): boolean {
    if (type1 === type2) {
      return true;
    }
    
    // 基本类型兼容性
    const compatibleTypes: Record<string, string[]> = {
      'number': ['bigint'],
      'string': ['template'],
      'object': ['array', 'function', 'class'],
      'function': ['arrow', 'method'],
      'array': ['object'],
      'class': ['object'],
      'method': ['function'],
      'arrow': ['function']
    };
    
    return compatibleTypes[type1]?.includes(type2) || 
           compatibleTypes[type2]?.includes(type1) || 
           false;
  }

  /**
   * 获取类型层次结构
   */
  static getTypeHierarchy(type: string): string[] {
    const hierarchy: Record<string, string[]> = {
      'string': ['primitive', 'value'],
      'number': ['primitive', 'value'],
      'boolean': ['primitive', 'value'],
      'null': ['primitive', 'value'],
      'undefined': ['primitive', 'value'],
      'bigint': ['primitive', 'value'],
      'symbol': ['primitive', 'value'],
      'object': ['reference', 'value'],
      'array': ['object', 'reference', 'value'],
      'function': ['object', 'reference', 'value'],
      'class': ['function', 'object', 'reference', 'value'],
      'arrow': ['function', 'object', 'reference', 'value'],
      'method': ['function', 'object', 'reference', 'value']
    };
    
    return hierarchy[type] || ['unknown'];
  }

  /**
   * 检查是否为原始类型
   */
  static isPrimitiveType(type: string): boolean {
    const primitiveTypes = ['string', 'number', 'boolean', 'null', 'undefined', 'bigint', 'symbol'];
    return primitiveTypes.includes(type);
  }

  /**
   * 检查是否为引用类型
   */
  static isReferenceType(type: string): boolean {
    return !this.isPrimitiveType(type);
  }

  /**
   * 检查是否为函数类型
   */
  static isFunctionType(type: string): boolean {
    const functionTypes = ['function', 'arrow', 'method', 'classMethod', 'objectMethod'];
    return functionTypes.includes(type);
  }

  /**
   * 检查是否为对象类型
   */
  static isObjectType(type: string): boolean {
    const objectTypes = ['object', 'array', 'function', 'class'];
    return objectTypes.includes(type);
  }

  /**
   * 检查是否为数组类型
   */
  static isArrayType(type: string): boolean {
    return type === 'array';
  }

  /**
   * 检查是否为类类型
   */
  static isClassType(type: string): boolean {
    const classTypes = ['class', 'classExpression'];
    return classTypes.includes(type);
  }

  /**
   * 获取类型描述
   */
  static getTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'string': '字符串类型',
      'number': '数字类型',
      'boolean': '布尔类型',
      'null': '空值类型',
      'undefined': '未定义类型',
      'bigint': '大整数类型',
      'symbol': '符号类型',
      'object': '对象类型',
      'array': '数组类型',
      'function': '函数类型',
      'arrow': '箭头函数类型',
      'method': '方法类型',
      'class': '类类型',
      'classExpression': '类表达式类型',
      'classMethod': '类方法类型',
      'objectMethod': '对象方法类型',
      'identifier': '标识符类型',
      'member': '成员访问类型',
      'conditional': '条件表达式类型',
      'logical': '逻辑表达式类型',
      'nullish': '空值合并类型',
      'JSX': 'JSX元素类型',
      'unknown': '未知类型'
    };
    
    return descriptions[type] || '未知类型';
  }

  /**
   * 推断复杂类型
   */
  static inferComplexType(node: any): {
    baseType: string;
    isArray: boolean;
    isObject: boolean;
    isFunction: boolean;
    isClass: boolean;
    isGeneric: boolean;
    genericParams?: string[];
    properties?: string[];
    methods?: string[];
  } {
    const baseType = this.inferExpressionType(node);
    const isArray = baseType === 'array';
    const isObject = baseType === 'object';
    const isFunction = this.isFunctionType(baseType);
    const isClass = this.isClassType(baseType);
    const isGeneric = false; // 简化实现
    const genericParams: string[] = [];
    const properties: string[] = [];
    const methods: string[] = [];

    // 分析对象属性
    if (t.isObjectExpression(node)) {
      for (const prop of node.properties) {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          properties.push(prop.key.name);
        } else if (t.isObjectMethod(prop) && t.isIdentifier(prop.key)) {
          methods.push(prop.key.name);
        }
      }
    }

    return {
      baseType,
      isArray,
      isObject,
      isFunction,
      isClass,
      isGeneric,
      genericParams,
      properties,
      methods
    };
  }
}