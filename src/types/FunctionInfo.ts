/**
 * 函数信息类型定义
 * 定义函数分析结果的数据结构
 */

import type { ParameterInfo, VariableUsage } from './VariableInfo';

/**
 * 函数信息
 */
export interface FunctionInfo {
  /** 函数名 */
  name: string;
  /** 函数类型 */
  type: FunctionType;
  /** 参数列表 */
  parameters: ParameterInfo[];
  /** 返回类型 */
  returnType: string;
  /** 函数体 */
  body: string;
  /** 是否异步 */
  isAsync: boolean;
  /** 是否生成器 */
  isGenerator: boolean;
  /** 是否箭头函数 */
  isArrow: boolean;
  /** 是否方法 */
  isMethod: boolean;
  /** 是否静态方法 */
  isStatic: boolean;
  /** 是否私有方法 */
  isPrivate: boolean;
  /** 是否导出 */
  isExported: boolean;
  /** 是否导入 */
  isImported: boolean;
  /** 声明行号 */
  line: number;
  /** 声明列号 */
  column: number;
  /** 函数描述 */
  description?: string;
  /** 复杂度 */
  complexity: number;
  /** 调用次数 */
  callCount: number;
  /** 调用者 */
  callers: string[];
  /** 被调用者 */
  callees: string[];
  /** 副作用 */
  sideEffects: SideEffect[];
  /** 依赖关系 */
  dependencies: string[];
  /** 变量使用 */
  variableUsage: VariableUsage[];
  /** 控制流 */
  controlFlow: ControlFlowNode[];
  /** 异常处理 */
  exceptionHandling: ExceptionHandler[];
  /** 性能指标 */
  performance: PerformanceMetrics;
}

/**
 * 函数类型
 */
export type FunctionType =
  | 'function' // 普通函数
  | 'arrow' // 箭头函数
  | 'method' // 方法
  | 'constructor' // 构造函数
  | 'getter' // getter
  | 'setter' // setter
  | 'callback' // 回调函数
  | 'event_handler' // 事件处理函数
  | 'hook' // React Hook
  | 'middleware' // 中间件
  | 'validator' // 验证函数
  | 'transformer' // 转换函数
  | 'filter' // 过滤函数
  | 'mapper' // 映射函数
  | 'reducer' // 归约函数
  | 'other'; // 其他

/**
 * 副作用
 */
export interface SideEffect {
  /** 副作用类型 */
  type: SideEffectType;
  /** 描述 */
  description: string;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
  /** 影响范围 */
  scope: 'local' | 'module' | 'global';
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high';
}

/**
 * 副作用类型
 */
export type SideEffectType =
  | 'console_log' // 控制台输出
  | 'dom_manipulation' // DOM操作
  | 'network_request' // 网络请求
  | 'file_operation' // 文件操作
  | 'state_mutation' // 状态变更
  | 'global_variable' // 全局变量
  | 'local_storage' // 本地存储
  | 'session_storage' // 会话存储
  | 'cookie' // Cookie操作
  | 'timer' // 定时器
  | 'event_listener' // 事件监听
  | 'other'; // 其他

/**
 * 控制流节点
 */
export interface ControlFlowNode {
  /** 节点ID */
  id: string;
  /** 节点类型 */
  type: ControlFlowNodeType;
  /** 节点标签 */
  label: string;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
  /** 子节点 */
  children: string[];
  /** 父节点 */
  parent?: string;
  /** 条件（条件节点） */
  condition?: string;
  /** 循环类型（循环节点） */
  loopType?: 'for' | 'while' | 'do-while' | 'for-in' | 'for-of';
  /** 异常类型（异常节点） */
  exceptionType?: string;
}

/**
 * 控制流节点类型
 */
export type ControlFlowNodeType =
  | 'start' // 开始
  | 'end' // 结束
  | 'statement' // 语句
  | 'condition' // 条件
  | 'loop' // 循环
  | 'branch' // 分支
  | 'merge' // 合并
  | 'exception' // 异常
  | 'return' // 返回
  | 'break' // 跳出
  | 'continue' // 继续
  | 'throw' // 抛出异常
  | 'try' // try块
  | 'catch' // catch块
  | 'finally' // finally块
  | 'other'; // 其他

/**
 * 异常处理器
 */
export interface ExceptionHandler {
  /** 异常类型 */
  type: string;
  /** 处理位置 */
  location: {
    line: number;
    column: number;
  };
  /** 处理代码 */
  handler: string;
  /** 是否重新抛出 */
  rethrow: boolean;
  /** 处理范围 */
  scope: {
    start: number;
    end: number;
  };
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 圈复杂度 */
  cyclomaticComplexity: number;
  /** 认知复杂度 */
  cognitiveComplexity: number;
  /** 嵌套深度 */
  nestingDepth: number;
  /** 参数数量 */
  parameterCount: number;
  /** 局部变量数量 */
  localVariableCount: number;
  /** 语句数量 */
  statementCount: number;
  /** 表达式数量 */
  expressionCount: number;
  /** 条件数量 */
  conditionCount: number;
  /** 循环数量 */
  loopCount: number;
  /** 递归调用数量 */
  recursiveCallCount: number;
  /** 最大调用深度 */
  maxCallDepth: number;
  /** 平均调用深度 */
  avgCallDepth: number;
}
