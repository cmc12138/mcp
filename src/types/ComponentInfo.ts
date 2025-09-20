/**
 * 组件信息类型定义
 * 定义组件分析结果的数据结构
 */

/**
 * 组件信息
 */
export interface ComponentInfo {
  /** 组件名 */
  name: string;
  /** 组件类型 */
  type: ComponentType;
  /** 框架类型 */
  framework: 'react' | 'vue' | 'angular' | 'svelte' | 'other';
  /** 组件路径 */
  path: string;
  /** 是否为函数组件 */
  isFunctional: boolean;
  /** 是否为类组件 */
  isClass: boolean;
  /** 是否为单文件组件 */
  isSFC: boolean;
  /** 是否为页面组件 */
  isPage: boolean;
  /** 是否为布局组件 */
  isLayout: boolean;
  /** 是否为容器组件 */
  isContainer: boolean;
  /** 是否为展示组件 */
  isPresentational: boolean;
  /** 是否为高阶组件 */
  isHOC: boolean;
  /** 是否为自定义Hook */
  isHook: boolean;
  /** 是否导出 */
  isExported: boolean;
  /** 是否默认导出 */
  isDefaultExport: boolean;
  /** 声明行号 */
  line: number;
  /** 声明列号 */
  column: number;
  /** 组件描述 */
  description?: string;
  /** Props定义 */
  props: ComponentProps;
  /** State定义 */
  state: ComponentState;
  /** 生命周期方法 */
  lifecycle: LifecycleMethod[];
  /** Hooks使用 */
  hooks: HookUsage[];
  /** 事件处理器 */
  eventHandlers: EventHandler[];
  /** 子组件 */
  children: ComponentChild[];
  /** 父组件 */
  parents: ComponentParent[];
  /** 依赖的组件 */
  dependencies: ComponentDependency[];
  /** 样式信息 */
  styles: StyleInfo[];
  /** 测试信息 */
  tests: TestInfo[];
  /** 复杂度指标 */
  complexity: ComponentComplexity;
  /** 性能指标 */
  performance: ComponentPerformance;
}

/**
 * 组件类型
 */
export type ComponentType =
  | 'functional' // 函数组件
  | 'class' // 类组件
  | 'sfc' // 单文件组件
  | 'page' // 页面组件
  | 'layout' // 布局组件
  | 'container' // 容器组件
  | 'presentational' // 展示组件
  | 'hoc' // 高阶组件
  | 'hook' // 自定义Hook
  | 'mixin' // 混入
  | 'directive' // 指令
  | 'filter' // 过滤器
  | 'other'; // 其他

/**
 * 组件Props
 */
export interface ComponentProps {
  /** Props定义 */
  definitions: PropDefinition[];
  /** 默认Props */
  defaults: Record<string, any>;
  /** 必需Props */
  required: string[];
  /** 可选Props */
  optional: string[];
  /** Props验证 */
  validation: PropValidation[];
  /** Props类型 */
  types: Record<string, string>;
  /** Props描述 */
  descriptions: Record<string, string>;
}

/**
 * Props定义
 */
export interface PropDefinition {
  /** 属性名 */
  name: string;
  /** 属性类型 */
  type: string;
  /** 是否必需 */
  required: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 验证器 */
  validator?: string;
  /** 描述 */
  description?: string;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * Props验证
 */
export interface PropValidation {
  /** 属性名 */
  name: string;
  /** 验证规则 */
  rules: ValidationRule[];
  /** 验证函数 */
  validator?: string;
  /** 错误消息 */
  errorMessage?: string;
}

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 规则类型 */
  type: 'required' | 'type' | 'min' | 'max' | 'pattern' | 'custom';
  /** 规则值 */
  value: any;
  /** 错误消息 */
  message: string;
}

/**
 * 组件State
 */
export interface ComponentState {
  /** State定义 */
  definitions: StateDefinition[];
  /** State类型 */
  types: Record<string, string>;
  /** State初始值 */
  initialValues: Record<string, any>;
  /** State更新器 */
  updaters: StateUpdater[];
  /** State订阅者 */
  subscribers: StateSubscriber[];
}

/**
 * State定义
 */
