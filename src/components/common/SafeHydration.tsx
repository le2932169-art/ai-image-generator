"use client";

import { useEffect, useState } from 'react';

interface SafeHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 简单的安全水合组件
 * 避免服务端和客户端渲染不匹配的问题
 */
export default function SafeHydration({ children, fallback }: SafeHydrationProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div suppressHydrationWarning>{fallback || null}</div>;
  }

  return <>{children}</>;
}