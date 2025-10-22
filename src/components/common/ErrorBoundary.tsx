"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 如果是removeChild错误，尝试静默处理
    if (error.message?.includes('removeChild') || error.message?.includes('不是该节点的子节点')) {
      console.warn('Caught removeChild error, attempting recovery');
      // 延迟重置错误状态，允许重新渲染
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 100);
      return;
    }
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // 对于removeChild错误，返回空div而不是错误UI
      if (this.state.error?.message?.includes('removeChild') || 
          this.state.error?.message?.includes('不是该节点的子节点')) {
        return <div key={Date.now()}>{this.props.children}</div>;
      }
      
      return this.props.fallback || (
        <div className="p-4 text-center">
          <p className="text-red-500">出现了一个错误</p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook版本的错误边界（用于函数组件）
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError, resetError };
}