export interface StateDefinition {
  /** 状态名 */
  name: string;
  /** 状态类型 */
  type: string;
  /** 初始值 */
  initialValue: any;
  /** 是否私有 */
  isPrivate: boolean;
  /** 是否只读 */
  isReadonly: boolean;
  /** 描述 */
  description?: string;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * State更新器
 */
export interface StateUpdater {
  /** 更新器名 */
  name: string;
  /** 更新的状态 */
  state: string;
  /** 更新逻辑 */
  logic: string;
  /** 是否异步 */
  isAsync: boolean;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * State订阅者
 */
export interface StateSubscriber {
  /** 订阅者名 */
  name: string;
  /** 订阅的状态 */
  state: string;
  /** 订阅逻辑 */
  logic: string;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * 生命周期方法
 */
export interface LifecycleMethod {
  /** 方法名 */
  name: string;
  /** 生命周期阶段 */
  phase: LifecyclePhase;
  /** 方法体 */
  body: string;
  /** 是否异步 */
  isAsync: boolean;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
  /** 描述 */
  description?: string;
}

/**
 * 生命周期阶段
 */
export type LifecyclePhase =
  | 'creation' // 创建阶段
  | 'mounting' // 挂载阶段
  | 'updating' // 更新阶段
  | 'unmounting' // 卸载阶段
  | 'error' // 错误处理
  | 'other'; // 其他

/**
 * Hook使用
 */
export interface HookUsage {
  /** Hook名 */
  name: string;
  /** Hook类型 */
  type: HookType;
  /** 参数 */
  parameters: any[];
  /** 返回值 */
  returnValue?: any;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
  /** 依赖数组 */
  dependencies?: string[];
  /** 是否自定义Hook */
  isCustom: boolean;
}

/**
 * Hook类型
 */
export type HookType =
  | 'useState' // 状态Hook
  | 'useEffect' // 副作用Hook
  | 'useContext' // 上下文Hook
  | 'useReducer' // 归约Hook
  | 'useCallback' // 回调Hook
  | 'useMemo' // 记忆Hook
  | 'useRef' // 引用Hook
  | 'useImperativeHandle' // 命令式句柄Hook
  | 'useLayoutEffect' // 布局副作用Hook
  | 'useDebugValue' // 调试值Hook
  | 'custom' // 自定义Hook
  | 'other'; // 其他

/**
 * 事件处理器
 */
export interface EventHandler {
  /** 处理器名 */
  name: string;
  /** 事件类型 */
  eventType: string;
  /** 处理器函数 */
  handler: string;
  /** 是否异步 */
  isAsync: boolean;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
  /** 是否阻止默认行为 */
  preventDefault: boolean;
  /** 是否阻止冒泡 */
  stopPropagation: boolean;
}

/**
 * 组件子元素
 */
export interface ComponentChild {
  /** 子元素名 */
  name: string;
  /** 子元素类型 */
  type: 'component' | 'element' | 'text' | 'fragment';
  /** 子元素路径 */
  path?: string;
  /** 是否为条件渲染 */
  isConditional: boolean;
  /** 是否为列表渲染 */
  isList: boolean;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * 组件父元素
 */
export interface ComponentParent {
  /** 父组件名 */
  name: string;
  /** 父组件路径 */
  path: string;
  /** 使用方式 */
  usage: 'direct' | 'indirect' | 'dynamic';
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * 组件依赖
 */
export interface ComponentDependency {
  /** 依赖组件名 */
  name: string;
  /** 依赖组件路径 */
  path: string;
  /** 依赖类型 */
  type: 'import' | 'require' | 'dynamic';
  /** 是否为默认导入 */
  isDefault: boolean;
  /** 导入的成员 */
  members: string[];
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * 样式信息
 */
export interface StyleInfo {
  /** 样式类型 */
  type: 'css' | 'scss' | 'sass' | 'less' | 'stylus' | 'css-in-js' | 'inline';
  /** 样式路径 */
  path?: string;
  /** 样式内容 */
  content?: string;
  /** 是否为模块化样式 */
  isModule: boolean;
  /** 样式变量 */
  variables: StyleVariable[];
  /** 样式类名 */
  classNames: string[];
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * 样式变量
 */
export interface StyleVariable {
  /** 变量名 */
  name: string;
  /** 变量值 */
  value: string;
  /** 变量类型 */
  type: 'color' | 'size' | 'spacing' | 'font' | 'other';
  /** 是否CSS变量 */
  isCSSVariable: boolean;
  /** 位置 */
  location: {
    line: number;
    column: number;
  };
}

/**
 * 测试信息
 */
export interface TestInfo {
  /** 测试文件路径 */
  path: string;
  /** 测试框架 */
  framework: 'jest' | 'mocha' | 'vitest' | 'cypress' | 'playwright' | 'other';
  /** 测试用例数量 */
  testCount: number;
  /** 覆盖率 */
  coverage: number;
  /** 测试类型 */
  type: 'unit' | 'integration' | 'e2e' | 'visual' | 'other';
}

/**
 * 组件复杂度
 */
export interface ComponentComplexity {
  /** 圈复杂度 */
  cyclomaticComplexity: number;
  /** 认知复杂度 */
  cognitiveComplexity: number;
  /** 嵌套深度 */
  nestingDepth: number;
  /** Props数量 */
  propCount: number;
  /** State数量 */
  stateCount: number;
  /** 方法数量 */
  methodCount: number;
  /** Hook数量 */
  hookCount: number;
  /** 事件处理器数量 */
  eventHandlerCount: number;
  /** 条件渲染数量 */
  conditionalRenderCount: number;
  /** 循环渲染数量 */
  loopRenderCount: number;
}

/**
 * 组件性能
 */
export interface ComponentPerformance {
  /** 渲染次数 */
  renderCount: number;
  /** 平均渲染时间 */
  avgRenderTime: number;
  /** 最大渲染时间 */
  maxRenderTime: number;
  /** 最小渲染时间 */
  minRenderTime: number;
  /** 重渲染次数 */
  reRenderCount: number;
  /** 不必要的重渲染次数 */
  unnecessaryReRenderCount: number;
  /** 内存使用量 */
  memoryUsage: number;
  /** 包大小 */
  bundleSize: number;
  /** 依赖数量 */
  dependencyCount: number;
}
