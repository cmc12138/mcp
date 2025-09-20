/**
 * 错误类型定义
 * 定义项目中使用的各种错误类型
 */

/**
 * 基础分析错误类
 */
export class AnalysisError extends Error {
  public readonly code: string;
  public readonly context?: any;

  constructor(
    message: string,
    code: string,
    context?: any
  ) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
    this.context = context;
  }
}

/**
 * 解析错误
 */
export class ParseError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'PARSE_ERROR', context);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

/**
 * 文件错误
 */
export class FileError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'FILE_ERROR', context);
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'NETWORK_ERROR', context);
  }
}

/**
 * 配置错误
 */
export class ConfigError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'CONFIG_ERROR', context);
  }
}

/**
 * 权限错误
 */
export class PermissionError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'PERMISSION_ERROR', context);
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'TIMEOUT_ERROR', context);
  }
}

/**
 * 内存错误
 */
export class MemoryError extends AnalysisError {
  constructor(message: string, context?: any) {
    super(message, 'MEMORY_ERROR', context);
  }
}

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 解析错误
  PARSE_ERROR = 'PARSE_ERROR',
  INVALID_SYNTAX = 'INVALID_SYNTAX',
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
  
  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // 文件错误
  FILE_ERROR = 'FILE_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  FILE_PERMISSION_ERROR = 'FILE_PERMISSION_ERROR',
  
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
  
  // 配置错误
  CONFIG_ERROR = 'CONFIG_ERROR',
  INVALID_CONFIG = 'INVALID_CONFIG',
  MISSING_CONFIG = 'MISSING_CONFIG',
  
  // 权限错误
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INSUFFICIENT_PRIVILEGES = 'INSUFFICIENT_PRIVILEGES',
  
  // 内存错误
  MEMORY_ERROR = 'MEMORY_ERROR',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  MEMORY_LEAK = 'MEMORY_LEAK',
  
  // 其他错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  DEPRECATED = 'DEPRECATED'
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  /** 错误代码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 错误严重程度 */
  severity: ErrorSeverity;
  /** 错误上下文 */
  context?: any;
  /** 错误堆栈 */
  stack?: string;
  /** 错误时间 */
  timestamp: Date;
  /** 错误来源 */
  source?: string;
  /** 错误位置 */
  location?: {
    file: string;
    line: number;
    column: number;
  };
}

/**
 * 错误处理器接口
 */
export interface ErrorHandler {
  /** 处理错误 */
  handle(error: Error): void;
  /** 处理分析错误 */
  handleAnalysisError(error: AnalysisError): void;
  /** 格式化错误信息 */
  formatError(error: Error): string;
  /** 记录错误 */
  logError(error: Error, context?: any): void;
}

/**
 * 错误处理工具类
 */
export class ErrorUtils {
  /**
   * 创建错误信息
   */
  static createErrorInfo(
    error: Error,
    code: string = ErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: any
  ): ErrorInfo {
    return {
      code,
      message: error.message,
      severity,
      context,
      stack: error.stack,
      timestamp: new Date(),
      source: error.name
    };
  }

  /**
   * 格式化错误信息
   */
  static formatError(error: Error): string {
    if (error instanceof AnalysisError) {
      return `[${error.code}] ${error.message}${error.context ? `\nContext: ${JSON.stringify(error.context, null, 2)}` : ''}`;
    }
    return `${error.name}: ${error.message}`;
  }

  /**
   * 检查是否为特定错误类型
   */
  static isErrorType(error: Error, errorType: string): boolean {
    return error.name === errorType || (error as any).code === errorType;
  }

  /**
   * 获取错误代码
   */
  static getErrorCode(error: Error): string {
    if (error instanceof AnalysisError) {
      return error.code;
    }
    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * 检查错误是否可恢复
   */
  static isRecoverable(error: Error): boolean {
    const recoverableCodes = [
      ErrorCode.TIMEOUT_ERROR,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.CONNECTION_ERROR
    ];
    return recoverableCodes.includes(this.getErrorCode(error) as ErrorCode);
  }

  /**
   * 检查错误是否致命
   */
  static isFatal(error: Error): boolean {
    const fatalCodes = [
      ErrorCode.OUT_OF_MEMORY,
      ErrorCode.MEMORY_LEAK,
      ErrorCode.INTERNAL_ERROR
    ];
    return fatalCodes.includes(this.getErrorCode(error) as ErrorCode);
  }
}