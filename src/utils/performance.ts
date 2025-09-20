/**
 * 性能优化工具
 * 提供缓存、并行处理、内存优化等功能
 */

import * as fs from 'fs';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage: NodeJS.MemoryUsage;
  cacheHits: number;
  cacheMisses: number;
}

export interface ParallelTask<T> {
  id: string;
  task: () => Promise<T>;
  priority: number;
}

/**
 * 性能优化器类
 */
export class PerformanceOptimizer {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: PerformanceMetrics[] = [];
  private maxCacheSize = 1000;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * 带缓存的异步操作
   */
  async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.getFromCache<T>(key);
    if (cached !== null) {
      this.recordCacheHit();
      return cached;
    }

    this.recordCacheMiss();
    const result = await operation();
    this.setCache(key, result, ttl);
    return result;
  }

  /**
   * 并行处理文件
   */
  async processFilesParallel<T>(
    files: string[],
    processor: (filePath: string) => Promise<T>,
    concurrency: number = 5
  ): Promise<T[]> {
    const chunks = this.chunkArray(files, concurrency);
    const results: T[] = [];

    for (const chunk of chunks) {
      const promises = chunk.map(file => processor(file));
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * 并行处理任务
   */
  async processTasksParallel<T>(
    tasks: ParallelTask<T>[],
    concurrency: number = 5
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const sortedTasks = tasks.sort((a, b) => b.priority - a.priority);
    const chunks = this.chunkArray(sortedTasks, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async task => {
        const result = await task.task();
        return { id: task.id, result };
      });

      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(({ id, result }) => {
        results.set(id, result);
      });
    }

    return results;
  }

  /**
   * 流式处理大文件
   */
  async processLargeFile<T>(
    filePath: string,
    processor: (chunk: string) => T,
    chunkSize: number = 1024 * 1024 // 1MB
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      let buffer = '';

      stream.on('data', (chunk: string) => {
        buffer += chunk;

        // 按行分割处理
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

        lines.forEach(line => {
          if (line.trim()) {
            try {
              const result = processor(line);
              results.push(result);
            } catch (error) {
              console.warn(`处理行时出错: ${error}`);
            }
          }
        });
      });

      stream.on('end', () => {
        // 处理最后一行
        if (buffer.trim()) {
          try {
            const result = processor(buffer);
            results.push(result);
          } catch (error) {
            console.warn(`处理最后一行时出错: ${error}`);
          }
        }
        resolve(results);
      });

      stream.on('error', reject);
    });
  }

  /**
   * 内存优化：对象池
   */
  createObjectPool<T>(factory: () => T, reset: (obj: T) => void, maxSize: number = 100) {
    const pool: T[] = [];
    let size = 0;

    return {
      acquire(): T {
        if (pool.length > 0) {
          return pool.pop()!;
        }
        size++;
        return factory();
      },

      release(obj: T): void {
        if (size < maxSize) {
          reset(obj);
          pool.push(obj);
        } else {
          size--;
        }
      },

      getSize(): number {
        return size;
      },

      getPoolSize(): number {
        return pool.length;
      },
    };
  }

  /**
   * 批量操作优化
   */
  async batchProcess<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 10
  ): Promise<R[]> {
    const batches = this.chunkArray(items, batchSize);
    const results: R[] = [];

    for (const batch of batches) {
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 防抖函数
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * 节流函数
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * 性能监控
   */
  startTimer(): PerformanceMetrics {
    const startTime = Date.now();
    const memoryUsage = process.memoryUsage();

    return {
      startTime,
      endTime: 0,
      duration: 0,
      memoryUsage,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * 结束计时
   */
  endTimer(metrics: PerformanceMetrics): PerformanceMetrics {
    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.memoryUsage = process.memoryUsage();

    this.metrics.push(metrics);
    return metrics;
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats(): {
    averageDuration: number;
    totalCacheHits: number;
    totalCacheMisses: number;
    cacheHitRate: number;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const totalHits = this.metrics.reduce((sum, m) => sum + m.cacheHits, 0);
    const totalMisses = this.metrics.reduce((sum, m) => sum + m.cacheMisses, 0);

    return {
      averageDuration: this.metrics.length > 0 ? totalDuration / this.metrics.length : 0,
      totalCacheHits: totalHits,
      totalCacheMisses: totalMisses,
      cacheHitRate: totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0,
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 设置缓存
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 从缓存获取
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 记录缓存命中
   */
  private recordCacheHit(): void {
    // 这里可以添加更详细的统计逻辑
  }

  /**
   * 记录缓存未命中
   */
  private recordCacheMiss(): void {
    // 这里可以添加更详细的统计逻辑
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

/**
 * 全局性能优化器实例
 */
export const performanceOptimizer = new PerformanceOptimizer();
