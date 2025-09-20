/**
 * 变量信息类型定义
 * 定义变量分析结果的数据结构
 */

/**
 * 变量信息
 */
export interface VariableInfo {
  /** 变量名 */
  name: string;
  /** 变量类型 */
  type: string;
  /** 作用域 */
  scope: VariableScope;
  /** 声明类型 */
  declarationType: DeclarationType;
  /** 使用情况 */
  usage: VariableUsage[];
  /** 依赖关系 */
  dependencies: string[];
  /** 变量描述 */
  description?: string;
  /** 是否导出 */
  isExported: boolean;
  /** 是否导入 */
  isImported: boolean;
  /** 声明行号 */
  line: number;
  /** 声明列号 */
  column: number;
  /** 变量值（如果是常量） */
  value?: any;
  /** 是否为可选变量 */
  isOptional: boolean;
  /** 是否为只读变量 */
  isReadonly: boolean;
  /** 是否为私有变量 */
  isPrivate: boolean;
  /** 是否为静态变量 */
  isStatic: boolean;
  /** 变量复杂度 */
  complexity: number;
  /** 使用次数 */
  usageCount: number;
  /** 最后使用位置 */
  lastUsedAt?: {
    line: number;
    column: number;
  };
}

/**
 * 变量作用域
 */
export type VariableScope = 
  | 'global'     // 全局作用域
  | 'module'     // 模块作用域
  | 'function'   // 函数作用域
  | 'block'      // 块作用域
  | 'class'      // 类作用域
  | 'interface'; // 接口作用域

/**
 * 声明类型
 */
export type DeclarationType = 
  | 'var'        // var声明
  | 'let'        // let声明
  | 'const'      // const声明
  | 'function'   // function声明
  | 'class'      // class声明
  | 'interface'  // interface声明
  | 'type'       // type声明
  | 'enum'       // enum声明
  | 'parameter'  // 函数参数
  | 'destructuring' // 解构赋值
  | 'arrow'      // 箭头函数
  | 'method';    // 方法

/**
 * 变量使用情况
 */
export interface VariableUsage {
  /** 使用类型 */
  type: UsageType;
  /** 使用位置 */
  location: {
    line: number;
    column: number;
  };
  /** 使用上下文 */
  context: string;
  /** 是否为赋值操作 */
  isAssignment: boolean;
  /** 是否为读取操作 */
  isRead: boolean;
  /** 是否为函数调用 */
  isFunctionCall: boolean;
  /** 是否为属性访问 */
  isPropertyAccess: boolean;
  /** 是否为数组访问 */
  isArrayAccess: boolean;
  /** 是否为条件判断 */
  isConditional: boolean;
  /** 是否为循环变量 */
  isLoopVariable: boolean;
  /** 使用频率 */
  frequency: 'high' | 'medium' | 'low';
}

/**
 * 使用类型
 */
export type UsageType = 
  | 'declaration'    // 声明
  | 'assignment'     // 赋值
  | 'read'           // 读取
  | 'function_call'  // 函数调用
  | 'property_access' // 属性访问
  | 'array_access'   // 数组访问
  | 'conditional'    // 条件判断
  | 'loop'           // 循环
  | 'return'         // 返回
  | 'parameter'      // 参数传递
  | 'destructuring'  // 解构
  | 'spread'         // 展开
  | 'other';         // 其他

/**
 * 变量类型信息
 */
export interface VariableTypeInfo {
  /** 基础类型 */
  baseType: string;
  /** 是否为数组 */
  isArray: boolean;
  /** 是否为对象 */
  isObject: boolean;
  /** 是否为函数 */
  isFunction: boolean;
  /** 是否为类 */
  isClass: boolean;
  /** 是否为接口 */
  isInterface: boolean;
  /** 是否为枚举 */
  isEnum: boolean;
  /** 是否为联合类型 */
  isUnion: boolean;
  /** 是否为交叉类型 */
  isIntersection: boolean;
  /** 是否为泛型 */
  isGeneric: boolean;
  /** 泛型参数 */
  genericParams?: string[];
  /** 属性列表（对象类型） */
  properties?: PropertyInfo[];
  /** 方法列表（对象类型） */
  methods?: MethodInfo[];
  /** 数组元素类型 */
  arrayElementType?: string;
  /** 联合类型成员 */
  unionMembers?: string[];
  /** 类型参数 */
  typeParams?: TypeParameterInfo[];
}

/**
 * 属性信息
 */
export interface PropertyInfo {
  /** 属性名 */
  name: string;
  /** 属性类型 */
  type: string;
  /** 是否可选 */
  optional: boolean;
  /** 是否只读 */
  readonly: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 描述 */
  description?: string;
}

/**
 * 方法信息
 */
export interface MethodInfo {
  /** 方法名 */
  name: string;
  /** 参数列表 */
  parameters: ParameterInfo[];
  /** 返回类型 */
  returnType: string;
  /** 是否异步 */
  isAsync: boolean;
  /** 是否生成器 */
  isGenerator: boolean;
  /** 是否静态 */
  isStatic: boolean;
  /** 是否私有 */
  isPrivate: boolean;
  /** 描述 */
  description?: string;
}

/**
 * 参数信息
 */
export interface ParameterInfo {
  /** 参数名 */
  name: string;
  /** 参数类型 */
  type: string;
  /** 是否可选 */
  optional: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 是否为剩余参数 */
  isRest: boolean;
  /** 描述 */
  description?: string;
}

/**
 * 类型参数信息
 */
export interface TypeParameterInfo {
  /** 参数名 */
  name: string;
  /** 约束类型 */
  constraint?: string;
  /** 默认类型 */
  defaultType?: string;
  /** 是否协变 */
  covariant: boolean;
  /** 是否逆变 */
  contravariant: boolean;
}