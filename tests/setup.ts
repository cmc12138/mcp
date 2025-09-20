/**
 * 测试设置文件
 * 配置测试环境
 */

import { setGlobalLogLevel } from '../src/utils/logger';

// 设置测试环境日志级别
setGlobalLogLevel(0); // DEBUG level for tests

// 设置测试超时时间
// jest.setTimeout(10000);

// 全局测试配置
// beforeAll(() => {
//   // 测试开始前的设置
// });

// afterAll(() => {
//   // 测试结束后的清理
// });

// beforeEach(() => {
//   // 每个测试前的设置
// });

// afterEach(() => {
//   // 每个测试后的清理
// });
