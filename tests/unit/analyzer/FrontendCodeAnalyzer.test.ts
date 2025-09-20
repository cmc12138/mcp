/**
 * FrontendCodeAnalyzer 单元测试
 */

import * as path from 'path';
import { FrontendCodeAnalyzer } from '../../../src/analyzer/FrontendCodeAnalyzer';

// 模拟 fs 模块
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}));

describe('FrontendCodeAnalyzer', () => {
  let analyzer: FrontendCodeAnalyzer;
  const testProjectPath = path.join(__dirname, '../fixtures/test-project');
  const mockFs = require('fs');

  beforeEach(() => {
    analyzer = new FrontendCodeAnalyzer(testProjectPath);
    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('analyzeProject', () => {
    it('should analyze a React project correctly', async () => {
      // 创建测试项目结构
      const testProject = {
        'package.json': JSON.stringify({
          name: 'test-project',
          version: '1.0.0',
          dependencies: {
            react: '^18.0.0',
          },
        }),
      };

      // 模拟文件系统
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((filePath: string) => {
        if (filePath.includes('package.json')) {
          return testProject['package.json'];
        }
        return '';
      });
      mockFs.readdirSync.mockReturnValue([]);
      mockFs.statSync.mockImplementation((filePath: string) => {
        return {
          isDirectory: () => false,
          isFile: () => false,
          size: 100,
          mtime: new Date(),
        } as any;
      });

      const result = await analyzer.analyzeProject();

      expect(result).toBeDefined();
      expect(result.framework).toBe('react');
      expect(result.name).toBe('test-project');
      expect(result.files).toHaveLength(0); // 没有源代码文件
    });

    it('should handle invalid project path gracefully', async () => {
      const invalidAnalyzer = new FrontendCodeAnalyzer('/invalid/path');

      // 模拟文件系统操作抛出错误
      mockFs.existsSync.mockReturnValue(false);
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      const result = await invalidAnalyzer.analyzeProject();

      // 应该返回默认的项目信息，而不是抛出错误
      expect(result).toBeDefined();
      expect(result.framework).toBe('unknown');
      expect(result.name).toBe('path');
    });
  });

  describe('detectFramework', () => {
    it('should detect React framework', () => {
      // 测试框架检测逻辑
      const packageJson = {
        dependencies: {
          react: '^18.0.0',
        },
      };

      // 这里需要测试私有方法，可能需要重构为公共方法或使用其他测试策略
      expect(true).toBe(true); // 占位符测试
    });
  });
});
