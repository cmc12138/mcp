/**
 * 高级使用示例
 * 演示如何使用前端分析MCP服务器的各种功能
 */

import { FrontendCodeAnalyzer } from '../src/analyzer/index.js';
import { ToolHandler } from '../src/server/ToolHandler.js';
import { ResourceHandler } from '../src/server/ResourceHandler.js';
import * as path from 'path';

async function advancedExample() {
  try {
    // 创建代码分析器
    const projectPath = path.join(__dirname, '../tests/fixtures/test-project');
    const analyzer = new FrontendCodeAnalyzer(projectPath);
    
    // 分析项目
    console.log('分析项目...');
    const projectInfo = await analyzer.analyzeProject();
    
    console.log('项目信息:');
    console.log(`- 名称: ${projectInfo.name}`);
    console.log(`- 框架: ${projectInfo.framework}`);
    console.log(`- 文件数: ${projectInfo.files.length}`);
    console.log(`- 总行数: ${projectInfo.stats.totalLines}`);
    console.log(`- 变量数: ${projectInfo.stats.totalVariables}`);
    console.log(`- 函数数: ${projectInfo.stats.totalFunctions}`);
    console.log(`- 组件数: ${projectInfo.stats.totalComponents}`);
    
    // 创建工具处理器
    const toolHandler = new ToolHandler();
    
    // 演示工具调用
    console.log('\n演示工具调用:');
    
    // 1. 分析项目
    const analyzeResult = await toolHandler.handleToolCall(
      'analyze_project',
      { projectPath },
      analyzer
    );
    console.log('项目分析结果:', analyzeResult.content[0].text.substring(0, 200) + '...');
    
    // 2. 获取变量信息
    const variableResult = await toolHandler.handleToolCall(
      'get_variable_info',
      { variableName: 'count', filePath: path.join(projectPath, 'src/App.jsx') },
      analyzer
    );
    console.log('变量信息:', variableResult.content[0].text.substring(0, 200) + '...');
    
    // 3. 生成流程图
    const diagramResult = await toolHandler.handleToolCall(
      'generate_flow_diagram',
      { filePath: path.join(projectPath, 'src/App.jsx'), diagramType: 'control_flow' },
      analyzer
    );
    console.log('流程图:', diagramResult.content[0].text);
    
    // 创建资源处理器
    const resourceHandler = new ResourceHandler();
    
    // 演示资源访问
    console.log('\n演示资源访问:');
    
    // 1. 获取项目结构
    const structureResult = await resourceHandler.handleResourceRead(
      'project://structure',
      analyzer
    );
    console.log('项目结构资源:', structureResult.contents[0].text.substring(0, 200) + '...');
    
    // 2. 获取变量信息
    const variablesResult = await resourceHandler.handleResourceRead(
      'project://variables',
      analyzer
    );
    console.log('变量信息资源:', variablesResult.contents[0].text.substring(0, 200) + '...');
    
    // 3. 获取统计信息
    const statisticsResult = await resourceHandler.handleResourceRead(
      'project://statistics',
      analyzer
    );
    console.log('统计信息资源:', statisticsResult.contents[0].text.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('示例运行失败:', error);
  }
}

// 运行高级示例
if (import.meta.url === `file://${process.argv[1]}`) {
  advancedExample();
}