import { Pool } from "pg";

// 链接池，所有的连接都维护在这个连接池里面
let globalPool: Pool;

export function getDb(): Pool {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;
    
    // 如果没有配置数据库连接字符串，抛出错误
    if (!connectionString) {
      throw new Error('POSTGRES_URL environment variable is required but not set');
    }

    globalPool = new Pool({
      connectionString,
    });
  }

  return globalPool;
}

// 安全的获取数据库连接，返回null而不是抛出错误
export function getDbSafe(): Pool | null {
  try {
    return getDb();
  } catch (error) {
    console.warn('⚠️ Database connection not available:', error);
    return null;
  }
}