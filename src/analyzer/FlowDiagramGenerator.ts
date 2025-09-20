/**
 * 流程图生成器
 * 负责生成各种类型的流程图，包括控制流图、数据流图、组件树图等
 */

import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface FlowNode {
  id: string;
  label: string;
  type:
    | 'start'
    | 'end'
    | 'process'
    | 'decision'
    | 'loop'
    | 'function'
    | 'component'
    | 'variable'
    | 'data';
  properties?: Record<string, any>;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'normal' | 'conditional' | 'loop' | 'data' | 'dependency';
  condition?: string;
}

export interface FlowDiagram {
  nodes: FlowNode[];
  edges: FlowEdge[];
  metadata: {
    type: 'control_flow' | 'data_flow' | 'component_tree' | 'dependency_graph';
    title: string;
    description?: string;
  };
}

/**
 * 流程图生成器类
 */
export class FlowDiagramGenerator {
  /**
   * 生成控制流图
   */
  generateControlFlow(ast: any, filePath: string): FlowDiagram {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    let nodeId = 0;

    // 添加开始节点
    const startNode: FlowNode = {
      id: 'start',
      label: 'Start',
      type: 'start',
    };
    nodes.push(startNode);

    // 分析控制流结构
    traverse(ast, {
      Program: path => {
        this.analyzeProgramControlFlow(path, nodes, edges, nodeId);
      },
      FunctionDeclaration: path => {
        this.analyzeFunctionControlFlow(path, nodes, edges, nodeId);
      },
      ArrowFunctionExpression: path => {
        this.analyzeFunctionControlFlow(path, nodes, edges, nodeId);
      },
    });

    // 添加结束节点
    const endNode: FlowNode = {
      id: 'end',
      label: 'End',
      type: 'end',
    };
    nodes.push(endNode);

    return {
      nodes,
      edges,
      metadata: {
        type: 'control_flow',
        title: `Control Flow - ${filePath}`,
        description: '程序控制流图',
      },
    };
  }

  /**
   * 生成数据流图
   */
  generateDataFlow(ast: any, filePath: string): FlowDiagram {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    const variableMap = new Map<string, string>();

    // 分析变量声明和使用
    traverse(ast, {
      VariableDeclarator: path => {
        if (t.isIdentifier(path.node.id)) {
          const varId = `var_${path.node.id.name}`;
          variableMap.set(path.node.id.name, varId);

          nodes.push({
            id: varId,
            label: path.node.id.name,
            type: 'variable',
            properties: {
              declarationType: this.getDeclarationType(path),
              value: this.extractValue(path.node.init),
            },
          });
        }
      },
      Identifier: path => {
        const name = path.node.name;
        if (variableMap.has(name)) {
          const varId = variableMap.get(name)!;

          // 检查是否为赋值
          if (t.isAssignmentExpression(path.parent)) {
            const assignmentId = `assign_${Date.now()}_${Math.random()}`;
            nodes.push({
              id: assignmentId,
              label: 'Assignment',
              type: 'process',
            });

            edges.push({
              from: varId,
              to: assignmentId,
              type: 'data',
            });
          }
        }
      },
    });

    return {
      nodes,
      edges,
      metadata: {
        type: 'data_flow',
        title: `Data Flow - ${filePath}`,
        description: '数据流图',
      },
    };
  }

  /**
   * 生成组件树图
   */
  generateComponentTree(ast: any, filePath: string): FlowDiagram {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    const componentMap = new Map<string, string>();

    // 分析React组件
    traverse(ast, {
      FunctionDeclaration: path => {
        if (this.isReactComponent(path)) {
          const componentId = this.addComponentNode(path, nodes, componentMap);
          this.analyzeComponentChildren(path, componentId, nodes, edges, componentMap);
        }
      },
      ArrowFunctionExpression: path => {
        if (this.isReactComponent(path)) {
          const componentId = this.addComponentNode(path, nodes, componentMap);
          this.analyzeComponentChildren(path, componentId, nodes, edges, componentMap);
        }
      },
      ClassDeclaration: path => {
        if (this.isReactClassComponent(path)) {
          const componentId = this.addComponentNode(path, nodes, componentMap);
          this.analyzeComponentChildren(path, componentId, nodes, edges, componentMap);
        }
      },
    });

    return {
      nodes,
      edges,
      metadata: {
        type: 'component_tree',
        title: `Component Tree - ${filePath}`,
        description: '组件树图',
      },
    };
  }

