"use client";

import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // 简单的错误静默处理
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      // 静默处理已知的水合错误
      if (message.includes('Hydration failed') || 
          message.includes('Text content does not match') ||
          message.includes('removeChild') ||
          message.includes('不是该节点的子节点')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
  }, []);

  if (!isMounted) {
    return (
      <div suppressHydrationWarning>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}