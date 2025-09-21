/**
 * 组件分析器
 * 负责分析React/Vue等前端框架的组件
 */

import * as t from '@babel/types';

// 自定义AST遍历器，替代babel traverse
function traverseAST(ast: any, visitors: any) {
  function traverseNode(node: any, path: any = { node, parent: null, parentPath: null }) {
    if (!node || typeof node !== 'object') return;

    // 调用对应的访问器
    const visitor = visitors[node.type];
    if (visitor && typeof visitor === 'function') {
      visitor(path);
    }

    // 递归遍历子节点
    for (const key in node) {
      if (key === 'type' || key === 'loc' || key === 'range') continue;

      const child = node[key];
      if (Array.isArray(child)) {
        child.forEach((item, index) => {
          if (item && typeof item === 'object') {
            traverseNode(item, {
              node: item,
              parent: node,
              parentPath: path,
              key,
              index,
            });
          }
        });
      } else if (child && typeof child === 'object') {
        traverseNode(child, {
          node: child,
          parent: node,
          parentPath: path,
          key,
        });
      }
    }
  }

  traverseNode(ast);
}

import type {
  ComponentInfo,
  ComponentProps,
  ComponentState,
  ComponentType,
  EventHandler,
  HookUsage,
  LifecycleMethod,
} from '../types/index';

/**
 * 组件分析器类
 */
export class ComponentAnalyzer {
  /**
   * 分析文件中的组件
   */
  analyzeComponents(ast: any, filePath: string): ComponentInfo[] {
    const components: ComponentInfo[] = [];

    traverseAST(ast, {
      FunctionDeclaration: (path: any) => {
        if (this.isReactComponent(path)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
          components.push(componentInfo);
        } else if (this.isCustomHookComponent(path)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
          components.push(componentInfo);
        } else if (this.isHigherOrderComponent(path.node)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
          components.push(componentInfo);
        }
      },

      ArrowFunctionExpression: (path: any) => {
        // 只有在不是VariableDeclarator且不是JSX表达式的情况下才检测
        if (
          !t.isVariableDeclarator(path.parent) &&
          !t.isJSXExpressionContainer(path.parent) &&
          !t.isCallExpression(path.parent) &&
          this.isReactComponent(path)
        ) {
          const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
          components.push(componentInfo);
        }
      },

      ClassDeclaration: (path: any) => {
        if (this.isReactClassComponent(path)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'class', ast);
          components.push(componentInfo);
        }
      },

      VariableDeclarator: (path: any) => {
        if (t.isArrowFunctionExpression(path.node.init)) {
          if (this.isReactComponent(path)) {
            const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
            components.push(componentInfo);
          } else if (this.isCustomHookComponent(path)) {
            const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
            components.push(componentInfo);
          }
        }
      },
    });