  /**
   * 生成依赖关系图
   */
  generateDependencyGraph(projectInfo: any): FlowDiagram {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];

    // 添加文件节点
    projectInfo.files?.forEach((file: any) => {
      const fileId = `file_${file.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
      nodes.push({
        id: fileId,
        label: file.name,
        type: 'component',
        properties: {
          fileType: file.type,
          size: file.size,
        },
      });
    });

    // 添加依赖关系
    projectInfo.dependencies?.forEach((dep: any) => {
      const depId = `dep_${dep.name}`;
      nodes.push({
        id: depId,
        label: dep.name,
        type: 'data',
        properties: {
          version: dep.version,
          type: dep.type,
        },
      });

      // 连接依赖到使用它的文件
      dep.usedIn?.forEach((filePath: string) => {
        const fileId = `file_${filePath.replace(/[^a-zA-Z0-9]/g, '_')}`;
        edges.push({
          from: depId,
          to: fileId,
          type: 'dependency',
        });
      });
    });

    return {
      nodes,
      edges,
      metadata: {
        type: 'dependency_graph',
        title: 'Dependency Graph',
        description: '项目依赖关系图',
      },
    };
  }

  /**
   * 生成Mermaid图表
   */
  generateMermaidDiagram(diagram: FlowDiagram): string {
    let mermaid = `graph ${this.getMermaidDirection(diagram.metadata.type)}\n`;

    // 添加节点
    diagram.nodes.forEach(node => {
      const nodeLabel = this.escapeMermaidLabel(node.label);
      const nodeStyle = this.getMermaidNodeStyle(node.type);
      mermaid += `  ${node.id}["${nodeLabel}"]${nodeStyle}\n`;
    });

    // 添加边
    diagram.edges.forEach(edge => {
      const edgeLabel = edge.label ? `|"${this.escapeMermaidLabel(edge.label)}"|` : '';
      const edgeStyle = this.getMermaidEdgeStyle(edge.type);
      mermaid += `  ${edge.from} -->${edgeLabel} ${edge.to}${edgeStyle}\n`;
    });

    return mermaid;
  }

  /**
   * 分析程序控制流
   */
  private analyzeProgramControlFlow(
    path: any,
    nodes: FlowNode[],
    edges: FlowEdge[],
    nodeId: number
  ): void {
    const programId = `program_${nodeId++}`;
    nodes.push({
      id: programId,
      label: 'Program',
      type: 'process',
    });

    edges.push({
      from: 'start',
      to: programId,
      type: 'normal',
    });

    // 分析程序体中的语句
    if (t.isProgram(path.node)) {
      path.node.body.forEach((stmt: any, index: number) => {
        this.analyzeStatementControlFlow(stmt, nodes, edges, nodeId, programId);
      });
    }
  }

  /**
   * 分析函数控制流
   */
  private analyzeFunctionControlFlow(
    path: any,
    nodes: FlowNode[],
    edges: FlowEdge[],
    nodeId: number
  ): void {
    const functionName = this.getFunctionName(path);
    const functionId = `func_${functionName}_${nodeId++}`;

    nodes.push({
      id: functionId,
      label: functionName,
      type: 'function',
    });

    // 分析函数体
    if (path.node.body) {
      this.analyzeStatementControlFlow(path.node.body, nodes, edges, nodeId, functionId);
    }
  }

  /**
   * 分析语句控制流
   */
  private analyzeStatementControlFlow(
    stmt: any,
    nodes: FlowNode[],
    edges: FlowEdge[],
    nodeId: number,
    parentId: string
  ): void {
    if (t.isIfStatement(stmt)) {
      this.analyzeIfStatement(stmt, nodes, edges, nodeId, parentId);
    } else if (t.isForStatement(stmt) || t.isWhileStatement(stmt) || t.isDoWhileStatement(stmt)) {
      this.analyzeLoopStatement(stmt, nodes, edges, nodeId, parentId);
    } else if (t.isSwitchStatement(stmt)) {
      this.analyzeSwitchStatement(stmt, nodes, edges, nodeId, parentId);
    } else {
      // 普通语句
      const stmtId = `stmt_${nodeId++}`;
      nodes.push({
        id: stmtId,
        label: stmt.type,
        type: 'process',
      });
      edges.push({
        from: parentId,
        to: stmtId,
        type: 'normal',
      });
    }
  }

  /**
   * 分析if语句
   */
  private analyzeIfStatement(
    stmt: any,
    nodes: FlowNode[],
    edges: FlowEdge[],
    nodeId: number,
    parentId: string
  ): void {
    const ifId = `if_${nodeId++}`;
    nodes.push({
      id: ifId,
      label: 'If Condition',
      type: 'decision',
    });
    edges.push({
      from: parentId,
      to: ifId,
      type: 'normal',
    });

    // then分支
    const thenId = `then_${nodeId++}`;
    nodes.push({
      id: thenId,
      label: 'Then',
      type: 'process',
    });
    edges.push({
      from: ifId,
      to: thenId,
      type: 'conditional',
      condition: 'true',
    });

    // else分支
    if (stmt.alternate) {
      const elseId = `else_${nodeId++}`;
      nodes.push({
        id: elseId,
        label: 'Else',
        type: 'process',
      });
      edges.push({
        from: ifId,
        to: elseId,
        type: 'conditional',
        condition: 'false',
      });
    }
  }

  /**
   * 分析循环语句
   */
  private analyzeLoopStatement(
    stmt: any,
    nodes: FlowNode[],
    edges: FlowEdge[],
    nodeId: number,
    parentId: string
  ): void {
    const loopId = `loop_${nodeId++}`;
    const loopType = t.isForStatement(stmt)
      ? 'For Loop'
      : t.isWhileStatement(stmt)
        ? 'While Loop'
        : 'Do-While Loop';

    nodes.push({
      id: loopId,
      label: loopType,
      type: 'loop',
    });
    edges.push({
      from: parentId,
      to: loopId,
      type: 'normal',
    });

    // 循环体
    const bodyId = `body_${nodeId++}`;
    nodes.push({
      id: bodyId,
      label: 'Loop Body',
      type: 'process',
    });
    edges.push({
      from: loopId,
      to: bodyId,
      type: 'normal',
    });

    // 循环回边
    edges.push({
      from: bodyId,
      to: loopId,
      type: 'loop',
    });
  }

  /**
   * 分析switch语句
   */
  private analyzeSwitchStatement(
    stmt: any,
    nodes: FlowNode[],
    edges: FlowEdge[],
    nodeId: number,
    parentId: string
  ): void {
    const switchId = `switch_${nodeId++}`;
    nodes.push({
      id: switchId,
      label: 'Switch',
      type: 'decision',
    });
    edges.push({
      from: parentId,
      to: switchId,
      type: 'normal',
    });

    // 各个case
    stmt.cases.forEach((caseStmt: any) => {
      const caseId = `case_${nodeId++}`;
      const caseLabel = caseStmt.test
        ? `Case ${caseStmt.test.value || caseStmt.test.name}`
        : 'Default';

      nodes.push({
        id: caseId,
        label: caseLabel,
        type: 'process',
      });
      edges.push({
        from: switchId,
        to: caseId,
        type: 'conditional',
      });
    });
  }

  /**
   * 检查是否为React组件
   */
  private isReactComponent(path: any): boolean {
    const node = path.node;
    const name = this.getFunctionName(path);
    return name && name.length > 0 && name[0] === name[0]?.toUpperCase();
  }

  /**
   * 检查是否为React类组件
   */
  private isReactClassComponent(path: any): boolean {
    const node = path.node;
    return (
      t.isClassDeclaration(node) &&
      node.superClass &&
      t.isMemberExpression(node.superClass) &&
      t.isIdentifier(node.superClass.object) &&
      node.superClass.object.name === 'React' &&
      t.isIdentifier(node.superClass.property) &&
      node.superClass.property.name === 'Component'
    );
  }

  /**
   * 获取函数名
   */
  private getFunctionName(path: any): string {
    const node = path.node;
    if (t.isFunctionDeclaration(node) && node.id) {
      return node.id.name;
    } else if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
      if (t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
        return path.parent.id.name;
      }
    } else if (t.isClassDeclaration(node) && node.id) {
      return node.id.name;
    }
    return 'Anonymous';
  }

  /**
   * 添加组件节点
   */
  private addComponentNode(
    path: any,
    nodes: FlowNode[],
    componentMap: Map<string, string>
  ): string {
    const name = this.getFunctionName(path);
    const componentId = `comp_${name}`;

    nodes.push({
      id: componentId,
      label: name,
      type: 'component',
      properties: {
        isFunctional: t.isFunctionDeclaration(path.node) || t.isArrowFunctionExpression(path.node),
        isClass: t.isClassDeclaration(path.node),
      },
    });

    componentMap.set(name, componentId);
    return componentId;
  }

  /**
   * 分析组件子组件
   */
  private analyzeComponentChildren(
    path: any,
    componentId: string,
    nodes: FlowNode[],
    edges: FlowEdge[],
    componentMap: Map<string, string>
  ): void {
    traverse(path.node, {
      JSXElement: jsxPath => {
        const element = jsxPath.node.openingElement;
        if (t.isJSXIdentifier(element.name)) {
          const childName = element.name.name;
          if (childName[0] === childName[0]?.toUpperCase()) {
            // 这是一个组件
            let childId = componentMap.get(childName);
            if (!childId) {
              childId = `comp_${childName}`;
              nodes.push({
                id: childId,
                label: childName,
                type: 'component',
              });
              componentMap.set(childName, childId);
            }

            edges.push({
              from: componentId,
              to: childId,
              type: 'dependency',
            });
          }
        }
      },
    });
  }

  /**
   * 获取声明类型
   */
  private getDeclarationType(path: any): string {
    if (t.isVariableDeclarator(path.node)) {
      const parent = path.parent;
      if (t.isVariableDeclaration(parent)) {
        return parent.kind;
      }
    }
    return 'var';
  }

  /**
   * 提取值
   */
  private extractValue(node: any): any {
    if (t.isLiteral(node)) {
      return (node as any).value;
    }
    return undefined;
  }

  /**
   * 获取Mermaid方向
   */
  private getMermaidDirection(diagramType: string): string {
    switch (diagramType) {
      case 'component_tree':
      case 'dependency_graph':
        return 'TD'; // Top Down
      case 'control_flow':
      case 'data_flow':
      default:
        return 'TD'; // Top Down
    }
  }

  /**
   * 获取Mermaid节点样式
   */
  private getMermaidNodeStyle(nodeType: string): string {
    switch (nodeType) {
      case 'start':
        return ':::start';
      case 'end':
        return ':::end';
      case 'decision':
        return ':::decision';
      case 'loop':
        return ':::loop';
      case 'function':
        return ':::function';
      case 'component':
        return ':::component';
      case 'variable':
        return ':::variable';
      default:
        return '';
    }
  }

  /**
   * 获取Mermaid边样式
   */
  private getMermaidEdgeStyle(edgeType?: string): string {
    switch (edgeType) {
      case 'conditional':
        return ':::conditional';
      case 'loop':
        return ':::loop';
      case 'data':
        return ':::data';
      case 'dependency':
        return ':::dependency';
      default:
        return '';
    }
  }

  /**
   * 转义Mermaid标签
   */
  private escapeMermaidLabel(label: string): string {
    return label.replace(/"/g, '&quot;').replace(/\n/g, '<br/>');
  }
}
