/**
 * ComponentAnalyzer 单元测试
 */

import { parse } from '@babel/parser';
import { ComponentAnalyzer } from '../../../src/analyzer/ComponentAnalyzer';

describe('ComponentAnalyzer', () => {
  let analyzer: ComponentAnalyzer;

  beforeEach(() => {
    analyzer = new ComponentAnalyzer();
  });

  describe('analyzeComponents', () => {
    it('should analyze functional React components correctly', () => {
      const code = `
        import React from 'react';
        
        function UserCard({ name, age }: { name: string; age: number }) {
          return (
            <div>
              <h1>{name}</h1>
              <p>Age: {age}</p>
            </div>
          );
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe('UserCard');
      expect(components[0].type).toBe('functional');
      expect(components[0].framework).toBe('react');
      expect(components[0].isFunctional).toBe(true);
      expect(components[0].isClass).toBe(false);
    });

    it('should analyze arrow function React components correctly', () => {
      const code = `
        import React from 'react';
        
        const Button = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
          return <button onClick={onClick}>{children}</button>;
        };
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe('Button');
      expect(components[0].type).toBe('functional');
      expect(components[0].isFunctional).toBe(true);
    });

    it('should analyze class React components correctly', () => {
      const code = `
        import React, { Component } from 'react';
        
        class UserProfile extends Component {
          constructor(props) {
            super(props);
            this.state = { name: props.name };
          }
          
          render() {
            return <div>{this.state.name}</div>;
          }
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe('UserProfile');
      expect(components[0].type).toBe('class');
      expect(components[0].isClass).toBe(true);
      expect(components[0].isFunctional).toBe(false);
    });

    it('should detect Vue components', () => {
      const code = `
        import { defineComponent } from 'vue';
        
        export default defineComponent({
          name: 'VueComponent',
          props: {
            title: String
          },
          setup(props) {
            return () => <h1>{props.title}</h1>;
          }
        });
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.vue');

      expect(components).toHaveLength(1);
      expect(components[0].framework).toBe('vue');
      expect(components[0].isSFC).toBe(true);
    });

    it('should analyze component props correctly', () => {
      const code = `
        function ProductCard({ 
          name, 
          price = 0, 
          onAddToCart 
        }: { 
          name: string; 
          price?: number; 
          onAddToCart: () => void; 
        }) {
          return (
            <div>
              <h3>{name}</h3>
              <p>Price: {price}</p>
              <button onClick={onAddToCart}>Add to Cart</button>
            </div>
          );
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].props.definitions).toHaveLength(3);

      const nameProp = components[0].props.definitions.find(p => p.name === 'name');
      const priceProp = components[0].props.definitions.find(p => p.name === 'price');
      const onAddToCartProp = components[0].props.definitions.find(p => p.name === 'onAddToCart');

      expect(nameProp?.required).toBe(true);
      expect(priceProp?.required).toBe(false);
      expect(onAddToCartProp?.type).toBe('function');
    });

    it('should analyze component state correctly', () => {
      const code = `
        import React, { useState } from 'react';
        
        function Counter() {
          const [count, setCount] = useState(0);
          const [name, setName] = useState('');
          
          return (
            <div>
              <p>Count: {count}</p>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          );
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].state.definitions).toHaveLength(2);

      const countState = components[0].state.definitions.find(s => s.name === 'count');
      const nameState = components[0].state.definitions.find(s => s.name === 'name');

      expect(countState?.type).toBe('number');
      expect(countState?.initialValue).toBe(0);
      expect(nameState?.type).toBe('string');
      expect(nameState?.initialValue).toBe('');
    });

    it('should analyze React hooks correctly', () => {
      const code = `
        import React, { useState, useEffect, useCallback } from 'react';
        
        function DataFetcher() {
          const [data, setData] = useState(null);
          const [loading, setLoading] = useState(false);
          
          const fetchData = useCallback(async () => {
            setLoading(true);
            const response = await fetch('/api/data');
            const result = await response.json();
            setData(result);
            setLoading(false);
          }, []);
          
          useEffect(() => {
            fetchData();
          }, [fetchData]);
          
          return <div>{loading ? 'Loading...' : JSON.stringify(data)}</div>;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].hooks).toHaveLength(4);

      const useStateHook = components[0].hooks.find(h => h.name === 'useState');
      const useEffectHook = components[0].hooks.find(h => h.name === 'useEffect');
      const useCallbackHook = components[0].hooks.find(h => h.name === 'useCallback');

      expect(useStateHook?.type).toBe('useState');
      expect(useEffectHook?.type).toBe('useEffect');
      expect(useCallbackHook?.type).toBe('useCallback');
    });

    it('should analyze event handlers correctly', () => {
      const code = `
        function Form() {
          const handleSubmit = (e) => {
            e.preventDefault();
            console.log('Form submitted');
          };
          
          const handleInputChange = (e) => {
            console.log('Input changed:', e.target.value);
          };
          
          return (
            <form onSubmit={handleSubmit}>
              <input onChange={handleInputChange} />
              <button type="submit">Submit</button>
            </form>
          );
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].eventHandlers).toHaveLength(2);

      const submitHandler = components[0].eventHandlers.find(h => h.name === 'handleSubmit');
      const changeHandler = components[0].eventHandlers.find(h => h.name === 'handleInputChange');

      expect(submitHandler?.eventType).toBe('submit');
      expect(changeHandler?.eventType).toBe('change');
    });

    it('should detect page components correctly', () => {
      const code = `
        function HomePage() {
          return <div>Welcome to Home Page</div>;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].isPage).toBe(true);
    });

    it('should detect layout components correctly', () => {
      const code = `
        function MainLayout({ children }) {
          return (
            <div className="layout">
              <header>Header</header>
              <main>{children}</main>
              <footer>Footer</footer>
            </div>
          );
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].isLayout).toBe(true);
    });

    it('should detect container components correctly', () => {
      const code = `
        function UserContainer() {
          const [users, setUsers] = useState([]);
          
          useEffect(() => {
            fetchUsers().then(setUsers);
          }, []);
          
          return <UserList users={users} />;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].isContainer).toBe(true);
    });

    it('should detect custom hooks correctly', () => {
      const code = `
        function useCounter(initialValue = 0) {
          const [count, setCount] = useState(initialValue);
          
          const increment = () => setCount(c => c + 1);
          const decrement = () => setCount(c => c - 1);
          
          return { count, increment, decrement };
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].isHook).toBe(true);
    });

    it('should detect higher-order components correctly', () => {
      const code = `
        function withLoading(WrappedComponent) {
          return function WithLoadingComponent(props) {
            if (props.loading) {
              return <div>Loading...</div>;
            }
            return <WrappedComponent {...props} />;
          };
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].isHOC).toBe(true);
    });

    it('should detect exported components correctly', () => {
      const code = `
        export function PublicComponent() {
          return <div>Public</div>;
        }
        
        function PrivateComponent() {
          return <div>Private</div>;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      const publicComponent = components.find(c => c.name === 'PublicComponent');
      const privateComponent = components.find(c => c.name === 'PrivateComponent');

      expect(publicComponent?.isExported).toBe(true);
      expect(privateComponent?.isExported).toBe(false);
    });

    it('should detect default exported components correctly', () => {
      const code = `
        export default function DefaultComponent() {
          return <div>Default</div>;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].isDefaultExport).toBe(true);
    });
  });

  describe('complexity analysis', () => {
    it('should calculate component complexity correctly', () => {
      const code = `
        function ComplexComponent({ items, condition }) {
          const [state, setState] = useState(0);
          
          if (condition) {
            return <div>Conditional render</div>;
          }
          
          return (
            <div>
              {items.map((item, index) => (
                <div key={index}>
                  {item.active ? (
                    <span>Active: {item.name}</span>
                  ) : (
                    <span>Inactive: {item.name}</span>
                  )}
                </div>
              ))}
            </div>
          );
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].complexity.cyclomaticComplexity).toBeGreaterThan(1);
      expect(components[0].complexity.conditionalRenderCount).toBeGreaterThan(0);
      expect(components[0].complexity.loopRenderCount).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle components without JSX', () => {
      const code = `
        function NonJSXComponent() {
          return "Just text";
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe('NonJSXComponent');
    });

    it('should handle anonymous components', () => {
      const code = `
        const AnonymousComponent = () => <div>Anonymous</div>;
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe('AnonymousComponent');
    });

    it('should handle code without components', () => {
      const code = `
        const x = 1;
        const y = 2;
        console.log(x + y);
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');
      expect(components).toHaveLength(0);
    });

    it('should handle empty components', () => {
      const code = `
        function EmptyComponent() {
          return null;
        }
      `;
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const components = analyzer.analyzeComponents(ast, 'test.tsx');

      expect(components).toHaveLength(1);
      expect(components[0].complexity.cyclomaticComplexity).toBe(1);
    });
  });
});
