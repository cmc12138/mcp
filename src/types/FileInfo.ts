/**
 * 文件信息类型定义
 * 定义文件分析结果的数据结构
 */

import type { ComponentInfo } from './ComponentInfo';
import type { FunctionInfo } from './FunctionInfo';
import type { VariableInfo } from './VariableInfo';

/**
 * 文件信息
 */
export interface FileInfo {
  /** 文件路径 */
  path: string;
  /** 文件类型 */
  type: FileType;
  /** 文件大小（字节） */
  size: number;
  /** 行数 */
  lines: number;
  /** 变量列表 */
  variables: VariableInfo[];
  /** 函数列表 */
  functions: FunctionInfo[];
  /** 组件列表 */
  components: ComponentInfo[];
  /** 导入语句 */
  imports: ImportInfo[];
  /** 导出语句 */
  exports: ExportInfo[];
  /** 文件依赖 */
  dependencies: string[];
  /** 最后修改时间 */
  lastModified: Date;
  /** 文件编码 */
  encoding: string;
}

/**
 * 文件类型枚举
 */
export type FileType =
  | 'component' // 组件文件
  | 'page' // 页面文件
  | 'util' // 工具文件
  | 'service' // 服务文件
  | 'store' // 状态管理文件
  | 'config' // 配置文件
  | 'test' // 测试文件
  | 'style' // 样式文件
  | 'other'; // 其他文件

/**
 * 导入信息
 */
export interface ImportInfo {
  /** 导入的模块名 */
  module: string;
  /** 导入的变量名 */
  variables: string[];
  /** 导入类型 */
  type: 'default' | 'named' | 'namespace' | 'side-effect';
  /** 导入路径 */
  path: string;
  /** 行号 */
  line: number;
  /** 列号 */
  column: number;
}

/**
 * 导出信息
 */
export interface ExportInfo {
  /** 导出的变量名 */
  name: string;
  /** 导出类型 */
  type: 'default' | 'named' | 'namespace';
  /** 是否为重新导出 */
  isReExport: boolean;
  /** 原始模块（重新导出时） */
  fromModule?: string;
  /** 行号 */
  line: number;
  /** 列号 */
  column: number;
}
