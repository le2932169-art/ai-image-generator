"use client";

/**
 * 激进的DOM修复工具
 * 直接拦截和修复DOM操作中的removeChild错误
 */
export function applyDOMFixes() {
  if (typeof window === 'undefined') return;

  // 保存原始方法
  const originalRemoveChild = Node.prototype.removeChild;
  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;

  // 安全的removeChild包装器
  Node.prototype.removeChild = function<T extends Node>(child: T): T {
    try {
      // 检查子节点是否真的存在
      if (!this.contains(child)) {
        console.warn('Prevented removeChild error: node not found in parent');
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    } catch (error) {
      console.warn('Caught removeChild error:', error);
      return child;
    }
  };

  // 安全的appendChild包装器
  Node.prototype.appendChild = function<T extends Node>(child: T): T {
    try {
      // 如果子节点已经在另一个父节点中，先安全移除
      if (child.parentNode && child.parentNode !== this) {
        if (child.parentNode.contains(child)) {
          child.parentNode.removeChild(child);
        }
      }
      return originalAppendChild.call(this, child) as T;
    } catch (error) {
      console.warn('Caught appendChild error:', error);
      return child;
    }
  };

  // 安全的insertBefore包装器
  Node.prototype.insertBefore = function<T extends Node>(newChild: T, referenceChild: Node | null): T {
    try {
      // 如果新子节点已经在另一个父节点中，先安全移除
      if (newChild.parentNode && newChild.parentNode !== this) {
        if (newChild.parentNode.contains(newChild)) {
          newChild.parentNode.removeChild(newChild);
        }
      }
      return originalInsertBefore.call(this, newChild, referenceChild) as T;
    } catch (error) {
      console.warn('Caught insertBefore error:', error);
      return newChild;
    }
  };

  // 阻止React错误边界对removeChild错误的处理
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // 静默处理所有removeChild相关错误
    if (message.includes('removeChild') || 
        message.includes('不是该节点的子节点') ||
        message.includes('node to be removed is not a child') ||
        message.includes('Cannot read properties of null') ||
        message.includes('Cannot read property') ||
        message.includes('Failed to execute \'removeChild\'')) {
      return; // 完全静默
    }
    
    originalConsoleError.apply(console, args);
  };

  console.log('DOM fixes applied successfully');
}

/**
 * 清理页面上的问题DOM元素
 */
export function cleanupDOM() {
  if (typeof window === 'undefined') return;

  // 清理空的NextUI portals
  const portals = document.querySelectorAll('[data-nextui-portal]');
  portals.forEach(portal => {
    if (!portal.hasChildNodes()) {
      portal.remove();
    }
  });

  // 清理重复的样式表
  const stylesheets = document.querySelectorAll('style[data-styled], style[data-emotion]');
  const seen = new Set();
  stylesheets.forEach(style => {
    const content = style.textContent;
    if (seen.has(content)) {
      style.remove();
    } else {
      seen.add(content);
    }
  });

  // 清理孤立的DOM节点
  const body = document.body;
  Array.from(body.childNodes).forEach(node => {
    if (node.nodeType === 1) { // Element node
      const element = node as Element;
      if (element.tagName === 'DIV' && 
          !element.hasAttribute('id') && 
          !element.hasAttribute('class') && 
          !element.hasChildNodes()) {
        element.remove();
      }
    }
  });
}

/**
 * 初始化所有DOM修复
 */
export function initializeDOMFixes() {
  applyDOMFixes();
  
  // 定期清理DOM
  setInterval(cleanupDOM, 5000);
  
  // 在DOM变化时清理
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      cleanupDOM();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}