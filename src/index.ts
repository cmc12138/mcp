/**
 * 前端逻辑转AI理解MCP项目入口文件
 * 基于Model Context Protocol的前端代码分析工具
 */

export { FrontendCodeAnalyzer } from './analyzer/index';
export { FrontendAnalysisMCPServer } from './server/index';
export * from './types/index';
export {
  createAnalysisError,
  createErrorHandler,
  createFileError,
  createParseError,
  createValidationError,
  errorHandler,
  handleErrors,
  isFatalError,
  isRecoverableError,
  retry,
  withTimeout,
  wrapAsync,
  wrapSync,
} from './utils/index';

// 启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  const { FrontendAnalysisMCPServer } = await import('./server/index.js');
  const server = new FrontendAnalysisMCPServer();
  server.run().catch(console.error);
}