    return components;
  }

  /**
   * 创建组件信息
   */
  private createComponentInfo(path: any, filePath: string, type: string, ast: any): ComponentInfo {
    const node = path.node;
    const name = this.getComponentName(node, path);
    const framework = this.detectFramework(ast);
    const description = this.extractDescription(node);

    return {
      name,
      type: type as ComponentType,
      framework,
      path: filePath,
      isFunctional: type === 'functional',
      isClass: type === 'class',
      isSFC: this.isSingleFileComponent(filePath),
      isPage: this.isPageComponent(name),
      isLayout: this.isLayoutComponent(name),
      isContainer: this.isContainerComponent(name),
      isPresentational: this.isPresentationalComponent(name),
      isHOC: this.isHigherOrderComponent(node),
      isHook: this.isCustomHook(name),
      isExported: this.isExported(path),
      isDefaultExport: this.isDefaultExport(path),
      line: node.loc?.start.line || 0,
      column: node.loc?.start.column || 0,
      description,
      props: this.analyzeProps(node),
      state: this.analyzeState(node),
      lifecycle: this.analyzeLifecycle(node),
      hooks: this.analyzeHooks(node.body),
      eventHandlers: this.analyzeEventHandlers(node),
      children: [],
      parents: [],
      dependencies: [],
      styles: [],
      tests: [],
      complexity: this.calculateComplexity(node),
      performance: this.calculatePerformance(node),
    };
  }

  /**
   * 检查是否为React组件
   */
  private isReactComponent(path: any): boolean {
    const node = path.node;

    // 对于箭头函数，需要更严格的检查
    if (t.isArrowFunctionExpression(node)) {
      // 如果是在JSX表达式中，不是组件
      if (t.isJSXExpressionContainer(path.parent)) {
        return false;
      }
      // 如果是在变量声明中，检查变量名
      if (t.isVariableDeclarator(path.parent)) {
        const varName = path.parent.id?.name;
        if (varName && varName.length > 0 && varName[0] === varName[0]?.toUpperCase()) {
          return true;
        }
        return false;
      }
      // 其他情况，检查是否返回JSX
      return this.returnsJSX(node);
    }

    // 检查函数名是否以大写字母开头
    const name = this.getComponentName(node, path);
    if (name && name.length > 0 && name[0] === name[0]?.toUpperCase()) {
      return true;
    }

    // 检查是否返回JSX
    return this.returnsJSX(node);
  }

  /**
   * 检查是否为自定义Hook
   */
  private isCustomHookComponent(path: any): boolean {
    const node = path.node;
    const name = this.getComponentName(node, path);

    // 检查是否为自定义Hook（以use开头且不是组件）
    if (this.isCustomHook(name)) {
      return true;
    }

    return false;
  }

  /**
   * 检查是否为React类组件
   */
  private isReactClassComponent(path: any): boolean {
    const node = path.node;

    // 检查是否继承自React.Component或Component
    if (t.isClassDeclaration(node) && node.superClass) {
      if (t.isMemberExpression(node.superClass)) {
        return (
          t.isIdentifier(node.superClass.object) &&
          node.superClass.object.name === 'React' &&
          t.isIdentifier(node.superClass.property) &&
          node.superClass.property.name === 'Component'
        );
      } else if (t.isIdentifier(node.superClass)) {
        return node.superClass.name === 'Component';
      }
    }

    return false;
  }

  /**
   * 检查是否返回JSX
   */
  private returnsJSX(node: any): boolean {
    let hasJSX = false;

    // 使用简单的递归遍历而不是traverse
    this.findJSXNodes(node, () => {
      hasJSX = true;
    });

    return hasJSX;
  }

  /**
   * 查找JSX节点
   */
  private findJSXNodes(node: any, callback: () => void): void {
    if (t.isJSXElement(node) || t.isJSXFragment(node)) {
      callback();
      return;
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findJSXNodes(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findJSXNodes(node.consequent, callback);
      if (node.alternate) {
        this.findJSXNodes(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findJSXNodes(node.body, callback);
    } else if (t.isReturnStatement(node) && node.argument) {
      this.findJSXNodes(node.argument, callback);
    } else if (t.isConditionalExpression(node)) {
      this.findJSXNodes(node.consequent, callback);
      this.findJSXNodes(node.alternate, callback);
    } else if (t.isArrowFunctionExpression(node)) {
      // 对于箭头函数，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findJSXNodes(stmt, callback);
        }
      } else {
        // 对于表达式形式的箭头函数，直接检查表达式
        this.findJSXNodes(node.body, callback);
      }
    } else if (t.isFunctionExpression(node)) {
      // 对于函数表达式，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findJSXNodes(stmt, callback);
        }
      }
    }
  }

  /**
   * 获取组件名
   */
  private getComponentName(node: any, path: any): string {
    if (t.isFunctionDeclaration(node) && node.id) {
      return node.id.name;
    } else if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
      if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
        return path.parent.id.name;
      } else if (t.isAssignmentExpression(path.parent) && t.isIdentifier(path.parent.left)) {
        return path.parent.left.name;
      }
    } else if (t.isClassDeclaration(node) && node.id) {
      return node.id.name;
    } else if (t.isVariableDeclarator(node) && t.isIdentifier(node.id)) {
      return node.id.name;
    }
    return 'Anonymous';
  }

  /**
   * 检测框架类型
   */
  private detectFramework(ast: any): ComponentInfo['framework'] {
    let framework: ComponentInfo['framework'] = 'other';

    traverseAST(ast, {
      ImportDeclaration(path: any) {
        const source = path.node.source.value;
        if (source === 'react' || source.startsWith('react/')) {
          framework = 'react';
        } else if (source === 'vue' || source.startsWith('vue/')) {
          framework = 'vue';
        } else if (source.startsWith('@angular/')) {
          framework = 'angular';
        }
      },
    });

    return framework;
  }

  /**
   * 检查是否为单文件组件
   */
  private isSingleFileComponent(filePath: string): boolean {
    return filePath.endsWith('.vue') || filePath.endsWith('.svelte');
  }

  /**
   * 检查是否为页面组件
   */
  private isPageComponent(name: string): boolean {
    return (
      name.toLowerCase().includes('page') ||
      name.toLowerCase().includes('view') ||
      name.toLowerCase().includes('screen')
    );
  }

  /**
   * 检查是否为布局组件
   */
  private isLayoutComponent(name: string): boolean {
    return (
      name.toLowerCase().includes('layout') ||
      name.toLowerCase().includes('wrapper') ||
      name.toLowerCase().includes('container')
    );
  }

  /**
   * 检查是否为容器组件
   */
  private isContainerComponent(name: string): boolean {
    return (
      name.toLowerCase().includes('container') ||
      name.toLowerCase().includes('provider') ||
      name.toLowerCase().includes('store')
    );
  }

  /**
   * 检查是否为展示组件
   */
  private isPresentationalComponent(name: string): boolean {
    return (
      name.toLowerCase().includes('presentational') ||
      name.toLowerCase().includes('display') ||
      name.toLowerCase().includes('ui')
    );
  }

  /**
   * 检查是否为高阶组件
   */
  private isHigherOrderComponent(node: any): boolean {
    // 检查是否返回一个组件
    let returnsComponent = false;

    this.findReturnStatements(node, (returnNode: any) => {
      if (t.isJSXElement(returnNode.argument) || t.isJSXFragment(returnNode.argument)) {
        returnsComponent = true;
      } else if (t.isCallExpression(returnNode.argument)) {
        // 检查是否返回函数调用（可能是组件）
        returnsComponent = true;
      } else if (
        t.isFunctionExpression(returnNode.argument) ||
        t.isArrowFunctionExpression(returnNode.argument)
      ) {
        // 检查是否返回函数（可能是组件）
        returnsComponent = true;
      }
    });

    return returnsComponent;
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
    } else if (t.isArrowFunctionExpression(node)) {
      // 对于箭头函数，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findReturnStatements(stmt, callback);
        }
      } else {
        // 对于表达式形式的箭头函数，直接检查表达式
        this.findReturnStatements(node.body, callback);
      }
    } else if (t.isFunctionExpression(node)) {
      // 对于函数表达式，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findReturnStatements(stmt, callback);
        }
      }
    } else if (t.isFunctionDeclaration(node)) {
      // 对于函数声明，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findReturnStatements(stmt, callback);
        }
      }
    }
  }

  /**
   * 检查是否为自定义Hook
   */
  private isCustomHook(name: string): boolean {
    return name.startsWith('use') && name.length > 3;
  }

  /**
   * 检查是否导出
   */
  private isExported(path: any): boolean {
    let currentPath = path;

    while (currentPath) {
      if (
        t.isExportNamedDeclaration(currentPath.node) ||
        t.isExportDefaultDeclaration(currentPath.node)
      ) {
        return true;
      }
      currentPath = currentPath.parentPath;
    }

    return false;
  }

  /**
   * 检查是否为默认导出
   */
  private isDefaultExport(path: any): boolean {
    let currentPath = path;

    while (currentPath) {
      if (t.isExportDefaultDeclaration(currentPath.node)) {
        return true;
      }
      currentPath = currentPath.parentPath;
    }

    return false;
  }

  /**
   * 提取组件描述
   */
  private extractDescription(node: any): string | undefined {
    // 这里可以添加JSDoc注释解析逻辑
    return undefined;
  }

  /**
   * 分析Props
   */
  private analyzeProps(node: any): ComponentProps {
    const definitions: ComponentProps['definitions'] = [];
    const defaults: Record<string, any> = {};
    const required: string[] = [];
    const optional: string[] = [];
    const validation: ComponentProps['validation'] = [];
    const types: Record<string, string> = {};
    const descriptions: Record<string, string> = {};

    // 分析函数参数（Props）
    if (node.params && node.params.length > 0) {
      const propsParam = node.params[0];

      if (t.isObjectPattern(propsParam)) {
        for (const prop of propsParam.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            const propName = prop.key.name;
            const propType = this.inferPropType(prop);

            const propDef: any = {
              name: propName,
              type: propType,
              required: !(prop as any).optional && !t.isAssignmentPattern(prop.value),
              location: {
                line: prop.loc?.start.line || 0,
                column: prop.loc?.start.column || 0,
              },
            };

            if (t.isAssignmentPattern(prop.value)) {
              propDef.defaultValue = this.extractDefaultValue(prop.value.right);
            }

            definitions.push(propDef);

            if ((prop as any).optional) {
              optional.push(propName);
            } else {
              required.push(propName);
            }

            types[propName] = propType;
          }
        }
      }
    }

    return {
      definitions,
      defaults,
      required,
      optional,
      validation,
      types,
      descriptions,
    };
  }

  /**
   * 推断Props类型
   */
  private inferPropType(prop: any): string {
    if (t.isAssignmentPattern(prop.value)) {
      return this.inferValueType(prop.value.right);
    } else if (t.isFunctionExpression(prop.value) || t.isArrowFunctionExpression(prop.value)) {
      return 'function';
    } else if (t.isIdentifier(prop.value)) {
      // 检查是否为函数类型
      const valueName = prop.value.name;
      if (valueName.startsWith('on') || valueName.startsWith('handle')) {
        return 'function';
      }
    }
    return 'any';
  }

  /**
   * 推断值类型
   */
  private inferValueType(node: any): string {
    if (t.isStringLiteral(node)) {
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
   * 分析State
   */
  private analyzeState(node: any): ComponentState {
    const definitions: ComponentState['definitions'] = [];
    const types: Record<string, string> = {};
    const initialValues: Record<string, any> = {};
    const updaters: ComponentState['updaters'] = [];
    const subscribers: ComponentState['subscribers'] = [];

    // 使用traverseAST来查找useState调用
    traverseAST(node, {
      VariableDeclarator: (path: any) => {
        const declarator = path.node;
        if (
          t.isCallExpression(declarator.init) &&
          t.isIdentifier(declarator.init.callee) &&
          declarator.init.callee.name === 'useState' &&
          t.isArrayPattern(declarator.id) &&
          declarator.id.elements.length > 0
        ) {
          const stateName = declarator.id.elements[0];
          if (t.isIdentifier(stateName)) {
            const initialState = declarator.init.arguments[0];

            definitions.push({
              name: stateName.name,
              type: this.inferValueType(initialState),
              initialValue: this.extractDefaultValue(initialState),
              isPrivate: false,
              isReadonly: false,
              location: {
                line: declarator.loc?.start.line || 0,
                column: declarator.loc?.start.column || 0,
              },
            });

            types[stateName.name] = this.inferValueType(initialState);
            initialValues[stateName.name] = this.extractDefaultValue(initialState);
          }
        }
      },
    });

    return {
      definitions,
      types,
      initialValues,
      updaters,
      subscribers,
    };
  }

  /**
   * 查找useState调用
   */
  private findUseStateCalls(
    node: any,
    callback: (callNode: any, path: any) => void,
    path: any = null
  ): void {
    if (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === 'useState'
    ) {
      callback(node, path);
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findUseStateCalls(stmt, callback, path);
      }
    } else if (t.isIfStatement(node)) {
      this.findUseStateCalls(node.consequent, callback, path);
      if (node.alternate) {
        this.findUseStateCalls(node.alternate, callback, path);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findUseStateCalls(node.body, callback, path);
    } else if (t.isReturnStatement(node) && node.argument) {
      this.findUseStateCalls(node.argument, callback, path);
    } else if (t.isConditionalExpression(node)) {
      this.findUseStateCalls(node.consequent, callback, path);
      this.findUseStateCalls(node.alternate, callback, path);
    } else if (t.isArrowFunctionExpression(node)) {
      // 对于箭头函数，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findUseStateCalls(stmt, callback, path);
        }
      } else {
        // 对于表达式形式的箭头函数，直接检查表达式
        this.findUseStateCalls(node.body, callback, path);
      }
    } else if (t.isFunctionExpression(node)) {
      // 对于函数表达式，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findUseStateCalls(stmt, callback, path);
        }
      }
    } else if (t.isFunctionDeclaration(node)) {
      // 对于函数声明，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findUseStateCalls(stmt, callback, path);
        }
      }
    }
  }

  /**
   * 从useState调用中提取状态名
   */
  private extractStateNameFromCall(callNode: any): string | undefined {
    // 从父级变量声明中提取状态名
    if (callNode.parent && t.isVariableDeclarator(callNode.parent)) {
      const declarator = callNode.parent;
      if (t.isArrayPattern(declarator.id) && declarator.id.elements.length > 0) {
        const firstElement = declarator.id.elements[0];
        if (t.isIdentifier(firstElement)) {
          return firstElement.name;
        }
      }
    }

    // 如果callNode本身就是变量声明的一部分
    if (
      t.isVariableDeclarator(callNode) &&
      t.isArrayPattern(callNode.id) &&
      callNode.id.elements.length > 0
    ) {
      const firstElement = callNode.id.elements[0];
      if (t.isIdentifier(firstElement)) {
        return firstElement.name;
      }
    }

    return undefined;
  }

  /**
   * 提取状态名
   */
  private extractStateName(path: any): string | undefined {
    const parent = path.parent;
    if (t.isVariableDeclarator(parent) && t.isArrayPattern(parent.id)) {
      const elements = parent.id.elements;
      if (elements.length >= 1 && t.isIdentifier(elements[0])) {
        return elements[0].name;
      }
    }
    return undefined;
  }

  /**
   * 分析生命周期方法
   */
  private analyzeLifecycle(node: any): LifecycleMethod[] {
    const lifecycle: LifecycleMethod[] = [];

    this.findLifecycleMethods(node, (methodNode: any) => {
      const methodName = t.isIdentifier(methodNode.key) ? methodNode.key.name : '';
      const phase = this.getLifecyclePhase(methodName);

      if (phase !== 'other') {
        lifecycle.push({
          name: methodName,
          phase,
          body: this.extractMethodBody(methodNode),
          isAsync: methodNode.async || false,
          location: {
            line: methodNode.loc?.start.line || 0,
            column: methodNode.loc?.start.column || 0,
          },
        });
      }
    });

    return lifecycle;
  }

  /**
   * 查找生命周期方法
   */
  private findLifecycleMethods(node: any, callback: (methodNode: any) => void): void {
    if (t.isMethod(node)) {
      callback(node);
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findLifecycleMethods(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findLifecycleMethods(node.consequent, callback);
      if (node.alternate) {
        this.findLifecycleMethods(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findLifecycleMethods(node.body, callback);
    }
  }

  /**
   * 获取生命周期阶段
   */
  private getLifecyclePhase(methodName: string): LifecycleMethod['phase'] {
    const lifecycleMap: Record<string, LifecycleMethod['phase']> = {
      componentDidMount: 'mounting',
      componentDidUpdate: 'updating',
      componentWillUnmount: 'unmounting',
      componentDidCatch: 'error',
      getDerivedStateFromProps: 'updating',
      shouldComponentUpdate: 'updating',
      getSnapshotBeforeUpdate: 'updating',
    };

    return lifecycleMap[methodName] || 'other';
  }

  /**
   * 提取方法体
   */
  private extractMethodBody(node: any): string {
    if (t.isBlockStatement(node.body)) {
      return node.body.body.map((stmt: any) => stmt.type).join('\n');
    }
    return node.body.type;
  }

  /**
   * 分析Hooks使用
   */
  private analyzeHooks(node: any): HookUsage[] {
    const hooks: HookUsage[] = [];

    // 检查node是否存在
    if (!node) {
      return hooks;
    }

    // 使用简单的递归遍历来查找Hook调用，只在当前函数内部搜索
    this.findHookCalls(node, (callNode: any) => {
      if (t.isIdentifier(callNode.callee)) {
        const hookName = callNode.callee.name;
        if (this.isReactHook(hookName)) {
          hooks.push({
            name: hookName,
            type: this.getHookType(hookName),
            parameters: callNode.arguments.map((arg: any) => this.extractArgumentValue(arg)),
            returnValue: undefined,
            location: {
              line: callNode.loc?.start.line || 0,
              column: callNode.loc?.start.column || 0,
            },
            dependencies: this.extractHookDependencies(callNode.arguments),
            isCustom: !this.isBuiltInHook(hookName),
          });
        }
      }
    });

    return hooks;
  }

  /**
   * 查找Hook调用
   */
  private findHookCalls(node: any, callback: (callNode: any) => void): void {
    if (!node) return;

    if (t.isCallExpression(node) && t.isIdentifier(node.callee)) {
      callback(node);
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findHookCalls(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findHookCalls(node.consequent, callback);
      if (node.alternate) {
        this.findHookCalls(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findHookCalls(node.body, callback);
    } else if (t.isReturnStatement(node) && node.argument) {
      this.findHookCalls(node.argument, callback);
    } else if (t.isConditionalExpression(node)) {
      this.findHookCalls(node.consequent, callback);
      this.findHookCalls(node.alternate, callback);
    } else if (t.isArrowFunctionExpression(node)) {
      // 对于箭头函数，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findHookCalls(stmt, callback);
        }
      } else {
        // 对于表达式形式的箭头函数，直接检查表达式
        this.findHookCalls(node.body, callback);
      }
    } else if (t.isFunctionExpression(node)) {
      // 对于函数表达式，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findHookCalls(stmt, callback);
        }
      }
    } else if (t.isFunctionDeclaration(node)) {
      // 对于函数声明，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findHookCalls(stmt, callback);
        }
      }
    } else if (t.isVariableDeclaration(node)) {
      // 处理变量声明，检查初始化值中的Hook调用
      for (const declarator of node.declarations) {
        if (declarator.init) {
          this.findHookCalls(declarator.init, callback);
        }
      }
    } else if (t.isVariableDeclarator(node)) {
      // 处理变量声明器，检查初始化值中的Hook调用
      if (node.init) {
        this.findHookCalls(node.init, callback);
      }
    } else if (t.isExpressionStatement(node)) {
      // 处理表达式语句，如 useEffect(() => {});
      this.findHookCalls(node.expression, callback);
    }
  }

  /**
   * 检查是否为React Hook
   */
  private isReactHook(name: string): boolean {
    return name.startsWith('use') && name.length > 3;
  }

  /**
   * 获取Hook类型
   */
  private getHookType(name: string): HookUsage['type'] {
    const hookTypeMap: Record<string, HookUsage['type']> = {
      useState: 'useState',
      useEffect: 'useEffect',
      useContext: 'useContext',
      useReducer: 'useReducer',
      useCallback: 'useCallback',
      useMemo: 'useMemo',
      useRef: 'useRef',
      useImperativeHandle: 'useImperativeHandle',
      useLayoutEffect: 'useLayoutEffect',
      useDebugValue: 'useDebugValue',
    };

    return hookTypeMap[name] || 'custom';
  }

  /**
   * 检查是否为内置Hook
   */
  private isBuiltInHook(name: string): boolean {
    const builtInHooks = [
      'useState',
      'useEffect',
      'useContext',
      'useReducer',
      'useCallback',
      'useMemo',
      'useRef',
      'useImperativeHandle',
      'useLayoutEffect',
      'useDebugValue',
    ];
    return builtInHooks.includes(name);
  }

  /**
   * 提取参数值
   */
  private extractArgumentValue(arg: any): any {
    if (t.isLiteral(arg)) {
      return (arg as any).value;
    } else if (t.isArrayExpression(arg)) {
      return arg.elements.map(el => this.extractArgumentValue(el));
    } else if (t.isObjectExpression(arg)) {
      return {};
    }
    return undefined;
  }

  /**
   * 提取Hook依赖
   */
  private extractHookDependencies(args: any[]): string[] {
    // 通常依赖数组是第二个参数
    if (args.length >= 2 && t.isArrayExpression(args[1])) {
      return args[1].elements.filter((el: any) => t.isIdentifier(el)).map((el: any) => el.name);
    }
    return [];
  }

  /**
   * 分析事件处理器
   */
  private analyzeEventHandlers(node: any): EventHandler[] {
    const handlers: EventHandler[] = [];

    // 使用traverseAST来查找事件处理器
    traverseAST(node, {
      FunctionDeclaration: (path: any) => {
        const funcNode = path.node;
        const funcName = funcNode.id?.name || '';
        if (this.isEventHandler(funcName)) {
          handlers.push({
            name: funcName,
            eventType: this.extractEventType(funcName),
            handler: this.extractMethodBody(funcNode),
            isAsync: funcNode.async || false,
            location: {
              line: funcNode.loc?.start.line || 0,
              column: funcNode.loc?.start.column || 0,
            },
            preventDefault: false,
            stopPropagation: false,
          });
        }
      },
      VariableDeclarator: (path: any) => {
        const declarator = path.node;
        if (
          (t.isFunctionExpression(declarator.init) ||
            t.isArrowFunctionExpression(declarator.init)) &&
          t.isIdentifier(declarator.id)
        ) {
          const funcName = declarator.id.name;
          if (this.isEventHandler(funcName)) {
            handlers.push({
              name: funcName,
              eventType: this.extractEventType(funcName),
              handler: this.extractMethodBody(declarator.init),
              isAsync: declarator.init.async || false,
              location: {
                line: declarator.loc?.start.line || 0,
                column: declarator.loc?.start.column || 0,
              },
              preventDefault: false,
              stopPropagation: false,
            });
          }
        }
      },
    });

    return handlers;
  }

  /**
   * 查找事件处理器
   */
  private findEventHandlers(node: any, callback: (methodNode: any) => void): void {
    if (t.isObjectMethod(node)) {
      callback(node);
    } else if (
      t.isFunctionDeclaration(node) ||
      t.isFunctionExpression(node) ||
      t.isArrowFunctionExpression(node)
    ) {
      // 检查函数名是否为事件处理器
      const name = this.getComponentName(node, { node, parent: null });
      if (this.isEventHandler(name)) {
        callback(node);
      }
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findEventHandlers(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findEventHandlers(node.consequent, callback);
      if (node.alternate) {
        this.findEventHandlers(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findEventHandlers(node.body, callback);
    } else if (t.isArrowFunctionExpression(node)) {
      // 对于箭头函数，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findEventHandlers(stmt, callback);
        }
      } else {
        // 对于表达式形式的箭头函数，直接检查表达式
        this.findEventHandlers(node.body, callback);
      }
    } else if (t.isFunctionExpression(node)) {
      // 对于函数表达式，检查函数体
      if (t.isBlockStatement(node.body)) {
        for (const stmt of node.body.body) {
          this.findEventHandlers(stmt, callback);
        }
      }
    }
  }

  /**
   * 检查是否为事件处理器
   */
  private isEventHandler(name: string): boolean {
    return (
      name.startsWith('handle') ||
      name.startsWith('on') ||
      name.includes('Click') ||
      name.includes('Change') ||
      name.includes('Submit')
    );
  }

  /**
   * 提取事件类型
   */
  private extractEventType(name: string): string {
    if (name.includes('Click')) return 'click';
    if (name.includes('Change')) return 'change';
    if (name.includes('Submit')) return 'submit';
    if (name.includes('Focus')) return 'focus';
    if (name.includes('Blur')) return 'blur';
    return 'unknown';
  }

  /**
   * 计算组件复杂度
   */
  private calculateComplexity(node: any): ComponentInfo['complexity'] {
    let cyclomaticComplexity = 1;
    let cognitiveComplexity = 0;
    let nestingDepth = 0;
    let propCount = 0;
    let stateCount = 0;
    let methodCount = 0;
    let hookCount = 0;
    let eventHandlerCount = 0;
    let conditionalRenderCount = 0;
    let loopRenderCount = 0;

    // 使用traverseAST来遍历节点
    traverseAST(node, {
      IfStatement: () => {
        cyclomaticComplexity++;
        conditionalRenderCount++;
      },
      ConditionalExpression: () => {
        cyclomaticComplexity++;
        conditionalRenderCount++;
      },
      ForStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      ForInStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      ForOfStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      WhileStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      Method: () => methodCount++,
      CallExpression: (path: any) => {
        const callNode = path.node;
        if (t.isIdentifier(callNode.callee) && this.isReactHook(callNode.callee.name)) {
          hookCount++;
        } else if (t.isMemberExpression(callNode.callee)) {
          // 检查是否为数组方法调用（如map、forEach等）
          const property = callNode.callee.property;
          if (
            t.isIdentifier(property) &&
            ['map', 'forEach', 'filter', 'reduce'].includes(property.name)
          ) {
            loopRenderCount++;
          }
        }
      },
      VariableDeclarator: (path: any) => {
        const declarator = path.node;
        if (
          t.isCallExpression(declarator.init) &&
          t.isIdentifier(declarator.init.callee) &&
          declarator.init.callee.name === 'useState'
        ) {
          stateCount++;
        }
      },
      FunctionDeclaration: (path: any) => {
        const funcNode = path.node;
        const funcName = funcNode.id?.name || '';
        if (this.isEventHandler(funcName)) {
          eventHandlerCount++;
        }
      },
    });

    // 计算Props数量
    if (node.params && node.params.length > 0) {
      const propsParam = node.params[0];
      if (t.isObjectPattern(propsParam)) {
        propCount = propsParam.properties.length;
      }
    }

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      nestingDepth,
      propCount,
      stateCount,
      methodCount,
      hookCount,
      eventHandlerCount,
      conditionalRenderCount,
      loopRenderCount,
    };
  }

  /**
   * 分析复杂度节点
   */
  private analyzeComplexityNodes(node: any, callbacks: any): void {
    if (t.isIfStatement(node)) {
      callbacks.onIfStatement?.();
    } else if (t.isConditionalExpression(node)) {
      callbacks.onConditionalExpression?.();
    } else if (t.isForStatement(node)) {
      callbacks.onForStatement?.();
    } else if (t.isForInStatement(node)) {
      callbacks.onForInStatement?.();
    } else if (t.isForOfStatement(node)) {
      callbacks.onForOfStatement?.();
    } else if (t.isWhileStatement(node)) {
      callbacks.onWhileStatement?.();
    } else if (t.isMethod(node)) {
      callbacks.onMethod?.();
    } else if (t.isCallExpression(node)) {
      callbacks.onCallExpression?.(node);
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.analyzeComplexityNodes(stmt, callbacks);
      }
    } else if (t.isIfStatement(node)) {
      this.analyzeComplexityNodes(node.consequent, callbacks);
      if (node.alternate) {
        this.analyzeComplexityNodes(node.alternate, callbacks);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.analyzeComplexityNodes(node.body, callbacks);
    } else if (t.isReturnStatement(node) && node.argument) {
      this.analyzeComplexityNodes(node.argument, callbacks);
    } else if (t.isConditionalExpression(node)) {
      this.analyzeComplexityNodes(node.consequent, callbacks);
      this.analyzeComplexityNodes(node.alternate, callbacks);
    }
  }

  /**
   * 计算组件性能指标
   */
  private calculatePerformance(node: any): ComponentInfo['performance'] {
    return {
      renderCount: 0,
      avgRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: 0,
      reRenderCount: 0,
      unnecessaryReRenderCount: 0,
      memoryUsage: 0,
      bundleSize: 0,
      dependencyCount: 0,
    };
  }
}
