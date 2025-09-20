/**
 * 错误处理工具
 * 提供统一的错误处理功能
 */

import {
  AnalysisError,
  ErrorCode,
  ErrorInfo,
  ErrorSeverity,
  FileError,
  ErrorHandler as IErrorHandler,
  ParseError,
  ValidationError,
} from '../types/errors';
import { logger } from './logger';

/**
 * 错误处理器类
 */
export class ErrorHandler implements IErrorHandler {
  private static instance: ErrorHandler;

  constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   */
  handle(error: Error): void {
    this.logError(error);
  }

  /**
   * 处理分析错误
   */
  handleAnalysisError(error: AnalysisError): void {
    logger.error(`Analysis Error [${error.code}]: ${error.message}`, error.context);
  }

  /**
   * 格式化错误信息
   */
  formatError(error: Error): string {
    if (error instanceof AnalysisError) {
      return `[${error.code}] ${error.message}${error.context ? `\nContext: ${JSON.stringify(error.context, null, 2)}` : ''}`;
    }
    return `${error.name}: ${error.message}`;
  }

  /**
   * 记录错误
   */
  logError(error: Error, context?: any): void {
    const errorInfo = this.createErrorInfo(error, context);
    logger.error('Error occurred:', errorInfo);
  }

  /**
   * 创建错误信息
   */
  private createErrorInfo(error: Error, context?: any): ErrorInfo {
    return {
      code: this.getErrorCode(error),
      message: error.message,
      severity: this.getErrorSeverity(error),
      context,
      stack: error.stack,
      timestamp: new Date(),
      source: error.name,
    };
  }

  /**
   * 获取错误代码
   */
  private getErrorCode(error: Error): string {
    if (error instanceof AnalysisError) {
      return error.code;
    }
    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * 获取错误严重程度
   */
  private getErrorSeverity(error: Error): ErrorSeverity {
    if (error instanceof AnalysisError) {
      const code = error.code;
      if (code === ErrorCode.OUT_OF_MEMORY || code === ErrorCode.MEMORY_LEAK) {
        return ErrorSeverity.CRITICAL;
      } else if (code === ErrorCode.INTERNAL_ERROR || code === ErrorCode.PARSE_ERROR) {
        return ErrorSeverity.HIGH;
      } else if (code === ErrorCode.VALIDATION_ERROR || code === ErrorCode.FILE_ERROR) {
        return ErrorSeverity.MEDIUM;
      } else {
        return ErrorSeverity.LOW;
      }
    }
    return ErrorSeverity.MEDIUM;
  }

  /**
   * 包装异步函数以捕获错误
   */
  wrapAsync<T extends any[], R>(fn: (...args: T) => Promise<R>): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error as Error);
        throw error;
      }
    };
  }

  /**
   * 包装同步函数以捕获错误
   */
  wrapSync<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error as Error);
        throw error;
      }
    };
  }

  /**
   * 创建错误处理中间件
   */
  createMiddleware() {
    return (error: Error, req: any, res: any, next: any) => {
      this.handle(error);
      next(error);
    };
  }
}

/**
 * 默认错误处理器实例
 */
export const errorHandler = ErrorHandler.getInstance();

/**
 * 创建错误处理器
 */
export function createErrorHandler(): ErrorHandler {
  return new ErrorHandler();
}

/**
 * 包装异步函数
 */
export function wrapAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return errorHandler.wrapAsync(fn);
}

/**
 * 包装同步函数
 */
export function wrapSync<T extends any[], R>(fn: (...args: T) => R): (...args: T) => R {
  return errorHandler.wrapSync(fn);
}

/**
 * 创建错误处理装饰器
 */
export function handleErrors(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    try {
      const result = method.apply(this, args);

      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          errorHandler.handle(error);
          throw error;
        });
      }

      return result;
    } catch (error) {
      errorHandler.handle(error as Error);
      throw error;
    }
  };
}

/**
 * 创建分析错误
 */
export function createAnalysisError(
  message: string,
  code: string = ErrorCode.UNKNOWN_ERROR,
  context?: any
): AnalysisError {
  return new AnalysisError(message, code, context);
}

/**
 * 创建解析错误
 */
export function createParseError(message: string, context?: any): ParseError {
  return new ParseError(message, context);
}

/**
 * 创建验证错误
 */
export function createValidationError(message: string, context?: any): ValidationError {
  return new ValidationError(message, context);
}

/**
 * 创建文件错误
 */
export function createFileError(message: string, context?: any): FileError {
  return new FileError(message, context);
}

/**
 * 检查错误是否可恢复
 */
export function isRecoverableError(error: Error): boolean {
  const recoverableCodes = [
    ErrorCode.TIMEOUT_ERROR,
    ErrorCode.NETWORK_ERROR,
    ErrorCode.CONNECTION_ERROR,
  ];

  if (error instanceof AnalysisError) {
    return recoverableCodes.includes(error.code as ErrorCode);
  }

  return false;
}

/**
 * 检查错误是否致命
 */
export function isFatalError(error: Error): boolean {
  const fatalCodes = [ErrorCode.OUT_OF_MEMORY, ErrorCode.MEMORY_LEAK, ErrorCode.INTERNAL_ERROR];

  if (error instanceof AnalysisError) {
    return fatalCodes.includes(error.code as ErrorCode);
  }

  return false;
}

/**
 * 重试机制
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries || !isRecoverableError(lastError)) {
        throw lastError;
      }

      logger.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 指数退避
    }
  }

  throw lastError!;
}

/**
 * 超时包装器
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AnalysisError(timeoutMessage, ErrorCode.TIMEOUT_ERROR));
      }, timeoutMs);
    }),
  ]);
}
