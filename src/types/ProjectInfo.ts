/**
 * 项目信息类型定义
 * 定义前端项目分析结果的数据结构
 */

import type { DependencyInfo } from './DependencyInfo';
import type { FileInfo } from './FileInfo';

/**
 * 项目整体信息
 */
export interface ProjectInfo {
  /** 项目名称 */
  name: string;
  /** 前端框架类型 */
  framework: 'react' | 'vue' | 'angular' | 'vanilla' | 'unknown';
  /** 项目版本 */
  version?: string;
  /** 项目描述 */
  description?: string;
  /** 文件列表 */
  files: FileInfo[];
  /** 依赖信息 */
  dependencies: DependencyInfo[];
  /** 项目根路径 */
  rootPath: string;
  /** 分析时间 */
  analyzedAt: Date;
  /** 分析耗时（毫秒） */
  analysisDuration: number;
  /** 项目统计信息 */
  stats: ProjectStats;
}

/**
 * 项目统计信息
 */
export interface ProjectStats {
  /** 总文件数 */
  totalFiles: number;
  /** 源代码文件数 */
  sourceFiles: number;
  /** 总行数 */
  totalLines: number;
  /** 总变量数 */
  totalVariables: number;
  /** 总函数数 */
  totalFunctions: number;
  /** 总组件数 */
  totalComponents: number;
  /** 平均文件大小（行数） */
  averageFileSize: number;
  /** 最大文件大小（行数） */
  maxFileSize: number;
  /** 最小文件大小（行数） */
  minFileSize: number;
}
