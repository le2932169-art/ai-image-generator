"use client";

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useNextUIHydrationFix, setupGlobalErrorHandler } from '@/lib/nextui-hydration-fix';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [key, setKey] = useState(0);

  // 使用NextUI水合修复
  useNextUIHydrationFix();

  useEffect(() => {
    setIsMounted(true);
    
    // 设置全局错误处理器
    setupGlobalErrorHandler();
    
    // 监听DOM异常并自动恢复
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('removeChild') || 
          event.message?.includes('不是该节点的子节点')) {
        console.warn('Detected removeChild error, forcing re-render');
        setKey(prev => prev + 1);
        event.preventDefault();
      }
    };

    // 监听未捕获的Promise rejection
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('removeChild') || 
          event.reason?.message?.includes('不是该节点的子节点')) {
        console.warn('Detected removeChild promise rejection, forcing re-render');
        setKey(prev => prev + 1);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={(error) => {
        if (error.message?.includes('removeChild') || 
            error.message?.includes('不是该节点的子节点')) {
          setTimeout(() => setKey(prev => prev + 1), 100);
        }
      }}
    >
      <div key={key}>
        {children}
      </div>
    </ErrorBoundary>
  );
}