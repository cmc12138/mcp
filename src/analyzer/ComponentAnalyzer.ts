/**
 * 组件分析器
 * 负责分析React/Vue等前端框架的组件
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';
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

    traverse(ast, {
      FunctionDeclaration: path => {
        if (this.isReactComponent(path)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
          components.push(componentInfo);
        }
      },

      ArrowFunctionExpression: path => {
        if (this.isReactComponent(path)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
          components.push(componentInfo);
        }
      },

      ClassDeclaration: path => {
        if (this.isReactClassComponent(path)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'class', ast);
          components.push(componentInfo);
        }
      },

      VariableDeclarator: path => {
        if (t.isArrowFunctionExpression(path.node.init) && this.isReactComponent(path)) {
          const componentInfo = this.createComponentInfo(path, filePath, 'functional', ast);
          components.push(componentInfo);
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
      hooks: this.analyzeHooks(node),
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

    // 检查函数名是否以大写字母开头
    const name = this.getComponentName(node, path);
    if (name && name.length > 0 && name[0] === name[0]?.toUpperCase()) {
      return true;
    }

    // 检查是否返回JSX
    return this.returnsJSX(node);
  }

  /**
   * 检查是否为React类组件
   */
  private isReactClassComponent(path: any): boolean {
    const node = path.node;

    // 检查是否继承自React.Component
    if (t.isClassDeclaration(node) && node.superClass) {
      if (t.isMemberExpression(node.superClass)) {
        return (
          t.isIdentifier(node.superClass.object) &&
          node.superClass.object.name === 'React' &&
          t.isIdentifier(node.superClass.property) &&
          node.superClass.property.name === 'Component'
        );
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
    }
    return 'Anonymous';
  }

  /**
   * 检测框架类型
   */
  private detectFramework(ast: any): ComponentInfo['framework'] {
    let framework: ComponentInfo['framework'] = 'other';

    traverse(ast, {
      ImportDeclaration(path) {
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
   * 检查是否为默认导出
   */
  private isDefaultExport(path: any): boolean {
    let currentPath = path.parent;

    while (currentPath) {
      if (t.isExportDefaultDeclaration(currentPath.node)) {
        return true;
      }
      currentPath = currentPath.parent;
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
              required: !(prop as any).optional,
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

    // 使用简单的递归遍历而不是traverse
    this.findUseStateCalls(node, (callNode: any, path: any) => {
      const stateName = this.extractStateNameFromCall(callNode);
      const initialState = callNode.arguments[0];

      if (stateName) {
        definitions.push({
          name: stateName,
          type: this.inferValueType(initialState),
          initialValue: this.extractDefaultValue(initialState),
          isPrivate: false,
          isReadonly: false,
          location: {
            line: callNode.loc?.start.line || 0,
            column: callNode.loc?.start.column || 0,
          },
        });

        types[stateName] = this.inferValueType(initialState);
        initialValues[stateName] = this.extractDefaultValue(initialState);
      }
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
  private findUseStateCalls(node: any, callback: (callNode: any, path: any) => void): void {
    if (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === 'useState'
    ) {
      callback(node, null);
    }

    // 递归查找子节点
    if (t.isBlockStatement(node)) {
      for (const stmt of node.body) {
        this.findUseStateCalls(stmt, callback);
      }
    } else if (t.isIfStatement(node)) {
      this.findUseStateCalls(node.consequent, callback);
      if (node.alternate) {
        this.findUseStateCalls(node.alternate, callback);
      }
    } else if (t.isForStatement(node) || t.isWhileStatement(node) || t.isDoWhileStatement(node)) {
      this.findUseStateCalls(node.body, callback);
    } else if (t.isReturnStatement(node) && node.argument) {
      this.findUseStateCalls(node.argument, callback);
    } else if (t.isConditionalExpression(node)) {
      this.findUseStateCalls(node.consequent, callback);
      this.findUseStateCalls(node.alternate, callback);
    }
  }

  /**
   * 从useState调用中提取状态名
   */
  private extractStateNameFromCall(callNode: any): string | undefined {
    // 这里需要从调用上下文推断状态名
    // 简化实现，返回undefined
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

    this.findEventHandlers(node, (methodNode: any) => {
      const methodName = t.isIdentifier(methodNode.key) ? methodNode.key.name : '';
      if (this.isEventHandler(methodName)) {
        handlers.push({
          name: methodName,
          eventType: this.extractEventType(methodName),
          handler: this.extractMethodBody(methodNode),
          isAsync: methodNode.async || false,
          location: {
            line: methodNode.loc?.start.line || 0,
            column: methodNode.loc?.start.column || 0,
          },
          preventDefault: false,
          stopPropagation: false,
        });
      }
    });

    return handlers;
  }

  /**
   * 查找事件处理器
   */
  private findEventHandlers(node: any, callback: (methodNode: any) => void): void {
    if (t.isObjectMethod(node)) {
      callback(node);
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

    this.analyzeComplexityNodes(node, {
      onIfStatement: () => {
        cyclomaticComplexity++;
        conditionalRenderCount++;
      },
      onConditionalExpression: () => {
        cyclomaticComplexity++;
        conditionalRenderCount++;
      },
      onForStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      onForInStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      onForOfStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      onWhileStatement: () => {
        cyclomaticComplexity++;
        loopRenderCount++;
      },
      onMethod: () => methodCount++,
      onCallExpression: (callNode: any) => {
        if (t.isIdentifier(callNode.callee) && this.isReactHook(callNode.callee.name)) {
          hookCount++;
        }
      },
    });

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
