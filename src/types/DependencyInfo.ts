/**
 * 依赖信息类型定义
 * 定义项目依赖分析结果的数据结构
 */

/**
 * 依赖信息
 */
export interface DependencyInfo {
  /** 依赖名称 */
  name: string;
  /** 依赖版本 */
  version: string;
  /** 依赖类型 */
  type: 'production' | 'development' | 'peer' | 'optional';
  /** 依赖描述 */
  description?: string;
  /** 依赖来源 */
  source: 'npm' | 'yarn' | 'pnpm' | 'local' | 'git';
  /** 是否已安装 */
  installed: boolean;
  /** 依赖路径 */
  path?: string;
  /** 子依赖 */
  dependencies?: DependencyInfo[];
}