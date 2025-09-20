/**
 * 日志工具
 * 提供统一的日志记录功能
 */

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * 日志记录器类
 */
export class Logger {
  private static instance: Logger;
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = LogLevel.INFO, prefix: string = '') {
    this.level = level;
    this.prefix = prefix;
  }

  /**
   * 获取单例实例
   */
  static getInstance(level?: LogLevel, prefix?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(level, prefix);
    }
    return Logger.instance;
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 设置前缀
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}]` : '';
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `${timestamp} [${level}]${prefix} ${message}${formattedArgs}`;
  }

  /**
   * 记录调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, ...args));
    }
  }

  /**
   * 记录信息日志
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, ...args));
    }
  }

  /**
   * 记录警告日志
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, ...args));
    }
  }

  /**
   * 记录错误日志
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, ...args));
    }
  }

  /**
   * 记录异常日志
   */
  exception(error: Error, message?: string, ...args: any[]): void {
    const errorMessage = message || 'Unhandled exception';
    this.error(`${errorMessage}: ${error.message}`, ...args);
    this.error('Stack trace:', error.stack);
  }

  /**
   * 记录性能日志
   */
  performance(operation: string, duration: number, ...args: any[]): void {
    this.info(`Performance: ${operation} took ${duration}ms`, ...args);
  }

  /**
   * 记录分析日志
   */
  analysis(component: string, action: string, details?: any): void {
    this.info(`Analysis: ${component} - ${action}`, details);
  }

  /**
   * 记录MCP请求日志
   */
  mcpRequest(method: string, params?: any): void {
    this.debug(`MCP Request: ${method}`, params);
  }

  /**
   * 记录MCP响应日志
   */
  mcpResponse(method: string, success: boolean, duration?: number): void {
    const status = success ? 'SUCCESS' : 'FAILED';
    const durationStr = duration ? ` (${duration}ms)` : '';
    this.info(`MCP Response: ${method} - ${status}${durationStr}`);
  }

  /**
   * 记录文件操作日志
   */
  fileOperation(operation: string, filePath: string, success: boolean, details?: any): void {
    const status = success ? 'SUCCESS' : 'FAILED';
    this.info(`File ${operation}: ${filePath} - ${status}`, details);
  }

  /**
   * 记录AST操作日志
   */
  astOperation(operation: string, nodeType: string, success: boolean, details?: any): void {
    const status = success ? 'SUCCESS' : 'FAILED';
    this.debug(`AST ${operation}: ${nodeType} - ${status}`, details);
  }

  /**
   * 记录内存使用日志
   */
  memory(operation: string, usage: NodeJS.MemoryUsage): void {
    this.debug(`Memory ${operation}:`, {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`
    });
  }

  /**
   * 创建子日志记录器
   */
  child(prefix: string): Logger {
    return new Logger(this.level, `${this.prefix}${prefix ? `:${prefix}` : ''}`);
  }

  /**
   * 创建性能计时器
   */
  timer(operation: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.performance(operation, duration);
    };
  }

  /**
   * 创建分析计时器
   */
  analysisTimer(component: string, action: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.analysis(component, action, { duration });
    };
  }
}

/**
 * 默认日志记录器实例
 */
export const logger = Logger.getInstance();

/**
 * 创建日志记录器
 */
export function createLogger(level?: LogLevel, prefix?: string): Logger {
  return new Logger(level, prefix);
}

/**
 * 设置全局日志级别
 */
export function setGlobalLogLevel(level: LogLevel): void {
  logger.setLevel(level);
}

/**
 * 设置全局日志前缀
 */
export function setGlobalLogPrefix(prefix: string): void {
  logger.setPrefix(prefix);
}