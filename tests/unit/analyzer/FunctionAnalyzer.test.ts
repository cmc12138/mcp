/**
 * FunctionAnalyzer 单元测试
 */

import { parse } from '@babel/parser';
import { FunctionAnalyzer } from '../../../src/analyzer/FunctionAnalyzer';

describe('FunctionAnalyzer', () => {
  let analyzer: FunctionAnalyzer;

  beforeEach(() => {
    analyzer = new FunctionAnalyzer();
  });

  describe('analyzeFunctions', () => {
    it('should analyze function declarations correctly', () => {
      const code = `
        function greet(name: string): string {
          return "Hello " + name;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('greet');
      expect(functions[0].type).toBe('function');
      expect(functions[0].parameters).toHaveLength(1);
      expect(functions[0].parameters[0].name).toBe('name');
      expect(functions[0].returnType).toBe('string');
      expect(functions[0].isAsync).toBe(false);
      expect(functions[0].isGenerator).toBe(false);
    });

    it('should analyze arrow functions correctly', () => {
      const code = `
        const add = (a: number, b: number) => a + b;
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('add');
      expect(functions[0].type).toBe('arrow');
      expect(functions[0].parameters).toHaveLength(2);
      expect(functions[0].isArrow).toBe(true);
    });

    it('should analyze async functions correctly', () => {
      const code = `
        async function fetchData(url: string): Promise<any> {
          const response = await fetch(url);
          return response.json();
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('fetchData');
      expect(functions[0].isAsync).toBe(true);
      expect(functions[0].returnType).toBe('object');
    });

    it('should analyze generator functions correctly', () => {
      const code = `
        function* numberGenerator(max: number) {
          for (let i = 0; i < max; i++) {
            yield i;
          }
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('numberGenerator');
      expect(functions[0].isGenerator).toBe(true);
    });

    it('should analyze class methods correctly', () => {
      const code = `
        class User {
          constructor(name: string) {
            this.name = name;
          }
          
          getName(): string {
            return this.name;
          }
          
          static createAdmin(): User {
            return new User('admin');
          }
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(3);

      const constructor = functions.find(f => f.name === 'constructor');
      const getName = functions.find(f => f.name === 'getName');
      const createAdmin = functions.find(f => f.name === 'createAdmin');

      expect(constructor?.type).toBe('method');
      expect(getName?.type).toBe('method');
      expect(createAdmin?.type).toBe('method');
      expect(createAdmin?.isStatic).toBe(true);
    });

    it('should analyze function expressions correctly', () => {
      const code = `
        const multiply = function(a: number, b: number) {
          return a * b;
        };
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('multiply');
      expect(functions[0].type).toBe('function');
    });

    it('should handle functions with default parameters', () => {
      const code = `
        function greet(name: string = "World"): string {
          return "Hello " + name;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].parameters).toHaveLength(1);
      expect(functions[0].parameters[0].optional).toBe(true);
      expect(functions[0].parameters[0].defaultValue).toBe('World');
    });

    it('should handle functions with rest parameters', () => {
      const code = `
        function sum(...numbers: number[]): number {
          return numbers.reduce((a, b) => a + b, 0);
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].parameters).toHaveLength(1);
      expect(functions[0].parameters[0].isRest).toBe(true);
      expect(functions[0].parameters[0].type).toBe('array');
    });

    it('should detect exported functions', () => {
      const code = `
        export function publicFunction() {
          return "public";
        }
        
        function privateFunction() {
          return "private";
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      const publicFunc = functions.find(f => f.name === 'publicFunction');
      const privateFunc = functions.find(f => f.name === 'privateFunction');

      expect(publicFunc?.isExported).toBe(true);
      expect(privateFunc?.isExported).toBe(false);
    });

    it('should detect private methods', () => {
      const code = `
        class TestClass {
          publicMethod() {
            return "public";
          }
          
          _privateMethod() {
            return "private";
          }
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      const publicMethod = functions.find(f => f.name === 'publicMethod');
      const privateMethod = functions.find(f => f.name === '_privateMethod');

      expect(publicMethod?.isPrivate).toBe(false);
      expect(privateMethod?.isPrivate).toBe(true);
    });
  });

  describe('function usage analysis', () => {
    it('should track function calls correctly', () => {
      const code = `
        function greet(name: string) {
          return "Hello " + name;
        }
        
        const message = greet("World");
        console.log(greet("Alice"));
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      const greetFunc = functions.find(f => f.name === 'greet');
      expect(greetFunc?.callCount).toBe(2);
    });

    it('should track function callers correctly', () => {
      const code = `
        function helper() {
          return "helper";
        }
        
        function main() {
          return helper();
        }
        
        function another() {
          return helper();
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      const helperFunc = functions.find(f => f.name === 'helper');
      expect(helperFunc?.callers).toContain('main');
      expect(helperFunc?.callers).toContain('another');
    });
  });

  describe('complexity analysis', () => {
    it('should calculate cyclomatic complexity correctly', () => {
      const code = `
        function complexFunction(x: number) {
          if (x > 0) {
            if (x > 10) {
              return "large";
            } else {
              return "small";
            }
          } else if (x < 0) {
            return "negative";
          } else {
            return "zero";
          }
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].complexity).toBeGreaterThan(1);
      expect(functions[0].performance.cyclomaticComplexity).toBeGreaterThan(1);
    });

    it('should count loops and conditions correctly', () => {
      const code = `
        function loopFunction(items: number[]) {
          let sum = 0;
          for (let i = 0; i < items.length; i++) {
            if (items[i] > 0) {
              sum += items[i];
            }
          }
          return sum;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].performance.loopCount).toBe(1);
      expect(functions[0].performance.conditionCount).toBe(1);
    });
  });

  describe('performance metrics', () => {
    it('should calculate performance metrics correctly', () => {
      const code = `
        function performanceTest(param1: string, param2: number) {
          const localVar = "test";
          let counter = 0;
          
          for (let i = 0; i < param2; i++) {
            if (i % 2 === 0) {
              counter++;
            }
          }
          
          return { localVar, counter };
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].performance.parameterCount).toBe(2);
      expect(functions[0].performance.localVariableCount).toBeGreaterThan(0);
      expect(functions[0].performance.statementCount).toBeGreaterThan(0);
      expect(functions[0].performance.expressionCount).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle anonymous functions', () => {
      const code = `
        const anonymous = function() {
          return "anonymous";
        };
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('anonymous');
    });

    it('should handle functions without names', () => {
      const code = `
        const unnamed = () => "unnamed";
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].name).toBe('unnamed');
    });

    it('should handle empty functions', () => {
      const code = `
        function empty() {}
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].complexity).toBe(1);
    });

    it('should handle functions with no parameters', () => {
      const code = `
        function noParams() {
          return "no parameters";
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');

      expect(functions).toHaveLength(1);
      expect(functions[0].parameters).toHaveLength(0);
    });

    it('should handle code without functions', () => {
      const code = `
        const x = 1;
        const y = 2;
        console.log(x + y);
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const functions = analyzer.analyzeFunctions(ast, 'test.ts');
      expect(functions).toHaveLength(0);
    });
  });
});
