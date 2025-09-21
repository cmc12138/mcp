/**
 * MCP服务器集成测试
 */

import * as path from 'path';
import { FrontendAnalysisMCPServer } from '../../src/server/FrontendAnalysisMCPServer';

// 模拟MCP客户端
class MockMCPClient {
  private server: FrontendAnalysisMCPServer;

  constructor(server: FrontendAnalysisMCPServer) {
    this.server = server;
  }

  async callTool(name: string, arguments_: any) {
    return await this.server.handleToolCall(name, arguments_);
  }

  async getResource(uri: string) {
    return await this.server.handleResourceRequest(uri);
  }
}

describe('MCP服务器集成测试', () => {
  let server: FrontendAnalysisMCPServer;
  let client: MockMCPClient;
  const testProjectPath = path.join(__dirname, '../fixtures/test-project');

  beforeEach(() => {
    server = new FrontendAnalysisMCPServer();
    client = new MockMCPClient(server);
  });

  describe('工具调用流程', () => {
    it('should handle analyze_project tool call', async () => {
      const result = await client.callTool('analyze_project', {
        projectPath: testProjectPath,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    it('should handle analyze_file tool call', async () => {
      const testFilePath = path.join(testProjectPath, 'src/App.jsx');

      const result = await client.callTool('analyze_file', {
        filePath: testFilePath,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle get_project_structure tool call', async () => {
      const result = await client.callTool('get_project_structure', {
        projectPath: testProjectPath,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle get_dependencies tool call', async () => {
      const result = await client.callTool('get_dependencies', {
        projectPath: testProjectPath,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle get_components tool call', async () => {
      const result = await client.callTool('get_components', {
        projectPath: testProjectPath,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle get_functions tool call', async () => {
      const result = await client.callTool('get_functions', {
        projectPath: testProjectPath,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle get_variables tool call', async () => {
      const result = await client.callTool('get_variables', {
        projectPath: testProjectPath,
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle generate_flow_diagram tool call', async () => {
      const result = await client.callTool('generate_flow_diagram', {
        projectPath: testProjectPath,
        diagramType: 'control_flow',
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    it('should handle invalid tool calls gracefully', async () => {
      const result = await client.callTool('invalid_tool', {
        someParam: 'value',
      });

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
    });
  });

  describe('资源访问流程', () => {
    it('should handle file resource requests', async () => {
      const testFilePath = path.join(testProjectPath, 'src/App.jsx');
      const uri = `file://${testFilePath}`;

      const result = await client.getResource(uri);

      expect(result).toBeDefined();
      expect(result.contents).toBeDefined();
    });

    it('should handle directory resource requests', async () => {
      const uri = `file://${testProjectPath}`;

      const result = await client.getResource(uri);

      expect(result).toBeDefined();
      expect(result.contents).toBeDefined();
    });

    it('should handle invalid resource requests gracefully', async () => {
      const uri = 'file:///invalid/path';

      const result = await client.getResource(uri);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
    });
  });

  describe('错误处理流程', () => {
    it('should handle invalid project path', async () => {
      const result = await client.callTool('analyze_project', {
        projectPath: '/invalid/path',
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].framework).toBe('unknown');
      expect(result.content[0].name).toBe('path');
    });

    it('should handle missing parameters', async () => {
      const result = await client.callTool('analyze_project', {});

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
    });

    it('should handle malformed file content', async () => {
      const result = await client.callTool('analyze_file', {
        filePath: '/path/to/malformed/file.js',
      });

      expect(result).toBeDefined();
      // 应该能够处理错误而不崩溃
    });
  });

  describe('端到端工作流', () => {
    it('should complete full analysis workflow', async () => {
      // 1. 分析项目
      const projectResult = await client.callTool('analyze_project', {
        projectPath: testProjectPath,
      });
      expect(projectResult).toBeDefined();

      // 2. 获取项目结构
      const structureResult = await client.callTool('get_project_structure', {
        projectPath: testProjectPath,
      });
      expect(structureResult).toBeDefined();

      // 3. 获取依赖
      const depsResult = await client.callTool('get_dependencies', {
        projectPath: testProjectPath,
      });
      expect(depsResult).toBeDefined();

      // 4. 获取组件
      const componentsResult = await client.callTool('get_components', {
        projectPath: testProjectPath,
      });
      expect(componentsResult).toBeDefined();

      // 5. 获取函数
      const functionsResult = await client.callTool('get_functions', {
        projectPath: testProjectPath,
      });
      expect(functionsResult).toBeDefined();

      // 6. 获取变量
      const variablesResult = await client.callTool('get_variables', {
        projectPath: testProjectPath,
      });
      expect(variablesResult).toBeDefined();

      // 7. 生成流程图
      const diagramResult = await client.callTool('generate_flow_diagram', {
        projectPath: testProjectPath,
        diagramType: 'control_flow',
      });
      expect(diagramResult).toBeDefined();
    });

    it('should handle concurrent tool calls', async () => {
      const promises = [
        client.callTool('analyze_project', { projectPath: testProjectPath }),
        client.callTool('get_project_structure', { projectPath: testProjectPath }),
        client.callTool('get_dependencies', { projectPath: testProjectPath }),
        client.callTool('get_components', { projectPath: testProjectPath }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('性能测试', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();

      const result = await client.callTool('analyze_project', {
        projectPath: testProjectPath,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成
    });

    it('should handle large projects efficiently', async () => {
      // 这里可以添加大项目的测试
      const result = await client.callTool('analyze_project', {
        projectPath: testProjectPath,
      });

      expect(result).toBeDefined();
    });
  });
});
