/**
 * 文件工具函数
 * 提供文件操作相关的工具函数
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 文件工具类
 */
export class FileUtils {
  /**
   * 检查文件是否存在
   */
  static exists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * 检查是否为目录
   */
  static isDirectory(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * 检查是否为文件
   */
  static isFile(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }

  /**
   * 读取文件内容
   */
  static readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): string {
    try {
      return fs.readFileSync(filePath, encoding);
    } catch (error) {
      throw new Error(
        `无法读取文件 ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 写入文件内容
   */
  static writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): void {
    try {
      fs.writeFileSync(filePath, content, encoding);
    } catch (error) {
      throw new Error(
        `无法写入文件 ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取文件统计信息
   */
  static getFileStats(filePath: string): fs.Stats {
    try {
      return fs.statSync(filePath);
    } catch (error) {
      throw new Error(
        `无法获取文件统计信息 ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取文件扩展名
   */
  static getExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }

  /**
   * 获取文件名（不含扩展名）
   */
  static getBasename(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * 获取目录名
   */
  static getDirname(filePath: string): string {
    return path.dirname(filePath);
  }

  /**
   * 规范化路径
   */
  static normalizePath(filePath: string): string {
    return path.normalize(filePath);
  }

  /**
   * 解析路径
   */
  static parsePath(filePath: string): path.ParsedPath {
    return path.parse(filePath);
  }

  /**
   * 连接路径
   */
  static joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
   * 解析相对路径
   */
  static resolvePath(from: string, to: string): string {
    return path.resolve(from, to);
  }

  /**
   * 检查路径是否为绝对路径
   */
  static isAbsolute(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }

  /**
   * 获取相对路径
   */
  static getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * 递归读取目录
   */
  static readDirectoryRecursive(
    dirPath: string,
    options?: {
      includeHidden?: boolean;
      maxDepth?: number;
      filter?: (filePath: string, stats: fs.Stats) => boolean;
    }
  ): string[] {
    const files: string[] = [];
    const { includeHidden = false, maxDepth = Infinity, filter } = options || {};

    const readDir = (currentPath: string, depth: number = 0): void => {
      if (depth >= maxDepth) return;

      try {
        const items = fs.readdirSync(currentPath);

        for (const item of items) {
          if (!includeHidden && item.startsWith('.')) continue;

          const fullPath = path.join(currentPath, item);
          const stats = fs.statSync(fullPath);

          if (stats.isDirectory()) {
            readDir(fullPath, depth + 1);
          } else if (stats.isFile()) {
            if (!filter || filter(fullPath, stats)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // 忽略无法访问的目录
      }
    };

    readDir(dirPath);
    return files;
  }

  /**
   * 查找文件
   */
  static findFiles(dirPath: string, pattern: RegExp | string): string[] {
    const files = this.readDirectoryRecursive(dirPath);

    if (typeof pattern === 'string') {
      return files.filter(file => file.includes(pattern));
    } else {
      return files.filter(file => pattern.test(file));
    }
  }

  /**
   * 查找特定扩展名的文件
   */
  static findFilesByExtension(dirPath: string, extensions: string[]): string[] {
    const files = this.readDirectoryRecursive(dirPath);
    return files.filter(file => {
      const ext = this.getExtension(file);
      return extensions.includes(ext);
    });
  }

  /**
   * 获取文件大小（字节）
   */
  static getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch {
      return 0;
    }
  }

  /**
   * 获取文件行数
   */
  static getFileLineCount(filePath: string): number {
    try {
      const content = this.readFile(filePath);
      return content.split('\n').length;
    } catch {
      return 0;
    }
  }

  /**
   * 检查文件是否为空
   */
  static isEmpty(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      return stats.size === 0;
    } catch {
      return true;
    }
  }

  /**
   * 创建目录
   */
  static createDirectory(dirPath: string, recursive: boolean = true): void {
    try {
      fs.mkdirSync(dirPath, { recursive });
    } catch (error) {
      throw new Error(
        `无法创建目录 ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 删除文件
   */
  static deleteFile(filePath: string): void {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      throw new Error(
        `无法删除文件 ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 删除目录
   */
  static deleteDirectory(dirPath: string, recursive: boolean = true): void {
    try {
      if (recursive) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      } else {
        fs.rmdirSync(dirPath);
      }
    } catch (error) {
      throw new Error(
        `无法删除目录 ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 复制文件
   */
  static copyFile(sourcePath: string, destPath: string): void {
    try {
      fs.copyFileSync(sourcePath, destPath);
    } catch (error) {
      throw new Error(
        `无法复制文件 ${sourcePath} 到 ${destPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 移动文件
   */
  static moveFile(sourcePath: string, destPath: string): void {
    try {
      fs.renameSync(sourcePath, destPath);
    } catch (error) {
      throw new Error(
        `无法移动文件 ${sourcePath} 到 ${destPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取文件修改时间
   */
  static getModifiedTime(filePath: string): Date {
    try {
      return fs.statSync(filePath).mtime;
    } catch (error) {
      throw new Error(
        `无法获取文件修改时间 ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取文件创建时间
   */
  static getCreatedTime(filePath: string): Date {
    try {
      return fs.statSync(filePath).birthtime;
    } catch (error) {
      throw new Error(
        `无法获取文件创建时间 ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 检查文件权限
   */
  static checkPermissions(filePath: string): {
    readable: boolean;
    writable: boolean;
    executable: boolean;
  } {
    let readable = false;
    let writable = false;
    let executable = false;

    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      readable = true;
    } catch {
      readable = false;
    }

    try {
      fs.accessSync(filePath, fs.constants.W_OK);
      writable = true;
    } catch {
      writable = false;
    }

    try {
      fs.accessSync(filePath, fs.constants.X_OK);
      executable = true;
    } catch {
      executable = false;
    }

    return { readable, writable, executable };
  }
}
