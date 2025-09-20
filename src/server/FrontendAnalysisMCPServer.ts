/**
 * 前端分析MCP服务器
 * 基于Model Context Protocol的前端代码分析工具
 */

import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Server,
  StdioServerTransport,
} from '@modelcontextprotocol/sdk';
import { FrontendCodeAnalyzer } from '../analyzer/index';
import { ResourceHandler } from './ResourceHandler';
import { ToolHandler } from './ToolHandler';

/**
 * 前端分析MCP服务器类
 */
export class FrontendAnalysisMCPServer {
  private server: Server;
  private analyzer: FrontendCodeAnalyzer | null = null;
  private toolHandler: ToolHandler;
  private resourceHandler: ResourceHandler;

  constructor() {
    this.server = new Server({
      name: 'frontend-analysis-mcp',
      version: '1.0.0',
      capabilities: {
        tools: {},
        resources: {},
      },
    });

    this.toolHandler = new ToolHandler();
    this.resourceHandler = new ResourceHandler();
    this.setupHandlers();
  }

  /**
   * 设置请求处理器
   */
  private setupHandlers(): void {
    // 工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.toolHandler.getTools(),
      };
    });

    // 资源列表处理器
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: this.resourceHandler.getResources(),
      };
    });

    // 工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        return await this.toolHandler.handleToolCall(name, args, this.analyzer);
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });

    // 资源读取处理器
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
      const { uri } = request.params;

      try {
        return await this.resourceHandler.handleResourceRead(uri, this.analyzer);
      } catch (error) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  /**
   * 运行服务器
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('前端分析MCP服务器已启动');
  }

  /**
   * 设置分析器
   */
  setAnalyzer(analyzer: FrontendCodeAnalyzer): void {
    this.analyzer = analyzer;
  }

  /**
   * 获取分析器
   */
  getAnalyzer(): FrontendCodeAnalyzer | null {
    return this.analyzer;
  }
}
