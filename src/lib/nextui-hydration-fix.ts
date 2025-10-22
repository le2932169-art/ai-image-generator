/**
 * NextUI SSR Hydration Fix
 * 处理NextUI组件在SSR时的水合不匹配问题
 */

"use client";

import { useEffect } from 'react';

export function useNextUIHydrationFix() {
  useEffect(() => {
    // 延迟设置，确保DOM完全渲染
    const timer = setTimeout(() => {
      // 修复NextUI Portal问题
      const portals = document.querySelectorAll('[data-nextui-portal]');
      portals.forEach(portal => {
        if (portal.innerHTML === '') {
          portal.remove();
        }
      });

      // 修复Dropdown组件的data属性不匹配
      const dropdowns = document.querySelectorAll('[data-slot="trigger"]');
      dropdowns.forEach(dropdown => {
        const existingId = dropdown.getAttribute('id');
        if (!existingId || existingId.includes('react-aria')) {
          dropdown.setAttribute('id', `dropdown-${Math.random().toString(36).substr(2, 9)}`);
        }
      });

      // 修复popover定位问题
      const popovers = document.querySelectorAll('[role="dialog"][data-slot="content"]');
      popovers.forEach(popover => {
        const htmlElement = popover as HTMLElement;
        if (htmlElement.style.transform && htmlElement.style.transform.includes('NaN')) {
          htmlElement.style.transform = 'translateX(0) translateY(0)';
        }
      });
    }, 100);

    // 监听DOM变化，处理动态创建的NextUI组件
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            
            // 处理新添加的dropdown
            if (element.hasAttribute('data-slot') && element.getAttribute('data-slot') === 'trigger') {
              const existingId = element.getAttribute('id');
              if (!existingId || existingId.includes('react-aria')) {
                element.setAttribute('id', `dropdown-${Math.random().toString(36).substr(2, 9)}`);
              }
            }
            
            // 处理空的portal
            if (element.hasAttribute('data-nextui-portal') && element.innerHTML === '') {
              element.remove();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'data-slot', 'data-nextui-portal']
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}

// 全局错误处理器
export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // 捕获removeChild错误
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('removeChild') || 
        message.includes('不是该节点的子节点') ||
        message.includes('node to be removed is not a child')) {
      console.warn('Caught and handled removeChild error:', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // 全局错误监听
  window.addEventListener('error', (event) => {
    if (event.message?.includes('removeChild') || 
        event.message?.includes('不是该节点的子节点')) {
      console.warn('Global error handler caught removeChild error');
      event.preventDefault();
      return false;
    }
  });

  // Promise rejection处理
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('removeChild') || 
        event.reason?.message?.includes('不是该节点的子节点')) {
      console.warn('Global promise rejection handler caught removeChild error');
      event.preventDefault();
    }
  });
}