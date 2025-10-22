"use client";

import React, { useEffect, useState } from 'react';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 完全防止SSR的组件包装器
 * 只在客户端渲染，完全避免水合不匹配
 */
export function HydrationSafe({ children, fallback }: HydrationSafeProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        {fallback || <div className="animate-pulse bg-gray-200 rounded h-8 w-32"></div>}
      </div>
    );
  }

  return <>{children}</>;
}

export default HydrationSafe;