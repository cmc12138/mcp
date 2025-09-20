/**
 * 基本使用示例
 * 演示如何使用前端分析MCP服务器
 */

import { FrontendAnalysisMCPServer } from '../src/server/index.js';
import { FrontendCodeAnalyzer } from '../src/analyzer/index.js';
import * as path from 'path';

async function main() {
  try {
    // 创建MCP服务器
    const server = new FrontendAnalysisMCPServer();
    
    // 创建代码分析器
    const projectPath = path.join(__dirname, '../tests/fixtures/test-project');
    const analyzer = new FrontendCodeAnalyzer(projectPath);
    
    // 设置分析器
    server.setAnalyzer(analyzer);
    
    // 启动服务器
    console.log('启动MCP服务器...');
    await server.run();
    
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

// 运行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}